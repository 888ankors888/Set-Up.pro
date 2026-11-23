import type { FoodEntry, Macros100, Totals } from './types';

/** Атвотер: 4 ккал/г белка и углеводов, 9 ккал/г жира */
export const KCAL_PER_GRAM = { protein: 4, fat: 9, carbs: 4 } as const;

export const round1 = (n: number) => Math.round(n * 10) / 10;

/** Калорийность по БЖУ (на любое количество) */
export const kcalFromMacros = (p: number, f: number, c: number) =>
  p * KCAL_PER_GRAM.protein + f * KCAL_PER_GRAM.fat + c * KCAL_PER_GRAM.carbs;

/** Пересчёт значений на 100 г в значения на порцию */
export function calcPortion(per100: Macros100, grams: number): Totals {
  const k = Math.max(0, grams) / 100;
  return {
    kcal: per100.kcal * k,
    protein: per100.protein * k,
    fat: per100.fat * k,
    carbs: per100.carbs * k,
  };
}

export const emptyTotals = (): Totals => ({ kcal: 0, protein: 0, fat: 0, carbs: 0 });

export function sumTotals(entries: FoodEntry[]): Totals {
  return entries.reduce<Totals>((acc, e) => {
    const p = calcPortion(e.per100, e.grams);
    acc.kcal += p.kcal;
    acc.protein += p.protein;
    acc.fat += p.fat;
    acc.carbs += p.carbs;
    return acc;
  }, emptyTotals());
}

/** Доля калорий из белков, жиров и углеводов, % */
export function macroEnergySplit(t: Totals) {
  const p = t.protein * KCAL_PER_GRAM.protein;
  const f = t.fat * KCAL_PER_GRAM.fat;
  const c = t.carbs * KCAL_PER_GRAM.carbs;
  const sum = p + f + c;
  if (!sum) return { protein: 0, fat: 0, carbs: 0 };
  return {
    protein: Math.round((p / sum) * 100),
    fat: Math.round((f / sum) * 100),
    carbs: Math.round((c / sum) * 100),
  };
}

export const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const todayKey = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
