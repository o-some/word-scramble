(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureOuterStyles(doc){
    if(doc.getElementById('ws-boss-abilities-4-6-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-abilities-4-6-style';
    style.textContent=`
      .ws-boss-ability-badge-4-6{display:inline-flex;align-items:center;gap:5px;margin:0 auto 8px;padding:4px 8px;border:1px solid rgba(239,199,102,.55);border-radius:999px;background:rgba(1,32,53,.82);color:#ffe18a;font-size:.44rem;font-weight:950;letter-spacing:.06em;box-shadow:inset 0 1px rgba(255,255,255,.08)}
      .ws-boss-ability-badge-4-6::before{content:'☠';font-size:.56rem}
      .ws-roderick-timer{margin:0 0 10px;padding:7px 9px;border:1px solid rgba(239,199,102,.46);border-radius:13px;background:rgba(1,30,49,.82);box-shadow:inset 0 1px rgba(255,255,255,.06)}
      .ws-roderick-timer-head{display:flex;justify-content:space-between;gap:8px;margin-bottom:5px;color:#ffe18a;font-size:.48rem;font-weight:950;letter-spacing:.07em}.ws-roderick-timer-head b{font-size:.56rem}.ws-roderick-track{height:7px;overflow:hidden;border-radius:999px;background:rgba(255,255,255,.10)}.ws-roderick-track i{display:block;width:var(--ws-time,100%);height:100%;border-radius:inherit;background:linear-gradient(90deg,#70d9ad,#efc766 65%,#ef8e8e);transition:width .1s linear}
      .slot.ws-vargas-sealed{position:relative;border-color:#efc766!important;background:linear-gradient(160deg,rgba(71,49,31,.94),rgba(31,24,24,.96))!important;color:transparent!important;box-shadow:inset 0 0 0 2px rgba(239,199,102,.16),0 0 15px rgba(239,199,102,.10)}
      .slot.ws-vargas-sealed::after{content:'🔒';position:absolute;inset:0;display:grid;place-items:center;color:#ffe18a;font-size:1rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.5))}.tiles.ws-vargas-wait .tile:not(.used),#hint.ws-vargas-wait{opacity:.46!important;cursor:not-allowed!important;filter:saturate(.65)}
      .ws-vargas-note{margin:-2px 0 9px;text-align:center;color:#efc766;font-size:.45rem;font-weight:900;letter-spacing:.06em}
      .ws-ironhook-toast{position:absolute;z-index:18;left:50%;top:53%;transform:translate(-50%,-50%);padding:8px 11px;border:1px solid #efc766;border-radius:999px;background:rgba(49,32,25,.97);color:#fff0bd;font-size:.56rem;font-weight:1000;letter-spacing:.08em;pointer-events:none;box-shadow:0 10px 24px rgba(0,0,0,.38);animation:wsHookPop .55s ease-out both}@keyframes wsHookPop{0%{opacity:0;transform:translate(-50%,-42%) scale(.8)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}100%{opacity:0;transform:translate(-50%,-58%) scale(.96)}}
      @media(max-width:430px){.ws-boss-ability-badge-4-6{font-size:.38rem;padding:3px 7px;margin-bottom:6px}.ws-roderick-timer{padding:6px 8px}.ws-roderick-timer-head{font-size:.42rem}.ws-vargas-note{font-size:.39rem}}
      @media(prefers-reduced-motion:reduce){.ws-roderick-track i{transition:none}.ws-ironhook-toast{animation-duration:.08s!important}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(doc.getElementById('ws-boss-abilities-4-6-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-abilities-4-6-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_ABILITIES_4_6__)return;
      window.__WS_BOSS_ABILITIES_4_6__=true;

      const abilityNames={4:'Zeitdruck',5:'Versiegelter Slot',6:'Enterhaken'};
      const baseRender=render;
      const baseSetup=setup;
      let wordNonce=0;
      let roderickTimer=0;
      let roderickRemaining=12000;
      let vargasTimer=0;
      let vargasStarted=false;
      let vargasLocked=true;
      let ironhookTimer=0;
      let ironhookUsed=false;
      let ironhookBusy=false;

      const currentLevel=()=>{
        const match=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);
        if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
        try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
      };
      const active=(lvl)=>Boolean(s&&s.boss&&currentLevel()===lvl);
      const introOpen=()=>Boolean(document.querySelector('.ws-boss-intro'));
      const pauseOpen=()=>Boolean(document.querySelector('#pauseModal:not(.hidden)'));

      function clearTimers(){
        clearInterval(roderickTimer);roderickTimer=0;
        clearTimeout(vargasTimer);vargasTimer=0;
        clearTimeout(ironhookTimer);ironhookTimer=0;
      }

      function resetWord(){
        wordNonce++;
        clearTimers();
        roderickRemaining=12000;
        vargasStarted=false;
        vargasLocked=true;
        ironhookUsed=false;
        ironhookBusy=false;
      }

      function cleanupUi(){
        document.querySelectorAll('.ws-boss-ability-badge-4-6,.ws-roderick-timer,.ws-vargas-note,.ws-ironhook-toast').forEach(el=>el.remove());
        document.querySelectorAll('.ws-vargas-sealed').forEach(el=>el.classList.remove('ws-vargas-sealed'));
        document.querySelector('.tiles')?.classList.remove('ws-vargas-wait');
        document.getElementById('hint')?.classList.remove('ws-vargas-wait');
      }

      function badge(lvl){
        const card=document.querySelector('.card');
        if(!card)return;
        let el=card.querySelector('.ws-boss-ability-badge-4-6');
        if(!el){
          el=document.createElement('div');
          el.className='ws-boss-ability-badge-4-6';
          const label=card.querySelector('.label');
          if(label)label.insertAdjacentElement('beforebegin',el);else card.prepend(el);
        }
        el.textContent=abilityNames[lvl]||'';
      }

      function ensureRoderickUi(){
        const card=document.querySelector('.card');
        if(!card)return null;
        let timer=card.querySelector('.ws-roderick-timer');
        if(!timer){
          timer=document.createElement('div');
          timer.className='ws-roderick-timer';
          timer.innerHTML='<div class="ws-roderick-timer-head"><span>⏳ ZEIT BIS RODERICK ZUSCHLÄGT</span><b></b></div><div class="ws-roderick-track"><i></i></div>';
          const prompt=card.querySelector('.prompt');
          if(prompt)prompt.insertAdjacentElement('beforebegin',timer);else card.prepend(timer);
        }
        const pct=Math.max(0,Math.min(100,(roderickRemaining/12000)*100));
        timer.style.setProperty('--ws-time',pct+'%');
        const value=timer.querySelector('b');
        if(value)value.textContent=(roderickRemaining/1000).toFixed(1)+'s';
        return timer;
      }

      function roderickTimeout(){
        clearInterval(roderickTimer);roderickTimer=0;
        if(!active(4)||s.feedback)return;
        const token=wordNonce;
        s.feedback={ok:false,msg:'Zeit abgelaufen.'};
        s.bossMiss++;
        render();
        setTimeout(()=>{
          if(token!==wordNonce||!s.boss)return;
          if(s.bossHp<=0||s.bossMiss>=3){s.boss=false;s.normal=0;s.bossHp=3;s.bossMiss=0;s.i++;}
          s.feedback=null;
          setup();
        },1000);
      }

      function renderRoderick(){
        ensureRoderickUi();
        if(roderickTimer||introOpen()||s.feedback)return;
        roderickTimer=setInterval(()=>{
          if(!active(4)){clearInterval(roderickTimer);roderickTimer=0;return;}
          if(introOpen()||pauseOpen()||s.feedback)return;
          roderickRemaining=Math.max(0,roderickRemaining-100);
          ensureRoderickUi();
          if(roderickRemaining<=0)roderickTimeout();
        },100);
      }

      function renderVargas(){
        const slots=Array.from(document.querySelectorAll('.slots .slot'));
        const tiles=document.querySelector('.tiles');
        const hint=document.getElementById('hint');
        if(slots[1]&&vargasLocked)slots[1].classList.add('ws-vargas-sealed');
        if(!vargasStarted&&!introOpen()){
          vargasStarted=true;
          const token=wordNonce;
          vargasTimer=setTimeout(()=>{
            if(token!==wordNonce||!active(5))return;
            vargasLocked=false;
            render();
          },1800);
        }
        const waiting=Boolean(vargasLocked&&s.sel.length>=1);
        if(tiles)tiles.classList.toggle('ws-vargas-wait',waiting);
        if(hint)hint.classList.toggle('ws-vargas-wait',waiting);
        document.querySelectorAll('.tiles .tile:not(.used)').forEach(btn=>{btn.disabled=waiting;});
        if(hint)hint.disabled=waiting;
        const card=document.querySelector('.card');
        if(card&&vargasLocked){
          let note=card.querySelector('.ws-vargas-note');
          if(!note){note=document.createElement('div');note.className='ws-vargas-note';note.textContent='Vargas versiegelt den zweiten Platz kurz.';document.querySelector('.slots')?.insertAdjacentElement('afterend',note);}
        }
      }

      function showHookToast(letter){
        document.querySelector('.ws-ironhook-toast')?.remove();
        const card=document.querySelector('.card');
        if(!card)return;
        const toast=document.createElement('div');
        toast.className='ws-ironhook-toast';
        toast.textContent='⚓ ENTERHAKEN! '+letter+' ZURÜCK';
        card.appendChild(toast);
        setTimeout(()=>toast.remove(),620);
      }

      function renderIronhook(){
        if(ironhookUsed||ironhookBusy||introOpen()||s.feedback||s.sel.length<2)return;
        ironhookBusy=true;
        const token=wordNonce;
        ironhookTimer=setTimeout(()=>{
          if(token!==wordNonce||!active(6)||s.feedback){ironhookBusy=false;return;}
          if(!s.sel.length){ironhookBusy=false;return;}
          const pulled=s.sel.pop();
          ironhookUsed=true;
          ironhookBusy=false;
          render();
          showHookToast(pulled?.l||'');
        },420);
      }

      function abilityRender(){
        const lvl=currentLevel();
        if(!s.boss||lvl<4||lvl>6){cleanupUi();return;}
        badge(lvl);
        if(lvl===4)renderRoderick();
        if(lvl===5)renderVargas();
        if(lvl===6)renderIronhook();
      }

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
    }catch(err){console.warn('Word Scramble boss abilities 4-6 skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
