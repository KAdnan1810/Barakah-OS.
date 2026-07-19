/**
 * Zakat calculation — standard nisab-based method (gold standard).
 * Nisab = value of 87.48 grams of gold. Zakat is 2.5% of zakatable wealth
 * held for one lunar year, if total wealth meets or exceeds the nisab.
 *
 * Zakatable assets: cash, bank balances, gold/silver held as investment,
 * business inventory/receivables, and Shariah-compliant investment value.
 * Not zakatable: primary residence, personal-use items, active liabilities
 * due immediately are deducted from the zakatable base.
 */

export const ZAKAT_RATE = 0.025;
export const NISAB_GOLD_GRAMS = 87.48;

export interface ZakatInput {
  cashAndBank: number;
  goldSilverValue: number;
  businessAssets: number;
  investmentValue: number;
  immediateLiabilities: number;
  goldPricePerGram: number;
}

export interface ZakatResult {
  nisabThreshold: number;
  totalZakatableAssets: number;
  netZakatableAssets: number;
  meetsNisab: boolean;
  zakatDue: number;
}

export function calculateZakat(input: ZakatInput): ZakatResult {
  const nisabThreshold = NISAB_GOLD_GRAMS * input.goldPricePerGram;
  const totalZakatableAssets =
    input.cashAndBank + input.goldSilverValue + input.businessAssets + input.investmentValue;
  const netZakatableAssets = Math.max(0, totalZakatableAssets - input.immediateLiabilities);
  const meetsNisab = netZakatableAssets >= nisabThreshold;

  return {
    nisabThreshold,
    totalZakatableAssets,
    netZakatableAssets,
    meetsNisab,
    zakatDue: meetsNisab ? Math.round(netZakatableAssets * ZAKAT_RATE) : 0,
  };
}
