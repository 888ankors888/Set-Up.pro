(() => {
  const section = document.createElement('section');
  section.className = 'card';
  section.id = 'workouts-weekly-program';
  const heading = document.createElement('h2');
  heading.textContent = 'Программа тренировок';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = 'Загрузка недельного планировщика…';
  const frame = document.createElement('iframe');
  frame.title = 'Программа тренировок с понедельника по воскресенье';
  frame.style.cssText = 'width:100%;height:800px;border:0;display:none;background:transparent';
  frame.src = 'index.html?workouts-program=1';
  section.append(heading, status, frame);
  const main = document.querySelector('main');
  main.insertBefore(section, main.querySelector('section'));
  frame.addEventListener('load', () => {
    try {
      const w = frame.contentWindow, d = frame.contentDocument;
      const style = d.createElement('style');
      style.textContent = 'body{padding:0!important}body> :not(#app):not(dialog):not(#toast):not(style):not(script){display:none!important}#app{padding:0!important;max-width:none!important;margin:0!important}#app>*:not(#training-sport-program){display:none!important}#training-sport-program>*:not(#daily-training-week){display:none!important}#daily-training-week{margin:0!important;border:0!important;box-shadow:none!important;padding:8px!important}#daily-training-week>h2{display:none!important}#daily-training-week .daily-plan-grid{grid-template-columns:1fr!important}dialog{position:fixed!important;max-height:85vh!important}';
      d.head.appendChild(style);
      let attempts = 0, opened = false, observer;
      const timer = setInterval(() => {
        attempts++;
        try {
          if (!opened && typeof w.sportsGo === 'function') {
            opened = true;
            w.sportsGo('training');
          }
          const block = d.getElementById('daily-training-week');
          if (block) {
            clearInterval(timer);
            status.textContent = 'План и выполнение связаны со спортивным дневником и целями food.pro. До подтверждения выполнения активности остаются планом.';
            frame.style.display = 'block';
            const resize = () => { frame.style.height = Math.max(800, block.getBoundingClientRect().height + 80) + 'px'; };
            observer = new w.ResizeObserver(resize);
            observer.observe(d.getElementById('training-sport-program'));
            resize();
          } else if (attempts >= 80) {
            clearInterval(timer);
            status.textContent = 'Не удалось открыть планировщик. Проверьте сохранение анкеты в «Моих целях» и загрузку спортивного модуля.';
            const link = document.createElement('a');
            link.href = 'index.html';
            link.textContent = ' Открыть основное приложение';
            status.appendChild(link);
          }
        } catch (error) {
          clearInterval(timer);
          status.textContent = 'Ошибка загрузки планировщика: ' + error.message;
        }
      }, 250);
      window.addEventListener('pagehide', () => { clearInterval(timer); observer?.disconnect(); }, {once:true});
    } catch (error) { status.textContent = 'Не удалось загрузить встроенный планировщик: ' + error.message; }
  });
})();
