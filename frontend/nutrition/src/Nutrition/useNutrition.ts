import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FoodEntry, MealType, NutritionGoals } from './types';
import { MEAL_ORDER } from './types';
import { sumTotals, todayKey, uid } from './nutrition';

export const DEFAULT_GOALS: NutritionGoals = { kcal: 2200, protein: 140, fat: 70, carbs: 250 };

type DayLog = Record<string, FoodEntry[]>;

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* переполнение или приватный режим — игнорируем */
  }
}

export interface UseNutritionOptions {
  storageKey?: string;
  initialGoals?: NutritionGoals;
  /** false — без localStorage (данные только в памяти) */
  persist?: boolean;
}

export function useNutrition({
  storageKey = 'nutrition-block',
  initialGoals = DEFAULT_GOALS,
  persist = true,
}: UseNutritionOptions = {}) {
  const [date, setDate] = useState<string>(todayKey());
  const [log, setLog] = useState<DayLog>(() => (persist ? load(`${storageKey}:log`, {}) : {}));
  const [goals, setGoals] = useState<NutritionGoals>(() =>
    persist ? load(`${storageKey}:goals`, initialGoals) : initialGoals,
  );

  useEffect(() => { if (persist) save(`${storageKey}:log`, log); }, [log, persist, storageKey]);
  useEffect(() => { if (persist) save(`${storageKey}:goals`, goals); }, [goals, persist, storageKey]);

  const entries = useMemo(() => log[date] ?? [], [log, date]);
  const totals = useMemo(() => sumTotals(entries), [entries]);

  const byMeal = useMemo(() => {
    const map = {} as Record<MealType, FoodEntry[]>;
    MEAL_ORDER.forEach((m) => (map[m] = []));
    entries.forEach((e) => map[e.meal].push(e));
    return map;
  }, [entries]);

  const addEntry = useCallback(
    (entry: Omit<FoodEntry, 'id' | 'createdAt'>) => {
      const full: FoodEntry = { ...entry, id: uid(), createdAt: Date.now() };
      setLog((prev) => ({ ...prev, [date]: [...(prev[date] ?? []), full] }));
    },
    [date],
  );

  const updateEntry = useCallback(
    (id: string, patch: Partial<Omit<FoodEntry, 'id'>>) => {
      setLog((prev) => ({
        ...prev,
        [date]: (prev[date] ?? []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
      }));
    },
    [date],
  );

  const removeEntry = useCallback(
    (id: string) => {
      setLog((prev) => ({ ...prev, [date]: (prev[date] ?? []).filter((e) => e.id !== id) }));
    },
    [date],
  );

  const clearDay = useCallback(() => {
    setLog((prev) => {
      const next = { ...prev };
      delete next[date];
      return next;
    });
  }, [date]);

  return {
    date, setDate,
    entries, byMeal, totals,
    goals, setGoals,
    addEntry, updateEntry, removeEntry, clearDay,
  };
}
