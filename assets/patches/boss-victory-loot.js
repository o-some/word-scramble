(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  const bosses=window.WS_BOSS_META||[];
  const rewards={
    1:{score:80,shells:2},
    2:{score:130,shells:3},
    3:{score:200,shells:5}
  };

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-victory-loot-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-victory-loot-style';
    style.textContent=`
      .bossImg.ws-boss-final-defeat{animation:wsBossFinalDefeat .72s cubic-bezier(.18,.82,.24,1) both!important}
      .bossSide.ws-boss-final-defeat-stage::after{content:'';position:absolute;z-index:2;left:44%;bottom:76px;width:178px;height:178px;border-radius:50%;transform:translate(-50%,50%);background:radial-gradient(circle,rgba(255,218,109,.34),rgba(255,105,82,.16) 38%,transparent 72%);pointer-events:none;animation:wsBossFinalFlash .72s ease-out both}
      @keyframes wsBossFinalDefeat{0%{transform:translateY(0) rotate(0) scale(1);filter:drop-shadow(0 20px 17px rgba(0,0,0,.62))}28%{transform:translateY(-8px) rotate(-4deg) scale(1.04);filter:drop-shadow(0 18px 16px rgba(0,0,0,.58)) drop-shadow(0 0 24px rgba(255,214,96,.55)) brightness(1.08)}58%{transform:translateY(7px) rotate(3deg) scale(.96)}100%{transform:translateY(18px) rotate(-2deg) scale(.90);filter:drop-shadow(0 14px 12px rgba(0,0,0,.52)) grayscale(.2) brightness(.74);opacity:.58}}
      @keyframes wsBossFinalFlash{0%{opacity:0;transform:translate(-50%,50%) scale(.58)}30%{opacity:1;transform:translate(-50%,50%) scale(.98)}100%{opacity:0;transform:translate(-50%,50%) scale(1.28)}}
      .ws-victory-overlay{position:fixed;z-index:150;inset:0;display:grid;place-items:center;padding:calc(14px + env(safe-area-inset-top)) 12px calc(14px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 28%,rgba(255,211,90,.18),transparent 34%),rgba(0,10,19,.88);-webkit-backdrop-filter:blur(12px) saturate(1.08);backdrop-filter:blur(12px) saturate(1.08);animation:wsVictoryOverlay 2.75s ease both;pointer-events:auto}
      .ws-victory-card{position:relative;width:min(420px,100%);overflow:hidden;padding:18px 17px 16px;border:1px solid rgba(255,224,126,.93);border-radius:27px;background:radial-gradient(circle at 82% 7%,rgba(72,222,202,.12),transparent 29%),radial-gradient(circle at 12% 100%,rgba(255,204,82,.13),transparent 34%),linear-gradient(155deg,rgba(5,59,88,.995),rgba(1,25,43,.995));box-shadow:inset 0 1px rgba(255,255,255,.14),inset 0 0 0 5px rgba(1,20,36,.32),0 30px 76px rgba(0,4,13,.68);text-align:center}
      .ws-victory-kicker{display:inline-flex;align-items:center;min-height:27px;padding:0 10px;border:1px solid rgba(239,199,102,.58);border-radius:999px;background:rgba(1,31,52,.78);color:#f3cc67;font-size:.52rem;font-weight:1000;letter-spacing:.12em}
      .ws-victory-portrait{height:118px;margin:2px auto -2px;display:grid;place-items:end center}.ws-victory-portrait img{max-width:145px;max-height:128px;object-fit:contain;filter:drop-shadow(0 14px 12px rgba(0,0,0,.58)) grayscale(.12);opacity:.78;transform:rotate(-2deg)}
      .ws-victory-card h2{margin:4px 0 4px;color:#fff0bd;font:900 1.45rem/1 Georgia,serif;text-shadow:0 4px 16px rgba(0,0,0,.4)}
      .ws-victory-level{margin:0;color:#abd8d9;font-size:.55rem;font-weight:950;letter-spacing:.12em}
      .ws-victory-stars{margin:10px 0 7px;color:#ffe18a;font-size:1.45rem;line-height:1;letter-spacing:.06em;text-shadow:0 0 16px rgba(255,216,111,.24),0 3px 8px rgba(0,0,0,.4);opacity:0;animation:wsVictoryRise .42s .20s ease-out forwards}
      .ws-victory-performance{margin:0 0 10px;color:#cbe7e4;font-size:.53rem;font-weight:850;opacity:0;animation:wsVictoryRise .42s .34s ease-out forwards}
      .ws-victory-loot{display:grid;grid-template-columns:64px 1fr;align-items:center;gap:10px;margin:0 auto 11px;padding:10px 12px;border:1px solid rgba(239,199,102,.43);border-radius:18px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.025));text-align:left;opacity:0;animation:wsVictoryRise .46s .58s ease-out forwards}
      .ws-victory-chest{position:relative;width:58px;height:45px;filter:drop-shadow(0 8px 7px rgba(0,0,0,.34))}.ws-victory-chest::before{content:'';position:absolute;left:5px;right:5px;bottom:2px;height:27px;border:2px solid #683a0d;border-radius:5px 5px 8px 8px;background:linear-gradient(#f4c95c,#c68221 60%,#8b5317)}.ws-victory-chest::after{content:'';position:absolute;left:4px;right:4px;top:2px;height:20px;border:2px solid #683a0d;border-radius:16px 16px 4px 4px;background:linear-gradient(#ffe28a,#d89929);transform-origin:50% 100%;animation:wsVictoryChestOpen .58s .70s ease-out both}
      .ws-victory-loot b{display:block;color:#fff0bd;font-size:.72rem;margin-bottom:3px}.ws-victory-loot span{display:block;color:#ffe18a;font-size:.63rem;font-weight:1000}.ws-victory-loot small{display:block;margin-top:2px;color:#bcdfe0;font-size:.45rem;font-weight:800}
      .ws-victory-next{padding:8px 10px;border:1px solid rgba(112,217,173,.28);border-radius:13px;background:rgba(4,67,74,.24);color:#ccebe5;font-size:.48rem;font-weight:900;line-height:1.35;opacity:0;animation:wsVictoryRise .46s .96s ease-out forwards}.ws-victory-next b{color:#ffe18a}
      @keyframes wsVictoryRise{0%{opacity:0;transform:translateY(8px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}}
      @keyframes wsVictoryChestOpen{0%,25%{transform:rotateX(0) translateY(0)}55%,100%{transform:rotateX(70deg) translateY(-4px)}}
      @keyframes wsVictoryOverlay{0%{opacity:0}8%,84%{opacity:1}100%{opacity:0}}
      @media(max-width:430px){.ws-victory-card{padding:15px 13px 13px;border-radius:23px}.ws-victory-portrait{height:96px}.ws-victory-portrait img{max-width:122px;max-height:105px}.ws-victory-card h2{font-size:1.2rem}.ws-victory-stars{font-size:1.25rem;margin-top:8px}.ws-victory-loot{grid-template-columns:54px 1fr;padding:8px 9px}.ws-victory-chest{transform:scale(.88);transform-origin:center}.ws-victory-next{font-size:.42rem}}
      @media(prefers-reduced-motion:reduce){.bossImg.ws-boss-final-defeat,.bossSide.ws-boss-final-defeat-stage::after,.ws-victory-overlay,.ws-victory-stars,.ws-victory-performance,.ws-victory-loot,.ws-victory-next,.ws-victory-chest::after{animation-duration:.10s!important;animation-delay:0s!important}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(doc.getElementById('ws-boss-victory-loot-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-victory-loot-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_VICTORY_LOOT__)return;
      window.__WS_BOSS_VICTORY_LOOT__=true;
      const rewards=${JSON.stringify(rewards)};
      const CLAIM_KEY='wordScrambleBossVictoryLootClaimV1';
      document.addEventListener('ws-boss-campaign-updated',event=>{
        const result=event.detail;
        if(!result||!result.level||!result.at)return;
        const claim=String(result.level)+':'+String(result.at);
        try{if(sessionStorage.getItem(CLAIM_KEY)===claim)return;sessionStorage.setItem(CLAIM_KEY,claim);}catch{}
        const reward=rewards[Math.max(1,Math.min(3,Number(result.stars)||1))]||rewards[1];
        s.score+=reward.score;
        s.shells+=reward.shells;
        render();
        document.dispatchEvent(new CustomEvent('ws-boss-victory-loot',{detail:{...result,reward}}));
      });
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function showVictory(doc,result){
    if(!result?.reward)return;
    const level=Math.max(1,Math.min(10,Number(result.level)||1));
    const boss=bosses[level-1];
    if(!boss)return;
    const nextLevel=level>=10?1:level+1;
    const nextBoss=bosses[nextLevel-1];
    const stars=Math.max(1,Math.min(3,Number(result.stars)||1));
    const starText='★'.repeat(stars)+'☆'.repeat(3-stars);
    const finalBoss=level===10;

    window.setTimeout(()=>{
      const img=doc.querySelector('.bossImg');
      const side=doc.querySelector('.bossSide');
      if(img)img.classList.add('ws-boss-final-defeat');
      if(side)side.classList.add('ws-boss-final-defeat-stage');
    },0);

    window.setTimeout(()=>{
      doc.querySelector('.ws-victory-overlay')?.remove();
      const overlay=doc.createElement('div');
      overlay.className='ws-victory-overlay';
      overlay.setAttribute('role','status');
      overlay.setAttribute('aria-live','polite');
      overlay.innerHTML=`<section class="ws-victory-card"><div class="ws-victory-kicker">⚔ BOSS BESIEGT</div><div class="ws-victory-portrait"><img src="${boss.sprite}" alt="${boss.name}"></div><p class="ws-victory-level">LEVEL ${level}</p><h2>${boss.name} besiegt!</h2><div class="ws-victory-stars" aria-label="${stars} von 3 Sternen">${starText}</div><p class="ws-victory-performance">${Number(result.misses)||0} Bossfehler · ${Number(result.hints)||0} Tipps${Number(result.best)>stars?' · Bestwert '+('★'.repeat(Number(result.best))):''}</p><div class="ws-victory-loot"><div class="ws-victory-chest"></div><div><b>SIEGESBEUTE</b><span>+${result.reward.score} Punkte · +${result.reward.shells} Muscheln</span><small>Belohnung für ${stars} Stern${stars===1?'':'e'}</small></div></div><div class="ws-victory-next">${finalBoss?'🏆 KAMPAGNE ABGESCHLOSSEN':'☠ NÄCHSTER GEGNER'}<br><b>LEVEL ${nextLevel} · ${nextBoss?.name||''}</b></div></section>`;
      doc.body.appendChild(overlay);
      window.setTimeout(()=>overlay.remove(),2750);
    },430);
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.documentElement)return;
      ensureStyles(doc);
      installRuntime(doc);
      doc.addEventListener('ws-boss-victory-loot',event=>showVictory(doc,event.detail));
    }catch(err){console.warn('Word Scramble boss victory loot skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();

(()=>{
  const id='ws-tula-final-polish-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/tula-reactions-final-polish.js';
  document.head.appendChild(script);
})();
