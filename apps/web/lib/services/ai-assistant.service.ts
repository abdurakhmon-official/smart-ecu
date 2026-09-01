import Cookie from 'js-cookie';
import type { AiMessageOutput } from '@repo/contracts';
import { TOKEN_COOKIE } from '@/lib/axios';
import { BaseService } from '@/lib/services/base.service';

export interface AiStreamHandlers {
  onDelta: (text: string) => void;
  onDone: (message: AiMessageOutput) => void;
  onError: (code?: string) => void;
}

class AiAssistantService extends BaseService<AiMessageOutput, never, never> {
  protected BASE_PATH = 'ai-assistant';

  async history(): Promise<AiMessageOutput[]> {
    return this.sendGet<AiMessageOutput[]>('/messages');
  }

  async reset(): Promise<null> {
    return this.sendDelete<null>('/messages');
  }

  /**
   * Javob SSE orqali oqim ko'rinishida keladi — `BaseService`ning axios asosidagi
   * `sendPost`i JSON javobni kutadi, oqimni emas. Shuning uchun bu bitta metodda
   * xom `fetch` + `ReadableStream` ishlatiladi; qolgan metodlar odatdagi patternda qoladi.
   */
  async sendMessage(message: string, handlers: AiStreamHandlers, signal?: AbortSignal): Promise<void> {
    const token = Cookie.get(TOKEN_COOKIE);

    let response: Response;
    try {
      response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${this.BASE_PATH}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message }),
        signal,
      });
    } catch {
      handlers.onError();
      return;
    }

    if (!response.ok || !response.body) {
      handlers.onError(await this.tryReadErrorCode(response));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        this.dispatchFrame(frame, handlers);
      }
    }
  }

  /** SSE ochilishidan oldin (masalan, `AI_ASSISTANT_NOT_CONFIGURED`) xato oddiy JSON envelope'da qaytadi. */
  private async tryReadErrorCode(response: Response): Promise<string | undefined> {
    try {
      const body = (await response.json()) as { _code?: string };
      return body._code;
    } catch {
      return undefined;
    }
  }

  private dispatchFrame(frame: string, handlers: AiStreamHandlers): void {
    const lines = frame.split('\n');
    const eventLine = lines.find((line) => line.startsWith('event: '));
    const dataLine = lines.find((line) => line.startsWith('data: '));
    if (!eventLine || !dataLine) return;

    const event = eventLine.slice('event: '.length);
    const data = JSON.parse(dataLine.slice('data: '.length));

    if (event === 'delta') handlers.onDelta(data.text);
    else if (event === 'done') handlers.onDone(data as AiMessageOutput);
    else if (event === 'error') handlers.onError(data._code);
  }
}

export const aiAssistantService = new AiAssistantService();
