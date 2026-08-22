(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureStyles(doc){
    if(!doc?.head||doc.getElementById('ws-boss-abilities-1-3-atomic-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-abilities-1-3-atomic-style';
    style.textContent=`
      .ws-boss-ability-badge{display:flex;align-items:center;justify-content:flex-start;gap:8px;width:fit-content;max-width:100%;min-height:38px;margin:0 0 9px;padding:7px 11px;border:1px solid rgba(239,199,102,.75);border-radius:13px;background:linear-gradient(160deg,rgba(4,57,86,.98),rgba(1,29,49,.98));color:#ffe18a;font-size:.55rem;font-weight:1000;letter-spacing:.055em;box-shadow:inset 0 1px rgba(255,255,255,.10),0 7px 17px rgba(0,10,23,.22)}
      .ws-boss-ability-badge::before{content:'☠';display:grid;place-items:center;width:26px;height:26px;flex:0 0 26px;border:1px solid rgba(255,216,111,.45);border-radius:8px;background:rgba(255,216,111,.10);font-size:.8rem}
      .tile.ws-kai-shuffled{animation:wsKaiShuffleAtomic .46s cubic-bezier(.2,.84,.24,1)}
      @keyframes wsKaiShuffleAtomic{0%{transform:translateX(0) rotate(0)}35%{transform:translateX(var(--ws-shift,7px)) rotate(var(--ws-rot,3deg))}70%{transform:translateX(calc(var(--ws-shift,7px)*-.45)) rotate(calc(var(--ws-rot,3deg)*-.6))}100%{transform:translateX(0) rotate(0)}}
      .ws-kai-toast{position:absolute;z-index:22;left:50%;top:53%;transform:translate(-50%,-50%);padding:8px 11px;border:1px solid #efc766;border-radius:999px;background:rgba(54,37,24,.97);color:#fff0bd;font-size:.54rem;font-weight:1000;white-space:nowrap;pointer-events:none;box-shadow:0 10px 24px rgba(0,0,0,.38);animation:wsKaiToastAtomic .8s ease-out both}
      @keyframes wsKaiToastAtomic{0%{opacity:0;transform:translate(-50%,-42%) scale(.84)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}100%{opacity:0;transform:translate(-50%,-60%) scale(.97)}}
      .tile.ws-brax-hidden{position:relative;color:transparent!important;text-shadow:none!important}.tile.ws-brax-hidden::after{content:'?';position:absolute;inset:0;display:grid;place-items:center;color:#fff0bd;font:1000 1rem Georgia,serif;text-shadow:0 2px 5px rgba(0,0,0,.45)}
      .tile.ws-decoy{position:relative;border-color:#ef8e8e!important;background:linear-gradient(#ffd4aa,#d99053 58%,#9a4e2b)!important;color:#4a1f18!important;box-shadow:inset 0 2px rgba(255,255,255,.4),0 5px 0 #66301e!important}.tile.ws-decoy::before{content:'?';position:absolute;top:-5px;right:-5px;width:15px;height:15px;display:grid;place-items:center;border-radius:50%;background:#5a2430;color:#ffe8c4;font-size:.48rem;font-weight:1000;border:1px solid #ef8e8e}
      .ws-decoy-note{position:absolute;z-index:21;left:50%;top:53%;transform:translate(-50%,-50%);padding:7px 10px;border:1px solid #ef8e8e;border-radius:999px;background:rgba(83,30,39,.96);color:#fff0bd;font-size:.55rem;font-weight:1000;pointer-events:none}
      @media(max-width:430px){.ws-boss-ability-badge{min-height:34px;padding:6px 8px;font-size:.46rem}.ws-boss-ability-badge::before{width:22px;height:22px;flex-basis:22px;font-size:.68rem}.ws-kai-toast{font-size:.46rem;max-width:90%;white-space:normal;text-align:center}}
      @media(prefers-reduced-motion:reduce){.tile.ws-kai-shuffled,.ws-kai-toast{animation-duration:.08s!important}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(!doc?.documentElement||doc.getElementById('ws-boss-abilities-1-3-atomic-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-abilities-1-3-atomic-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_ABILITIES_1_3_ATOMIC__)return;
      window.__WS_BOSS_ABILITIES_1_3_ATOMIC__=true;
      const baseRender=render,baseBind=bind;
      const names={1:'Deckschrubber-Trick',2:'Verdecktes Wort',3:'Köderwort'};
      let activeKey='',kaiTriggered=false,braxIndex=null,braxReveal=false,braxTimer=0,blackfinnDecoy='';
      const level=()=>{try{return Number(window.WS_BOSS_CAMPAIGN?.currentLevel?.()||1)}catch{return 1}};
      const active=()=>Boolean(s&&s.boss&&level()>=1&&level()<=3);
      const key=()=>level()+'|'+String(window.WS_GET_BOSS_ANSWER?.()||'');
      const units=()=>{try{return window.WS_GET_BOSS_UNITS?.().map(x=>String(x).toUpperCase())||[]}catch{return[]}};
      function resetForKey(next){activeKey=next;kaiTriggered=false;braxIndex=null;braxReveal=false;blackfinnDecoy='';clearTimeout(braxTimer);braxTimer=0;document.querySelectorAll('.ws-kai-toast,.ws-decoy-note').forEach(el=>el.remove())}
      function cleanup(){clearTimeout(braxTimer);braxTimer=0;activeKey='';document.querySelectorAll('.ws-boss-ability-badge,.ws-kai-toast,.ws-decoy,.ws-decoy-note').forEach(el=>el.remove());document.querySelectorAll('.ws-brax-hidden').forEach(el=>el.classList.remove('ws-brax-hidden'))}
      function badge(lvl){const card=document.querySelector('.card');if(!card)return;let el=card.querySelector('.ws-boss-ability-badge');if(!el){el=document.createElement('div');el.className='ws-boss-ability-badge';const label=card.querySelector('.label');if(label)label.insertAdjacentElement('beforebegin',el);else card.prepend(el)}const text=names[lvl]||'Bossfähigkeit';if(el.textContent!==text)el.textContent=text;el.dataset.wsStableAbility='1'}
      function showKaiToast(){const card=document.querySelector('.card');if(!card)return;document.querySelector('.ws-kai-toast')?.remove();const toast=document.createElement('div');toast.className='ws-kai-toast';toast.textContent='☠ KAI MISCHT DIE ÜBRIGEN WÖRTER!';card.appendChild(toast);setTimeout(()=>toast.remove(),850)}
      function triggerKai(){if(kaiTriggered||!active()||level()!==1)return;kaiTriggered=true;const box=document.querySelector('.tiles');if(!box)return;const free=Array.from(box.querySelectorAll('.tile[data-i]:not(.used)'));if(free.length>1){[...free].reverse().forEach((el,i)=>{box.appendChild(el);el.style.setProperty('--ws-shift',(i%2?'-8px':'8px'));el.style.setProperty('--ws-rot',(i%2?'-3deg':'3deg'));el.classList.remove('ws-kai-shuffled');void el.offsetWidth;el.classList.add('ws-kai-shuffled')})}showKaiToast()}
      function ensureBrax(){if(braxIndex===null&&!braxReveal){const free=Array.from(document.querySelectorAll('.tiles .tile[data-i]:not(.used)'));const chosen=free[Math.floor(free.length/2)]||free[0];if(chosen){braxIndex=String(chosen.dataset.i);const token=activeKey;braxTimer=setTimeout(()=>{if(token!==activeKey||!active()||level()!==2)return;braxReveal=true;render()},2300)}}if(braxIndex!==null&&!braxReveal)document.querySelector('.tiles .tile[data-i="'+braxIndex+'"]')?.classList.add('ws-brax-hidden')}
      function chooseDecoy(){const used=new Set(units());return ['ALWAYS','NEVER','CANNON','MOON','SECRET','ANCHOR','COMPASS','STORM'].find(x=>!used.has(x))||'CANNON'}
      function ensureBlackfinn(){const box=document.querySelector('.tiles');if(!box||box.querySelector('.ws-decoy'))return;if(!blackfinnDecoy)blackfinnDecoy=chooseDecoy();const fake=document.createElement('button');fake.type='button';fake.className='tile ws-decoy';fake.textContent=blackfinnDecoy;fake.setAttribute('aria-label',blackfinnDecoy+', Köderwort');fake.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();const card=document.querySelector('.card');if(!card)return;document.querySelector('.ws-decoy-note')?.remove();const note=document.createElement('div');note.className='ws-decoy-note';note.textContent='☠ KÖDERWORT!';card.appendChild(note);setTimeout(()=>note.remove(),650)});const children=Array.from(box.children),at=Math.min(children.length,Math.max(1,Math.floor(children.length/2)));if(children[at])box.insertBefore(fake,children[at]);else box.appendChild(fake)}
      function abilityRender(){if(!active()){cleanup();return}const lvl=level(),next=key();if(next!==activeKey)resetForKey(next);badge(lvl);if(lvl===2)ensureBrax();if(lvl===3)ensureBlackfinn()}
      function abilityBind(){if(!active()||level()!==1||kaiTriggered)return;document.querySelectorAll('.tiles .tile[data-i]:not(.used)').forEach(button=>{if(button.dataset.wsKaiBound==='1')return;button.dataset.wsKaiBound='1';const original=button.onclick;button.onclick=function(event){const before=s.sel.length;if(original)original.call(this,event);if(s.sel.length>before&&!kaiTriggered)setTimeout(triggerKai,0)}})}
      render=function(){baseRender();abilityRender()};
      bind=function(){baseBind();abilityBind()};
      render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.documentElement)return;
      ensureStyles(doc);
      installRuntime(doc);
    }catch(err){console.warn('Word Scramble boss abilities 1-3 skipped',err)}
  }
  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
