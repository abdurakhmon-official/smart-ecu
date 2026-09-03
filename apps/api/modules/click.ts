import { createHash } from 'node:crypto';
import config from '@/config';

interface ClickPrepareSignParams {
  clickTransId: string;
  serviceId: string;
  merchantTransId: string;
  amount: string;
  action: string;
  signTime: string;
}

interface ClickCompleteSignParams extends ClickPrepareSignParams {
  merchantPrepareId: string;
}

export const buildClickCheckoutUrl = (paymentId: string, amountSom: number): string => {
  const params = new URLSearchParams({
    service_id: config.click.serviceId,
    merchant_id: config.click.merchantId,
    amount: amountSom.toFixed(2),
    transaction_param: paymentId,
  });

  return `${config.click.checkoutUrl}?${params.toString()}`;
};

const md5 = (value: string): string => createHash('md5').update(value).digest('hex');

export const verifyClickPrepareSignature = (params: ClickPrepareSignParams, signString: string): boolean => {
  const expected = md5(
    [params.clickTransId, params.serviceId, config.click.secretKey, params.merchantTransId, params.amount, params.action, params.signTime].join(''),
  );

  return expected === signString && Boolean(config.click.secretKey);
};

export const verifyClickCompleteSignature = (params: ClickCompleteSignParams, signString: string): boolean => {
  const expected = md5(
    [
      params.clickTransId,
      params.serviceId,
      config.click.secretKey,
      params.merchantTransId,
      params.merchantPrepareId,
      params.amount,
      params.action,
      params.signTime,
    ].join(''),
  );

  return expected === signString && Boolean(config.click.secretKey);
};

export const CLICK_ERROR = {
  SUCCESS: 0,
  SIGN_CHECK_FAILED: -1,
  INCORRECT_AMOUNT: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_PAID: -4,
  USER_NOT_FOUND: -5,
  TRANSACTION_NOT_FOUND: -6,
  BAD_REQUEST: -8,
  TRANSACTION_CANCELLED: -9,
} as const;
