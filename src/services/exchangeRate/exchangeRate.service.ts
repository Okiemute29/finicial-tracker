import { buildExchangeRatePairUrl, isExchangeRateApiConfigured } from "./exchangeRateClient";

type PairRateResponse = {
  result: "success" | "error";
  conversion_rate?: number;
  "error-type"?: string;
};

async function fetchLiveRate(base: string, quote: string): Promise<number> {
  if (!isExchangeRateApiConfigured) throw new Error("Exchange rate API is not configured.");

  const response = await fetch(buildExchangeRatePairUrl(base, quote));
  if (!response.ok) throw new Error("Failed to fetch exchange rate.");

  const data = (await response.json()) as PairRateResponse;
  if (data.result !== "success" || typeof data.conversion_rate !== "number") {
    throw new Error(data["error-type"] ?? "Exchange rate API returned an error.");
  }

  return data.conversion_rate;
}

export const exchangeRateService = { fetchLiveRate };
