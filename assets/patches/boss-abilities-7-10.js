(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureOuterStyles(doc){
    if(doc.getElementById('ws-boss-abilities-7-10-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-abilities-7-10-style';
    style.textContent=`
      .ws-boss-ability-badge-7-10{display:inline-flex;align-items:center;gap:5px;margin:0 auto 8px;padding:4px 8px;border:1px solid rgba(239,199,102,.55);border-radius:999px;background:rgba(1,32,53,.84);color:#ffe18a;font-size:.44rem;font-weight:950;letter-spacing:.06em;box-shadow:inset 0 1px rgba(255,255,255,.08)}
      .ws-boss-ability-badge-7-10::before{content:'☠';font-size:.56rem}
      .ws-thorne-chain{margin:0 0 9px;padding:7px 9px;border:1px solid rgba(239,199,102,.45);border-radius:13px;background:rgba(2,36,57,.84);color:#dff3ef;text-align:center;font-size:.5rem;font-weight:900;letter-spacing:.06em}.ws-thorne-chain b{color:#ffe18a;font-size:.66rem}
      .tile.ws-corvin-route{position:relative;outline:2px solid rgba(112,217,173,.75);outline-offset:2px;box-shadow:inset 0 2px rgba(255,255,255,.45),0 5px 0 #78460e,0 0 18px rgba(112,217,173,.25)!important}.tile.ws-corvin-route::after{content:'🧭';position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:.78rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))}.ws-corvin-note{margin:-2px 0 9px;text-align:center;color:#9fd6cf;font-size:.43rem;font-weight:900;letter-spacing:.05em}
      .tile.ws-azrak-shadow,.tile.ws-varkos-shadow{position:relative;color:transparent!important;text-shadow:none!important;filter:brightness(.46) saturate(.55)!important}.tile.ws-azrak-shadow::after,.tile.ws-varkos-shadow::after{content:'◆';position:absolute;inset:0;display:grid;place-items:center;color:#bda7d8;font-size:.95rem;text-shadow:0 0 10px rgba(122,76,165,.8)}.tile.ws-azrak-reveal,.tile.ws-varkos-reveal{animation:wsShadowReveal .36s ease-out}@keyframes wsShadowReveal{0%{filter:brightness(.6);transform:scale(.96)}100%{filter:none;transform:scale(1)}}
      .ws-varkos-mode{margin:-2px 0 9px;padding:6px 8px;border:1px solid rgba(239,199,102,.4);border-radius:12px;background:linear-gradient(160deg,rgba(87,51,23,.34),rgba(41,21,45,.45));color:#ffe7a0;text-align:center;font-size:.43rem;font-weight:950;letter-spacing:.06em}.ws-varkos-timer{margin:0 0 9px;padding:6px 8px;border:1px solid rgba(239,199,102,.45);border-radius:12px;background:rgba(1,28,46,.86)}.ws-varkos-timer-head{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px;color:#ffe18a;font-size:.45rem;font-weight:950}.ws-varkos-track{height:7px;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.1)}.ws-varkos-track i{display:block;width:var(--ws-time,100%);height:100%;border-radius:inherit;background:linear-gradient(90deg,#70d9ad,#efc766 62%,#ef8e8e);transition:width .1s linear}
      .tile.ws-varkos-decoy{position:relative;border-color:#dca1ff!important;background:linear-gradient(#ead7ff,#a772c5 58%,#5a3b73)!important;color:#24132f!important;box-shadow:inset 0 2px rgba(255,255,255,.42),0 5px 0 #3d274e!important}.tile.ws-varkos-decoy::before{content:'♛';position:absolute;top:-6px;right:-5px;width:15px;height:15px;display:grid;place-items:center;border-radius:50%;background:#4b285e;color:#ffe9b0;font-size:.44rem;border:1px solid #dca1ff}.ws-varkos-toast{position:absolute;z-index:18;left:50%;top:53%;transform:translate(-50%,-50%);padding:8px 11px;border:1px solid #dca1ff;border-radius:999px;background:rgba(51,27,65,.97);color:#fff0bd;font-size:.54rem;font-weight:1000;letter-spacing:.07em;pointer-events:none;box-shadow:0 10px 24px rgba(0,0,0,.38);animation:wsVarkosPop .58s ease-out both}@keyframes wsVarkosPop{0%{opacity:0;transform:translate(-50%,-42%) scale(.8)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}100%{opacity:0;transform:translate(-50%,-58%) scale(.96)}}
      @media(max-width:430px){.ws-boss-ability-badge-7-10{font-size:.38rem;padding:3px 7px;margin-bottom:6px}.ws-thorne-chain,.ws-varkos-mode{font-size:.39rem}.ws-corvin-note{font-size:.38rem}.ws-varkos-timer-head{font-size:.4rem}}
      @media(prefers-reduced-motion:reduce){.tile.ws-azrak-reveal,.tile.ws-varkos-reveal,.ws-varkos-toast{animation-duration:.08s!important}.ws-varkos-track i{transition:none}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(doc.getElementById('ws-boss-abilities-7-10-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-abilities-7-10-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_ABILITIES_7_10__)return;
      window.__WS_BOSS_ABILITIES_7_10__=true;

      const abilityNames={7:'Doppelschlag',8:'Falsche Fährte',9:'Schattenfluch',10:'Königsprüfung'};
      const baseRender=render;
      const baseSetup=setup;
      const baseCheck=check;
      const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let wordNonce=0;
      let lastLevel=0;
      let thorneChain=0;
      let corvinIndex=-1;
      let azrakTimer=0;
      let azrakRevealed=false;
      let azrakIndices=[];
      let varkosWordCounter=0;
      let varkosMode=0;
      let varkosTimer=0;
      let varkosRemaining=14000;
      let varkosShadowTimer=0;
      let varkosShadowIndex=-1;
      let varkosShadowRevealed=false;
      let varkosHookTimer=0;
      let varkosHookUsed=false;
      let varkosHookBusy=false;

      const currentLevel=()=>{
        const match=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);
        if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
        try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
      };
      const active=(lvl)=>Boolean(s&&s.boss&&currentLevel()===lvl);
      const introOpen=()=>Boolean(document.querySelector('.ws-boss-intro'));
      const pauseOpen=()=>Boolean(document.querySelector('#pauseModal:not(.hidden)'));

      function clearWordTimers(){
        clearTimeout(azrakTimer);azrakTimer=0;
        clearInterval(varkosTimer);varkosTimer=0;
        clearTimeout(varkosShadowTimer);varkosShadowTimer=0;
        clearTimeout(varkosHookTimer);varkosHookTimer=0;
      }

      function resetWord(){
        wordNonce++;
        clearWordTimers();
        corvinIndex=-1;
        azrakRevealed=false;
        azrakIndices=[];
        varkosRemaining=14000;
        varkosShadowIndex=-1;
        varkosShadowRevealed=false;
        varkosHookUsed=false;
        varkosHookBusy=false;
        if(active(10)){varkosMode=varkosWordCounter%2;varkosWordCounter++;}
      }

      function cleanupUi(){
        document.querySelectorAll('.ws-boss-ability-badge-7-10,.ws-thorne-chain,.ws-corvin-note,.ws-varkos-mode,.ws-varkos-timer,.ws-varkos-toast').forEach(el=>el.remove());
        document.querySelectorAll('.ws-corvin-route,.ws-azrak-shadow,.ws-varkos-shadow').forEach(el=>el.classList.remove('ws-corvin-route','ws-azrak-shadow','ws-varkos-shadow'));
        document.querySelectorAll('.tile.ws-varkos-decoy').forEach(el=>el.remove());
      }

      function badge(lvl,extra=''){
        const card=document.querySelector('.card');
        if(!card)return;
        let el=card.querySelector('.ws-boss-ability-badge-7-10');
        if(!el){el=document.createElement('div');el.className='ws-boss-ability-badge-7-10';const label=card.querySelector('.label');if(label)label.insertAdjacentElement('beforebegin',el);else card.prepend(el);}
        el.textContent=(abilityNames[lvl]||'')+(extra?' · '+extra:'');
      }

      function renderThorne(){
        const card=document.querySelector('.card');
        if(!card)return;
        let chain=card.querySelector('.ws-thorne-chain');
        if(!chain){chain=document.createElement('div');chain.className='ws-thorne-chain';const prompt=card.querySelector('.prompt');if(prompt)prompt.insertAdjacentElement('beforebegin',chain);else card.prepend(chain);}
        chain.innerHTML='⚔️ DOPPELSCHLAG · <b>'+(thorneChain===0?'0/2':'1/2')+'</b> · Zwei richtige Wörter für einen Treffer';
      }

      function chooseCorvinIndex(){
        if(corvinIndex>=0)return;
        const tiles=Array.from(document.querySelectorAll('.tiles .tile[data-i]'));
        const wrongFirst=tiles.find(btn=>btn.textContent.trim().toUpperCase()!=='P');
        corvinIndex=Number((wrongFirst||tiles[0])?.dataset.i ?? -1);
      }

      function renderCorvin(){
        chooseCorvinIndex();
        document.querySelectorAll('.ws-corvin-route').forEach(el=>el.classList.remove('ws-corvin-route'));
        if(corvinIndex>=0)document.querySelector('.tiles .tile[data-i="'+corvinIndex+'"]')?.classList.add('ws-corvin-route');
        const card=document.querySelector('.card');
        if(card&&!card.querySelector('.ws-corvin-note')){const note=document.createElement('div');note.className='ws-corvin-note';note.textContent='🧭 Corvins Karte zeigt eine mögliche Spur – aber Karten können lügen.';document.querySelector('.tiles')?.insertAdjacentElement('afterend',note);}
      }

      function initAzrak(){
        if(azrakIndices.length||introOpen())return;
        const tiles=Array.from(document.querySelectorAll('.tiles .tile[data-i]'));
        if(!tiles.length)return;
        const first=tiles[Math.floor(tiles.length/3)]||tiles[0];
        const second=tiles[Math.floor(tiles.length*2/3)]||tiles[tiles.length-1];
        azrakIndices=[Number(first.dataset.i),Number(second.dataset.i)].filter((v,i,a)=>Number.isFinite(v)&&a.indexOf(v)===i);
        const token=wordNonce;
        azrakTimer=setTimeout(()=>{if(token!==wordNonce||!active(9))return;azrakRevealed=true;document.querySelectorAll('.ws-azrak-shadow').forEach(el=>{el.classList.remove('ws-azrak-shadow');el.classList.add('ws-azrak-reveal');setTimeout(()=>el.classList.remove('ws-azrak-reveal'),420);});},2400);
      }

      function renderAzrak(){
        initAzrak();
        if(azrakRevealed)return;
        azrakIndices.forEach(i=>document.querySelector('.tiles .tile[data-i="'+i+'"]')?.classList.add('ws-azrak-shadow'));
      }

      function ensureVarkosMode(){
        const card=document.querySelector('.card');if(!card)return;
        let mode=card.querySelector('.ws-varkos-mode');
        if(!mode){mode=document.createElement('div');mode.className='ws-varkos-mode';const prompt=card.querySelector('.prompt');if(prompt)prompt.insertAdjacentElement('beforebegin',mode);else card.prepend(mode);}
        mode.textContent=varkosMode===0?'♛ KÖNIGSPRÜFUNG · SCHATTEN + KÖDER':'♛ KÖNIGSPRÜFUNG · ZEITDRUCK + ENTERHAKEN';
      }

      function varkosDecoy(){
        const box=document.querySelector('.tiles');
        if(!box||box.querySelector('.ws-varkos-decoy'))return;
        const used=new Set(Array.from(box.querySelectorAll('.tile:not(.ws-varkos-decoy)')).map(x=>x.textContent.trim().toUpperCase()));
        const letter=Array.from(alphabet).find(ch=>!used.has(ch))||'X';
        const fake=document.createElement('button');fake.type='button';fake.className='tile ws-varkos-decoy';fake.textContent=letter;fake.setAttribute('aria-label',letter+', königlicher Köderbuchstabe');
        fake.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();document.querySelector('.ws-varkos-toast')?.remove();const card=document.querySelector('.card');if(!card)return;const toast=document.createElement('div');toast.className='ws-varkos-toast';toast.textContent='♛ KÖDER DES KÖNIGS!';card.appendChild(toast);setTimeout(()=>toast.remove(),650);});
        const children=Array.from(box.children);const at=Math.min(children.length,Math.max(1,Math.floor(children.length/2)));if(children[at])box.insertBefore(fake,children[at]);else box.appendChild(fake);
      }

      function varkosShadow(){
        if(varkosShadowIndex<0&&!introOpen()){
          const tiles=Array.from(document.querySelectorAll('.tiles .tile[data-i]'));
          const target=tiles[Math.floor(tiles.length/2)]||tiles[0];
          varkosShadowIndex=Number(target?.dataset.i ?? -1);
          const token=wordNonce;
          varkosShadowTimer=setTimeout(()=>{if(token!==wordNonce||!active(10))return;varkosShadowRevealed=true;const el=document.querySelector('.tiles .tile[data-i="'+varkosShadowIndex+'"]');if(el){el.classList.remove('ws-varkos-shadow');el.classList.add('ws-varkos-reveal');setTimeout(()=>el.classList.remove('ws-varkos-reveal'),420);}},2100);
        }
        if(!varkosShadowRevealed&&varkosShadowIndex>=0)document.querySelector('.tiles .tile[data-i="'+varkosShadowIndex+'"]')?.classList.add('ws-varkos-shadow');
      }

      function ensureVarkosTimer(){
        const card=document.querySelector('.card');if(!card)return null;
        let timer=card.querySelector('.ws-varkos-timer');
        if(!timer){timer=document.createElement('div');timer.className='ws-varkos-timer';timer.innerHTML='<div class="ws-varkos-timer-head"><span>⏳ VARKOS LÄSST KEINE ZEIT</span><b></b></div><div class="ws-varkos-track"><i></i></div>';const prompt=card.querySelector('.prompt');if(prompt)prompt.insertAdjacentElement('beforebegin',timer);else card.prepend(timer);}
        const pct=Math.max(0,Math.min(100,(varkosRemaining/14000)*100));timer.style.setProperty('--ws-time',pct+'%');const value=timer.querySelector('b');if(value)value.textContent=(varkosRemaining/1000).toFixed(1)+'s';return timer;
      }

      function varkosTimeout(){
        clearInterval(varkosTimer);varkosTimer=0;if(!active(10)||s.feedback)return;
        const token=wordNonce;s.feedback={ok:false,msg:'Varkos war schneller.'};s.bossMiss++;render();
        setTimeout(()=>{if(token!==wordNonce||!s.boss)return;if(s.bossHp<=0||s.bossMiss>=3){s.boss=false;s.normal=0;s.bossHp=3;s.bossMiss=0;s.i++;}s.feedback=null;setup();},1000);
      }

      function renderVarkosTimedHook(){
        ensureVarkosTimer();
        if(!varkosTimer&&!introOpen()&&!s.feedback){varkosTimer=setInterval(()=>{if(!active(10)||varkosMode!==1){clearInterval(varkosTimer);varkosTimer=0;return;}if(introOpen()||pauseOpen()||s.feedback)return;varkosRemaining=Math.max(0,varkosRemaining-100);ensureVarkosTimer();if(varkosRemaining<=0)varkosTimeout();},100);}
        if(varkosHookUsed||varkosHookBusy||introOpen()||s.feedback||s.sel.length<3)return;
        varkosHookBusy=true;const token=wordNonce;varkosHookTimer=setTimeout(()=>{if(token!==wordNonce||!active(10)||varkosMode!==1||s.feedback){varkosHookBusy=false;return;}if(!s.sel.length){varkosHookBusy=false;return;}const pulled=s.sel.pop();varkosHookUsed=true;varkosHookBusy=false;render();document.querySelector('.ws-varkos-toast')?.remove();const card=document.querySelector('.card');if(card){const toast=document.createElement('div');toast.className='ws-varkos-toast';toast.textContent='♛ ENTERHAKEN! '+(pulled?.l||'')+' ZURÜCK';card.appendChild(toast);setTimeout(()=>toast.remove(),650);}},520);
      }

      function renderVarkos(){
        ensureVarkosMode();
        if(varkosMode===0){varkosShadow();varkosDecoy();}
        else renderVarkosTimedHook();
      }

      function abilityRender(){
        const lvl=currentLevel();
        if(lastLevel!==lvl){if(lastLevel===7)thorneChain=0;if(lastLevel===10)varkosWordCounter=0;lastLevel=lvl;}
        if(!s.boss||lvl<7||lvl>10){cleanupUi();thorneChain=0;if(lvl!==10)varkosWordCounter=0;return;}
        badge(lvl,lvl===10?(varkosMode===0?'Schatten + Köder':'Zeit + Enterhaken'):'');
        if(lvl===7)renderThorne();
        if(lvl===8)renderCorvin();
        if(lvl===9)renderAzrak();
        if(lvl===10)renderVarkos();
      }

      check=function(){
        if(!active(7))return baseCheck();
        const answer='PIRATE';
        const value=s.sel.map(x=>x.l).join('');
        if(value.length!==answer.length)return;
        if(value!==answer){thorneChain=0;return baseCheck();}
        if(thorneChain===0){
          thorneChain=1;
          const token=wordNonce;
          s.feedback={ok:true,msg:'Doppelschlag 1/2 – noch ein richtiges Wort!'};
          render();
          setTimeout(()=>{if(token!==wordNonce||!active(7))return;s.feedback=null;setup();},900);
          return;
        }
        thorneChain=0;
        return baseCheck();
      };

      render=function(){baseRender();abilityRender();};
      setup=function(){resetWord();baseSetup();};
      resetWord();
      render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.documentElement)return;
      ensureOuterStyles(doc);
      installRuntime(doc);
    }catch(err){console.warn('Word Scramble boss abilities 7-10 skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
