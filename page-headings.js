/* Компактные неоновые шапки страниц «Спорт», «Питание», «Привычки»: без большого слогана, со значком раздела. */
(() => {
'use strict';
if (window.setupPageHeadings) return;
window.setupPageHeadings = true;
const ic = d => "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23071108' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'>" + d + "</svg>\")";
const ICONS = {
  sport: ic("<path d='M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11'/>"),
  eat: ic("<path d='M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10'/>"),
  habit: ic("<circle cx='12' cy='12' r='9'/><path d='m8 12.5 2.8 2.8L16 9.5'/>")
};
const css = `
html:root:root:root:root body :is(.setup-page-heading,[data-setup-section-header],[data-setup-sport-header]) h1{display:none!important}
html:root:root:root:root body :is(.setup-page-heading,[data-setup-section-header],[data-setup-sport-header]){display:flex!important;align-items:center;gap:12px;margin:-16px 0 14px!important;padding:0!important}
html:root:root:root:root body :is(.setup-page-heading,[data-setup-section-header],[data-setup-sport-header])>div:not(.eyebrow){display:contents}
html:root:root:root:root body .eyebrow[data-ph]{position:relative;display:inline-flex!important;align-items:center;gap:10px;flex:none;margin:0!important;padding:6px 16px 6px 7px;border-radius:999px;border:1px solid rgba(184,255,44,.38);background:linear-gradient(100deg,rgba(184,255,44,.16),rgba(56,232,255,.05) 70%,rgba(184,255,44,.02));box-shadow:0 0 20px rgba(184,255,44,.2),inset 0 0 14px rgba(184,255,44,.07);color:#d6ff6e!important;font-size:12px!important;font-weight:800;letter-spacing:.16em;text-transform:uppercase;text-shadow:0 0 12px rgba(184,255,44,.55);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);white-space:nowrap}
.eyebrow[data-ph]::before{content:"";flex:none;width:26px;height:26px;border-radius:50%;background-color:#c8f560;background-repeat:no-repeat;background-position:center;background-size:15px;box-shadow:0 0 14px rgba(184,255,44,.7)}
.eyebrow[data-ph=sport]::before{background-image:${ICONS.sport}}
.eyebrow[data-ph=eat]::before{background-image:${ICONS.eat}}
.eyebrow[data-ph=habit]::before{background-image:${ICONS.habit}}
.eyebrow[data-ph]::after{content:"";position:absolute;right:-6px;top:50%;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;background:#b8ff2c;box-shadow:0 0 10px #b8ff2c;animation:phpulse 2.6s ease-in-out infinite;display:none}
:is(.setup-page-heading,[data-setup-section-header],[data-setup-sport-header]):has(>.eyebrow[data-ph])::before{content:"";flex:1;min-width:20px;height:1px;background:linear-gradient(270deg,rgba(184,255,44,.55),rgba(56,232,255,.18) 60%,transparent)}
:is(.setup-page-heading,[data-setup-section-header],[data-setup-sport-header]):has(>.eyebrow[data-ph])::after{content:"";flex:1;min-width:20px;height:1px;background:linear-gradient(90deg,rgba(184,255,44,.55),rgba(56,232,255,.18) 60%,transparent)}
:is(.setup-page-heading):has(>div>.eyebrow[data-ph])>div::before{content:"";flex:1;min-width:20px;height:1px;background:linear-gradient(270deg,rgba(184,255,44,.55),rgba(56,232,255,.18) 60%,transparent)}
:is(.setup-page-heading):has(>div>.eyebrow[data-ph])>div::after{content:"";flex:1;min-width:20px;height:1px;background:linear-gradient(90deg,rgba(184,255,44,.55),rgba(56,232,255,.18) 60%,transparent)}
html:root:root:root:root body .setup-page-heading>.tag{margin-left:auto;flex:none}
@keyframes phpulse{0%,100%{opacity:.4}50%{opacity:1}}
@media(max-width:380px){html:root:root:root:root body .eyebrow[data-ph]{letter-spacing:.1em;font-size:11px!important}}
`;
const st = document.createElement('style'); st.id = 'setup-page-headings-css'; st.textContent = css; document.head.append(st);
let q = false;
function run() {
  q = false;
  document.querySelectorAll('.setup-page-heading .eyebrow,[data-setup-section-header] .eyebrow,[data-setup-sport-header] .eyebrow,#app>header>.eyebrow').forEach(e => {
    const t = (e.textContent || '').toLowerCase();
    const k = /спорт|трениров/.test(t) ? 'sport' : /питани|еда|еды/.test(t) ? 'eat' : /привыч/.test(t) ? 'habit' : '';
    if (k && e.dataset.ph !== k) e.dataset.ph = k;
  });
}
const sched = () => { if (!q) { q = true; requestAnimationFrame(run); } };
new MutationObserver(sched).observe(document.documentElement, {childList: true, subtree: true, characterData: true});
run();
})();
