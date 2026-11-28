/* Renames the visible label "Мои цели" to "Мои данные" everywhere it is rendered (page title, profile card, buttons, menu items). */
(() => {
'use strict';
const FROM = 'Мои цели', TO = 'Мои данные';
const SELECTOR = 'h1,h2,h3,h4,button,a,summary,span,b,strong,label,legend,p,li,div.sqm-label';
let queued = false;

function renameElement(el) {
  if (el.textContent.trim() !== FROM) return;
  const initial = el.querySelector(':scope > .setup-nav-initial');
  if (initial) {
    initial.textContent = TO[0];
    const rest = [...el.childNodes].find(n => n.nodeType === 3);
    if (rest) rest.textContent = TO.slice(1);
    return;
  }
  if (el.children.length) return;
  el.textContent = TO;
}

function renameAttributes(el) {
  for (const name of ['aria-label', 'title']) {
    const value = el.getAttribute(name);
    if (value && value.includes(FROM)) el.setAttribute(name, value.split(FROM).join(TO));
  }
}

function run() {
  queued = false;
  document.querySelectorAll(SELECTOR).forEach(renameElement);
  document.querySelectorAll('[aria-label*="' + FROM + '"],[title*="' + FROM + '"]').forEach(renameAttributes);
}
function schedule() { if (!queued) { queued = true; requestAnimationFrame(run); } }

function start() {
  run();
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener('pageshow', schedule);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
})();

/* Loads the quick habit check-in window (opened from the "+" quick menu). */
(() => {
'use strict';
if (document.querySelector('script[data-habit-quick]')) return;
const script = document.createElement('script');
script.src = new URL('habit-quick.js?v=1', document.baseURI).href;
script.dataset.habitQuick = 'true';
script.onerror = () => console.warn('habit-quick.js is not loaded');
document.head.append(script);
})();


/* Loads the rebuilt sport section (training hub). */
(() => {
'use strict';
if (document.querySelector('script[data-sport-hub]')) return;
const script = document.createElement('script');
script.src = new URL('sport-hub.js?v=23', document.baseURI).href;
script.dataset.sportHub = 'true';
script.onerror = () => console.warn('sport-hub.js is not loaded');
document.head.append(script);
})();
