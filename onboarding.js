(function () {
  'use strict';

  const STORAGE_KEY = 'setup.onboarding.v1';
  const APP_KEY = 'nt1';
  const VERSION = 1;
  const ROOT = document.querySelector('[data-setup-onboarding]');
  if (!ROOT) return;

  const SHELL = ROOT.querySelector('.setup-onboarding__shell');
  const WELCOME = SHELL.cloneNode(true);
  const STATUS_SELECTOR = '[data-onboarding-status]';

  const STEPS = [
    {
      id: 'sport', label: 'Спорт', questions: [
        {
          id: 'sportGoal', type: 'single',
          title: 'Какая у тебя главная спортивная цель?',
          options: [
            ['lose_weight', 'Снизить вес'],
            ['build_muscle', 'Набрать мышечную массу'],
            ['strength_endurance', 'Увеличить силу и выносливость'],
            ['maintain_fitness', 'Поддерживать форму'],
            ['improve_health', 'Улучшить здоровье']
          ]
        },
        {
          id: 'trainingPlace', type: 'single',
          title: 'Где планируешь заниматься?',
          options: [
            ['gym', 'В тренажёрном зале'],
            ['home', 'Дома'],
            ['outdoors', 'На улице'],
            ['mixed', 'В разных местах'],
            ['undecided', 'Пока не определился']
          ]
        }
      ]
    },
    {
      id: 'nutrition', label: 'Питание', questions: [
        {
          id: 'nutritionGoal', type: 'single',
          title: 'Какая у тебя цель в питании?',
          options: [
            ['lose_weight', 'Снизить вес'],
            ['gain_weight', 'Набрать массу'],
            ['maintain_weight', 'Поддерживать текущий вес'],
            ['balance_diet', 'Сбалансировать питание'],
            ['improve_habits', 'Улучшить пищевые привычки']
          ]
        },
        {
          id: 'nutritionFormat', type: 'single',
          title: 'Какой формат тебе ближе?',
          options: [
            ['count_macros', 'Подсчёт калорий и БЖУ'],
            ['meal_plans', 'Готовые рационы и рецепты'],
            ['healthy_no_counting', 'Здоровое питание без подсчётов'],
            ['ai_recommendations', 'Персональные рекомендации ИИ']
          ]
        }
      ]
    },
    {
      id: 'habits', label: 'Привычки', questions: [
        {
          id: 'habits', type: 'multiple',
          title: 'Какие привычки хочешь развивать?',
          hint: 'Можно выбрать несколько.',
          options: [
            ['regular_training', 'Регулярные тренировки'],
            ['hydration', 'Питьевой режим'],
            ['quality_sleep', 'Качественный сон'],
            ['proper_nutrition', 'Правильное питание'],
            ['daily_activity', 'Ежедневная активность'],
            ['reading_growth', 'Чтение и саморазвитие'],
            ['daily_routine', 'Режим дня']
          ]
        },
        {
          id: 'obstacle', type: 'single',
          title: 'Что чаще всего мешает достигать целей?',
          options: [
            ['discipline', 'Не хватает дисциплины'],
            ['time', 'Не хватает времени'],
            ['motivation', 'Не хватает мотивации'],
            ['no_plan', 'Нет чёткого плана'],
            ['hard_to_track', 'Сложно отслеживать результаты'],
            ['nothing', 'Ничего не мешает']
          ]
        }
      ]
    }
  ];

  const QUESTIONS = STEPS.flatMap(step => step.questions);
  const ALLOWED = new Map(QUESTIONS.map(q => [q.id, new Set(q.options.map(o => o[0]))]));

  let sessionDismissed = false;
  let state = readState();
  let storageAvailable = true;

  function emptyState() {
    return {
      version: VERSION,
      status: 'new',
      step: -1,
      answers: {},
      updatedAt: null
    };
  }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  function sanitizeAnswers(raw) {
    const clean = {};
    if (!isPlainObject(raw)) return clean;

    for (const question of QUESTIONS) {
      const value = raw[question.id];
      const allowed = ALLOWED.get(question.id);
      if (question.type === 'multiple') {
        if (Array.isArray(value)) {
          clean[question.id] = [...new Set(value)].filter(item => allowed.has(item));
        }
      } else if (typeof value === 'string' && allowed.has(value)) {
        clean[question.id] = value;
      }
    }
    return clean;
  }

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return emptyState();
      const parsed = JSON.parse(raw);
      if (!isPlainObject(parsed) || parsed.version !== VERSION) return emptyState();
      const status = ['new', 'draft', 'review'].includes(parsed.status) ? parsed.status : 'new';
      const step = Number.isInteger(parsed.step) && parsed.step >= -1 && parsed.step < STEPS.length
        ? parsed.step
        : -1;
      return {
        version: VERSION,
        status,
        step,
        answers: sanitizeAnswers(parsed.answers),
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null
      };
    } catch (_) {
      storageAvailable = false;
      return emptyState();
    }
  }

  function saveState() {
    state.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      storageAvailable = true;
      return true;
    } catch (_) {
      storageAvailable = false;
      return false;
    }
  }

  function hasExistingProfile() {
    try {
      const raw = localStorage.getItem(APP_KEY);
      if (raw === null) return false;
      const app = JSON.parse(raw);
      return isPlainObject(app) && isPlainObject(app.profile) && Object.keys(app.profile).length > 0;
    } catch (_) {
      // Повреждённое основное состояние нельзя считать новым пользователем.
      return true;
    }
  }

  function setOpen(open) {
    ROOT.hidden = !open;
    document.documentElement.toggleAttribute('data-setup-onboarding-open', open);
  }

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function focusHeading() {
    const heading = ROOT.querySelector('h1');
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: false });
  }

  function setStatus(message) {
    const status = ROOT.querySelector(STATUS_SELECTOR);
    if (status) status.textContent = message || '';
  }

  function showWelcome() {
    ROOT.replaceChildren(WELCOME.cloneNode(true));
    setOpen(true);
    focusHeading();
  }

  function stepComplete(step) {
    return step.questions.every(question => {
      const value = state.answers[question.id];
      return question.type === 'multiple' ? Array.isArray(value) && value.length > 0 : Boolean(value);
    });
  }

  function renderQuestion(question) {
    const fieldset = create('fieldset', 'setup-onboarding__question');
    const legend = create('legend', 'setup-onboarding__legend', question.title);
    fieldset.append(legend);
    if (question.hint) fieldset.append(create('p', 'setup-onboarding__hint', question.hint));

    const list = create('div', 'setup-onboarding__options');
    for (const [value, label] of question.options) {
      const id = `onboarding-${question.id}-${value}`;
      const option = create('label', 'setup-onboarding__option');
      option.htmlFor = id;

      const input = create('input');
      input.id = id;
      input.type = question.type === 'multiple' ? 'checkbox' : 'radio';
      input.name = question.id;
      input.value = value;
      input.checked = question.type === 'multiple'
        ? (state.answers[question.id] || []).includes(value)
        : state.answers[question.id] === value;
      input.dataset.questionId = question.id;

      option.append(input, create('span', 'setup-onboarding__option-label', label));
      list.append(option);
    }
    fieldset.append(list);
    return fieldset;
  }

  function showStep(index) {
    const step = STEPS[index];
    state.step = index;
    if (state.status === 'new') state.status = 'draft';
    saveState();

    const shell = create('div', 'setup-onboarding__shell');
    shell.dataset.onboardingScreen = step.id;

    const progress = create('div', 'setup-onboarding__progress');
    progress.setAttribute('role', 'progressbar');
    progress.setAttribute('aria-label', 'Прогресс анкеты');
    progress.setAttribute('aria-valuemin', '1');
    progress.setAttribute('aria-valuemax', String(STEPS.length));
    progress.setAttribute('aria-valuenow', String(index + 1));
    progress.setAttribute('aria-valuetext', `Шаг ${index + 1} из ${STEPS.length}: ${step.label}`);

    const segments = create('div', 'setup-onboarding__segments');
    STEPS.forEach((_, i) => {
      const segment = create('span', 'setup-onboarding__segment');
      if (i <= index) segment.dataset.active = 'true';
      segments.append(segment);
    });
    progress.append(segments, create('p', 'setup-onboarding__step-label', `Шаг ${index + 1} из ${STEPS.length} · ${step.label}`));

    const title = create('h1', '', step.label);
    title.id = 'setup-onboarding-step-title';
    title.tabIndex = -1;

    const form = create('form', 'setup-onboarding__form');
    form.noValidate = true;
    form.setAttribute('aria-labelledby', title.id);
    step.questions.forEach(question => form.append(renderQuestion(question)));

    const message = create('p', 'setup-onboarding__status');
    message.setAttribute('role', 'status');
    message.dataset.onboardingStatus = '';
    if (!storageAvailable) {
      message.textContent = 'Не удалось сохранить ответы в браузере. Не закрывай страницу до конца анкеты.';
    }

    const actions = create('div', 'setup-onboarding__actions');
    const back = create('button', 'setup-onboarding__button setup-onboarding__button--secondary', 'Назад');
    back.type = 'button';
    back.dataset.onboardingAction = 'back';
    const next = create('button', 'setup-onboarding__button setup-onboarding__button--primary',
      index === STEPS.length - 1 ? 'Готово' : 'Далее');
    next.type = 'submit';
    next.dataset.onboardingAction = 'next';
    next.disabled = !stepComplete(step);
    actions.append(back, next);

    form.append(message, actions);
    shell.append(progress, title, form);
    ROOT.replaceChildren(shell);
    setOpen(true);
    title.focus();
  }

  function showReview() {
    state.status = 'review';
    state.step = STEPS.length;
    saveState();
    document.dispatchEvent(new CustomEvent('setup:onboarding-answered', {
      detail: { answers: JSON.parse(JSON.stringify(state.answers)) }
    }));

    const shell = create('div', 'setup-onboarding__shell');
    const title = create('h1', '', 'Ответы сохранены');
    title.tabIndex = -1;
    const text = create('p', 'setup-onboarding__lead',
      'Анкета сохранена в этом браузере. Карточка «Твой будущий Set-Up» и регистрация подключаются на следующих этапах.');
    const actions = create('div', 'setup-onboarding__actions');
    const back = create('button', 'setup-onboarding__button setup-onboarding__button--secondary', 'Изменить ответы');
    back.type = 'button';
    back.dataset.onboardingAction = 'edit';
    const close = create('button', 'setup-onboarding__button setup-onboarding__button--primary', 'Перейти в приложение');
    close.type = 'button';
    close.dataset.onboardingAction = 'close';
    actions.append(back, close);
    shell.append(title, text, actions);
    ROOT.replaceChildren(shell);
    title.focus();
  }

  function updateAnswer(input) {
    const question = QUESTIONS.find(item => item.id === input.dataset.questionId);
    if (!question || !ALLOWED.get(question.id).has(input.value)) return;

    if (question.type === 'multiple') {
      const selected = new Set(state.answers[question.id] || []);
      if (input.checked) selected.add(input.value); else selected.delete(input.value);
      state.answers[question.id] = question.options
        .map(option => option[0])
        .filter(value => selected.has(value));
    } else {
      state.answers[question.id] = input.value;
    }

    if (!saveState()) {
      const status = ROOT.querySelector(STATUS_SELECTOR);
      if (status) status.textContent = 'Не удалось сохранить ответы в браузере. Не закрывай страницу до конца анкеты.';
    }
    const next = ROOT.querySelector('[data-onboarding-action="next"]');
    if (next) next.disabled = !stepComplete(STEPS[state.step]);
  }

  ROOT.addEventListener('change', event => {
    if (event.target.matches('input[data-question-id]')) updateAnswer(event.target);
  });

  ROOT.addEventListener('submit', event => {
    event.preventDefault();
    if (state.step < 0 || state.step >= STEPS.length) return;
    if (!stepComplete(STEPS[state.step])) {
      setStatus('Ответь на все вопросы шага, чтобы продолжить.');
      return;
    }
    if (state.step === STEPS.length - 1) showReview();
    else showStep(state.step + 1);
  });

  ROOT.addEventListener('click', event => {
    const button = event.target.closest('[data-onboarding-action]');
    if (!button) return;
    const action = button.dataset.onboardingAction;

    if (action === 'start') {
      showStep(Math.max(0, Math.min(state.step, STEPS.length - 1)));
    } else if (action === 'existing-account') {
      sessionDismissed = true;
      setOpen(false);
      document.dispatchEvent(new CustomEvent('setup:onboarding-existing-account'));
    } else if (action === 'back') {
      if (state.step <= 0) {
        state.step = -1;
        saveState();
        showWelcome();
      } else {
        showStep(state.step - 1);
      }
    } else if (action === 'edit') {
      showStep(STEPS.length - 1);
    } else if (action === 'close') {
      sessionDismissed = true;
      setOpen(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !ROOT.hidden) {
      sessionDismissed = true;
      setOpen(false);
    }
  });

  function init() {
    if (hasExistingProfile() || sessionDismissed) return;

    if (state.status === 'review') showReview();
    else if (state.step >= 0 && state.step < STEPS.length) showStep(state.step);
    else showWelcome();
  }

  window.SetUpOnboarding = Object.freeze({
    open() { sessionDismissed = false; init(); },
    getAnswers() { return JSON.parse(JSON.stringify(state.answers)); }
  });

  init();
})();
