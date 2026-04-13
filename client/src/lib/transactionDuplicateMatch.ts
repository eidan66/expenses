import type { Transaction } from "@shared/schema";
import { safeParseFloat } from "@/lib/utils";

export type DraftForDuplicateCheck = {
  amount: string;
  category: string;
  subcategory: string | null;
};

function normalizeSubcategory(s: string | null | undefined): string {
  return (s ?? "").trim();
}

function transactionRecencyTime(t: Transaction): number {
  const row = t as Transaction & { created_at?: string; updated_at?: string };
  const s = row.updated_at || row.created_at || t.date || "";
  const n = new Date(s).getTime();
  return Number.isNaN(n) ? 0 : n;
}

export function findSimilarTransactions(
  existing: Transaction[],
  draft: DraftForDuplicateCheck
): Transaction[] {
  const draftSub = normalizeSubcategory(draft.subcategory);
  const draftAmount = safeParseFloat(draft.amount);

  const results: { transaction: Transaction; score: number }[] = [];

  for (const t of existing) {
    const amountMatch = safeParseFloat(t.amount) === draftAmount;
    const categoryMatch = t.category === draft.category;
    const subMatch = normalizeSubcategory(t.subcategory) === draftSub;

    const score =
      (amountMatch ? 1 : 0) + (categoryMatch ? 1 : 0) + (subMatch ? 1 : 0);
    // Important: do not allow category+subcategory alone to count as a duplicate.
    // Duplicate requires amount match plus either category OR subcategory match.
    if (amountMatch && (categoryMatch || subMatch)) {
      results.push({ transaction: t, score });
    }
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return transactionRecencyTime(b.transaction) - transactionRecencyTime(a.transaction);
  });

  return results.map((r) => r.transaction);
}
