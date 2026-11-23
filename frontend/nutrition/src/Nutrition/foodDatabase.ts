import type { FoodPreset } from './types';

/** Базовый справочник: значения на 100 г (усреднённые табличные данные) */
export const FOOD_DATABASE: FoodPreset[] = [
  { id: 'chicken-breast', name: 'Куриная грудка (варёная)', kcal: 137, protein: 29.8, fat: 1.8, carbs: 0.5 },
  { id: 'beef', name: 'Говядина (тушёная)', kcal: 232, protein: 25.6, fat: 14.6, carbs: 0 },
  { id: 'salmon', name: 'Лосось (запечённый)', kcal: 206, protein: 22.1, fat: 12.4, carbs: 0 },
  { id: 'tuna', name: 'Тунец консервированный в с/с', kcal: 96, protein: 21, fat: 1, carbs: 0 },
  { id: 'egg', name: 'Яйцо куриное', kcal: 157, protein: 12.7, fat: 11.5, carbs: 0.7 },
  { id: 'cottage-5', name: 'Творог 5%', kcal: 121, protein: 17.2, fat: 5, carbs: 1.8 },
  { id: 'greek-yogurt', name: 'Греческий йогурт 2%', kcal: 66, protein: 9, fat: 2, carbs: 3.6 },
  { id: 'milk-25', name: 'Молоко 2.5%', kcal: 52, protein: 2.8, fat: 2.5, carbs: 4.7 },
  { id: 'kefir-1', name: 'Кефир 1%', kcal: 40, protein: 3, fat: 1, carbs: 4 },
  { id: 'cheese', name: 'Сыр твёрдый', kcal: 356, protein: 24, fat: 29.5, carbs: 0.3 },
  { id: 'oatmeal', name: 'Овсяные хлопья (сухие)', kcal: 352, protein: 12.3, fat: 6.2, carbs: 61.8 },
  { id: 'buckwheat', name: 'Гречка (варёная)', kcal: 110, protein: 4.2, fat: 1.1, carbs: 21.3 },
  { id: 'rice', name: 'Рис белый (варёный)', kcal: 116, protein: 2.2, fat: 0.5, carbs: 24.9 },
  { id: 'pasta', name: 'Макароны (варёные)', kcal: 112, protein: 3.5, fat: 0.4, carbs: 23.2 },
  { id: 'potato', name: 'Картофель отварной', kcal: 82, protein: 2, fat: 0.4, carbs: 16.7 },
  { id: 'bread-rye', name: 'Хлеб ржаной', kcal: 210, protein: 6.6, fat: 1.2, carbs: 42.6 },
  { id: 'bread-white', name: 'Хлеб пшеничный', kcal: 242, protein: 8.1, fat: 1, carbs: 48.8 },
  { id: 'banana', name: 'Банан', kcal: 96, protein: 1.5, fat: 0.5, carbs: 21 },
  { id: 'apple', name: 'Яблоко', kcal: 47, protein: 0.4, fat: 0.4, carbs: 9.8 },
  { id: 'cucumber', name: 'Огурец', kcal: 15, protein: 0.8, fat: 0.1, carbs: 2.8 },
  { id: 'tomato', name: 'Помидор', kcal: 20, protein: 1.1, fat: 0.2, carbs: 3.7 },
  { id: 'broccoli', name: 'Брокколи', kcal: 34, protein: 2.8, fat: 0.4, carbs: 6.6 },
  { id: 'avocado', name: 'Авокадо', kcal: 160, protein: 2, fat: 14.7, carbs: 8.5 },
  { id: 'almonds', name: 'Миндаль', kcal: 609, protein: 18.6, fat: 53.7, carbs: 13 },
  { id: 'peanut-butter', name: 'Арахисовая паста', kcal: 588, protein: 25, fat: 50, carbs: 20 },
  { id: 'olive-oil', name: 'Масло оливковое', kcal: 898, protein: 0, fat: 99.8, carbs: 0 },
  { id: 'butter', name: 'Масло сливочное 82%', kcal: 748, protein: 0.5, fat: 82.5, carbs: 0.8 },
  { id: 'honey', name: 'Мёд', kcal: 329, protein: 0.8, fat: 0, carbs: 80.3 },
  { id: 'whey', name: 'Протеин сывороточный', kcal: 380, protein: 75, fat: 6, carbs: 7 },
  { id: 'dark-choc', name: 'Шоколад горький 70%', kcal: 579, protein: 7.8, fat: 42.6, carbs: 34.4 },

  // --- Готовые блюда для завтрака ---
  { id: 'syrniki', name: 'Сырники (жареные)', kcal: 224, protein: 15.5, fat: 10.3, carbs: 17.5 },
  { id: 'oatmeal-milk', name: 'Овсянка на молоке 2.5%', kcal: 102, protein: 3.2, fat: 4.1, carbs: 14.2 },
  { id: 'fried-eggs', name: 'Яичница (жареная на масле)', kcal: 196, protein: 13.6, fat: 15.3, carbs: 0.9 },
  // --- Домашние блюда для обеда ---
  { id: 'borscht', name: 'Борщ с говядиной', kcal: 57, protein: 3.5, fat: 2.8, carbs: 4.5 },
  { id: 'cutlets', name: 'Котлеты домашние свино-говяжьи (жареные)', kcal: 260, protein: 15, fat: 18, carbs: 9.6 },
  { id: 'plov', name: 'Плов с говядиной', kcal: 200, protein: 7, fat: 10.2, carbs: 20 },
  // --- Блюда для ужина ---
  { id: 'fish-veggies', name: 'Рыба белая, запечённая с овощами', kcal: 80, protein: 10, fat: 2.5, carbs: 4.5 },
  { id: 'pasta-bolognese', name: 'Паста болоньезе', kcal: 150, protein: 7.5, fat: 5.5, carbs: 17.5 },
  { id: 'syrniki-berries', name: 'Сырники с ягодами', kcal: 178, protein: 11.8, fat: 7.8, carbs: 15 },
  // --- Мясо, птица, рыба ---
  { id: 'turkey-breast', name: 'Индейка, филе (варёное)', kcal: 130, protein: 25, fat: 3, carbs: 0 },
  { id: 'pork-tenderloin', name: 'Свиная вырезка (запечённая)', kcal: 180, protein: 27, fat: 8, carbs: 0 },
  { id: 'beef-mince', name: 'Фарш говяжий 15% (жареный)', kcal: 250, protein: 24, fat: 17, carbs: 0 },
  { id: 'cod', name: 'Треска (запечённая)', kcal: 105, protein: 23, fat: 0.9, carbs: 0 },
  { id: 'shrimp', name: 'Креветки (варёные)', kcal: 99, protein: 24, fat: 0.3, carbs: 0.2 },
  { id: 'herring', name: 'Сельдь слабосолёная', kcal: 217, protein: 19.8, fat: 15.4, carbs: 0 },
  { id: 'sausages', name: 'Сосиски молочные', kcal: 266, protein: 11, fat: 23.9, carbs: 1.6 },
  { id: 'doctor-sausage', name: 'Колбаса варёная «Докторская»', kcal: 257, protein: 12.8, fat: 22.2, carbs: 1.5 },
  // --- Молочные продукты ---
  { id: 'sour-cream-15', name: 'Сметана 15%', kcal: 158, protein: 2.6, fat: 15, carbs: 3 },
  { id: 'mozzarella', name: 'Сыр моцарелла', kcal: 299, protein: 22.2, fat: 22.4, carbs: 2.2 },
  { id: 'milk-32', name: 'Молоко 3.2%', kcal: 60, protein: 2.9, fat: 3.2, carbs: 4.7 },
  { id: 'ryazhenka-4', name: 'Ряженка 4%', kcal: 67, protein: 2.9, fat: 4, carbs: 4.2 },
  { id: 'feta-brynza', name: 'Брынза', kcal: 260, protein: 17.9, fat: 20.1, carbs: 0 },
  // --- Крупы, бобовые, выпечка ---
  { id: 'corn-flakes', name: 'Хлопья кукурузные', kcal: 357, protein: 7.2, fat: 1.1, carbs: 81 },
  { id: 'bulgur', name: 'Булгур (варёный)', kcal: 83, protein: 3.1, fat: 0.2, carbs: 18.6 },
  { id: 'quinoa', name: 'Киноа (варёная)', kcal: 120, protein: 4.4, fat: 1.9, carbs: 21.3 },
  { id: 'lentils', name: 'Чечевица (варёная)', kcal: 116, protein: 9, fat: 0.4, carbs: 20 },
  { id: 'red-beans', name: 'Фасоль красная (консервированная)', kcal: 99, protein: 6.7, fat: 0.3, carbs: 17.4 },
  { id: 'chickpeas', name: 'Нут (варёный)', kcal: 164, protein: 8.9, fat: 2.6, carbs: 27.4 },
  { id: 'millet', name: 'Пшённая каша на воде', kcal: 90, protein: 3, fat: 0.7, carbs: 17 },
  { id: 'lavash', name: 'Лаваш армянский', kcal: 236, protein: 7.9, fat: 1, carbs: 47.6 },
  { id: 'pelmeni', name: 'Пельмени (варёные)', kcal: 250, protein: 11.9, fat: 12.4, carbs: 23 },
  // --- Овощи, фрукты, ягоды ---
  { id: 'carrot', name: 'Морковь', kcal: 35, protein: 1.3, fat: 0.1, carbs: 6.9 },
  { id: 'cabbage', name: 'Капуста белокочанная', kcal: 27, protein: 1.8, fat: 0.1, carbs: 4.7 },
  { id: 'bell-pepper', name: 'Перец болгарский', kcal: 26, protein: 1.3, fat: 0.1, carbs: 5.3 },
  { id: 'orange', name: 'Апельсин', kcal: 43, protein: 0.9, fat: 0.2, carbs: 8.1 },
  { id: 'strawberry', name: 'Клубника', kcal: 41, protein: 0.8, fat: 0.4, carbs: 7.5 },
  // --- Орехи, сухофрукты, сладкое ---
  { id: 'walnuts', name: 'Грецкий орех', kcal: 654, protein: 15.2, fat: 65.2, carbs: 7 },
  { id: 'raisins', name: 'Изюм', kcal: 299, protein: 3.1, fat: 0.5, carbs: 79 },
  { id: 'sugar', name: 'Сахар', kcal: 398, protein: 0, fat: 0, carbs: 99.7 },
];

export function searchFoods(query: string, db: FoodPreset[] = FOOD_DATABASE, limit = 10): FoodPreset[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return db
    .filter((f) => f.name.toLowerCase().includes(q))
    .sort((a, b) => a.name.toLowerCase().indexOf(q) - b.name.toLowerCase().indexOf(q))
    .slice(0, limit);
}
