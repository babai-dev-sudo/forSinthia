/* anniversary.js — For Sinthia
   Shows anniversary section only on May 2nd
   Envelope tap reveals the letter
*/
(() => {
  'use strict';

  function isAnniversaryToday() {
    const now = new Date();
    return now.getMonth() === 4 && now.getDate() === 2; // May = index 4
  }

  function initPetals() {
    const wrap = document.getElementById('annivPetals');
    if (!wrap) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 14; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      p.style.cssText = `
        left:${Math.random()*80+10}%;
        top:${Math.random()*80+10}%;
        --pd:${(Math.random()*4+4).toFixed(1)}s;
        --pdelay:${(Math.random()*6).toFixed(1)}s;
      `;
      frag.appendChild(p);
    }
    wrap.appendChild(frag);
  }

  function initEnvelope() {
    const envelope  = document.getElementById('annivEnvelope');
    const letterWrap = document.getElementById('letterWrap');
    const hint       = document.getElementById('envHint');
    if (!envelope || !letterWrap) return;

    function open() {
      if (envelope.classList.contains('open')) return;
      envelope.classList.add('open');
      if (hint) { hint.style.opacity = '0'; hint.style.pointerEvents = 'none'; }
      setTimeout(() => letterWrap.classList.add('open'), 550);
    }

    envelope.addEventListener('click', open);
    envelope.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById('s-anniversary');
    if (!section) return;

    if (isAnniversaryToday()) {
      section.style.display = 'flex';
      initPetals();
      initEnvelope();

      // rebuild nav dots to include this section
      if (window.__refreshNav) window.__refreshNav();
    }
    // if not anniversary day, section stays display:none and doesn't appear in snap scroll
  });

})();
