import { Controller, Inject } from '@tsed/di';
import { BodyParams, HeaderParams } from '@tsed/platform-params';
import { Post } from '@tsed/schema';
import { verifyPaymeAuth } from '@/modules/payme';
import { PaymeRpcError, PaymeService } from '@/services/payme.service';

// types

interface PaymeRpcRequest {
  method: string;
  params: Record<string, unknown>;
  id: number | string;
}

@Controller('/payments/payme')
export class PaymeController {
  @Inject()
  private paymeService!: PaymeService;

  @Post('/')
  async handle(@BodyParams() body: PaymeRpcRequest, @HeaderParams('authorization') authorization: string) {
    if (!verifyPaymeAuth(authorization)) {
      return { jsonrpc: '2.0', error: { code: -32504, message: 'Insufficient privilege' }, id: body?.id ?? null };
    }

    try {
      const result = await this.paymeService.handle(body.method, body.params);
      return { jsonrpc: '2.0', result, id: body.id };
    } catch (error) {
      if (error instanceof PaymeRpcError) {
        return { jsonrpc: '2.0', error: { code: error.code, data: error.data }, id: body.id };
      }

      console.error('[PaymeController] unexpected error', error);
      return { jsonrpc: '2.0', error: { code: -32400 }, id: body.id };
    }
  }
}
