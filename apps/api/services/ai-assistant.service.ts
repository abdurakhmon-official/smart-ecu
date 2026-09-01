import { PlatformContext } from '@tsed/common';
import { InjectContext, Injectable } from '@tsed/di';
import Anthropic from '@anthropic-ai/sdk';
import type { Request, Response } from 'express';
import prisma from '@/modules/db';
import config from '@/config';
import { AI_MESSAGE_ROLE } from '../generated/prisma';
import { ok } from '@/utils/response.utils';
import { requireUserId } from '@/utils/errors.utils';
import { SendAiMessageInputSchema } from '@/inputs/ai-assistant.input';
import { AiAssistantNotConfiguredException } from '@/exceptions/ai-assistant.exceptions';

// types

interface StoredAiMessage {
  id: string;
  role: AI_MESSAGE_ROLE;
  content: string;
  createdAt: Date;
}

@Injectable()
export class AiAssistantService {
  private static readonly MODEL = 'claude-sonnet-5';
  private static readonly MAX_TOKENS = 1024;
  private static readonly MAX_HISTORY_MESSAGES = 20;

  /**
   * 4-bo'lim talabi: AI hech qachon aniq tashxis qo'ymaydi — faqat ehtimoliy sabablar va
   * diagnostika tavsiyasi beradi, doim malakali servisga murojaat qilishni tavsiya qiladi.
   */
  private static readonly SYSTEM_PROMPT = [
    "Sen Smart ECU platformasidagi avtomobil bo'yicha yordamchi assistentsan.",
    "Foydalanuvchi tasvirlagan avtomobil muammosiga javob berasan.",
    '',
    'Qattiq qoidalar:',
    "1. Hech qachon aniq tashxis qo'ymaysan (masalan, \"sizda aniq shu detal buzilgan\" deb aytmaysan).",
    "2. Faqat ehtimoliy sabablar ro'yxatini beraman deb tushuntirasan va ularni ehtimollik tartibida sanaysan.",
    "3. Har doim aniq diagnostika (OBD skanerlash, servisda tekshirtirish) tavsiya qilasan.",
    "4. Xavfsizlikka bevosita ta'sir qiladigan muammolarda (tormoz, rul, yoqilg'i hidi, tutun) darhol to'xtab, malakali servisga murojaat qilishni alohida ta'kidlaysan.",
    "5. ECU proshivka/tuning bo'yicha kafolat bermaysan, faqat umumiy ma'lumot berasan va bu jarayon kafolatsiz ekanini eslatasan.",
    "6. Javoblaring qisqa, aniq va o'zbek tilida (foydalanuvchi boshqa tilda yozmasa) bo'ladi.",
  ].join('\n');

  @InjectContext()
  private context!: PlatformContext;

  private readonly client: Anthropic | null = config.anthropic.apiKey
    ? new Anthropic({ apiKey: config.anthropic.apiKey })
    : null;

  private get currentUserId(): string {
    return requireUserId(this.context.getRequest<Request>().user);
  }

  async history() {
    const conversation = await this.getOrCreateConversation(this.currentUserId);
    return ok(conversation.messages.map(AiAssistantService.serialize));
  }

  async reset() {
    const conversation = await this.getOrCreateConversation(this.currentUserId);
    await prisma.aiMessage.deleteMany({ where: { conversationId: conversation.id } });
    return ok(null);
  }

  /**
   * Javobni SSE orqali oqim ko'rinishida yozadi — shuning uchun controller `ok()`
   * konvertidan chetlab, `@Res()` orqali xom Express `Response`ni beradi (namuna: `AwsController.sign()`).
   */
  async streamReply(rawBody: unknown, res: Response): Promise<void> {
    const { message } = SendAiMessageInputSchema.parse(rawBody);
    if (!this.client) throw new AiAssistantNotConfiguredException();

    const client = this.client;
    const conversation = await this.getOrCreateConversation(this.currentUserId);

    await prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: AI_MESSAGE_ROLE.USER, content: message },
    });

    const history = await prisma.aiMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'asc' },
      take: AiAssistantService.MAX_HISTORY_MESSAGES,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let fullText = '';

    try {
      const stream = client.messages.stream({
        model: AiAssistantService.MODEL,
        max_tokens: AiAssistantService.MAX_TOKENS,
        system: AiAssistantService.SYSTEM_PROMPT,
        messages: history.map((entry) => ({
          role: entry.role === AI_MESSAGE_ROLE.USER ? ('user' as const) : ('assistant' as const),
          content: entry.content,
        })),
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          fullText += event.delta.text;
          res.write(`event: delta\ndata: ${JSON.stringify({ text: event.delta.text })}\n\n`);
        }
      }

      await stream.finalMessage();
    } catch (error) {
      console.error('[AiAssistantService] upstream stream failed', error);
      res.write(`event: error\ndata: ${JSON.stringify({ _code: 'AI_ASSISTANT_UPSTREAM_ERROR' })}\n\n`);
      res.end();
      return;
    }

    const saved = await prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: AI_MESSAGE_ROLE.ASSISTANT, content: fullText },
    });

    res.write(`event: done\ndata: ${JSON.stringify(AiAssistantService.serialize(saved))}\n\n`);
    res.end();
  }

  private async getOrCreateConversation(userId: string) {
    const existing = await prisma.aiConversation.findUnique({
      where: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (existing) return existing;

    return prisma.aiConversation.create({
      data: { userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  private static serialize(message: StoredAiMessage) {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
