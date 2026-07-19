import { describe, it, expect } from "vitest";
import { formatCurrency, formatPercent, formatSignedCurrency } from "../currency";

describe("formatCurrency", () => {
  it("formats INR with no decimal places", () => {
    expect(formatCurrency(145000)).toBe("₹1,45,000");
  });

  it("formats zero correctly", () => {
    expect(formatCurrency(0)).toBe("₹0");
  });
});

describe("formatSignedCurrency", () => {
  it("prefixes positive amounts with +", () => {
    expect(formatSignedCurrency(5000)).toBe("+₹5,000");
  });

  it("prefixes negative amounts with -", () => {
    expect(formatSignedCurrency(-5000)).toBe("-₹5,000");
  });
});

describe("formatPercent", () => {
  it("formats with one decimal by default", () => {
    expect(formatPercent(42.567)).toBe("42.6%");
  });

  it("respects a custom fraction digit count", () => {
    expect(formatPercent(42.567, 0)).toBe("43%");
  });
});
