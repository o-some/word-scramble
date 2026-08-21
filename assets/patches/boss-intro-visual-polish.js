(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-intro-visual-polish-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-intro-visual-polish-style';
    style.textContent=`
      .ws-boss-intro{
        isolation:isolate!important;
        overflow:hidden!important;
        background:
          linear-gradient(180deg,rgba(0,13,25,.40),rgba(0,10,20,.86)),
          radial-gradient(circle at 50% 24%,rgba(255,216,111,.16),transparent 34%),
          url('https://o-some.github.io/tulasisland/assets/creative/world_harbor.webp') center/cover no-repeat!important;
      }
      .ws-boss-intro::before{content:'';position:absolute;z-index:0;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 36%,transparent 0 34%,rgba(0,8,17,.34) 72%,rgba(0,5,12,.70) 100%),linear-gradient(110deg,rgba(17,126,139,.10),transparent 40%,rgba(255,192,70,.08));box-shadow:inset 0 0 100px rgba(0,5,14,.62)}
      .ws-boss-intro-card{z-index:1!important;overflow:hidden!important;background:radial-gradient(circle at 82% 7%,rgba(80,226,207,.15),transparent 28%),linear-gradient(155deg,rgba(4,54,83,.91),rgba(1,20,37,.94))!important;-webkit-backdrop-filter:blur(12px) saturate(1.12);backdrop-filter:blur(12px) saturate(1.12);box-shadow:inset 0 1px rgba(255,255,255,.16),inset 0 0 0 5px rgba(1,19,34,.34),0 30px 78px rgba(0,4,13,.66),0 0 34px rgba(239,199,102,.10)!important}
      .ws-boss-intro-card::before{content:'';position:absolute;z-index:-1;inset:0;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.035),transparent 28%),repeating-linear-gradient(118deg,rgba(255,255,255,.018) 0 2px,transparent 2px 19px)}
      .ws-boss-intro-kicker{border-color:rgba(255,216,111,.72)!important;background:rgba(1,27,47,.72)!important;box-shadow:inset 0 1px rgba(255,255,255,.09),0 0 16px rgba(239,199,102,.10)!important}
      .ws-boss-intro-portrait img{filter:drop-shadow(0 18px 15px rgba(0,0,0,.66)) drop-shadow(0 0 22px rgba(255,216,111,.23))!important}
      .ws-boss-ability{background:linear-gradient(160deg,rgba(1,30,49,.72),rgba(1,22,39,.60))!important;border-color:rgba(239,199,102,.52)!important}
      .ws-boss-info-chip.show{border-color:#ffe18a!important;background:linear-gradient(160deg,rgba(12,79,101,.99),rgba(2,35,57,.99))!important;color:#fff4c3!important;box-shadow:inset 0 1px rgba(255,255,255,.16),0 8px 18px rgba(0,8,20,.38),0 0 0 1px rgba(255,225,138,.14),0 0 18px rgba(255,207,72,.30)!important;animation:wsBossInfoPulse 3s ease-in-out infinite}
      .ws-boss-info-chip.show span{background:linear-gradient(#fff0a8,#e6b94c)!important;box-shadow:0 0 12px rgba(255,216,111,.38)!important}
      @keyframes wsBossInfoPulse{0%,100%{transform:translateY(0) scale(1);filter:brightness(1)}50%{transform:translateY(-1px) scale(1.035);filter:brightness(1.12)}}

      @media(max-width:500px){
        .ws-boss-intro{padding:calc(7px + env(safe-area-inset-top)) 8px calc(7px + env(safe-area-inset-bottom))!important}
        .ws-boss-intro-card{width:min(390px,100%)!important;max-height:calc(100dvh - 14px)!important;overflow:hidden!important;padding:11px 11px 10px!important;border-radius:22px!important}
        .ws-boss-intro-kicker{min-height:22px!important;padding:0 8px!important;font-size:.44rem!important}
        .ws-boss-intro-portrait{height:128px!important;margin:1px auto -2px!important}.ws-boss-intro-portrait img{max-width:142px!important;max-height:142px!important}
        .ws-boss-intro-level{font-size:.48rem!important;line-height:1.05!important}.ws-boss-intro h2{margin:2px 0 4px!important;font-size:1.18rem!important}
        .ws-boss-ability{margin:7px 0 6px!important;padding:8px 9px!important;border-radius:13px!important}.ws-boss-ability small{font-size:.40rem!important;margin-bottom:2px!important}.ws-boss-ability b{font-size:.70rem!important;margin-bottom:3px!important}.ws-boss-ability p{font-size:.54rem!important;line-height:1.24!important}
        .ws-boss-intro-card .ws-tula-intro{grid-template-columns:38px 1fr!important;gap:6px!important;margin:0 0 6px!important;padding:5px 6px!important;border-radius:11px!important}.ws-boss-intro-card .ws-tula-intro img{width:38px!important;height:38px!important}.ws-boss-intro-card .ws-tula-intro b{font-size:.47rem!important}.ws-boss-intro-card .ws-tula-intro span{font-size:.39rem!important;line-height:1.18!important}
        .ws-boss-intro-card .ws-star-rules{margin:0 0 7px!important;padding:5px 6px!important;border-radius:10px!important;font-size:.37rem!important;line-height:1.2!important}
        .ws-boss-intro-start{min-height:47px!important;border-radius:14px!important;font-size:.72rem!important;box-shadow:0 4px 0 #75430e!important}
        .ws-boss-info-chip.show{min-height:44px!important}
      }
      @media(max-width:500px) and (max-height:700px){
        .ws-boss-intro-card{padding:8px 9px 8px!important}
        .ws-boss-intro-portrait{height:104px!important}.ws-boss-intro-portrait img{max-width:118px!important;max-height:118px!important}
        .ws-boss-intro h2{font-size:1.05rem!important}.ws-boss-ability{margin:5px 0!important;padding:6px 7px!important}.ws-boss-ability p{font-size:.49rem!important;line-height:1.16!important}
        .ws-boss-intro-card .ws-tula-intro{grid-template-columns:32px 1fr!important;padding:4px 5px!important;margin-bottom:5px!important}.ws-boss-intro-card .ws-tula-intro img{width:32px!important;height:32px!important}.ws-boss-intro-card .ws-tula-intro span{font-size:.35rem!important}
        .ws-boss-intro-card .ws-star-rules{padding:4px 5px!important;margin-bottom:5px!important;font-size:.34rem!important}.ws-boss-intro-start{min-height:44px!important;font-size:.68rem!important}
      }
      @media(max-width:430px){.ws-boss-info-chip.show{width:44px!important;min-width:44px!important;height:44px!important;padding:4px!important}.ws-boss-info-chip.show span{width:24px!important;height:24px!important;font-size:.78rem!important}}
      @media(prefers-reduced-motion:reduce){.ws-boss-info-chip.show{animation:none!important;transform:none!important;filter:none!important;box-shadow:inset 0 1px rgba(255,255,255,.16),0 8px 18px rgba(0,8,20,.38),0 0 0 1px rgba(255,225,138,.18),0 0 16px rgba(255,207,72,.24)!important}}
    `;
    doc.head.appendChild(style);
  }

  function install(){
    try{const doc=frame.contentDocument;if(!doc?.head)return;ensureStyles(doc);}catch(err){console.warn('Word Scramble boss intro visual polish skipped',err)}
  }
  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();

(()=>{
  const id='ws-boss-ux-final-regression-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-ux-final-regression.js';
  document.head.appendChild(script);
})();
