/* Header logo: "Set" + glossy neon-maze sphere + "Up", one link to the home page */
(() => {
'use strict';

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" focusable="false" aria-hidden="true">
  <defs>
    <radialGradient id="sphereGrad" cx="38%" cy="28%" r="70%" fx="32%" fy="22%">
      <stop offset="0%" stop-color="#454a4e"/>
      <stop offset="25%" stop-color="#1b1e21"/>
      <stop offset="70%" stop-color="#090a0c"/>
      <stop offset="100%" stop-color="#000000"/>
    </radialGradient>
    <radialGradient id="rimLight" cx="50%" cy="92%" r="45%">
      <stop offset="0%" stop-color="#2c3e35" stop-opacity="0.7"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="neonGrad" x1="20%" y1="15%" x2="80%" y2="85%">
      <stop offset="0%" stop-color="#b4ff6b"/>
      <stop offset="45%" stop-color="#76e86c"/>
      <stop offset="100%" stop-color="#2ba859"/>
    </linearGradient>
    <linearGradient id="glossTop" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <linearGradient id="glossSide" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>
    <filter id="neonGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="5" result="blur1"/>
      <feGaussianBlur stdDeviation="12" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <clipPath id="sphereClip">
      <circle cx="256" cy="256" r="236"/>
    </clipPath>
  </defs>
  <g clip-path="url(#sphereClip)">
    <circle cx="256" cy="256" r="236" fill="url(#sphereGrad)"/>
    <circle cx="256" cy="256" r="236" fill="url(#rimLight)"/>
    <circle cx="256" cy="256" r="175" fill="#4ce66d" opacity="0.12" filter="url(#neonGlow)"/>
    <g fill="none" stroke="url(#neonGrad)" stroke-linecap="round" stroke-linejoin="round" filter="url(#neonGlow)">
      <path d="M 244 90 A 166 166 0 0 0 90 244 L 122 244" stroke-width="11"/>
      <path d="M 268 90 A 166 166 0 0 1 422 244" stroke-width="11"/>
      <path d="M 90 268 A 166 166 0 0 0 244 422 L 244 390" stroke-width="11"/>
      <path d="M 422 268 A 166 166 0 0 1 268 422 L 268 390" stroke-width="11"/>
      <path d="M 244 122 A 134 134 0 0 0 122 244" stroke-width="11"/>
      <path d="M 268 122 A 134 134 0 0 1 390 244 L 358 244" stroke-width="11"/>
      <path d="M 122 268 A 134 134 0 0 0 220 385" stroke-width="11"/>
      <path d="M 390 268 A 134 134 0 0 1 292 385" stroke-width="11"/>
      <path d="M 162 215 A 102 102 0 0 1 350 215" stroke-width="11"/>
      <path d="M 154 268 A 102 102 0 0 0 358 268" stroke-width="11"/>
      <path d="M 186 256 A 70 70 0 1 1 326 256 A 70 70 0 0 1 268 325 L 268 358" stroke-width="11"/>
      <path d="M 186 256 A 70 70 0 0 0 244 325 L 244 358" stroke-width="11"/>
      <path d="M 244 292 A 38 38 0 1 1 268 292" stroke-width="11"/>
      <circle cx="145" cy="215" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="348" cy="188" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="404" cy="212" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="185" cy="340" r="7" fill="#0d1210" stroke-width="4.5"/>
      <circle cx="332" cy="336" r="7" fill="#0d1210" stroke-width="4.5"/>
    </g>
    <path d="M 118 112 C 165 44, 347 44, 394 112 C 345 78, 167 78, 118 112 Z" fill="url(#glossTop)"/>
    <path d="M 65 170 C 44 215, 44 275, 62 315 C 66 270, 68 215, 86 175 Z" fill="url(#glossSide)"/>
    <circle cx="256" cy="256" r="235" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
  </g>
</svg>`;

if (!document.getElementById('setup-logo-font')) {
  const link = document.createElement('link');
  link.id = 'setup-logo-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@1,700;1,800&display=swap';
  document.head.appendChild(link);
}

/* NOTE: the site hides every "span" inside ".brand" (body .brand span{display:none!important}),
   so the logo parts are <b>/<i> elements and the main rules are repeated with high specificity. */
const style = document.createElement('style');
style.id = 'setup-logo-style';
style.textContent = `
html body .brand a.setup-logo,html body a.setup-logo{display:inline-flex!important;align-items:center!important;gap:.2em;height:1.4em;font-family:'Exo 2','Chakra Petch',system-ui,-apple-system,'Segoe UI',sans-serif!important;font-style:italic;font-weight:800;font-size:34px;line-height:1;letter-spacing:.005em;color:#fff!important;text-decoration:none!important;white-space:nowrap;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;flex:none!important;width:auto!important;max-width:none!important;margin:0!important;padding:0!important;visibility:visible!important;opacity:1!important}
html body a.setup-logo b.setup-logo-word{display:inline-block!important;font:inherit!important;color:#fff!important;letter-spacing:inherit!important;text-shadow:0 2px 8px rgba(0,0,0,.5)}
html body a.setup-logo i.setup-logo-orb{display:inline-block!important;font-style:normal;width:1.14em;height:1.14em;flex:none;filter:drop-shadow(0 0 8px rgba(76,230,109,.45));transition:transform .35s ease,filter .35s ease}
html body a.setup-logo i.setup-logo-orb svg{display:block!important;width:100%!important;height:100%!important;overflow:visible}
html body a.setup-logo:hover i.setup-logo-orb,html body a.setup-logo:focus-visible i.setup-logo-orb{transform:rotate(25deg) scale(1.06);filter:drop-shadow(0 0 14px rgba(76,230,109,.7))}
html body a.setup-logo:focus-visible{outline:2px solid #b4ff6b;outline-offset:4px;border-radius:8px}
@media(max-width:768px){html body .brand a.setup-logo,html body a.setup-logo{font-size:26px}}
@media(prefers-reduced-motion:reduce){html body a.setup-logo i.setup-logo-orb{transition:none}html body a.setup-logo:hover i.setup-logo-orb,html body a.setup-logo:focus-visible i.setup-logo-orb{transform:none}}
html:root:root:root:root:root:root body:has(#nav) :is(.brand:not(.big),main>.setup-home)>img{display:none!important}
`;
document.head.appendChild(style);

let serial = 0;
function build() {
  const id = 'sl' + (++serial);
  const a = document.createElement('a');
  a.className = 'setup-logo';
  a.href = '/';
  a.setAttribute('aria-label', 'SetUp — На главную');
  const svg = SVG.replace(/(id="|url\(#)(sphereGrad|rimLight|neonGrad|glossTop|glossSide|neonGlow|sphereClip)/g, '$1' + id + '-$2');
  a.innerHTML = '<b class="setup-logo-word">Set</b><i class="setup-logo-orb" aria-hidden="true">' + svg + '</i><b class="setup-logo-word">Up</b>';
  return a;
}

let queued = false;
function apply() {
  queued = false;
  document.querySelectorAll('.brand:not(.big),main>.setup-home').forEach(brand => {
    if (brand.querySelector(':scope>.setup-logo')) return;
    brand.prepend(build());
  });
}
function schedule() { if (!queued) { queued = true; requestAnimationFrame(apply); } }

function start() {
  apply();
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('pageshow', schedule);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
else start();
})();
