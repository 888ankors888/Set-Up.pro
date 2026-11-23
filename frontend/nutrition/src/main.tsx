import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NutritionBlock } from './Nutrition';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NutritionBlock
      initialGoals={{ kcal: 2200, protein: 140, fat: 70, carbs: 250 }}
      onTotalsChange={(t, date) => console.log(date, t)}
    />
  </StrictMode>,
);
