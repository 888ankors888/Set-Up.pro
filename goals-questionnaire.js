(() => {
  if (window.foodQuestionnaireLayoutInstalled) return;
  window.foodQuestionnaireLayoutInstalled = true;
  const previousForm = formView;
  const groups = [
    ['about', 'О вас', 'Ваши данные и главный ориентир. Ответы можно изменить позже.'],
    ['nutrition', 'Питание', 'Выберите, что хотите улучшить. Не нужно менять всё сразу.'],
    ['sport', 'Спорт', 'Укажите опыт, доступное время и ограничения для подбора программы.'],
    ['habits', 'Привычки', 'Начните с небольших действий. Отмечайте только то, что хотите отслеживать.']
  ];
  function wrapBlock(id, title, hint, index) {
    const block = document.createElement('section');
    block.className = 'card goals-questionnaire-block';
    block.id = 'goals-questionnaire-' + id;
    block.setAttribute('aria-labelledby', block.id + '-title');
    block.innerHTML = '<div class="eyebrow">Блок ' + (index + 1) + ' из 4</div><h2 id="' + block.id + '-title">' + title + '</h2><p class="mu">' + hint + '</p>';
    return block;
  }
  function moveCard(card, destination, optional) {
    if (!optional) {
      card.classList.remove('card');
      card.classList.add('goals-questionnaire-fields');
      destination.appendChild(card);
      return;
    }
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = card.querySelector('h2')?.textContent || 'Дополнительные вопросы';
    details.appendChild(summary);
    card.querySelector('h2')?.remove();
    card.classList.remove('card');
    details.appendChild(card);
    destination.appendChild(details);
  }
  formView = function () {
    const template = document.createElement('template');
    template.innerHTML = previousForm();
    const root = template.content;
    const cards = [...root.children].filter(node => node.classList.contains('card'));
    if (!cards.length) return template.innerHTML;
    const blocks = Object.fromEntries(groups.map(([id, title, hint], index) => [id, wrapBlock(id, title, hint, index)]));
    const first = cards[0];
    first.before(...groups.map(([id]) => blocks[id]));
    for (const card of cards) {
      const title = card.querySelector('h2')?.textContent.trim() || '';
      if (title === 'О вас') {
        moveCard(card, blocks.about, false);
        card.querySelector('h2')?.remove();
      } else if (card.id === 'food-goals-form' || title === 'Цель') {
        moveCard(card, blocks.about, false);
        const heading = card.querySelector('h2');
        if (heading) heading.textContent = 'Главный ориентир';
      } else if (title === 'Здоровье') {
        moveCard(card, blocks.about, true);
      } else if (card.id === 'sport-form') {
        moveCard(card, blocks.sport, false);
        card.querySelector('h2')?.remove();
      } else if (card.id === 'questionnaire-water-goal' || title === 'Цель по воде') {
        moveCard(card, blocks.habits, false);
      } else if (title === 'Ваша ладонь') {
        moveCard(card, blocks.nutrition, true);
      } else {
        moveCard(card, blocks.nutrition, false);
      }
    }
    const habitIds = ['water', 'tracking', 'new_food'];
    root.querySelectorAll('.food-nutrition-goal').forEach(input => {
      if (!habitIds.includes(input.value)) return;
      const option = input.closest('label');
      if (option) blocks.habits.appendChild(option);
    });
    const note = document.createElement('p');
    note.className = 'subtle';
    note.textContent = 'Вода связана с существующим счётчиком. Выбор регулярных записей и новых блюд пока сохраняет настройки: отдельные трекеры этих привычек ещё не подключены.';
    blocks.habits.appendChild(note);
    const heading = root.querySelector('h1');
    if (heading) heading.textContent = 'Мои цели';
    const button = root.querySelector('button[onclick="saveForm()"]');
    if (button) button.textContent = 'Сохранить анкету';
    return template.innerHTML;
  };
  window.foodGoalsPage = () => formView();
  const style = document.createElement('style');
  style.id = 'goals-questionnaire-style';
  style.textContent = '.goals-questionnaire-block{border:1px solid var(--ln);border-inline-start:5px solid var(--ac);padding:24px;margin:24px 0}.goals-questionnaire-block>h2{font-size:24px;margin:6px 0}.goals-questionnaire-block input[type=checkbox]{width:auto;flex:none}.goals-questionnaire-block .food-goal-option{display:flex;align-items:flex-start;gap:10px;padding:12px;border:1px solid var(--ln);border-radius:12px;margin:8px 0}.goals-questionnaire-block .food-goal-option small{display:block;color:var(--mu)}.goals-questionnaire-block details{padding:14px 0;border-top:1px solid var(--ln);margin-top:14px}.goals-questionnaire-block summary{cursor:pointer;color:var(--ac);font-weight:600}.goals-questionnaire-fields{margin:16px 0}.goals-questionnaire-fields h2{font-size:17px}#goals-questionnaire-about{border-inline-start-color:#7895b8}#goals-questionnaire-nutrition{border-inline-start-color:#78a174}#goals-questionnaire-sport{border-inline-start-color:#b58ac0}#goals-questionnaire-habits{border-inline-start-color:#c5a35c}@media(max-width:600px){.goals-questionnaire-block{padding:18px;margin:18px 0}}';
  document.head.appendChild(style);
  render();
  const loadOptions=()=>{const script=document.createElement('script');script.src=new URL('questionnaire-options.js?v=1',document.baseURI).href;script.onload=()=>{const blocks=document.createElement('script');blocks.src=new URL('questionnaire-blocks.js?v=1',document.baseURI).href;document.head.appendChild(blocks);};document.head.appendChild(script);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadOptions,{once:true});else loadOptions();
})();
