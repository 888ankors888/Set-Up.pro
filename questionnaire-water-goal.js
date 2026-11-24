(() => {
  const MIN_WATER_ML = 250;
  const MAX_WATER_ML = 10000;
  const WATER_STEP_ML = 50;

  function createWaterGoalCard(input, label) {
    const card = document.createElement('section');
    card.className = 'card';
    card.id = 'questionnaire-water-goal';

    const heading = document.createElement('h2');
    heading.textContent = 'Цель по воде';
    card.appendChild(heading);

    if (label) {
      label.textContent = 'Личная цель, мл в день';
      card.appendChild(label);
    }
    input.step = String(WATER_STEP_ML);
    card.appendChild(input);

    const help = document.createElement('p');
    help.className = 'subtle';
    help.textContent = 'Эта цель используется в дневнике питания независимо от выбранных привычек. Личный ориентир, не медицинская норма.';
    card.appendChild(help);
    return card;
  }

  function isValidWaterGoal(water) {
    return Number.isInteger(water) && water >= MIN_WATER_ML && water <= MAX_WATER_ML;
  }

  const previousForm = formView;
  formView = function () {
    const template = document.createElement('template');
    template.innerHTML = previousForm();
    const input = template.content.querySelector('#food-water-goal');
    if (!input) return template.innerHTML;

    const label = template.content.querySelector('label[for="food-water-goal"]');
    const note = input.nextElementSibling;
    if (note?.tagName === 'P' && note.textContent.includes('Если выбран водный баланс')) {
      note.remove();
    }

    const card = createWaterGoalCard(input, label);
    const button = template.content.querySelector('button[onclick="saveForm()"]');
    if (button) {
      button.before(card);
    } else {
      template.content.appendChild(card);
    }
    return template.innerHTML;
  };

  const previousSave = saveForm;
  saveForm = function () {
    const input = document.getElementById('food-water-goal');
    if (!input) return previousSave();

    const water = Number(input.value);
    if (!isValidWaterGoal(water)) {
      toast('Укажите цель воды от 250 до 10000 мл');
      return;
    }

    const before = S.profile;
    previousSave();
    if (S.profile && S.profile !== before) {
      S.profile.nutritionGoalSettings = {
        ...S.profile.nutritionGoalSettings,
        waterMl: water
      };
      S.waterGoal = water;
      save();
      render();
    }
  };

  render();
})();
