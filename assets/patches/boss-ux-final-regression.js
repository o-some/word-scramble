(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  let dismissedIntroUntil=0;

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-ux-final-regression-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-ux-final-regression-style';
    style.textContent=`
      body:has(.ws-trail-candidate) .tile.ws-corvin-route:not(.ws-trail-candidate){outline-color:transparent!important;box-shadow:inset 0 2px rgba(255,255,255,.45),0 5px 0 #78460e!important}
      body:has(.ws-trail-candidate) .tile.ws-corvin-route:not(.ws-trail-candidate)::after{display:none!important}
      .ws-boss-intro-start{position:relative!important;z-index:5!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
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

  function dismissBossIntro(doc){
    dismissedIntroUntil=Date.now()+1400;
    const overlay=doc.querySelector('.ws-boss-intro');
    if(overlay)overlay.remove();
    const chip=doc.querySelector('.ws-boss-info-chip');
    if(chip)chip.classList.add('show');
  }

  function bindBossStart(doc){
    doc.querySelectorAll('.ws-boss-intro-start:not([data-ws-start-guard])').forEach(cta=>{
      cta.dataset.wsStartGuard='1';
      const finish=event=>{
        if(event.type==='touchend')event.preventDefault();
        dismissBossIntro(doc);
      };
      cta.addEventListener('pointerup',finish,{passive:true});
      cta.addEventListener('touchend',finish,{passive:false});
      cta.addEventListener('click',finish);
    });
  }

  function guardReopen(doc){
    if(Date.now()>=dismissedIntroUntil)return;
    doc.querySelectorAll('.ws-boss-intro').forEach(overlay=>overlay.remove());
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.body)return;
      ensureStyles(doc);
      decorateBossInfo(doc);
      bindBossStart(doc);
      if(doc.documentElement.dataset.wsBossUxFinalRegression==='2')return;
      doc.documentElement.dataset.wsBossUxFinalRegression='2';
      doc.addEventListener('click',event=>{
        if(!event.target?.closest?.('.ws-boss-info-chip'))return;
        window.setTimeout(()=>{decorateBossInfo(doc);bindBossStart(doc);},0);
      });
      const target=doc.getElementById('game')||doc.body;
      if(target)new MutationObserver(()=>{
        guardReopen(doc);
        decorateBossInfo(doc);
        bindBossStart(doc);
      }).observe(target,{childList:true,subtree:true});
    }catch(err){console.warn('Word Scramble final boss UX regression patch skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
