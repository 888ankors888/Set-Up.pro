import { useEffect, useState } from 'react';
import type { FoodEntry, FoodPreset, NutritionGoals, Totals } from './types';
import { MEAL_LABELS, MEAL_ORDER } from './types';
import { calcPortion, macroEnergySplit, round1, sumTotals, todayKey } from './nutrition';
import { useNutrition, DEFAULT_GOALS } from './useNutrition';
import { AddFoodForm, type FoodFormValue } from './AddFoodForm';
import s from './Nutrition.module.css';

export interface NutritionBlockProps {
  title?: string;
  storageKey?: string;
  initialGoals?: NutritionGoals;
  persist?: boolean;
  foodDatabase?: FoodPreset[];
  /** Колбэк при изменении итогов дня — например, для синхронизации с бэкендом */
  onTotalsChange?: (totals: Totals, date: string) => void;
  className?: string;
}

/* ---------- Вспомогательные компоненты ---------- */

function CalorieRing({ value, goal }: { value: number; goal: number }) {
  const r = 52;
  const C = 2 * Math.PI * r;
  const ratio = goal > 0 ? value / goal : 0;
  const over = ratio > 1;
  const dash = Math.min(ratio, 1) * C;
  const left = Math.round(goal - value);
  return (
    <div className={s.ring}>
      <svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true">
        <circle cx="60" cy="60" r={r} className={s.ringTrack} />
        <circle
          cx="60" cy="60" r={r}
          className={`${s.ringBar} ${over ? s.ringOver : ''}`}
          strokeDasharray={`${dash} ${C}`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className={s.ringCenter}>
        <span className={s.ringValue}>{Math.round(value)}</span>
        <span className={s.ringSub}>из {goal} ккал</span>
        <span className={`${s.ringLeft} ${over ? s.textDanger : ''}`}>
          {over ? `+${Math.abs(left)} сверх` : `осталось ${left}`}
        </span>
      </div>
    </div>
  );
}

function MacroBar({ label, value, goal, tone }: { label: string; value: number; goal: number; tone: 'p' | 'f' | 'c' }) {
  const pct = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;
  const over = value > goal;
  return (
    <div className={s.macroBar}>
      <div className={s.macroBarHead}>
        <span>{label}</span>
        <span className={over ? s.textDanger : s.muted}>
          <strong className={s.num}>{round1(value)}</strong> / {goal} г
        </span>
      </div>
      <div
        className={s.track}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={goal}
        aria-valuenow={round1(value)}
      >
        <div className={`${s.fill} ${s[`tone_${tone}`]} ${over ? s.fillOver : ''}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function GoalsEditor({ goals, onSave, onClose }: { goals: NutritionGoals; onSave: (g: NutritionGoals) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(goals);
  const keys: { k: keyof NutritionGoals; label: string }[] = [
    { k: 'kcal', label: 'Калории, ккал' },
    { k: 'protein', label: 'Белки, г' },
    { k: 'fat', label: 'Жиры, г' },
    { k: 'carbs', label: 'Углеводы, г' },
  ];
  return (
    <form
      className={s.goals}
      onSubmit={(e) => { e.preventDefault(); onSave(draft); onClose(); }}
    >
      <div className={s.macroGrid}>
        {keys.map(({ k, label }) => (
          <label key={k} className={s.field}>
            <span className={s.label}>{label}</span>
            <input
              className={s.input}
              type="number"
              min={0}
              value={draft[k]}
              onChange={(e) => setDraft({ ...draft, [k]: Math.max(0, Number(e.target.value) || 0) })}
            />
          </label>
        ))}
      </div>
      <div className={s.actions}>
        <button type="button" className={s.btnGhost} onClick={() => setDraft(DEFAULT_GOALS)}>По умолчанию</button>
        <button type="button" className={s.btnGhost} onClick={onClose}>Отмена</button>
        <button type="submit" className={s.btnPrimary}>Сохранить цели</button>
      </div>
    </form>
  );
}

function EntryRow({ entry, onEdit, onRemove }: { entry: FoodEntry; onEdit: () => void; onRemove: () => void }) {
  const p = calcPortion(entry.per100, entry.grams);
  return (
    <li className={s.entry}>
      <div className={s.entryMain}>
        <span className={s.entryName}>{entry.name}</span>
        <span className={s.muted}>
          {entry.grams} г · Б {round1(p.protein)} · Ж {round1(p.fat)} · У {round1(p.carbs)}
        </span>
      </div>
      <span className={s.entryKcal}>{Math.round(p.kcal)} <small>ккал</small></span>
      <div className={s.entryActions}>
        <button type="button" className={s.iconBtn} onClick={onEdit} aria-label={`Изменить ${entry.name}`} title="Изменить">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
        </button>
        <button type="button" className={s.iconBtn} onClick={onRemove} aria-label={`Удалить ${entry.name}`} title="Удалить">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
        </button>
      </div>
    </li>
  );
}

const shiftDate = (key: string, days: number) => {
  const [y, m, d] = key.split('-').map(Number);
  return todayKey(new Date(y, m - 1, d + days));
};

const formatDate = (key: string) => {
  if (key === todayKey()) return 'Сегодня';
  if (key === shiftDate(todayKey(), -1)) return 'Вчера';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' });
};

/* ---------- Основной блок ---------- */

export function NutritionBlock({
  title = 'Питание',
  storageKey,
  initialGoals,
  persist,
  foodDatabase,
  onTotalsChange,
  className,
}: NutritionBlockProps) {
  const n = useNutrition({ storageKey, initialGoals, persist });
  const [editing, setEditing] = useState<FoodEntry | null>(null);
  const [goalsOpen, setGoalsOpen] = useState(false);

  // уведомляем родителя об изменении итогов
  useEffect(() => {
    onTotalsChange?.(n.totals, n.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n.totals, n.date]);

  const split = macroEnergySplit(n.totals);

  const handleSubmit = (v: FoodFormValue) => {
    if (editing) {
      n.updateEntry(editing.id, v);
      setEditing(null);
    } else {
      n.addEntry(v);
    }
  };

  return (
    <section className={`${s.root} ${className ?? ''}`} aria-labelledby="nutrition-title">
      <header className={s.header}>
        <h2 id="nutrition-title" className={s.title}>{title}</h2>
        <div className={s.dateNav}>
          <button type="button" className={s.iconBtn} onClick={() => n.setDate(shiftDate(n.date, -1))} aria-label="Предыдущий день">‹</button>
          <span className={s.dateLabel}>{formatDate(n.date)}</span>
          <button
            type="button"
            className={s.iconBtn}
            onClick={() => n.setDate(shiftDate(n.date, 1))}
            disabled={n.date >= todayKey()}
            aria-label="Следующий день"
          >›</button>
        </div>
      </header>

      <div className={s.layout}>
        {/* Сводка */}
        <div className={`${s.card} ${s.summary}`}>
          <div className={s.cardHead}>
            <h3 className={s.cardTitle}>Итого за день</h3>
            <button type="button" className={s.linkBtn} onClick={() => setGoalsOpen((v) => !v)}>
              {goalsOpen ? 'Скрыть цели' : 'Цели'}
            </button>
          </div>

          {goalsOpen ? (
            <GoalsEditor goals={n.goals} onSave={n.setGoals} onClose={() => setGoalsOpen(false)} />
          ) : (
            <div className={s.summaryBody}>
              <CalorieRing value={n.totals.kcal} goal={n.goals.kcal} />
              <div className={s.macroBars}>
                <MacroBar label="Белки" value={n.totals.protein} goal={n.goals.protein} tone="p" />
                <MacroBar label="Жиры" value={n.totals.fat} goal={n.goals.fat} tone="f" />
                <MacroBar label="Углеводы" value={n.totals.carbs} goal={n.goals.carbs} tone="c" />
                <div className={s.split} aria-label="Распределение калорий по БЖУ">
                  <div className={s.splitBar}>
                    <span className={s.tone_p} style={{ width: `${split.protein}%` }} />
                    <span className={s.tone_f} style={{ width: `${split.fat}%` }} />
                    <span className={s.tone_c} style={{ width: `${split.carbs}%` }} />
                  </div>
                  <span className={s.muted}>
                    Энергия: Б {split.protein}% · Ж {split.fat}% · У {split.carbs}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Форма */}
        <AddFoodForm
          onSubmit={handleSubmit}
          editing={editing}
          onCancel={() => setEditing(null)}
          foodDatabase={foodDatabase}
        />

        {/* Приёмы пищи */}
        <div className={`${s.card} ${s.meals}`}>
          <div className={s.cardHead}>
            <h3 className={s.cardTitle}>Приёмы пищи</h3>
            {n.entries.length > 0 && (
              <button
                type="button"
                className={s.linkBtn}
                onClick={() => { if (confirm('Очистить все записи за этот день?')) { n.clearDay(); setEditing(null); } }}
              >
                Очистить день
              </button>
            )}
          </div>

          {n.entries.length === 0 ? (
            <div className={s.empty}>
              <p>Записей пока нет.</p>
              <p className={s.muted}>Добавьте первое блюдо через форму — итоги посчитаются автоматически.</p>
            </div>
          ) : (
            MEAL_ORDER.map((meal) => {
              const list = n.byMeal[meal];
              if (!list.length) return null;
              const t = sumTotals(list);
              return (
                <div key={meal} className={s.mealGroup}>
                  <div className={s.mealHead}>
                    <span className={s.mealName}>{MEAL_LABELS[meal]}</span>
                    <span className={s.muted}>
                      <strong className={s.num}>{Math.round(t.kcal)}</strong> ккал · Б {round1(t.protein)} · Ж {round1(t.fat)} · У {round1(t.carbs)}
                    </span>
                  </div>
                  <ul className={s.entryList}>
                    {list.map((e) => (
                      <EntryRow
                        key={e.id}
                        entry={e}
                        onEdit={() => setEditing(e)}
                        onRemove={() => { n.removeEntry(e.id); if (editing?.id === e.id) setEditing(null); }}
                      />
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

export default NutritionBlock;
