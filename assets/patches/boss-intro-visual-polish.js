(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  const abilityMeta=[
    ['Deckschrubber-Trick','Kai wirbelt die Wort-Kacheln deiner Übersetzung erneut durcheinander. Die Lösung bleibt fair, aber du musst die Satzreihenfolge neu erfassen.'],
    ['Verdecktes Wort','Brax verdeckt ein Wort für kurze Zeit. Merke dir seine Position und arbeite mit dem restlichen Satz weiter, bis es wieder sichtbar wird.'],
    ['Köderwort','Blackfinn schmuggelt ein falsches Wort zwischen die echten Wort-Kacheln. Das Köderwort gehört niemals zur richtigen Übersetzung.'],
    ['Zeitdruck','Roderick setzt den ganzen Satz unter Zeitdruck. Die Uhr pausiert bei Boss-Info und Pause, aber im Kampf zählt jede Sekunde.'],
    ['Versiegelter Platz','Vargas versiegelt kurz einen Satzplatz. Du kannst erst weitermachen, wenn das Schloss wieder geöffnet ist.'],
    ['Enterhaken','Ironhook zieht ein bereits gesetztes Wort zurück in den Pool. Setze es erneut an der richtigen Stelle ein.'],
    ['Doppelschlag','Thorne verlangt zwei vollständig richtige Sätze hintereinander, bevor ein Boss-Treffer zählt. Ein Fehler setzt die Kette zurück.'],
    ['Falsche Fährte','Corvin markiert absichtlich eine irreführende Wort-Kachel. Verlass dich auf die Übersetzung und nicht blind auf seine Karte.'],
    ['Schattenfluch','Azrak hüllt einzelne Wörter kurz in Schatten. Die Wörter erscheinen wieder, aber du musst dir ihre Position und Bedeutung merken.'],
    ['Königsprüfung','Varkos kombiniert bekannte Boss-Tricks kontrolliert miteinander: Schatten, Köder, Zeitdruck oder Enterhaken. Nie mehr als zwei gleichzeitig.']
  ];

  function syncMeta(){
    if(!Array.isArray(window.WS_BOSS_META))return;
    window.WS_BOSS_META.forEach((boss,index)=>{
      const meta=abilityMeta[index];
      if(!boss||!meta)return;
      boss.ability=meta[0];
      boss.description=meta[1];
    });
  }

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-intro-visual-polish-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-intro-visual-polish-style';
    style.textContent=`
      .ws-boss-intro{
        isolation:isolate!important;
        overflow:hidden!important;
        background:
          linear-gradient(180deg,rgba(0,13,25,.38),rgba(0,10,20,.88)),
          radial-gradient(circle at 50% 24%,rgba(255,216,111,.17),transparent 34%),
          url('https://o-some.github.io/tulasisland/assets/creative/world_harbor.webp') center/cover no-repeat!important;
      }
      .ws-boss-intro::before{content:'';position:absolute;z-index:0;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 36%,transparent 0 34%,rgba(0,8,17,.34) 72%,rgba(0,5,12,.72) 100%),linear-gradient(110deg,rgba(17,126,139,.10),transparent 40%,rgba(255,192,70,.08));box-shadow:inset 0 0 100px rgba(0,5,14,.62)}
      .ws-boss-intro-card{z-index:1!important;width:min(500px,calc(100% - 28px))!important;max-height:calc(100dvh - 24px)!important;overflow:auto!important;box-sizing:border-box!important;padding:24px 24px 20px!important;border-radius:30px!important;background:radial-gradient(circle at 82% 7%,rgba(80,226,207,.15),transparent 28%),linear-gradient(155deg,rgba(4,54,83,.93),rgba(1,20,37,.96))!important;-webkit-backdrop-filter:blur(12px) saturate(1.12);backdrop-filter:blur(12px) saturate(1.12);box-shadow:inset 0 1px rgba(255,255,255,.16),inset 0 0 0 5px rgba(1,19,34,.34),0 30px 78px rgba(0,4,13,.68),0 0 36px rgba(239,199,102,.12)!important}
      .ws-boss-intro-card::before{content:'';position:absolute;z-index:-1;inset:0;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.035),transparent 28%),repeating-linear-gradient(118deg,rgba(255,255,255,.018) 0 2px,transparent 2px 19px)}
      .ws-boss-intro-kicker{min-height:30px!important;padding:0 12px!important;border-color:rgba(255,216,111,.78)!important;background:rgba(1,27,47,.76)!important;font-size:.58rem!important;box-shadow:inset 0 1px rgba(255,255,255,.09),0 0 16px rgba(239,199,102,.10)!important}
      .ws-boss-intro-portrait{height:190px!important;margin:6px auto 0!important}.ws-boss-intro-portrait img{max-width:210px!important;max-height:210px!important;filter:drop-shadow(0 18px 15px rgba(0,0,0,.66)) drop-shadow(0 0 22px rgba(255,216,111,.23))!important}
      .ws-boss-intro-level{margin-top:4px!important;font-size:.64rem!important;letter-spacing:.15em!important}.ws-boss-intro h2{margin:4px 0 8px!important;font-size:1.76rem!important;line-height:1.02!important}
      .ws-boss-ability{position:relative;margin:16px 0 14px!important;padding:16px 16px 15px!important;border:1px solid rgba(239,199,102,.60)!important;border-radius:19px!important;background:radial-gradient(circle at 100% 0,rgba(239,199,102,.09),transparent 38%),linear-gradient(160deg,rgba(1,30,49,.82),rgba(1,22,39,.70))!important;text-align:left!important;box-shadow:inset 0 1px rgba(255,255,255,.08),0 12px 26px rgba(0,7,18,.22)!important}
      .ws-boss-ability::before{content:'☠';position:absolute;right:13px;top:11px;color:#efc766;font-size:1.18rem;opacity:.72;filter:drop-shadow(0 3px 6px rgba(0,0,0,.32))}
      .ws-boss-ability small{display:block;margin-bottom:6px!important;color:#efc766!important;font-size:.56rem!important;font-weight:1000!important;letter-spacing:.14em!important}.ws-boss-ability b{display:block;max-width:85%;margin-bottom:8px!important;color:#fff0bd!important;font-size:1.02rem!important;line-height:1.12!important}.ws-boss-ability p{margin:0!important;color:#e5f4f1!important;font-size:.76rem!important;font-weight:720!important;line-height:1.5!important}
      .ws-boss-intro-start{min-height:56px!important;border-radius:17px!important;font-size:.88rem!important}

      .ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10{position:relative!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:8px!important;min-height:48px!important;max-width:100%!important;margin:2px auto 9px!important;padding:7px 62px 7px 12px!important;box-sizing:border-box!important;border:1px solid rgba(255,216,111,.82)!important;border-radius:15px!important;background:radial-gradient(circle at 12% 50%,rgba(255,217,111,.10),transparent 30%),linear-gradient(160deg,rgba(7,65,94,.98),rgba(1,31,52,.99))!important;color:#fff0bd!important;font-size:.62rem!important;font-weight:1000!important;line-height:1.14!important;letter-spacing:.055em!important;box-shadow:inset 0 1px rgba(255,255,255,.13),0 8px 18px rgba(0,8,20,.34),0 0 0 1px rgba(255,216,111,.06)!important;cursor:pointer!important;user-select:none!important;-webkit-tap-highlight-color:transparent!important}
      .ws-boss-ability-badge::before,.ws-boss-ability-badge-4-6::before,.ws-boss-ability-badge-7-10::before{content:'☠'!important;display:grid!important;place-items:center!important;flex:0 0 30px!important;width:30px!important;height:30px!important;border:1px solid rgba(255,225,138,.64)!important;border-radius:9px!important;background:linear-gradient(160deg,rgba(121,73,23,.80),rgba(61,37,19,.94))!important;color:#ffe18a!important;font-size:1rem!important;line-height:1!important;box-shadow:inset 0 1px rgba(255,255,255,.15),0 0 13px rgba(255,201,72,.12)!important}
      .ws-boss-ability-badge::after,.ws-boss-ability-badge-4-6::after,.ws-boss-ability-badge-7-10::after{content:'INFO ›'!important;position:absolute!important;right:11px!important;top:50%!important;transform:translateY(-50%)!important;color:#9fd7d7!important;font-size:.38rem!important;font-weight:1000!important;letter-spacing:.08em!important}
      .ws-boss-ability-badge:hover,.ws-boss-ability-badge-4-6:hover,.ws-boss-ability-badge-7-10:hover{filter:brightness(1.08)!important}.ws-boss-ability-badge:active,.ws-boss-ability-badge-4-6:active,.ws-boss-ability-badge-7-10:active{transform:translateY(1px) scale(.99)!important}.ws-boss-ability-badge:focus-visible,.ws-boss-ability-badge-4-6:focus-visible,.ws-boss-ability-badge-7-10:focus-visible{outline:2px solid #fff0a8!important;outline-offset:2px!important}

      .ws-boss-info-chip.show{border-color:#ffe18a!important;background:linear-gradient(160deg,rgba(12,79,101,.99),rgba(2,35,57,.99))!important;color:#fff4c3!important;box-shadow:inset 0 1px rgba(255,255,255,.16),0 8px 18px rgba(0,8,20,.38),0 0 0 1px rgba(255,225,138,.14),0 0 18px rgba(255,207,72,.30)!important;animation:wsBossInfoPulse 3s ease-in-out infinite}
      .ws-boss-info-chip.show span{background:linear-gradient(#fff0a8,#e6b94c)!important;box-shadow:0 0 12px rgba(255,216,111,.38)!important}
      @keyframes wsBossInfoPulse{0%,100%{transform:translateY(0) scale(1);filter:brightness(1)}50%{transform:translateY(-1px) scale(1.035);filter:brightness(1.12)}}

      @media(max-width:500px){
        .ws-boss-intro{padding:calc(7px + env(safe-area-inset-top)) 8px calc(7px + env(safe-area-inset-bottom))!important}
        .ws-boss-intro-card{width:min(420px,calc(100% - 8px))!important;max-height:calc(100dvh - 14px)!important;overflow:auto!important;padding:15px 14px 13px!important;border-radius:23px!important}
        .ws-boss-intro-kicker{min-height:24px!important;padding:0 9px!important;font-size:.48rem!important}
        .ws-boss-intro-portrait{height:126px!important;margin:2px auto 0!important}.ws-boss-intro-portrait img{max-width:142px!important;max-height:142px!important}
        .ws-boss-intro-level{font-size:.51rem!important}.ws-boss-intro h2{margin:3px 0 7px!important;font-size:1.30rem!important}
        .ws-boss-ability{margin:9px 0 9px!important;padding:12px 12px 11px!important;border-radius:15px!important}.ws-boss-ability small{font-size:.46rem!important;margin-bottom:4px!important}.ws-boss-ability b{font-size:.86rem!important;margin-bottom:6px!important}.ws-boss-ability p{font-size:.68rem!important;line-height:1.43!important}
        .ws-boss-intro-card .ws-tula-intro{grid-template-columns:38px 1fr!important;gap:6px!important;margin:0 0 7px!important;padding:6px 7px!important;border-radius:11px!important}.ws-boss-intro-card .ws-tula-intro img{width:38px!important;height:38px!important}.ws-boss-intro-card .ws-tula-intro b{font-size:.49rem!important}.ws-boss-intro-card .ws-tula-intro span{font-size:.43rem!important;line-height:1.25!important}
        .ws-boss-intro-card .ws-star-rules{margin:0 0 8px!important;padding:6px 7px!important;border-radius:10px!important;font-size:.42rem!important;line-height:1.28!important}
        .ws-boss-intro-start{min-height:49px!important;border-radius:14px!important;font-size:.76rem!important;box-shadow:0 4px 0 #75430e!important}
        body.ws-boss-compact-mode .ws-boss-ability-badge,body.ws-boss-compact-mode .ws-boss-ability-badge-4-6,body.ws-boss-compact-mode .ws-boss-ability-badge-7-10{min-height:42px!important;margin-bottom:5px!important;padding:5px 50px 5px 8px!important;border-radius:12px!important;font-size:.49rem!important;line-height:1.08!important}
        body.ws-boss-compact-mode .ws-boss-ability-badge::before,body.ws-boss-compact-mode .ws-boss-ability-badge-4-6::before,body.ws-boss-compact-mode .ws-boss-ability-badge-7-10::before{flex-basis:25px!important;width:25px!important;height:25px!important;border-radius:8px!important;font-size:.82rem!important}
        body.ws-boss-compact-mode .ws-boss-ability-badge::after,body.ws-boss-compact-mode .ws-boss-ability-badge-4-6::after,body.ws-boss-compact-mode .ws-boss-ability-badge-7-10::after{right:8px!important;font-size:.31rem!important}
        .ws-boss-info-chip.show{min-height:44px!important}
      }
      @media(max-width:500px) and (max-height:700px){
        .ws-boss-intro-card{padding:11px 11px 10px!important}.ws-boss-intro-portrait{height:98px!important}.ws-boss-intro-portrait img{max-width:112px!important;max-height:112px!important}.ws-boss-intro h2{font-size:1.14rem!important}.ws-boss-ability{margin:7px 0!important;padding:10px!important}.ws-boss-ability p{font-size:.61rem!important;line-height:1.36!important}.ws-boss-intro-start{min-height:45px!important;font-size:.71rem!important}
      }
      @media(max-width:430px){.ws-boss-info-chip.show{width:44px!important;min-width:44px!important;height:44px!important;padding:4px!important}.ws-boss-info-chip.show span{width:24px!important;height:24px!important;font-size:.78rem!important}}
      @media(prefers-reduced-motion:reduce){.ws-boss-info-chip.show{animation:none!important;transform:none!important;filter:none!important;box-shadow:inset 0 1px rgba(255,255,255,.16),0 8px 18px rgba(0,8,20,.38),0 0 0 1px rgba(255,225,138,.18),0 0 16px rgba(255,207,72,.24)!important}}
    `;
    doc.head.appendChild(style);
  }

  function abilitySelector(){return '.ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10';}

  function enhanceAbilityBadges(doc){
    doc.querySelectorAll(abilitySelector()).forEach(badge=>{
      badge.setAttribute('role','button');
      badge.setAttribute('tabindex','0');
      badge.setAttribute('title','Bossfähigkeit ansehen');
      if(!badge.getAttribute('aria-label'))badge.setAttribute('aria-label','Bossfähigkeit ansehen');
    });
  }

  function openBossInfo(doc){
    syncMeta();
    const chip=doc.querySelector('.ws-boss-info-chip');
    if(chip){chip.click();return;}
  }

  function installInteraction(doc){
    if(doc.documentElement.dataset.wsBossAbilityInfoBound==='1')return;
    doc.documentElement.dataset.wsBossAbilityInfoBound='1';
    doc.addEventListener('click',event=>{
      const badge=event.target.closest?.(abilitySelector());
      if(!badge)return;
      event.preventDefault();
      openBossInfo(doc);
    },true);
    doc.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      const badge=event.target.closest?.(abilitySelector());
      if(!badge)return;
      event.preventDefault();
      openBossInfo(doc);
    },true);
    const target=doc.getElementById('game')||doc.body;
    if(target)new MutationObserver(()=>{syncMeta();enhanceAbilityBadges(doc);}).observe(target,{childList:true,subtree:true});
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head)return;
      syncMeta();
      ensureStyles(doc);
      enhanceAbilityBadges(doc);
      installInteraction(doc);
    }catch(err){console.warn('Word Scramble boss intro visual polish skipped',err)}
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
