const exchangeRateApiUrl = import.meta.env.VITE_EXCHANGE_RATE_API_URL;
const exchangeRateApiKey = import.meta.env.VITE_EXCHANGE_RATE_API_KEY;

export const isExchangeRateApiConfigured = Boolean(exchangeRateApiUrl && exchangeRateApiKey);

export function buildExchangeRatePairUrl(base: string, quote: string): string {
  return `${exchangeRateApiUrl}/${exchangeRateApiKey}/pair/${base}/${quote}`;
}
