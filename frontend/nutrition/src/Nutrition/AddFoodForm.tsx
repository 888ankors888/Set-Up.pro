import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { FoodEntry, FoodPreset, MealType } from './types';
import { MEAL_LABELS, MEAL_ORDER } from './types';
import { calcPortion, kcalFromMacros, round1 } from './nutrition';
import { FOOD_DATABASE, searchFoods } from './foodDatabase';
import s from './Nutrition.module.css';

export type FoodFormValue = Omit<FoodEntry, 'id' | 'createdAt'>;

interface Props {
  onSubmit: (value: FoodFormValue) => void;
  onCancel?: () => void;
  /** Если передан — форма в режиме редактирования */
  editing?: FoodEntry | null;
  defaultMeal?: MealType;
  foodDatabase?: FoodPreset[];
}

interface FormState {
  name: string;
  meal: MealType;
  grams: string;
  kcal: string;
  protein: string;
  fat: string;
  carbs: string;
  autoKcal: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

const QUICK_GRAMS = [50, 100, 150, 200, 250];

const guessMeal = (): MealType => {
  const h = new Date().getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
};

const emptyState = (meal: MealType): FormState => ({
  name: '', meal, grams: '100', kcal: '', protein: '', fat: '', carbs: '', autoKcal: true,
});

const num = (v: string) => {
  const n = parseFloat(v.replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

export function AddFoodForm({ onSubmit, onCancel, editing, defaultMeal, foodDatabase = FOOD_DATABASE }: Props) {
  const fid = useId();
  const [form, setForm] = useState<FormState>(() => emptyState(defaultMeal ?? guessMeal()));
  const [errors, setErrors] = useState<Errors>({});
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const nameRef = useRef<HTMLInputElement>(null);

  // Заполнение формы при редактировании
  useEffect(() => {
    if (editing) {
      const { per100 } = editing;
      setForm({
        name: editing.name,
        meal: editing.meal,
        grams: String(editing.grams),
        kcal: String(per100.kcal),
        protein: String(per100.protein),
        fat: String(per100.fat),
        carbs: String(per100.carbs),
        autoKcal: false,
      });
      setErrors({});
      nameRef.current?.focus();
    }
  }, [editing]);

  const suggestions = useMemo(() => searchFoods(form.name, foodDatabase), [form.name, foodDatabase]);

  const p = num(form.protein) || 0;
  const f = num(form.fat) || 0;
  const c = num(form.carbs) || 0;
  const kcal100 = form.autoKcal ? kcalFromMacros(p, f, c) : num(form.kcal) || 0;
  const grams = num(form.grams) || 0;
  const portion = calcPortion({ kcal: kcal100, protein: p, fat: f, carbs: c }, grams);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const applyPreset = (preset: FoodPreset) => {
    setForm((prev) => ({
      ...prev,
      name: preset.name,
      kcal: String(preset.kcal),
      protein: String(preset.protein),
      fat: String(preset.fat),
      carbs: String(preset.carbs),
      autoKcal: false,
    }));
    setErrors({});
    setSuggestOpen(false);
    setActiveIdx(-1);
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!form.name.trim()) e.name = 'Введите название блюда';
    const g = num(form.grams);
    if (!(g > 0) || g > 5000) e.grams = 'От 1 до 5000 г';
    (['protein', 'fat', 'carbs'] as const).forEach((k) => {
      const v = num(form[k] || '0');
      if (!(v >= 0) || v > 100) e[k] = '0–100 г';
    });
    if ((num(form.protein) || 0) + (num(form.fat) || 0) + (num(form.carbs) || 0) > 100) {
      e.carbs = 'Сумма БЖУ > 100 г на 100 г';
    }
    if (!form.autoKcal) {
      const k = num(form.kcal);
      if (!(k >= 0) || k > 900) e.kcal = '0–900 ккал';
    }
    return e;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit({
      name: form.name.trim(),
      meal: form.meal,
      grams: round1(grams),
      per100: { kcal: round1(kcal100), protein: round1(p), fat: round1(f), carbs: round1(c) },
    });
    if (!editing) {
      setForm(emptyState(form.meal));
      nameRef.current?.focus();
    }
  };

  const onNameKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || !suggestions.length) return;
    if (ev.key === 'ArrowDown') {
      ev.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (ev.key === 'ArrowUp') {
      ev.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (ev.key === 'Enter' && activeIdx >= 0) {
      ev.preventDefault();
      applyPreset(suggestions[activeIdx]);
    } else if (ev.key === 'Escape') {
      setSuggestOpen(false);
    }
  };

  const field = (key: 'protein' | 'fat' | 'carbs', label: string) => (
    <label className={s.field}>
      <span className={s.label}>{label}, г</span>
      <input
        className={`${s.input} ${errors[key] ? s.inputError : ''}`}
        inputMode="decimal"
        placeholder="0"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        aria-invalid={!!errors[key]}
      />
      {errors[key] && <span className={s.error}>{errors[key]}</span>}
    </label>
  );

  return (
    <form className={s.card} onSubmit={handleSubmit} noValidate>
      <div className={s.cardHead}>
        <h3 className={s.cardTitle}>{editing ? 'Редактировать блюдо' : 'Добавить блюдо'}</h3>
      </div>

      {/* Приём пищи */}
      <div className={s.segmented} role="radiogroup" aria-label="Приём пищи">
        {MEAL_ORDER.map((m) => (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={form.meal === m}
            className={`${s.segment} ${form.meal === m ? s.segmentActive : ''}`}
            onClick={() => set('meal', m)}
          >
            {MEAL_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Название + автодополнение */}
      <div className={s.field} style={{ position: 'relative' }}>
        <label className={s.label} htmlFor={`${fid}-name`}>Блюдо или продукт</label>
        <input
          id={`${fid}-name`}
          ref={nameRef}
          className={`${s.input} ${errors.name ? s.inputError : ''}`}
          placeholder="Начните вводить: гречка, творог…"
          autoComplete="off"
          value={form.name}
          onChange={(e) => { set('name', e.target.value); setSuggestOpen(true); setActiveIdx(-1); }}
          onFocus={() => setSuggestOpen(true)}
          onBlur={() => setTimeout(() => setSuggestOpen(false), 120)}
          onKeyDown={onNameKeyDown}
          role="combobox"
          aria-expanded={suggestOpen && suggestions.length > 0}
          aria-controls={`${fid}-list`}
          aria-invalid={!!errors.name}
        />
        {errors.name && <span className={s.error}>{errors.name}</span>}
        {suggestOpen && suggestions.length > 0 && (
          <ul id={`${fid}-list`} className={s.suggest} role="listbox">
            {suggestions.map((item, i) => (
              <li
                key={item.id}
                role="option"
                aria-selected={i === activeIdx}
                className={`${s.suggestItem} ${i === activeIdx ? s.suggestActive : ''}`}
                onMouseDown={(e) => { e.preventDefault(); applyPreset(item); }}
              >
                <span>{item.name}</span>
                <span className={s.muted}>
                  {item.kcal} ккал · Б {item.protein} · Ж {item.fat} · У {item.carbs}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Вес */}
      <div className={s.field}>
        <label className={s.label} htmlFor={`${fid}-grams`}>Вес порции, г</label>
        <div className={s.gramsRow}>
          <input
            id={`${fid}-grams`}
            className={`${s.input} ${s.gramsInput} ${errors.grams ? s.inputError : ''}`}
            inputMode="decimal"
            value={form.grams}
            onChange={(e) => set('grams', e.target.value)}
            aria-invalid={!!errors.grams}
          />
          <div className={s.chips}>
            {QUICK_GRAMS.map((g) => (
              <button
                key={g}
                type="button"
                className={`${s.chip} ${grams === g ? s.chipActive : ''}`}
                onClick={() => set('grams', String(g))}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        {errors.grams && <span className={s.error}>{errors.grams}</span>}
      </div>

      {/* БЖУ на 100 г */}
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>Пищевая ценность на 100 г</legend>
        <div className={s.macroGrid}>
          {field('protein', 'Белки')}
          {field('fat', 'Жиры')}
          {field('carbs', 'Углеводы')}
          <label className={s.field}>
            <span className={s.label}>Ккал</span>
            <input
              className={`${s.input} ${errors.kcal ? s.inputError : ''}`}
              inputMode="decimal"
              placeholder="0"
              value={form.autoKcal ? String(Math.round(kcal100)) : form.kcal}
              onChange={(e) => set('kcal', e.target.value)}
              disabled={form.autoKcal}
              aria-invalid={!!errors.kcal}
            />
            {errors.kcal && <span className={s.error}>{errors.kcal}</span>}
          </label>
        </div>
        <label className={s.toggle}>
          <input
            type="checkbox"
            checked={form.autoKcal}
            onChange={(e) => set('autoKcal', e.target.checked)}
          />
          <span>Считать калории по БЖУ (4 / 9 / 4 ккал на грамм)</span>
        </label>
      </fieldset>

      {/* Предпросмотр порции */}
      <div className={s.preview} aria-live="polite">
        <span className={s.previewLabel}>В порции {round1(grams)} г:</span>
        <strong>{Math.round(portion.kcal)} ккал</strong>
        <span>Б {round1(portion.protein)}</span>
        <span>Ж {round1(portion.fat)}</span>
        <span>У {round1(portion.carbs)}</span>
      </div>

      <div className={s.actions}>
        {editing && onCancel && (
          <button type="button" className={s.btnGhost} onClick={onCancel}>Отмена</button>
        )}
        <button type="submit" className={s.btnPrimary}>
          {editing ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
