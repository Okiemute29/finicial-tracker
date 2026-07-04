import { describe, expect, it } from "vitest";
import { convertCurrency, formatCompactCurrency, formatCurrency } from "./currencyHelpers";

describe("formatCurrency", () => {
  it("formats USD with 2 decimal places by default", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });

  it("formats NGN with no decimal places", () => {
    const formatted = formatCurrency(180000, "NGN");
    expect(formatted).not.toContain(".");
    expect(formatted.replace(/\D/g, "")).toBe("180000");
  });

  it("falls back to 0 for non-finite amounts", () => {
    expect(formatCurrency(Number.NaN, "USD")).toBe("$0.00");
    expect(formatCurrency(Number.POSITIVE_INFINITY, "USD")).toBe("$0.00");
  });

  it("defaults to USD when no currency is given", () => {
    expect(formatCurrency(10)).toBe("$10.00");
  });
});

describe("formatCompactCurrency", () => {
  it("abbreviates large amounts", () => {
    expect(formatCompactCurrency(1500000, "USD")).toBe("$1.5M");
  });

  it("falls back to 0 for non-finite amounts", () => {
    expect(formatCompactCurrency(Number.NaN, "USD")).toBe("$0");
  });
});

describe("convertCurrency", () => {
  it("multiplies amount by rate", () => {
    expect(convertCurrency(10, 1500)).toBe(15000);
  });

  it("rounds to 2 decimal places", () => {
    expect(convertCurrency(1, 0.333333)).toBeCloseTo(0.33, 2);
  });

  it("returns 0 when amount is 0", () => {
    expect(convertCurrency(0, 1500)).toBe(0);
  });
});
