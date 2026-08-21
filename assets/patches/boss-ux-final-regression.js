(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-ux-final-regression-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-ux-final-regression-style';
    style.textContent=`
      body:has(.ws-trail-candidate) .tile.ws-corvin-route:not(.ws-trail-candidate){outline-color:transparent!important;box-shadow:inset 0 2px rgba(255,255,255,.45),0 5px 0 #78460e!important}
      body:has(.ws-trail-candidate) .tile.ws-corvin-route:not(.ws-trail-candidate)::after{display:none!important}
    `;
    doc.head.appendChild(style);
  }

  function decorateBossInfo(doc){
    const intro=doc.querySelector('.ws-boss-intro');
    if(!intro)return;
    const cta=intro.querySelector('.ws-boss-intro-start');
    const kicker=intro.querySelector('.ws-boss-intro-kicker');
    if(!cta||!kicker)return;
    const manual=/ZURÜCK ZUM KAMPF/i.test(cta.textContent||'');
    if(manual&&kicker.textContent!=='ⓘ BOSS-INFO')kicker.textContent='ⓘ BOSS-INFO';
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.body)return;
      ensureStyles(doc);
      decorateBossInfo(doc);
      if(doc.documentElement.dataset.wsBossUxFinalRegression==='1')return;
      doc.documentElement.dataset.wsBossUxFinalRegression='1';
      doc.addEventListener('click',event=>{
        if(!event.target?.closest?.('.ws-boss-info-chip'))return;
        window.setTimeout(()=>decorateBossInfo(doc),0);
      },true);
    }catch(err){console.warn('Word Scramble final boss UX regression patch skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
