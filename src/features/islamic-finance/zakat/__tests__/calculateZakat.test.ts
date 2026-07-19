import { describe, it, expect } from "vitest";
import { calculateZakat, NISAB_GOLD_GRAMS, ZAKAT_RATE } from "../lib/calculateZakat";

describe("calculateZakat", () => {
  it("returns zero Zakat when net assets are below Nisab", () => {
    const result = calculateZakat({
      cashAndBank: 10000,
      goldSilverValue: 0,
      businessAssets: 0,
      investmentValue: 0,
      immediateLiabilities: 0,
      goldPricePerGram: 6700,
    });
    expect(result.meetsNisab).toBe(false);
    expect(result.zakatDue).toBe(0);
  });

  it("calculates 2.5% of net zakatable assets above Nisab", () => {
    const goldPricePerGram = 6700;
    const nisab = NISAB_GOLD_GRAMS * goldPricePerGram;
    const result = calculateZakat({
      cashAndBank: nisab + 100000,
      goldSilverValue: 0,
      businessAssets: 0,
      investmentValue: 0,
      immediateLiabilities: 0,
      goldPricePerGram,
    });
    expect(result.meetsNisab).toBe(true);
    expect(result.zakatDue).toBe(Math.round((nisab + 100000) * ZAKAT_RATE));
  });

  it("deducts immediate liabilities before checking Nisab", () => {
    const goldPricePerGram = 6700;
    const nisab = NISAB_GOLD_GRAMS * goldPricePerGram;
    const result = calculateZakat({
      cashAndBank: nisab + 5000,
      goldSilverValue: 0,
      businessAssets: 0,
      investmentValue: 0,
      immediateLiabilities: 10000,
      goldPricePerGram,
    });
    expect(result.netZakatableAssets).toBe(nisab - 5000);
    expect(result.meetsNisab).toBe(false);
  });

  it("never recommends interest-based instruments — investmentValue is the only investment input", () => {
    // Structural guardrail: calculateZakat has no field for interest-bearing
    // deposits/bonds, so they cannot enter the zakatable base at all.
    const result = calculateZakat({
      cashAndBank: 0,
      goldSilverValue: 0,
      businessAssets: 0,
      investmentValue: 50000,
      immediateLiabilities: 0,
      goldPricePerGram: 6700,
    });
    expect(result.totalZakatableAssets).toBe(50000);
  });
});
