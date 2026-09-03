import config from '@/config';

const TIYIN_PER_SOM = 100;
const PAYME_AUTH_LOGIN = 'Paycom';

export const buildPaymeCheckoutUrl = (paymentId: string, amountSom: number): string => {
  const params = `m=${config.payme.merchantId};ac.order_id=${paymentId};a=${amountSom * TIYIN_PER_SOM}`;
  const encoded = Buffer.from(params).toString('base64');

  return `${config.payme.checkoutUrl}/${encoded}`;
};

export const verifyPaymeAuth = (authorizationHeader: string | undefined): boolean => {
  if (!authorizationHeader?.startsWith('Basic ')) return false;

  let decoded: string;
  try {
    decoded = Buffer.from(authorizationHeader.slice('Basic '.length), 'base64').toString('utf8');
  } catch {
    return false;
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) return false;

  const login = decoded.slice(0, separatorIndex);
  const key = decoded.slice(separatorIndex + 1);

  return login === PAYME_AUTH_LOGIN && key === config.payme.merchantKey && Boolean(config.payme.merchantKey);
};

export const somToTiyin = (som: number): number => som * TIYIN_PER_SOM;
