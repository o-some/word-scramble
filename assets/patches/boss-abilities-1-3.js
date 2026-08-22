(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  const RELEASE='20260822-runtime-single-owner-5';
  const introMeta={
    1:{ability:'Deckschrubber-Trick',description:'Kai mischt die Wort-Kacheln deiner Satzübersetzung zusätzlich durch. Die Lösung bleibt vollständig möglich.'},
    2:{ability:'Verdecktes Wort',description:'Brax verdeckt zeitweise eine ganze Wort-Kachel. Der vollständige Satz bleibt trotzdem lösbar.'},
    3:{ability:'Köderwort',description:'Blackfinn schmuggelt ein falsches Wort zwischen die echten Wort-Kacheln. Finde den Köder.'},
    4:{ability:'Zeitdruck',description:'Roderick setzt dich beim Übersetzen des vollständigen Satzes unter fairen Zeitdruck.'},
    5:{ability:'Versiegelter Platz',description:'Vargas versiegelt kurz einen Satzplatz, bevor du ihn wieder benutzen kannst.'},
    6:{ability:'Enterhaken',description:'Ironhook zieht eine bereits gesetzte Wort-Kachel zurück in deinen Wort-Pool.'},
    7:{ability:'Doppelschlag',description:'Thorne verlangt zwei korrekt gelöste Sätze in Folge für einen vollständigen Treffer.'},
    8:{ability:'Falsche Fährte',description:'Corvin markiert absichtlich eine falsche Wort-Fährte. Verlass dich auf Satz und Wort-Kacheln.'},
    9:{ability:'Schattenfluch',description:'Azrak hüllt Wort-Kacheln oder Satzplätze kurz in Schatten, ohne die Aufgabe unlösbar zu machen.'},
    10:{ability:'Königsprüfung',description:'Varkos kombiniert kontrolliert bekannte Satz-Mechaniken. Nie mehr als zwei gleichzeitig.'}
  };

  const loaderIds=[
    'ws-variable-boss-words-loader',
    'ws-boss-abilities-4-6-loader',
    'ws-boss-abilities-7-10-loader',
    'ws-word-rarities-loader',
    'ws-treasure-words-loader',
    'ws-boss-campaign-stars-loader',
    'ws-boss-hints-v2-loader',
    'ws-boss-victory-loot-loader',
    'ws-boss-intro-visual-polish-loader',
    'ws-boss-ux-final-regression-loader',
    'ws-tula-final-polish-loader'
  ];

  const pipeline=[
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
    ['ws-stable-boss-ux-final-regression','./assets/patches/boss-ux-final-regression.js']
  ];

  let pipelineStarted=false;
  let readyTimer=0;
  let readyObserver=null;
  let observedDoc=null;
  let attempts=0;

  const getFrameDoc=()=>{try{return frame.contentDocument||null}catch{return null}};
  const frameReady=()=>{
    const doc=getFrameDoc();
    return Boolean(doc?.documentElement&&doc.body&&doc.getElementById('game')&&doc.querySelector('.card'));
  };

  function ensureStyles(doc){
    if(!doc?.head||doc.getElementById('ws-boss-abilities-1-3-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-abilities-1-3-style';
    style.textContent=`
      .ws-boss-ability-badge{display:flex;align-items:center;justify-content:flex-start;gap:7px;width:fit-content;max-width:100%;min-height:36px;margin:0 0 9px;padding:7px 11px;border:1px solid rgba(239,199,102,.72);border-radius:13px;background:linear-gradient(160deg,rgba(4,57,86,.98),rgba(1,29,49,.98));color:#ffe18a;font-size:.54rem;font-weight:1000;letter-spacing:.055em;box-shadow:inset 0 1px rgba(255,255,255,.10),0 7px 17px rgba(0,10,23,.22);box-sizing:border-box}
      .ws-boss-ability-badge::before{content:'☠';display:grid;place-items:center;width:25px;height:25px;flex:0 0 25px;border:1px solid rgba(255,216,111,.45);border-radius:8px;background:rgba(255,216,111,.10);font-size:.78rem}
      .tile.ws-kai-shuffled{animation:wsKaiShuffle .34s cubic-bezier(.2,.84,.24,1)}
      @keyframes wsKaiShuffle{0%{transform:translateX(0) rotate(0)}35%{transform:translateX(var(--ws-shift,5px)) rotate(var(--ws-rot,2deg))}70%{transform:translateX(calc(var(--ws-shift,5px) * -.45)) rotate(calc(var(--ws-rot,2deg) * -.6))}100%{transform:translateX(0) rotate(0)}}
      .tile.ws-brax-hidden{position:relative;color:transparent!important;text-shadow:none!important}
      .tile.ws-brax-hidden::after{content:'?';position:absolute;inset:0;display:grid;place-items:center;color:#fff0bd;font:1000 1rem Georgia,serif;text-shadow:0 2px 5px rgba(0,0,0,.45)}
      .tile.ws-brax-reveal{animation:wsBraxReveal .34s ease-out}
      @keyframes wsBraxReveal{0%{filter:brightness(1.8);transform:scale(1.06)}100%{filter:none;transform:scale(1)}}
      .tile.ws-decoy{position:relative;border-color:#ef8e8e!important;background:linear-gradient(#ffd4aa,#d99053 58%,#9a4e2b)!important;color:#4a1f18!important;box-shadow:inset 0 2px rgba(255,255,255,.4),0 5px 0 #66301e!important}
      .tile.ws-decoy::before{content:'?';position:absolute;top:-5px;right:-5px;width:15px;height:15px;display:grid;place-items:center;border-radius:50%;background:#5a2430;color:#ffe8c4;font-size:.48rem;font-weight:1000;border:1px solid #ef8e8e}
      .tile.ws-decoy.ws-decoy-hit{animation:wsDecoyHit .42s ease-out}
      @keyframes wsDecoyHit{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px) rotate(-3deg)}50%{transform:translateX(5px) rotate(3deg)}75%{transform:translateX(-3px) rotate(-2deg)}}
      .ws-decoy-note{position:absolute;z-index:15;left:50%;top:52%;transform:translate(-50%,-50%);padding:7px 10px;border:1px solid #ef8e8e;border-radius:999px;background:rgba(83,30,39,.96);color:#fff0bd;font-size:.55rem;font-weight:1000;letter-spacing:.08em;pointer-events:none;box-shadow:0 8px 20px rgba(0,0,0,.35)}
      @media(max-width:430px){.ws-boss-ability-badge{min-height:33px;padding:6px 8px;margin-bottom:7px;font-size:.46rem}.ws-boss-ability-badge::before{width:22px;height:22px;flex-basis:22px;font-size:.68rem}}
      @media(prefers-reduced-motion:reduce){.tile.ws-kai-shuffled,.tile.ws-brax-reveal,.tile.ws-decoy.ws-decoy-hit{animation-duration:.08s!important}}
    `;
    doc.head.appendChild(style);
  }

  function installIntroCopyObserver(doc){
    if(!doc?.body||doc.documentElement.dataset.wsSentenceIntroCopy==='1')return;
    doc.documentElement.dataset.wsSentenceIntroCopy='1';
    const patch=()=>{
      const intro=doc.querySelector('.ws-boss-intro');
      if(!intro)return;
      const match=intro.querySelector('.ws-boss-intro-level')?.textContent?.match(/LEVEL\s+(\d+)/i);
      const level=Math.max(1,Math.min(10,Number(match?.[1]||1)));
      const meta=introMeta[level];
      if(!meta)return;
      const ability=intro.querySelector('.ws-boss-ability b');
      const description=intro.querySelector('.ws-boss-ability p');
      if(ability&&ability.textContent!==meta.ability)ability.textContent=meta.ability;
      if(description&&description.textContent!==meta.description)description.textContent=meta.description;
    };
    patch();
    new MutationObserver(patch).observe(doc.body,{childList:true,subtree:true});
  }

  function installAbilityRuntime(doc){
    if(!doc?.documentElement||doc.getElementById('ws-boss-abilities-1-3-runtime-v3'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-abilities-1-3-runtime-v3';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_ABILITIES_1_3_V3__)return;
      window.__WS_BOSS_ABILITIES_1_3_V3__='${RELEASE}';
      const abilityNames={1:'Deckschrubber-Trick',2:'Verdecktes Wort',3:'Köderwort'};
      const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const baseRender=render;
      let activeKey='';
      let kaiOrder=[];
      let kaiAnimatedKey='';
      let braxHiddenIndex=null;
      let braxRevealAt=0;
      let braxTimer=0;
      let blackfinnDecoy='';

      const currentLevel=()=>{
        const m=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);
        if(m)return Math.max(1,Math.min(10,Number(m[1])||1));
        try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
      };
      const bossActive=()=>{try{return Boolean(s&&s.boss)}catch{return false}};
      const bossKey=()=>{
        let answer='';
        try{answer=typeof window.WS_GET_BOSS_ANSWER==='function'?(window.WS_GET_BOSS_ANSWER()||''):'';}catch{}
        if(!answer)answer=(document.querySelector('.prompt h1')?.textContent||'')+'|'+(Array.isArray(s?.tiles)?s.tiles.join('|'):'');
        return currentLevel()+'|'+answer;
      };
      const sentenceUnits=()=>{try{return typeof window.WS_GET_BOSS_UNITS==='function'?window.WS_GET_BOSS_UNITS():[]}catch{return []}};

      function clearTransient(){
        clearTimeout(braxTimer);braxTimer=0;
        document.querySelectorAll('.tile.ws-brax-hidden,.tile.ws-brax-reveal,.tile.ws-kai-shuffled').forEach(el=>el.classList.remove('ws-brax-hidden','ws-brax-reveal','ws-kai-shuffled'));
        document.querySelectorAll('.tile.ws-decoy,.ws-decoy-note').forEach(el=>el.remove());
      }
      function resetForKey(key){clearTransient();activeKey=key;kaiOrder=[];kaiAnimatedKey='';braxHiddenIndex=null;braxRevealAt=0;blackfinnDecoy='';}
      function cleanup(){activeKey='';clearTransient();document.querySelectorAll('.ws-boss-ability-badge').forEach(el=>el.remove());}

      function ensureBadge(level){
        const card=document.querySelector('.card');if(!card)return;
        let badge=card.querySelector('.ws-boss-ability-badge');
        if(!badge){badge=document.createElement('div');badge.className='ws-boss-ability-badge';const label=card.querySelector('.label');if(label)label.insertAdjacentElement('beforebegin',badge);else card.prepend(badge);}
        badge.textContent=abilityNames[level]||'Bossfähigkeit';
        badge.dataset.wsStableAbility='1';
      }

      function ensureKai(key){
        const box=document.querySelector('.tiles');if(!box)return;
        const tiles=Array.from(box.querySelectorAll('.tile[data-i]:not(.ws-decoy)'));if(tiles.length<2)return;
        if(!kaiOrder.length){kaiOrder=tiles.map(el=>String(el.dataset.i));if(kaiOrder.length%2===0)kaiOrder.reverse();else kaiOrder.push(kaiOrder.shift());}
        const byIndex=new Map(tiles.map(el=>[String(el.dataset.i),el]));
        kaiOrder.forEach(id=>{const el=byIndex.get(id);if(el)box.appendChild(el);});
        if(kaiAnimatedKey!==key){kaiAnimatedKey=key;kaiOrder.forEach((id,i)=>{const el=byIndex.get(id);if(!el)return;el.style.setProperty('--ws-shift',(i%2===0?6:-6)+'px');el.style.setProperty('--ws-rot',(i%2===0?2:-2)+'deg');el.classList.remove('ws-kai-shuffled');void el.offsetWidth;el.classList.add('ws-kai-shuffled');});}
      }

      function ensureBrax(key){
        if(braxHiddenIndex===null){
          const tiles=Array.from(document.querySelectorAll('.tiles .tile[data-i]:not(.used):not(.ws-decoy)'));
          if(tiles.length)braxHiddenIndex=String(tiles[Math.floor(tiles.length/2)].dataset.i);
          braxRevealAt=Date.now()+2800;
          if(braxHiddenIndex!==null){clearTimeout(braxTimer);braxTimer=setTimeout(()=>{if(activeKey!==key||!bossActive()||currentLevel()!==2)return;braxRevealAt=0;try{render();}catch{}},2820);}
        }
        const tile=braxHiddenIndex===null?null:document.querySelector('.tiles .tile[data-i="'+braxHiddenIndex+'"]');if(!tile)return;
        if(braxRevealAt>Date.now())tile.classList.add('ws-brax-hidden');else{tile.classList.remove('ws-brax-hidden');tile.classList.add('ws-brax-reveal');}
      }

      function chooseDecoy(){
        const used=new Set(sentenceUnits().map(v=>String(v).toUpperCase()));
        if(used.size){for(const word of ['ALWAYS','NEVER','CANNON','MOON','SECRET','ANCHOR','COMPASS'])if(!used.has(word))return word;}
        const letters=new Set(Array.from(document.querySelectorAll('.tiles .tile')).map(el=>el.textContent.trim().toUpperCase()));
        return Array.from(alphabet).find(ch=>!letters.has(ch))||'X';
      }
      function ensureBlackfinn(){
        const box=document.querySelector('.tiles');if(!box||box.querySelector('.ws-decoy'))return;
        if(!blackfinnDecoy)blackfinnDecoy=chooseDecoy();
        const fake=document.createElement('button');fake.type='button';fake.className='tile ws-decoy';fake.textContent=blackfinnDecoy;fake.setAttribute('aria-label',blackfinnDecoy+', Köder');
        fake.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();fake.classList.remove('ws-decoy-hit');void fake.offsetWidth;fake.classList.add('ws-decoy-hit');document.querySelector('.ws-decoy-note')?.remove();const note=document.createElement('div');note.className='ws-decoy-note';note.textContent='KÖDER!';document.querySelector('.card')?.appendChild(note);setTimeout(()=>note.remove(),650);});
        const children=Array.from(box.children);const at=Math.min(children.length,Math.max(1,Math.floor(children.length/2)));if(children[at])box.insertBefore(fake,children[at]);else box.appendChild(fake);
      }

      function abilityRender(){
        const level=currentLevel();
        if(!bossActive()||level<1||level>3){cleanup();return;}
        const key=bossKey();if(key!==activeKey)resetForKey(key);
        ensureBadge(level);
        if(level===1)ensureKai(key);
        if(level===2)ensureBrax(key);
        if(level===3)ensureBlackfinn();
      }

      render=function(){baseRender();abilityRender();};
      render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function ensureLoaderMarkers(){
    loaderIds.forEach(id=>{if(document.getElementById(id))return;const marker=document.createElement('meta');marker.id=id;marker.dataset.wsLoaderMarker='stable';document.head.appendChild(marker);});
  }

  function loadScript(id,src){
    return new Promise((resolve,reject)=>{
      if(document.getElementById(id)){resolve();return;}
      const script=document.createElement('script');script.id=id;script.async=false;script.src=src+(src.includes('?')?'&':'?')+'v='+RELEASE;
      script.addEventListener('load',()=>resolve(),{once:true});script.addEventListener('error',()=>reject(new Error('Failed to load '+src)),{once:true});document.head.appendChild(script);
    });
  }

  function assertRuntimeContracts(){
    const win=frame.contentWindow;
    const checks=[
      ['boss-sentences',Boolean(win?.__WS_VARIABLE_BOSS_WORDS__)],
      ['boss-abilities-4-6',Boolean(win?.__WS_BOSS_ABILITIES_4_6__)],
      ['boss-abilities-7-10',Boolean(win?.__WS_BOSS_ABILITIES_7_10__)],
      ['word-rarities',Boolean(win?.__WS_WORD_RARITIES__)],
      ['boss-abilities-1-3',Boolean(win?.__WS_BOSS_ABILITIES_1_3_V3__)]
    ];
    const missing=checks.filter(([,ok])=>!ok).map(([name])=>name);
    if(missing.length)throw new Error('Runtime contract incomplete: '+missing.join(', '));
  }

  function showFailure(message){
    let overlay=document.getElementById('ws-runtime-failure');
    if(!overlay){overlay=document.createElement('div');overlay.id='ws-runtime-failure';overlay.style.cssText='position:fixed;z-index:9999;inset:0;display:grid;place-items:center;padding:20px;background:#02192df2;color:#fff0bd;font-family:Inter,-apple-system,BlinkMacSystemFont,system-ui,sans-serif';overlay.innerHTML='<div style="width:min(420px,100%);padding:22px;border:1px solid #efc766;border-radius:22px;background:#032d4b;text-align:center;box-shadow:0 25px 60px #0008"><b style="display:block;font-size:1.1rem;margin-bottom:8px">Spiel konnte nicht vollständig starten</b><span style="display:block;color:#d8eeee;font-size:.78rem;line-height:1.45">Die vollständige Spiel-Runtime wurde nicht geladen. Die alte Basisversion wird aus Sicherheitsgründen nicht verwendet.</span><button type="button" style="width:100%;min-height:48px;margin-top:16px;border:1px solid #fff0a8;border-radius:14px;background:linear-gradient(#ffe895,#e3b13d);color:#092f4b;font-weight:900">Neu laden</button></div>';overlay.querySelector('button').onclick=()=>location.reload();document.body.appendChild(overlay);}
    overlay.dataset.reason=String(message||'runtime-incomplete').slice(0,180);
  }
  function clearFailure(){document.getElementById('ws-runtime-failure')?.remove();}

  async function bootstrapRuntime(){
    if(pipelineStarted||!frameReady())return false;
    pipelineStarted=true;clearTimeout(readyTimer);readyObserver?.disconnect();readyObserver=null;
    const doc=getFrameDoc();ensureStyles(doc);installIntroCopyObserver(doc);ensureLoaderMarkers();
    document.documentElement.dataset.wsStableRuntime='loading';document.documentElement.dataset.wsRuntimeRelease=RELEASE;
    try{
      for(const [id,src] of pipeline)await loadScript(id,src);
      installAbilityRuntime(doc);
      assertRuntimeContracts();
      clearFailure();
      document.documentElement.dataset.wsStableRuntime='ready';doc.documentElement.dataset.wsOuterRuntimeRelease=RELEASE;doc.documentElement.dataset.wsCoreRuntime='ready';
    }catch(err){
      document.documentElement.dataset.wsStableRuntime='failed';if(doc?.documentElement)doc.documentElement.dataset.wsCoreRuntime='failed';showFailure(err?.message||err);console.error('Word Scramble runtime bootstrap failed',err);
    }
    return true;
  }

  function watchUntilReady(){
    if(pipelineStarted)return;
    attempts++;
    if(frameReady()){bootstrapRuntime();return;}
    const doc=getFrameDoc();
    if(doc&&doc!==observedDoc){observedDoc=doc;readyObserver?.disconnect();const target=doc.getElementById('game')||doc.documentElement;if(target){readyObserver=new MutationObserver(()=>bootstrapRuntime());readyObserver.observe(target,{childList:true,subtree:true});}}
    if(attempts<120){clearTimeout(readyTimer);readyTimer=setTimeout(watchUntilReady,100);}else{document.documentElement.dataset.wsStableRuntime='failed';showFailure('timeout waiting for game frame');console.error('Word Scramble runtime bootstrap timed out');}
  }

  frame.addEventListener('load',()=>{
    const doc=getFrameDoc();
    if(doc){ensureStyles(doc);installIntroCopyObserver(doc);}
    if(!pipelineStarted){attempts=0;observedDoc=null;watchUntilReady();return;}
    window.setTimeout(()=>{
      const fresh=getFrameDoc();if(!fresh)return;ensureStyles(fresh);installIntroCopyObserver(fresh);installAbilityRuntime(fresh);
      window.setTimeout(()=>{try{assertRuntimeContracts();clearFailure();fresh.documentElement.dataset.wsCoreRuntime='ready';}catch(err){fresh.documentElement.dataset.wsCoreRuntime='failed';showFailure(err?.message||err);}},20);
    },0);
  });

  watchUntilReady();
})();
