import { InjectContext, Injectable } from '@tsed/di';
import { PlatformContext } from '@tsed/common';
import Anthropic from '@anthropic-ai/sdk';
import type { Request } from 'express';
import prisma from '@/modules/db';
import config from '@/config';
import { REPORT_SEVERITY } from '../generated/prisma';
import { getObject } from '@/modules/storage';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import type { AnalyzeReportInput } from '@/inputs/service-report-analysis.input';
import { ReportAnalyzerNotConfiguredException, ReportFileNotFoundException } from '@/exceptions/service-report-analysis.exceptions';

// types

type ImageMediaType = 'image/png' | 'image/jpeg' | 'image/webp';

const MIME_BY_EXTENSION: Record<string, ImageMediaType> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

@Injectable()
export class ServiceReportAnalyzerService {
  private static readonly MODEL = 'claude-sonnet-5';
  private static readonly MAX_TOKENS = 1024;

  private static readonly SYSTEM_PROMPT = [
    "Sen avtomobil servis hisobotlarini (diagnostika ekrani, ta'mirlash smetasi va h.k.) tahlil qiluvchi yordamchisan.",
    'Yuklangan rasmni ko\'rib chiq va quyidagilarni aniqla:',
    "1. Muammoning jiddiylik darajasi: LOW (kam muhim), MEDIUM (o'rtacha), HIGH (jiddiy, tezkor e'tibor kerak).",
    "2. Qisqa tushuntirish (2-4 jumla, o'zbek tilida) — nima ko'rinyapti va nima uchun shu daraja tanlandi.",
    "Hech qachon aniq tashxis qo'ymaysan, faqat ko'ringan ma'lumotni tasvirlab, servisga murojaat tavsiyasini berasan.",
    'Javobni FAQAT quyidagi JSON formatda qaytar, boshqa hech narsa yozma:',
    '{"severity": "LOW yoki MEDIUM yoki HIGH", "summary": "..."}',
  ].join('\n');

  @InjectContext()
  private context!: PlatformContext;

  private readonly client: Anthropic | null = config.anthropic.apiKey ? new Anthropic({ apiKey: config.anthropic.apiKey }) : null;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async analyze(input: AnalyzeReportInput) {
    if (!this.client) throw new ReportAnalyzerNotConfiguredException();

    const bytes = await getObject(input.storageKey);
    if (!bytes) throw new ReportFileNotFoundException();

    const message = await this.client.messages.create({
      model: ServiceReportAnalyzerService.MODEL,
      max_tokens: ServiceReportAnalyzerService.MAX_TOKENS,
      system: ServiceReportAnalyzerService.SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: ServiceReportAnalyzerService.mimeFor(input.storageKey), data: bytes.toString('base64') },
            },
            { type: 'text', text: 'Ushbu hisobotni tahlil qil.' },
          ],
        },
      ],
    });

    const { severity, summary } = ServiceReportAnalyzerService.parseResponse(message);

    const record = await prisma.serviceReportAnalysis.create({
      data: { userId: this.currentUserId, storageKey: input.storageKey, severity, summary },
    });

    return ok(ServiceReportAnalyzerService.serialize(record));
  }

  async list() {
    const records = await prisma.serviceReportAnalysis.findMany({
      where: { userId: this.currentUserId },
      orderBy: { createdAt: 'desc' },
    });

    return ok(records.map(ServiceReportAnalyzerService.serialize));
  }

  private static mimeFor(storageKey: string): ImageMediaType {
    const ext = storageKey.slice(storageKey.lastIndexOf('.')).toLowerCase();
    return MIME_BY_EXTENSION[ext] ?? 'image/jpeg';
  }

  private static parseResponse(message: Anthropic.Message): { severity: REPORT_SEVERITY | null; summary: string | null } {
    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') return { severity: null, summary: null };

    try {
      const parsed = JSON.parse(textBlock.text) as { severity?: string; summary?: string };
      const severity = (['LOW', 'MEDIUM', 'HIGH'] as const).includes(parsed.severity as REPORT_SEVERITY)
        ? (parsed.severity as REPORT_SEVERITY)
        : null;

      return { severity, summary: parsed.summary ?? null };
    } catch {
      return { severity: null, summary: textBlock.text };
    }
  }

  private static serialize(record: {
    id: string;
    storageKey: string;
    severity: REPORT_SEVERITY | null;
    summary: string | null;
    createdAt: Date;
  }) {
    return {
      id: record.id,
      storageKey: record.storageKey,
      severity: record.severity,
      summary: record.summary,
      createdAt: record.createdAt.toISOString(),
    };
  }
}
