export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

/** Пищевая ценность на 100 г продукта */
export interface Macros100 {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface FoodPreset extends Macros100 {
  id: string;
  name: string;
}

export interface FoodEntry {
  id: string;
  name: string;
  meal: MealType;
  grams: number;
  per100: Macros100;
  createdAt: number;
}

export interface Totals {
  kcal: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionGoals extends Totals {}

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

export const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
