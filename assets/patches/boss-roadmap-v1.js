(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  const bosses=[
    {name:'Pirat Kai',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-01-pirat-kai.webp?v=dbx-master-20260821',ability:'Deckschrubber-Trick',description:'Kai wirbelt die Wort-Kacheln deiner Übersetzung erneut durcheinander. Die Lösung bleibt fair, aber du musst die Satzreihenfolge neu erfassen.'},
    {name:'Kapitän Brax',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-02-kapitaen-brax.webp?v=dbx-master-20260821',ability:'Verdecktes Wort',description:'Brax verdeckt ein Wort für kurze Zeit. Merke dir seine Position und arbeite mit dem restlichen Satz weiter.'},
    {name:'Blackfinn',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-03-blackfinn.webp?v=dbx-master-20260821',ability:'Köderwort',description:'Blackfinn schmuggelt ein falsches Wort zwischen die echten Wort-Kacheln. Das Köderwort gehört niemals zur richtigen Übersetzung.'},
    {name:'Alt-Kapitän Roderick',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-04-alt-kapitaen-roderick.webp?v=dbx-master-20260821',ability:'Zeitdruck',description:'Roderick gibt dir 15 Sekunden für den ganzen Satz. Die Uhr pausiert bei Boss-Info und Pause.'},
    {name:'Piratenbaron Vargas',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-05-piratenbaron-vargas.webp?v=dbx-master-20260821',ability:'Wandernde Blockade',description:'Vargas startet mit einer Blockade auf Wort 2. Sie springt danach jeweils drei Positionen weiter und verschwindet, sobald nur noch ein Platz frei ist.'},
    {name:'Kapitän Ironhook',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-06-kapitaen-ironhook.webp?v=dbx-master-20260821',ability:'Enterhaken',description:'Ironhook zieht zuerst Wort 2 und danach Wort 5, 8 und so weiter wieder aus deinem Satz zurück. Setze die Wörter erneut richtig ein.'},
    {name:'Admiral Thorne',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-07-admiral-thorne.webp?v=dbx-master-20260821',ability:'Doppelschlag',description:'Thorne verlangt zwei vollständig richtige Sätze hintereinander. Nach dem ersten richtigen Satz wird 1/2 deutlich als geladener Treffer angezeigt.'},
    {name:'Kartenmeister Corvin',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-08-kartenmeister-corvin.webp?v=dbx-master-20260821',ability:'Falsche Fährte',description:'Corvin legt ein markiertes Köderwort aus, das komplett fremd ist und niemals zur richtigen Satzübersetzung gehört.'},
    {name:'Schattenfürst Azrak',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-09-schattenfuerst-azrak.webp?v=dbx-master-20260821',ability:'Schattenfluch',description:'Azrak macht immer genau ein noch nicht gesetztes Wort unlesbar. Setzt du es richtig ein, wird es sichtbar und der Schatten springt auf ein anderes Wort.'},
    {name:'Piratenkönig Varkos',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-10-piratenkoenig-varkos.webp?v=dbx-master-20260821',ability:'Königsprüfung',description:'Varkos kombiniert kontrolliert bekannte Boss-Tricks. Nie mehr als zwei gleichzeitig.'}
  ];
  window.WS_BOSS_META=bosses;

  let timer=0;
  let lastKey='';
  let wasEncounterActive=false;
  let introShownForEncounter=false;

  function currentLevel(win,doc){
    const plate=doc.querySelector('.bossPlate');
    const match=plate?.textContent?.match(/LEVEL\s+(\d+)/i);
    if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
    try{return Math.max(1,Math.min(10,Number(win.sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
  }

  function ensureEncounterStateProbe(doc){
    if(doc.getElementById('ws-boss-encounter-state-probe'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-encounter-state-probe';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_ENCOUNTER_ACTIVE__)return;
      window.__WS_BOSS_ENCOUNTER_ACTIVE__=()=>typeof s!=='undefined'&&Boolean(s.boss);
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function bossEncounterActive(win,doc){
    try{
      ensureEncounterStateProbe(doc);
      if(typeof win.__WS_BOSS_ENCOUNTER_ACTIVE__==='function')return Boolean(win.__WS_BOSS_ENCOUNTER_ACTIVE__());
    }catch{}
    return Boolean(doc.querySelector('.bossSide'));
  }

  function ensureStyles(doc){
    if(doc.getElementById('word-scramble-boss-roadmap-v1-style'))return;
    const style=doc.createElement('style');
    style.id='word-scramble-boss-roadmap-v1-style';
    style.textContent=`
      .game:has(.bossSide){grid-template-columns:minmax(0,1fr) 154px!important;gap:6px!important}
      .bossSide{overflow:visible!important;z-index:7!important;min-width:0!important;padding:58px 0 50px!important;isolation:isolate!important}
      .bossSide::before{left:43%!important;bottom:74px!important;width:172px!important;height:220px!important}
      .bossImg{width:222px!important;max-width:none!important;max-height:390px!important;margin-left:-54px!important;margin-right:-14px!important;position:relative!important;z-index:5!important;object-fit:contain!important;object-position:center bottom!important;filter:drop-shadow(0 24px 20px rgba(0,0,0,.72)) drop-shadow(0 0 22px rgba(255,216,111,.38))!important}
      .bossPlate{position:absolute!important;z-index:8!important;top:7px!important;left:-22px!important;right:-6px!important;margin:0!important;padding:6px 9px!important;border:1px solid rgba(255,216,111,.78)!important;border-radius:13px!important;background:linear-gradient(180deg,rgba(4,48,76,.98),rgba(1,27,47,.98))!important;color:#ffe18a!important;text-align:center!important;font:900 .64rem/1.12 Georgia,serif!important;box-shadow:inset 0 1px rgba(255,255,255,.12),0 7px 20px rgba(0,0,0,.32),0 0 14px rgba(255,216,111,.12)!important;text-shadow:0 2px 5px rgba(0,0,0,.58)!important}
      #pause.ws-pause-button{width:72px!important;min-width:72px!important;height:48px!important;border-radius:15px!important;border-color:rgba(255,216,111,.92)!important;background:linear-gradient(160deg,rgba(7,67,98,.99),rgba(1,29,49,.99))!important;box-shadow:inset 0 1px rgba(255,255,255,.13),0 8px 19px rgba(0,10,23,.40),0 0 0 1px rgba(255,216,111,.08)!important}
      #pause.ws-pause-button::before{top:7px!important;width:20px!important;height:18px!important;background:linear-gradient(90deg,#ffe18a 0 6px,transparent 6px 14px,#ffe18a 14px 20px)!important}
      #pause.ws-pause-button::after{content:'PAUSE'!important;bottom:5px!important;color:#fff0bd!important;font-size:.48rem!important;font-weight:1000!important;letter-spacing:.10em!important;text-shadow:0 2px 4px rgba(0,0,0,.45)!important}
      .ws-boss-info-chip{display:none;align-items:center;gap:5px;min-height:42px;padding:5px 8px;border:1px solid rgba(255,216,111,.72);border-radius:13px;background:linear-gradient(160deg,rgba(4,57,86,.98),rgba(1,29,49,.98));color:#fff0bd;font-size:.48rem;font-weight:950;letter-spacing:.04em;box-shadow:inset 0 1px rgba(255,255,255,.10),0 7px 17px rgba(0,10,23,.30);cursor:pointer;white-space:nowrap}
      .ws-boss-info-chip.show{display:inline-flex}.ws-boss-info-chip span{display:grid;place-items:center;width:21px;height:21px;border-radius:50%;background:#efc766;color:#082f4b;font-size:.72rem;font-weight:1000}.ws-boss-info-chip:active{transform:translateY(1px) scale(.98)}
      .ws-boss-intro{position:fixed;z-index:120;inset:0;display:grid;place-items:center;padding:calc(16px + env(safe-area-inset-top)) 14px calc(16px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 28%,rgba(21,111,137,.24),transparent 37%),rgba(0,10,20,.86);-webkit-backdrop-filter:blur(12px) saturate(1.08);backdrop-filter:blur(12px) saturate(1.08)}
      .ws-boss-intro-card{position:relative;width:min(430px,100%);max-height:min(620px,calc(100svh - 28px));overflow:auto;box-sizing:border-box;padding:18px 18px 16px;border:1px solid rgba(255,216,111,.90);border-radius:27px;background:radial-gradient(circle at 84% 8%,rgba(55,219,199,.14),transparent 30%),linear-gradient(155deg,rgba(5,59,91,.995),rgba(1,24,43,.995));box-shadow:inset 0 1px rgba(255,255,255,.13),inset 0 0 0 5px rgba(1,20,36,.32),0 30px 75px rgba(0,4,13,.65);text-align:center}
      .ws-boss-intro-kicker{display:inline-flex;align-items:center;min-height:27px;padding:0 10px;border:1px solid rgba(239,199,102,.55);border-radius:999px;background:rgba(1,31,52,.76);color:#f3cc67;font-size:.52rem;font-weight:950;letter-spacing:.12em}
      .ws-boss-intro-portrait{height:190px;margin:4px auto -4px;display:grid;place-items:end center;overflow:visible}.ws-boss-intro-portrait img{max-width:205px;max-height:205px;object-fit:contain;filter:drop-shadow(0 18px 15px rgba(0,0,0,.62)) drop-shadow(0 0 18px rgba(255,216,111,.18))}
      .ws-boss-intro h2{margin:3px 0 5px;color:#fff0bd;font:900 1.58rem/1 Georgia,serif;text-shadow:0 4px 16px rgba(0,0,0,.38)}
      .ws-boss-intro-level{margin:0;color:#a9d7d8;font-size:.58rem;font-weight:950;letter-spacing:.13em}.ws-boss-ability{margin:14px 0 11px;padding:12px;border:1px solid rgba(239,199,102,.42);border-radius:17px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.025));text-align:left}.ws-boss-ability small{display:block;margin-bottom:4px;color:#efc766;font-size:.48rem;font-weight:1000;letter-spacing:.12em}.ws-boss-ability b{display:block;margin-bottom:5px;color:#fff0bd;font-size:.84rem}.ws-boss-ability p{margin:0;color:#d8eeee;font-size:.67rem;font-weight:700;line-height:1.45}
      .ws-boss-intro-start{width:100%;min-height:53px;border:1px solid #fff0a8;border-radius:16px;background:linear-gradient(#ffe895,#e3b13d 55%,#b97418);box-shadow:0 5px 0 #75430e;color:#092f4b;font-weight:1000;font-size:.84rem;cursor:pointer}.ws-boss-intro-start:active{transform:translateY(2px);box-shadow:0 3px 0 #75430e}
      .ws-boss-roadmap{position:fixed;z-index:60;left:50%;bottom:max(6px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(500px,calc(100vw - 14px));box-sizing:border-box;padding:5px 6px 6px;border:1px solid rgba(239,199,102,.64);border-radius:15px;background:linear-gradient(155deg,rgba(3,49,76,.95),rgba(1,25,44,.96));box-shadow:inset 0 1px rgba(255,255,255,.08),0 10px 25px rgba(0,8,20,.40);pointer-events:auto;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
      .ws-boss-roadmap-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 2px 4px;color:#ffe18a;font-size:.48rem;font-weight:950;letter-spacing:.08em}.ws-boss-roadmap-head span:last-child{color:#a9d7d8;font-size:.38rem;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ws-boss-roadmap-track{display:flex;gap:4px;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch;touch-action:pan-x;padding:1px calc(50% - 56px) 2px}.ws-boss-roadmap-track::-webkit-scrollbar{display:none}.ws-boss-card{appearance:none;position:relative;display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:3px;flex:0 0 108px;min-width:108px;height:44px;padding:3px 5px 3px 3px;box-sizing:border-box;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.025));overflow:hidden;scroll-snap-align:center;color:inherit;font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent}.ws-boss-card.current{border-color:rgba(255,216,111,.92);background:linear-gradient(160deg,rgba(239,199,102,.24),rgba(31,142,153,.15));box-shadow:inset 0 0 0 1px rgba(255,216,111,.10),0 0 15px rgba(255,216,111,.15);transform:translateY(-1px)}.ws-boss-card:focus-visible{outline:2px solid #fff0a8;outline-offset:1px}.ws-boss-card:active{transform:translateY(1px) scale(.98)}.ws-boss-card.current:active{transform:translateY(0) scale(.98)}.ws-boss-card img{width:34px;height:36px;object-fit:contain;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55))}.ws-boss-card-copy{min-width:0;text-align:left}.ws-boss-card-copy b{display:block;color:#ffe18a;font-size:.30rem;line-height:1;margin-bottom:2px}.ws-boss-card-copy small{display:block;color:#dcefee;font-size:.29rem;font-weight:900;line-height:1.08;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ws-boss-card em{position:absolute;top:2px;right:2px;padding:2px 3px;border-radius:999px;background:#a84f2e;color:#fff6d8;font-size:.20rem;font-style:normal;font-weight:950;line-height:1}
      @media(max-width:500px){.game:has(.bossSide){grid-template-columns:minmax(0,1fr) 104px!important;gap:4px!important}.bossSide{padding:50px 0 46px!important}.bossImg{width:182px!important;max-height:330px!important;margin-left:-68px!important;margin-right:-10px!important}.bossPlate{top:4px!important;left:-34px!important;right:-4px!important;padding:5px 7px!important;font-size:.54rem!important}#pause.ws-pause-button{width:64px!important;min-width:64px!important;height:46px!important}#pause.ws-pause-button::after{font-size:.43rem!important}.ws-boss-info-chip{min-height:38px;padding:4px 6px;font-size:.40rem}.ws-boss-intro-card{padding:15px 14px 14px;border-radius:23px}.ws-boss-intro-portrait{height:164px}.ws-boss-intro-portrait img{max-width:178px;max-height:178px}.ws-boss-intro h2{font-size:1.36rem}}
      @media(max-width:430px){.bossImg{width:168px!important;max-height:315px!important;margin-left:-64px!important;margin-right:-8px!important}.ws-boss-roadmap{width:calc(100vw - 10px);padding:4px 5px 5px;border-radius:12px}.ws-boss-roadmap-head{font-size:.40rem;margin-bottom:3px}.ws-boss-roadmap-head span:last-child{font-size:.31rem}.ws-boss-roadmap-track{gap:3px;padding-left:calc(50% - 49px);padding-right:calc(50% - 49px)}.ws-boss-card{grid-template-columns:29px minmax(0,1fr);flex-basis:94px;min-width:94px;height:42px;padding:2px 3px 2px 2px;border-radius:8px}.ws-boss-card img{width:29px;height:32px}.ws-boss-card-copy b{font-size:.25rem}.ws-boss-card-copy small{font-size:.24rem}.ws-boss-card em{font-size:.17rem}.ws-boss-info-chip{font-size:0;width:40px;min-width:40px;padding:4px;justify-content:center}.ws-boss-info-chip span{width:22px;height:22px;font-size:.75rem}.ws-boss-ability{margin-top:10px}}
      @media(max-width:355px){.game:has(.bossSide){grid-template-columns:minmax(0,1fr) 92px!important}.bossImg{width:154px!important;margin-left:-59px!important}.bossPlate{left:-30px!important;font-size:.50rem!important}#pause.ws-pause-button{width:60px!important;min-width:60px!important}.ws-boss-card{grid-template-columns:27px minmax(0,1fr);flex-basis:88px;min-width:88px}.ws-boss-card img{width:27px;height:30px}.ws-boss-card-copy small{font-size:.22rem}.ws-boss-roadmap-track{padding-left:calc(50% - 46px);padding-right:calc(50% - 46px)}}
      @media(max-width:500px){
        html.ws-boss-compact-mode,body.ws-boss-compact-mode{height:100dvh!important;min-height:100dvh!important;overflow:hidden!important;overscroll-behavior:none}
        body.ws-boss-compact-mode .app{height:100dvh!important;min-height:100dvh!important;overflow:hidden!important;padding:calc(5px + env(safe-area-inset-top)) 7px calc(64px + env(safe-area-inset-bottom))!important}
        body.ws-boss-compact-mode .layer{height:100%!important;min-height:0!important;display:flex!important;flex-direction:column!important}
        body.ws-boss-compact-mode .hud{flex:0 0 auto!important;gap:4px!important;padding-bottom:4px!important}
        body.ws-boss-compact-mode .hud .top{display:none!important}
        body.ws-boss-compact-mode .stats{gap:4px!important}
        body.ws-boss-compact-mode .stat{min-height:36px!important;padding:4px 8px!important;border-radius:13px!important}
        body.ws-boss-compact-mode .stat small{font-size:.42rem!important}.ws-boss-compact-mode .stat b{font-size:.78rem!important}
        body.ws-boss-compact-mode .hud2{gap:4px!important;min-height:44px!important}
        body.ws-boss-compact-mode .level,body.ws-boss-compact-mode .wallet{min-height:40px!important;padding:3px 8px!important}
        body.ws-boss-compact-mode .level small,body.ws-boss-compact-mode .wallet small{font-size:.38rem!important}
        body.ws-boss-compact-mode .level b,body.ws-boss-compact-mode .wallet b{font-size:.62rem!important}
        body.ws-boss-compact-mode #pause.ws-pause-button{width:54px!important;min-width:54px!important;height:44px!important}
        body.ws-boss-compact-mode .ws-boss-info-chip{min-height:44px!important}
        body.ws-boss-compact-mode #game{flex:1 1 auto!important;min-height:0!important;overflow:hidden!important;display:block!important}
        body.ws-boss-compact-mode #game>.game{height:100%!important;min-height:0!important;grid-template-columns:minmax(0,1fr) 92px!important;grid-template-rows:minmax(0,1fr)!important;gap:4px!important;align-items:stretch!important;overflow:hidden!important}
        body.ws-boss-compact-mode #game>.game>.journey{display:none!important}
        body.ws-boss-compact-mode .card{height:100%!important;min-height:0!important;padding:9px 8px 8px!important;border-radius:22px!important;overflow:hidden!important}
        body.ws-boss-compact-mode .eyebrow{font-size:.42rem!important;line-height:1.1!important}
        body.ws-boss-compact-mode .bossHp{margin:4px 0 5px!important;padding:5px 8px!important;border-radius:12px!important;font-size:.58rem!important}
        body.ws-boss-compact-mode .prompt{margin:6px 0 7px!important}
        body.ws-boss-compact-mode .prompt h1{margin:0 0 4px!important;font-size:clamp(1.72rem,7.6vw,2.15rem)!important;line-height:.92!important}
        body.ws-boss-compact-mode .prompt p{max-width:28ch!important;font-size:.56rem!important;line-height:1.25!important}
        body.ws-boss-compact-mode .ws-boss-ability-badge,body.ws-boss-compact-mode .ws-boss-ability-badge-4-6,body.ws-boss-compact-mode .ws-boss-ability-badge-7-10{margin-bottom:4px!important;padding:3px 6px!important;font-size:.34rem!important}
        body.ws-boss-compact-mode .ws-roderick-timer{margin-bottom:5px!important;padding:4px 6px!important;border-radius:10px!important}
        body.ws-boss-compact-mode .ws-roderick-timer-head{margin-bottom:3px!important;font-size:.36rem!important}.ws-boss-compact-mode .ws-roderick-track{height:5px!important}
        body.ws-boss-compact-mode .ws-vargas-note{margin:-1px 0 4px!important;font-size:.34rem!important}
        body.ws-boss-compact-mode .ws-thorne-chain{margin-bottom:4px!important;padding:6px 7px!important}.ws-boss-compact-mode .ws-thorne-chain .ws-thorne-kicker{font-size:.30rem!important}.ws-boss-compact-mode .ws-thorne-chain strong{font-size:.60rem!important}.ws-boss-compact-mode .ws-thorne-chain.is-charged strong{font-size:.78rem!important}.ws-boss-compact-mode .ws-thorne-chain .ws-thorne-copy{font-size:.30rem!important}.ws-boss-compact-mode .ws-thorne-pips{margin-top:4px!important}
        body.ws-boss-compact-mode .ws-corvin-note,body.ws-boss-compact-mode .ws-azrak-note{margin:-1px 0 4px!important;font-size:.31rem!important}
        body.ws-boss-compact-mode .label{margin-bottom:5px!important;font-size:.43rem!important;line-height:1!important}
        body.ws-boss-compact-mode .slots+ .label{margin-top:8px!important}
        body.ws-boss-compact-mode .slots,body.ws-boss-compact-mode .tiles{gap:4px!important}
        body.ws-boss-compact-mode .slot{width:min(38px,calc((100% - 32px)/var(--n)))!important;height:34px!important;border-radius:9px!important;font-size:.88rem!important}
        body.ws-boss-compact-mode .tiles{margin:5px 0 7px!important}
        body.ws-boss-compact-mode .tile{min-width:31px!important;width:min(40px,calc((100% - 32px)/var(--n)))!important;height:44px!important;border-bottom-width:4px!important;border-radius:11px!important;font-size:1.02rem!important}
        body.ws-boss-compact-mode .actions{gap:5px!important;margin-top:7px!important}
        body.ws-boss-compact-mode .tool{min-height:44px!important;border-radius:13px!important;font-size:.55rem!important;line-height:1.15!important}
        body.ws-boss-compact-mode .check{min-height:48px!important;border-radius:14px!important;font-size:.82rem!important;box-shadow:0 4px 0 #75430e!important}
        body.ws-boss-compact-mode .bossSide{height:100%!important;min-height:0!important;padding:40px 0 10px!important;align-items:center!important;justify-content:flex-start!important;overflow:visible!important}
        body.ws-boss-compact-mode .bossSide::before{left:50%!important;bottom:72px!important;width:112px!important;height:158px!important}
        body.ws-boss-compact-mode .bossImg{width:120px!important;max-height:220px!important;margin:14px 0 0 -14px!important}
        body.ws-boss-compact-mode .bossPlate{top:3px!important;left:-12px!important;right:0!important;padding:4px 5px!important;border-radius:10px!important;font-size:.46rem!important;white-space:nowrap!important}
        body.ws-boss-compact-mode .bossSide .bubble{display:none!important}
        body.ws-boss-compact-mode .bossFeedback{top:36px!important;left:-18px!important;right:0!important;padding:5px 6px!important;font-size:.44rem!important;line-height:1.2!important}
        body.ws-boss-compact-mode .ws-boss-roadmap{bottom:max(3px,env(safe-area-inset-bottom))!important;padding:3px 4px 4px!important;border-radius:11px!important}
        body.ws-boss-compact-mode .ws-boss-roadmap-head{margin-bottom:2px!important;font-size:.36rem!important}.ws-boss-compact-mode .ws-boss-roadmap-head span:last-child{font-size:.28rem!important}
      }
      @media(max-width:500px) and (max-height:740px){
        body.ws-boss-compact-mode .app{padding-top:calc(3px + env(safe-area-inset-top))!important;padding-bottom:calc(61px + env(safe-area-inset-bottom))!important}
        body.ws-boss-compact-mode .hud{gap:3px!important;padding-bottom:3px!important}
        body.ws-boss-compact-mode .stat{min-height:32px!important;padding:3px 7px!important}.ws-boss-compact-mode .stat small{font-size:.38rem!important}.ws-boss-compact-mode .stat b{font-size:.72rem!important}
        body.ws-boss-compact-mode .hud2{min-height:40px!important;gap:3px!important}.ws-boss-compact-mode .level,.ws-boss-compact-mode .wallet{min-height:38px!important;padding:2px 7px!important}.ws-boss-compact-mode #pause.ws-pause-button{height:42px!important;width:50px!important;min-width:50px!important}
        body.ws-boss-compact-mode #game>.game{grid-template-columns:minmax(0,1fr) 84px!important;gap:3px!important}
        body.ws-boss-compact-mode .card{padding:7px 7px 6px!important;border-radius:20px!important}
        body.ws-boss-compact-mode .bossHp{margin:3px 0 4px!important;padding:4px 7px!important;font-size:.54rem!important}
        body.ws-boss-compact-mode .prompt{margin:4px 0 5px!important}.ws-boss-compact-mode .prompt h1{font-size:1.62rem!important}.ws-boss-compact-mode .prompt p{font-size:.51rem!important;line-height:1.2!important}
        body.ws-boss-compact-mode .slot{height:31px!important;font-size:.82rem!important}.ws-boss-compact-mode .tile{height:40px!important;font-size:.96rem!important}.ws-boss-compact-mode .tiles{margin:4px 0 5px!important}
        body.ws-boss-compact-mode .actions{margin-top:5px!important;gap:4px!important}.ws-boss-compact-mode .tool{min-height:42px!important;font-size:.51rem!important}.ws-boss-compact-mode .check{min-height:45px!important;font-size:.76rem!important}
        body.ws-boss-compact-mode .bossSide{padding-top:36px!important}.ws-boss-compact-mode .bossImg{width:108px!important;max-height:202px!important;margin-left:-10px!important}.ws-boss-compact-mode .bossPlate{left:-10px!important;font-size:.42rem!important}
        body.ws-boss-compact-mode .ws-boss-card{height:40px!important}.ws-boss-compact-mode .ws-boss-card img{height:30px!important}.ws-boss-compact-mode .ws-boss-roadmap-head{font-size:.32rem!important}
      }
      @media(max-width:355px){body.ws-boss-compact-mode #game>.game{grid-template-columns:minmax(0,1fr) 78px!important}.ws-boss-compact-mode .bossImg{width:102px!important;margin-left:-8px!important}.ws-boss-compact-mode .tile{min-width:29px!important;width:min(37px,calc((100% - 28px)/var(--n)))!important}.ws-boss-compact-mode .slot{width:min(35px,calc((100% - 28px)/var(--n)))!important}}
      @media(prefers-reduced-motion:reduce){.ws-boss-intro-card,.ws-boss-intro-start{scroll-behavior:auto!important;transition:none!important}}
    `;
    doc.head.appendChild(style);
  }

  function ensureRoadmap(doc){
    let roadmap=doc.querySelector('.ws-boss-roadmap');
    if(roadmap)return roadmap;
    roadmap=doc.createElement('section');
    roadmap.className='ws-boss-roadmap';
    roadmap.setAttribute('aria-label','Boss-Kampagne');
    roadmap.innerHTML='<div class="ws-boss-roadmap-head"><span>☠ BOSS-KAMPAGNE</span><span></span></div><div class="ws-boss-roadmap-track"></div>';
    doc.body.appendChild(roadmap);
    return roadmap;
  }

  function ensureInfoChip(doc){
    let chip=doc.querySelector('.ws-boss-info-chip');
    if(chip)return chip;
    const hud=doc.querySelector('.hud2');
    const levelButton=doc.getElementById('level');
    if(!hud||!levelButton)return null;
    chip=doc.createElement('button');
    chip.type='button';
    chip.className='ws-boss-info-chip';
    chip.innerHTML='<span>i</span>BOSS-INFO';
    chip.setAttribute('aria-label','Boss-Info öffnen');
    chip.addEventListener('click',()=>{
      const win=frame.contentWindow;
      const level=currentLevel(win,doc);
      showBossIntro(doc,level,false);
    });
    hud.insertBefore(chip,levelButton);
    return chip;
  }

  function showBossIntro(doc,level,isEncounterStart){
    doc.querySelector('.ws-boss-intro')?.remove();
    const boss=bosses[level-1];
    if(!boss)return;
    const overlay=doc.createElement('div');
    overlay.className='ws-boss-intro';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label',`${boss.name} Boss-Info`);
    overlay.innerHTML=`<section class="ws-boss-intro-card"><div class="ws-boss-intro-kicker">${isEncounterStart?'☠ BOSS ERSCHEINT':'☠ BOSS-INFO'}</div><div class="ws-boss-intro-portrait"><img src="${boss.sprite}" alt="${boss.name}"></div><p class="ws-boss-intro-level">LEVEL ${level}</p><h2>${boss.name}</h2><div class="ws-boss-ability"><small>BESONDERE FÄHIGKEIT</small><b>${boss.ability}</b><p>${boss.description}</p></div><button class="ws-boss-intro-start" type="button">${isEncounterStart?'BOSSKAMPF STARTEN':'ZURÜCK'}</button></section>`;
    const close=()=>{
      overlay.remove();
      const chip=ensureInfoChip(doc);
      if(chip&&bossEncounterActive(frame.contentWindow,doc))chip.classList.add('show');
    };
    overlay.querySelector('.ws-boss-intro-start')?.addEventListener('click',close,{once:true});
    doc.body.appendChild(overlay);
    overlay.querySelector('.ws-boss-intro-start')?.focus();
  }

  function syncBossIntro(win,doc,level,active){
    const chip=ensureInfoChip(doc);
    if(active&&!wasEncounterActive){
      introShownForEncounter=false;
      if(chip)chip.classList.remove('show');
    }
    if(active&&!introShownForEncounter){
      introShownForEncounter=true;
      showBossIntro(doc,level,true);
    }
    if(!active&&wasEncounterActive){
      introShownForEncounter=false;
      doc.querySelector('.ws-boss-intro')?.remove();
      if(chip)chip.classList.remove('show');
    }
    wasEncounterActive=active;
  }

  function centerCurrent(win,track){
    const current=track.querySelector('.ws-boss-card.current');
    if(!current)return;
    win.requestAnimationFrame(()=>{
      const target=current.offsetLeft+(current.offsetWidth/2)-(track.clientWidth/2);
      const max=Math.max(0,track.scrollWidth-track.clientWidth);
      track.scrollLeft=Math.max(0,Math.min(max,target));
    });
  }

  function render(){
    try{
      const win=frame.contentWindow;
      const doc=frame.contentDocument;
      if(!win||!doc||!doc.body||!doc.head)return;
      ensureStyles(doc);
      const level=currentLevel(win,doc);
      const active=bossEncounterActive(win,doc);
      doc.documentElement.classList.toggle('ws-boss-compact-mode',active);
      doc.body.classList.toggle('ws-boss-compact-mode',active);
      syncBossIntro(win,doc,level,active);
      const roadmap=ensureRoadmap(doc);
      const key=level+':'+active;
      if(key===lastKey)return;
      lastKey=key;
      const status=roadmap.querySelector('.ws-boss-roadmap-head span:last-child');
      if(status)status.textContent=(active?'AKTUELL · ':'NÄCHSTER · ')+bosses[level-1].name;
      const track=roadmap.querySelector('.ws-boss-roadmap-track');
      if(!track)return;
      track.innerHTML='';
      bosses.forEach((boss,idx)=>{
        const isCurrent=idx===level-1;
        const card=doc.createElement('button');
        card.type='button';
        card.className='ws-boss-card'+(isCurrent?' current':'');
        card.dataset.level=String(idx+1);
        card.setAttribute('aria-label',`Level ${idx+1} · ${boss.name} · Boss-Info öffnen`);
        card.innerHTML=`<img src="${boss.sprite}" alt=""><div class="ws-boss-card-copy"><b>LEVEL ${idx+1}</b><small>${boss.name}</small></div>${isCurrent?`<em>${active?'AKTUELL':'NÄCHSTER'}</em>`:''}`;
        card.addEventListener('click',()=>showBossIntro(doc,idx+1,false));
        track.appendChild(card);
      });
      centerCurrent(win,track);
    }catch(err){console.warn('Word Scramble boss roadmap patch skipped',err)}
  }

  function start(){
    window.clearInterval(timer);
    lastKey='';
    wasEncounterActive=false;
    introShownForEncounter=false;
    render();
    timer=window.setInterval(render,300);
  }

  frame.addEventListener('load',start);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')start();
})();
