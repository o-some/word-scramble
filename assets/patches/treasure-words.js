(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureOuterStyles(doc){
    if(doc.getElementById('ws-treasure-words-style'))return;
    const style=doc.createElement('style');
    style.id='ws-treasure-words-style';
    style.textContent=`
      .card.ws-treasure-word{outline:1px solid rgba(255,220,112,.58);outline-offset:-7px;background:radial-gradient(circle at 50% 0%,rgba(255,211,90,.10),transparent 34%),linear-gradient(160deg,#063c60f2,#021f37fa)}
      .ws-treasure-badge{display:inline-flex;align-items:center;justify-content:center;gap:6px;margin:0 auto 8px;padding:5px 10px;border:1px solid rgba(255,224,126,.92);border-radius:999px;background:linear-gradient(160deg,rgba(107,67,16,.96),rgba(47,31,19,.96));color:#fff0ae;font-size:.46rem;font-weight:1000;letter-spacing:.08em;box-shadow:inset 0 1px rgba(255,255,255,.17),0 0 18px rgba(255,206,79,.15)}
      .ws-treasure-note{margin:-1px 0 9px;text-align:center;color:#f6d784;font-size:.43rem;font-weight:900;letter-spacing:.045em}
      .ws-treasure-win{position:absolute;z-index:22;left:50%;top:51%;width:min(260px,calc(100% - 28px));transform:translate(-50%,-50%);padding:14px 14px 12px;border:1px solid rgba(255,226,140,.94);border-radius:20px;background:radial-gradient(circle at 50% 5%,rgba(255,221,112,.19),transparent 33%),linear-gradient(160deg,rgba(5,54,78,.985),rgba(37,27,18,.985));box-shadow:0 18px 42px rgba(0,0,0,.48),inset 0 1px rgba(255,255,255,.12);text-align:center;pointer-events:none;animation:wsTreasureWin .82s cubic-bezier(.18,.86,.24,1) both}
      .ws-treasure-chest{position:relative;width:72px;height:54px;margin:0 auto 8px;filter:drop-shadow(0 9px 8px rgba(0,0,0,.35))}
      .ws-treasure-chest::before{content:'';position:absolute;left:7px;right:7px;bottom:4px;height:31px;border:2px solid #6f3e0e;border-radius:5px 5px 9px 9px;background:linear-gradient(#f4c95c,#c68221 60%,#8b5317);box-shadow:inset 0 3px rgba(255,255,255,.24)}
      .ws-treasure-chest::after{content:'';position:absolute;left:5px;right:5px;top:3px;height:24px;border:2px solid #6f3e0e;border-radius:18px 18px 5px 5px;background:linear-gradient(#ffe28a,#d89929);transform-origin:50% 100%;animation:wsTreasureLid .82s ease-out both}
      .ws-treasure-lock{position:absolute;z-index:2;left:50%;bottom:18px;width:16px;height:18px;transform:translateX(-50%);border:2px solid #5b340f;border-radius:4px;background:#ffe082}
      .ws-treasure-win b{display:block;color:#fff0bd;font:900 1rem/1.05 Georgia,serif}.ws-treasure-win small{display:block;margin-top:5px;color:#d8eeee;font-size:.58rem;font-weight:900;line-height:1.35}
      @keyframes wsTreasureWin{0%{opacity:0;transform:translate(-50%,-42%) scale(.78)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-57%) scale(.97)}}
      @keyframes wsTreasureLid{0%,22%{transform:rotateX(0deg) translateY(0)}48%,100%{transform:rotateX(72deg) translateY(-5px)}}
      @media(max-width:430px){.ws-treasure-badge{font-size:.39rem;padding:4px 8px;margin-bottom:6px}.ws-treasure-note{font-size:.38rem}.ws-treasure-win{width:min(235px,calc(100% - 22px));padding:12px}.ws-treasure-chest{transform:scale(.9);margin-bottom:4px}}
      @media(prefers-reduced-motion:reduce){.ws-treasure-win,.ws-treasure-chest::after{animation-duration:.10s!important}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(doc.getElementById('ws-treasure-words-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-treasure-words-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_TREASURE_WORDS__)return;
      window.__WS_TREASURE_WORDS__=true;

      const loot=[
        {label:'MUSCHELBEUTE',score:30,shells:2,weight:55},
        {label:'GROSSE BEUTE',score:55,shells:3,weight:35},
        {label:'PIRATEN-JACKPOT',score:90,shells:5,weight:10}
      ];
      const baseRender=render;
      const baseSetup=setup;
      const baseCheck=check;
      let treasureActive=false;
      let treasureLoot=null;
      let rewardGranted=false;
      let usedInBossSegment=false;

      function pickLoot(){
        let roll=Math.random()*100;
        for(const item of loot){
          if(roll<item.weight)return item;
          roll-=item.weight;
        }
        return loot[0];
      }

      function chooseForWord(){
        if(s.boss){
          treasureActive=false;
          treasureLoot=null;
          rewardGranted=false;
          return;
        }
        if(s.normal===0)usedInBossSegment=false;
        treasureActive=Boolean(!usedInBossSegment&&s.normal===1&&Math.random()<0.40);
        treasureLoot=treasureActive?pickLoot():null;
        rewardGranted=false;
        if(treasureActive)usedInBossSegment=true;
      }

      function renderTreasure(){
        const card=document.querySelector('.card');
        if(!card||s.boss||!treasureActive)return;
        card.classList.add('ws-treasure-word');
        let badge=card.querySelector('.ws-treasure-badge');
        if(!badge){
          badge=document.createElement('div');
          badge.className='ws-treasure-badge';
          badge.textContent='🗝 SCHATZWORT';
          const prompt=card.querySelector('.prompt');
          if(prompt)prompt.insertAdjacentElement('beforebegin',badge);else card.prepend(badge);
        }
        let note=card.querySelector('.ws-treasure-note');
        if(!note){
          note=document.createElement('div');
          note.className='ws-treasure-note';
          note.textContent='Löse dieses Wort richtig und öffne die Schatztruhe.';
          const prompt=card.querySelector('.prompt');
          if(prompt)prompt.insertAdjacentElement('beforebegin',note);
        }
      }

      function showTreasureWin(){
        if(!treasureLoot)return;
        document.querySelector('.ws-treasure-win')?.remove();
        const card=document.querySelector('.card');
        if(!card)return;
        const win=document.createElement('div');
        win.className='ws-treasure-win';
        win.innerHTML='<div class="ws-treasure-chest"><span class="ws-treasure-lock"></span></div><b>'+treasureLoot.label+'</b><small>+'+treasureLoot.score+' Punkte · +'+treasureLoot.shells+' Muscheln</small>';
        card.appendChild(win);
        setTimeout(()=>win.remove(),880);
      }

      check=function(){
        if(s.boss||!treasureActive||!treasureLoot)return baseCheck();
        if(s.feedback)return;
        const answer=cur()[1].toUpperCase();
        const value=s.sel.map(x=>x.l).join('');
        if(value.length!==answer.length)return baseCheck();
        if(value!==answer)return baseCheck();
        if(rewardGranted)return;
        rewardGranted=true;
        baseCheck();
        s.score+=treasureLoot.score;
        s.shells+=treasureLoot.shells;
        if(s.feedback){
          s.feedback.msg+=' SCHATZWORT: +'+treasureLoot.score+' Punkte · +'+treasureLoot.shells+' Muscheln.';
        }
        render();
        showTreasureWin();
      };

      render=function(){baseRender();renderTreasure();};
      setup=function(){chooseForWord();baseSetup();};
      chooseForWord();
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
    }catch(err){console.warn('Word Scramble treasure words skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();

(()=>{
  const id='ws-boss-campaign-stars-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-campaign-stars.js';
  document.head.appendChild(script);
})();
