(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  let dismissedIntroUntil=0;
  let integrityBusy=false;
  let lastIntegrityRepair=0;
  const integrityVersion='20260822-1337-1';
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

  function bossActive(win,doc){
    try{
      if(typeof win.__WS_BOSS_ENCOUNTER_ACTIVE__==='function')return Boolean(win.__WS_BOSS_ENCOUNTER_ACTIVE__());
    }catch{}
    return Boolean(doc.querySelector('.bossSide'));
  }

  function currentBossLevel(win,doc){
    const match=doc.querySelector('.bossPlate')?.textContent?.match(/LEVEL\s+(\d+)/i);
    if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
    try{return Math.max(1,Math.min(10,Number(win.sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
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

  function loadFreshPatch(id,src){
    return new Promise(resolve=>{
      document.getElementById(id)?.remove();
      const script=document.createElement('script');
      script.id=id;
      script.src=src+(src.includes('?')?'&':'?')+'v='+integrityVersion+'&t='+Date.now();
      script.addEventListener('load',()=>resolve(true),{once:true});
      script.addEventListener('error',()=>resolve(false),{once:true});
      document.head.appendChild(script);
    });
  }

  function sentenceApiReady(win){
    return Boolean(win.__WS_VARIABLE_BOSS_WORDS__&&typeof win.WS_GET_BOSS_UNITS==='function'&&typeof win.WS_IS_BOSS_SENTENCE_MODE==='function');
  }

  function sentenceLooksHealthy(win,doc){
    if(!bossActive(win,doc))return true;
    if(!sentenceApiReady(win))return false;
    let sentenceMode=false;
    try{sentenceMode=Boolean(win.WS_IS_BOSS_SENTENCE_MODE());}catch{}
    const prompt=(doc.querySelector('.prompt h1')?.textContent||'').trim();
    const legacy=/^PIRATE$/i.test(prompt)||/^PIRAT$/i.test(prompt);
    return sentenceMode&&!legacy;
  }

  function rarityRuntimeReady(win,doc){
    return Boolean(win.__WS_WORD_RARITIES__&&doc.getElementById('ws-word-rarities-style'));
  }

  async function repairSentenceRuntime(win,doc){
    if(sentenceApiReady(win)){
      try{if(typeof win.setup==='function')win.setup();else if(typeof win.render==='function')win.render();}catch{}
      await new Promise(r=>setTimeout(r,60));
      if(sentenceLooksHealthy(win,doc))return;
    }
    try{
      win.__WS_VARIABLE_BOSS_WORDS__=false;
      doc.getElementById('ws-variable-boss-words-runtime')?.remove();
    }catch{}
    await loadFreshPatch('ws-variable-boss-words-integrity-loader','./assets/patches/variable-boss-words.js');
  }

  async function repairRarityRuntime(win,doc){
    if(rarityRuntimeReady(win,doc)){
      try{if(typeof win.render==='function')win.render();}catch{}
      return;
    }
    try{
      win.__WS_WORD_RARITIES__=false;
      doc.getElementById('ws-word-rarities-runtime')?.remove();
    }catch{}
    await loadFreshPatch('ws-word-rarities-integrity-loader','./assets/patches/word-rarities.js');
  }

  async function ensureGameplayIntegrity(doc){
    if(integrityBusy||Date.now()-lastIntegrityRepair<650)return;
    const win=frame.contentWindow;
    if(!win||!doc?.body)return;
    const sentenceBroken=!sentenceLooksHealthy(win,doc);
    const rarityBroken=!bossActive(win,doc)&&!rarityRuntimeReady(win,doc);
    if(!sentenceBroken&&!rarityBroken)return;
    integrityBusy=true;
    lastIntegrityRepair=Date.now();
    try{
      if(sentenceBroken)await repairSentenceRuntime(win,doc);
      if(rarityBroken)await repairRarityRuntime(win,doc);
    }finally{
      integrityBusy=false;
    }
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.body)return;
      ensureStyles(doc);
      ensureStableAbilityBadge(doc);
      decorateBossInfo(doc);
      bindBossStart(doc);
      ensureGameplayIntegrity(doc);
      if(doc.documentElement.dataset.wsBossUxFinalRegression==='4')return;
      doc.documentElement.dataset.wsBossUxFinalRegression='4';
      doc.addEventListener('click',event=>{
        if(event.target?.closest?.('.ws-boss-info-chip'))window.setTimeout(()=>{decorateBossInfo(doc);bindBossStart(doc);},0);
        ensureStableAbilityBadge(doc);
        window.setTimeout(()=>ensureGameplayIntegrity(doc),0);
      });
      const target=doc.getElementById('game')||doc.body;
      if(target)new MutationObserver(()=>{
        guardReopen(doc);
        ensureStableAbilityBadge(doc);
        decorateBossInfo(doc);
        bindBossStart(doc);
        ensureGameplayIntegrity(doc);
      }).observe(target,{childList:true,subtree:true});
      window.setInterval(()=>{
        ensureStableAbilityBadge(doc);
        ensureGameplayIntegrity(doc);
      },900);
    }catch(err){console.warn('Word Scramble final boss UX regression patch skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
