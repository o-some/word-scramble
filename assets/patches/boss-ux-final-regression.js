(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  let dismissedIntroUntil=0;
  const abilityLabels={1:'Deckschrubber-Trick',2:'Verdecktes Wort',3:'Köderwort',4:'Zeitdruck',5:'Versiegelter Platz',6:'Enterhaken',7:'Doppelschlag',8:'Falsche Fährte',9:'Schattenfluch',10:'Königsprüfung'};

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-ux-final-regression-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-ux-final-regression-style';
    style.textContent=`
      body:has(.ws-trail-candidate) .tile.ws-corvin-route:not(.ws-trail-candidate){outline-color:transparent!important;box-shadow:inset 0 2px rgba(255,255,255,.45),0 5px 0 #78460e!important}
      body:has(.ws-trail-candidate) .tile.ws-corvin-route:not(.ws-trail-candidate)::after{display:none!important}
      .ws-boss-intro-start{position:relative!important;z-index:5!important;pointer-events:auto!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important}
      .ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10{contain:layout paint;will-change:auto}
    `;
    doc.head.appendChild(style);
  }

  function installStateBridge(doc){
    if(doc.getElementById('ws-boss-state-bridge'))return;
    const bridge=doc.createElement('script');
    bridge.id='ws-boss-state-bridge';
    bridge.textContent=`(()=>{
      window.__WS_BOSS_ENCOUNTER_ACTIVE__=()=>{try{return Boolean(s&&s.boss)}catch{return false}};
      window.__WS_BOSS_FEEDBACK_ACTIVE__=()=>{try{return Boolean(s&&s.feedback)}catch{return false}};
      window.__WS_RUNTIME_CORE_READY__=()=>Boolean(window.__WS_BASE_RUNTIME__&&window.__WS_BOSS_ABILITIES_4_6__&&window.__WS_BOSS_ABILITIES_7_10__&&window.__WS_VARIABLE_BOSS_WORDS__&&window.__WS_WORD_RARITIES__);
    })();`;
    doc.documentElement.appendChild(bridge);
  }

  function bossActive(win,doc){
    try{
      if(typeof win.__WS_BOSS_ENCOUNTER_ACTIVE__==='function')return Boolean(win.__WS_BOSS_ENCOUNTER_ACTIVE__());
    }catch{}
    const img=doc.querySelector('.bossImg');
    if(!img)return false;
    try{
      const style=win.getComputedStyle(img);
      return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>0&&img.getClientRects().length>0;
    }catch{return false;}
  }

  function currentBossLevel(win,doc){
    const match=doc.querySelector('.bossPlate')?.textContent?.match(/LEVEL\s+(\d+)/i);
    if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
    try{return Math.max(1,Math.min(10,Number(win.sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
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
    doc.querySelector('.ws-boss-intro')?.remove();
    doc.querySelector('.ws-boss-info-chip')?.classList.add('show');
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

  function ensureStableAbilityBadge(doc){
    const win=frame.contentWindow;
    if(!win||!bossActive(win,doc))return;
    const card=doc.querySelector('.card');
    if(!card)return;
    const level=currentBossLevel(win,doc);
    let badge=card.querySelector('.ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10');
    if(!badge){
      badge=doc.createElement('div');
      badge.className=level<=3?'ws-boss-ability-badge':level<=6?'ws-boss-ability-badge-4-6':'ws-boss-ability-badge-7-10';
      const label=card.querySelector('.label');
      if(label)label.insertAdjacentElement('beforebegin',badge);else card.prepend(badge);
    }
    const text=abilityLabels[level]||'Bossfähigkeit';
    if(badge.textContent!==text)badge.textContent=text;
    badge.dataset.wsStableAbility='1';
  }

  function verifyCoreRuntime(doc){
    const win=frame.contentWindow;
    if(!win)return;
    let ready=false;
    try{ready=typeof win.__WS_RUNTIME_CORE_READY__==='function'&&Boolean(win.__WS_RUNTIME_CORE_READY__());}catch{}
    doc.documentElement.dataset.wsCoreRuntime=ready?'ready':'pending';
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.body)return;
      ensureStyles(doc);
      installStateBridge(doc);
      ensureStableAbilityBadge(doc);
      decorateBossInfo(doc);
      bindBossStart(doc);
      verifyCoreRuntime(doc);
      if(doc.documentElement.dataset.wsBossUxFinalRegression==='8')return;
      doc.documentElement.dataset.wsBossUxFinalRegression='8';
      doc.addEventListener('click',event=>{
        if(event.target?.closest?.('.ws-boss-info-chip'))window.setTimeout(()=>{decorateBossInfo(doc);bindBossStart(doc);},0);
        ensureStableAbilityBadge(doc);
      });
      const target=doc.getElementById('game')||doc.body;
      if(target)new MutationObserver(()=>{
        guardReopen(doc);
        ensureStableAbilityBadge(doc);
        decorateBossInfo(doc);
        bindBossStart(doc);
        verifyCoreRuntime(doc);
      }).observe(target,{childList:true,subtree:true});
    }catch(err){console.warn('Word Scramble final boss UX regression patch skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
