(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  const ownScript=document.currentScript;
  const RELEASE=String(window.__WS_RUNTIME_RELEASE__||new URL(ownScript?.src||location.href).searchParams.get('v')||'dev');
  window.__WS_RUNTIME_RELEASE__=RELEASE;

  const LEGACY_CHAIN_IDS=[
    'ws-treasure-words-loader',
    'ws-boss-campaign-stars-loader',
    'ws-boss-hints-v2-loader',
    'ws-boss-victory-loot-loader',
    'ws-tula-final-polish-loader',
    'ws-boss-intro-visual-polish-loader',
    'ws-boss-ux-final-regression-loader'
  ];

  const PIPELINE=[
    ['ws-stable-variable-boss-words','./assets/patches/variable-boss-words.js'],
    ['ws-stable-boss-abilities-4-6','./assets/patches/boss-abilities-4-6.js'],
    ['ws-stable-boss-abilities-7-10','./assets/patches/boss-abilities-7-10.js'],
    ['ws-stable-word-rarities','./assets/patches/word-rarities.js'],
    ['ws-stable-treasure-words','./assets/patches/treasure-words.js'],
    ['ws-stable-boss-campaign-stars','./assets/patches/boss-campaign-stars.js'],
    ['ws-stable-boss-hints-v2','./assets/patches/boss-hints-v2.js'],
    ['ws-stable-boss-victory-loot','./assets/patches/boss-victory-loot.js'],
    ['ws-stable-tula-final-polish','./assets/patches/tula-reactions-final-polish.js'],
    ['ws-stable-boss-intro-visual-polish','./assets/patches/boss-intro-visual-polish.js'],
    ['ws-stable-boss-ux-final-regression','./assets/patches/boss-ux-final-regression.js'],
    ['ws-stable-boss-abilities-1-3','./assets/patches/boss-abilities-1-3-runtime.js']
  ];

  let started=false;
  const doc=()=>{try{return frame.contentDocument||null}catch{return null}};
  const win=()=>{try{return frame.contentWindow||null}catch{return null}};

  function suppressLegacyChaining(){
    for(const id of LEGACY_CHAIN_IDS){
      if(document.getElementById(id))continue;
      const marker=document.createElement('meta');
      marker.id=id;
      marker.dataset.wsCompositionOwner='atomic';
      marker.dataset.wsRelease=RELEASE;
      document.head.appendChild(marker);
    }
  }

  function loadScript(id,src){
    return new Promise((resolve,reject)=>{
      const existing=document.getElementById(id);
      if(existing){
        const version=new URL(existing.src||location.href,location.href).searchParams.get('v');
        if(existing.tagName==='SCRIPT'&&version&&version!==RELEASE)return reject(new Error('Runtime-Version gemischt: '+src+' ('+version+' != '+RELEASE+')'));
        return resolve();
      }
      const script=document.createElement('script');
      script.id=id;
      script.src=src+'?v='+encodeURIComponent(RELEASE);
      script.dataset.wsRelease=RELEASE;
      script.onload=()=>resolve();
      script.onerror=()=>reject(new Error('Runtime-Modul konnte nicht geladen werden: '+src));
      document.head.appendChild(script);
    });
  }

  async function waitForBase(timeoutMs=8000){
    const startedAt=Date.now();
    while(Date.now()-startedAt<timeoutMs){
      const d=doc(),w=win();
      if(w?.__WS_BASE_RUNTIME__&&d?.documentElement&&d.body&&d.getElementById('game')&&d.querySelector('.card'))return;
      await new Promise(resolve=>setTimeout(resolve,40));
    }
    throw new Error('Lokale Basis-Runtime wurde nicht rechtzeitig bereit');
  }

  function assertContracts(){
    const w=win(),d=doc();
    const checks=[
      ['base',Boolean(w?.__WS_BASE_RUNTIME__)],
      ['campaign',Boolean(w?.WS_BOSS_CAMPAIGN)],
      ['sentences',Boolean(w?.__WS_VARIABLE_BOSS_WORDS__)],
      ['abilities-1-3',Boolean(w?.__WS_BOSS_ABILITIES_1_3_ATOMIC__)],
      ['abilities-4-6',Boolean(w?.__WS_BOSS_ABILITIES_4_6__)],
      ['abilities-7-10',Boolean(w?.__WS_BOSS_ABILITIES_7_10__)],
      ['rarities',Boolean(w?.__WS_WORD_RARITIES__)]
    ];
    const missing=checks.filter(([,ok])=>!ok).map(([name])=>name);
    if(missing.length)throw new Error('Unvollständige Runtime: '+missing.join(', '));
    const mismatched=[...document.querySelectorAll('script[data-ws-release]')].filter(el=>el.dataset.wsRelease!==RELEASE);
    if(mismatched.length)throw new Error('Gemischte Runtime-Versionen im DOM');
    document.documentElement.dataset.wsRuntimeRelease=RELEASE;
    document.documentElement.dataset.wsRuntimeComposition='ready';
    if(d?.documentElement){d.documentElement.dataset.wsRuntimeRelease=RELEASE;d.documentElement.dataset.wsCoreRuntime='ready';}
  }

  function fail(error){
    console.error('Word Scramble runtime composition failed',error);
    document.documentElement.dataset.wsRuntimeComposition='failed';
    const d=doc();
    if(d?.documentElement)d.documentElement.dataset.wsCoreRuntime='failed';
    let box=document.getElementById('ws-runtime-failure');
    if(!box){
      box=document.createElement('div');box.id='ws-runtime-failure';
      box.style.cssText='position:fixed;z-index:999;inset:0;display:grid;place-items:center;padding:24px;background:#032f50;color:#fff0bd;font:700 16px/1.4 system-ui;text-align:center';
      document.body.appendChild(box);
    }
    box.textContent='Word Scramble konnte nicht vollständig gestartet werden. Bitte neu laden.';
  }

  async function start(){
    if(started)return;
    started=true;
    try{
      suppressLegacyChaining();
      await waitForBase();
      for(const [id,src] of PIPELINE)await loadScript(id,src);
      await new Promise(resolve=>setTimeout(resolve,30));
      assertContracts();
    }catch(error){fail(error);}
  }

  frame.addEventListener('load',()=>{
    if(!started)start();
    else setTimeout(()=>{try{assertContracts()}catch(error){fail(error)}},80);
  });
  start();
})();
