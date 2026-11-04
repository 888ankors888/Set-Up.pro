(() => {
  const section=document.createElement('section');section.className='card';section.id='workouts-weekly-program';
  const heading=document.createElement('h2');heading.textContent='Программа тренировок';
  const status=document.createElement('p');status.setAttribute('role','status');status.textContent='Загрузка планировщика…';
  const frame=document.createElement('iframe');frame.title='Недельная программа тренировок';frame.style.cssText='width:100%;height:900px;border:0;display:block;visibility:hidden';
  const retry=document.createElement('button');retry.type='button';retry.className='btn s';retry.textContent='Повторить загрузку';retry.hidden=true;
  const link=document.createElement('a');link.href='index.html';link.textContent='Открыть основное приложение';link.hidden=true;
  section.append(heading,status,retry,link,frame);const main=document.querySelector('main');main.insertBefore(section,main.querySelector('section'));
  let cleanup=()=>{};
  function load(){cleanup();retry.hidden=true;link.hidden=true;status.textContent='Загрузка планировщика…';frame.style.visibility='hidden';frame.src='index.html?workouts-program=2&t='+Date.now();}
  retry.onclick=load;
  frame.addEventListener('load',()=>{
    cleanup();const w=frame.contentWindow,d=frame.contentDocument;if(!d)return;
    let tick=0,requested=false,timer,resizeObserver;const errors=[];
    const capture=e=>{errors.push(e.message||String(e.reason||'Ошибка JavaScript'));};w.addEventListener('error',capture);w.addEventListener('unhandledrejection',capture);
    const style=d.createElement('style');style.textContent='body{padding:0!important}#nav{display:none!important}#app{padding:0!important;max-width:none!important;margin:0!important}#app>*:not(#training-sport-program){display:none!important}#training-sport-program>*:not(#daily-training-week){display:none!important}#daily-training-week{margin:0!important;padding:8px!important}#daily-training-week>h2{display:none!important}';d.head.append(style);
    function fail(message){clearInterval(timer);status.textContent=message+(errors.length?' Ошибка: '+errors.slice(-2).join('; '):'');retry.hidden=false;link.hidden=false;}
    cleanup=()=>{clearInterval(timer);resizeObserver?.disconnect();w.removeEventListener('error',capture);w.removeEventListener('unhandledrejection',capture);};
    timer=setInterval(()=>{try{
      tick++;
      const block=d.getElementById('daily-training-week');
      if(block){clearInterval(timer);frame.style.visibility='visible';status.textContent='Планирование недели. Выполнение записывается только после подтверждения.';const resize=()=>{const root=d.getElementById('training-sport-program');frame.style.height=Math.max(900,(root?.getBoundingClientRect().height||0)+100)+'px';};resizeObserver=new w.ResizeObserver(resize);resizeObserver.observe(d.getElementById('app')||d.body);resize();return;}
      if(typeof w.sportsGo==='function'){
        if(!w.foodDailyPlannerInstalled&&!requested){requested=true;const s=d.createElement('script');s.src=new URL('daily-training.js?v=workouts-recovery-2',frame.src).href;s.onerror=()=>fail('Не загружается daily-training.js.');s.onload=()=>{if(!w.foodDailyPlannerInstalled)fail('daily-training.js получен, но не инициализирован.');};d.head.append(s);}
        if(tick%4===0)w.sportsGo('training');
      }
      if(tick>=120){const state=['sportsGo: '+typeof w.sportsGo,'дневной модуль: '+!!w.foodDailyPlannerInstalled,'контейнер спортивного экрана: '+!!d.getElementById('training-sport-program')];fail('Планировщик не открылся. Диагностика: '+state.join(' · '));}
    }catch(e){errors.push(e.message);fail('Ошибка запуска планировщика.');}},250);
  });
  window.addEventListener('pagehide',()=>cleanup(),{once:true});load();
})();
