(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  const bosses=[
    {name:'Pirat Kai',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-01-pirat-kai.webp?v=dbx-master-20260821',ability:'Deckschrubber-Trick',description:'Kai bringt zusätzliche Unordnung in die Buchstaben und macht das Sortieren schwerer.'},
    {name:'Kapitän Brax',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-02-kapitaen-brax.webp?v=dbx-master-20260821',ability:'Verdeckter Buchstabe',description:'Brax kann einen Buchstaben zeitweise verbergen. Die Lösung bleibt trotzdem vollständig möglich.'},
    {name:'Blackfinn',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-03-blackfinn.webp?v=dbx-master-20260821',ability:'Köderbuchstabe',description:'Blackfinn schmuggelt einen falschen Buchstaben unter die echten. Finde den Köder.'},
    {name:'Alt-Kapitän Roderick',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-04-alt-kapitaen-roderick.webp?v=dbx-master-20260821',ability:'Zeitdruck',description:'Roderick setzt dich bei Boss-Wörtern unter fairen Zeitdruck.'},
    {name:'Piratenbaron Vargas',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-05-piratenbaron-vargas.webp?v=dbx-master-20260821',ability:'Versiegelter Slot',description:'Vargas kann einen Zielplatz kurz versiegeln, bevor du ihn vollständig nutzen kannst.'},
    {name:'Kapitän Ironhook',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-06-kapitaen-ironhook.webp?v=dbx-master-20260821',ability:'Enterhaken',description:'Ironhook kann einen bereits gesetzten Buchstaben zurück in deinen Buchstaben-Pool ziehen.'},
    {name:'Admiral Thorne',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-07-admiral-thorne.webp?v=dbx-master-20260821',ability:'Doppelschlag',description:'Thorne verlangt zwei korrekt gelöste Boss-Wörter in Folge für einen vollen Treffer.'},
    {name:'Kartenmeister Corvin',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-08-kartenmeister-corvin.webp?v=dbx-master-20260821',ability:'Falsche Fährte',description:'Corvin arbeitet mit irreführenden visuellen Hinweisen. Verlass dich auf die Buchstaben.'},
    {name:'Schattenfürst Azrak',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-09-schattenfuerst-azrak.webp?v=dbx-master-20260821',ability:'Schattenfluch',description:'Azrak kann Buchstaben oder Slots kurz in Schatten hüllen, ohne das Wort unlösbar zu machen.'},
    {name:'Piratenkönig Varkos',sprite:'https://o-some.github.io/word-scramble/assets/bosses/level-10-piratenkoenig-varkos.webp?v=dbx-master-20260821',ability:'Königsprüfung',description:'Varkos kombiniert kontrolliert bekannte Boss-Tricks. Nie mehr als zwei gleichzeitig.'}
  ];
  window.WS_BOSS_META=bosses;

  let timer=0;
  let lastKey='';
  let wasActive=false;
  let introShownForEncounter=false;

  function currentLevel(win,doc){
    const plate=doc.querySelector('.bossPlate');
    const match=plate?.textContent?.match(/LEVEL\s+(\d+)/i);
    if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
    try{return Math.max(1,Math.min(10,Number(win.sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
  }

  function bossIsVisible(win,doc){
    const img=doc.querySelector('.bossImg');
    if(!img)return false;
    const style=win.getComputedStyle(img);
    return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>0&&img.getClientRects().length>0;
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
      .ws-boss-roadmap{position:fixed;z-index:60;left:50%;bottom:max(6px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(500px,calc(100vw - 14px));box-sizing:border-box;padding:5px 6px 6px;border:1px solid rgba(239,199,102,.64);border-radius:15px;background:linear-gradient(155deg,rgba(3,49,76,.95),rgba(1,25,44,.96));box-shadow:inset 0 1px rgba(255,255,255,.08),0 10px 25px rgba(0,8,20,.40);pointer-events:none;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
      .ws-boss-roadmap-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 2px 4px;color:#ffe18a;font-size:.48rem;font-weight:950;letter-spacing:.08em}.ws-boss-roadmap-head span:last-child{color:#a9d7d8;font-size:.38rem;letter-spacing:.02em;white-space:nowrap}.ws-boss-roadmap-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}.ws-boss-card{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:3px;min-width:0;height:43px;padding:3px 5px 3px 3px;box-sizing:border-box;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.025));overflow:hidden}.ws-boss-card.current{border-color:rgba(255,216,111,.80);background:linear-gradient(160deg,rgba(239,199,102,.18),rgba(31,142,153,.12));box-shadow:inset 0 0 0 1px rgba(255,216,111,.08),0 0 12px rgba(255,216,111,.09)}.ws-boss-card img{width:34px;height:36px;object-fit:contain;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55))}.ws-boss-card-copy{min-width:0;text-align:left}.ws-boss-card-copy b{display:block;color:#ffe18a;font-size:.30rem;line-height:1;margin-bottom:2px}.ws-boss-card-copy small{display:block;color:#dcefee;font-size:.29rem;font-weight:900;line-height:1.08;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ws-boss-card em{position:absolute;top:2px;right:2px;padding:2px 3px;border-radius:999px;background:#a84f2e;color:#fff6d8;font-size:.20rem;font-style:normal;font-weight:950;line-height:1}
      @media(max-width:500px){.game:has(.bossSide){grid-template-columns:minmax(0,1fr) 104px!important;gap:4px!important}.bossSide{padding:50px 0 46px!important}.bossImg{width:182px!important;max-height:330px!important;margin-left:-68px!important;margin-right:-10px!important}.bossPlate{top:4px!important;left:-34px!important;right:-4px!important;padding:5px 7px!important;font-size:.54rem!important}#pause.ws-pause-button{width:64px!important;min-width:64px!important;height:46px!important}#pause.ws-pause-button::after{font-size:.43rem!important}.ws-boss-info-chip{min-height:38px;padding:4px 6px;font-size:.40rem}.ws-boss-intro-card{padding:15px 14px 14px;border-radius:23px}.ws-boss-intro-portrait{height:164px}.ws-boss-intro-portrait img{max-width:178px;max-height:178px}.ws-boss-intro h2{font-size:1.36rem}}
      @media(max-width:430px){.bossImg{width:168px!important;max-height:315px!important;margin-left:-64px!important;margin-right:-8px!important}.ws-boss-roadmap{width:calc(100vw - 10px);padding:4px 5px 5px;border-radius:12px}.ws-boss-roadmap-head{font-size:.40rem;margin-bottom:3px}.ws-boss-roadmap-head span:last-child{font-size:.31rem}.ws-boss-roadmap-track{gap:3px}.ws-boss-card{grid-template-columns:29px minmax(0,1fr);height:38px;padding:2px 3px 2px 2px;border-radius:8px}.ws-boss-card img{width:29px;height:32px}.ws-boss-card-copy b{font-size:.25rem}.ws-boss-card-copy small{font-size:.24rem}.ws-boss-card em{font-size:.17rem}.ws-boss-info-chip{font-size:0;width:40px;min-width:40px;padding:4px;justify-content:center}.ws-boss-info-chip span{width:22px;height:22px;font-size:.75rem}.ws-boss-ability{margin-top:10px}}
      @media(max-width:355px){.game:has(.bossSide){grid-template-columns:minmax(0,1fr) 92px!important}.bossImg{width:154px!important;margin-left:-59px!important}.bossPlate{left:-30px!important;font-size:.50rem!important}#pause.ws-pause-button{width:60px!important;min-width:60px!important}.ws-boss-card{grid-template-columns:27px minmax(0,1fr)}.ws-boss-card img{width:27px;height:30px}.ws-boss-card-copy small{font-size:.22rem}}
      @media(prefers-reduced-motion:reduce){.ws-boss-intro-card,.ws-boss-intro-start{scroll-behavior:auto!important;transition:none!important}}
    `;
    doc.head.appendChild(style);
  }

  function ensureRoadmap(doc){
    let roadmap=doc.querySelector('.ws-boss-roadmap');
    if(roadmap)return roadmap;
    roadmap=doc.createElement('section');
    roadmap.className='ws-boss-roadmap';
    roadmap.setAttribute('aria-label','Nächste Bosse');
    roadmap.innerHTML='<div class="ws-boss-roadmap-head"><span>☠ NÄCHSTE BOSSE</span><span></span></div><div class="ws-boss-roadmap-track"></div>';
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
    overlay.innerHTML=`<section class="ws-boss-intro-card"><div class="ws-boss-intro-kicker">☠ BOSS ERSCHEINT</div><div class="ws-boss-intro-portrait"><img src="${boss.sprite}" alt="${boss.name}"></div><p class="ws-boss-intro-level">LEVEL ${level}</p><h2>${boss.name}</h2><div class="ws-boss-ability"><small>BESONDERE FÄHIGKEIT</small><b>${boss.ability}</b><p>${boss.description}</p></div><button class="ws-boss-intro-start" type="button">${isEncounterStart?'BOSSKAMPF STARTEN':'ZURÜCK ZUM KAMPF'}</button></section>`;
    const close=()=>{
      overlay.remove();
      const chip=ensureInfoChip(doc);
      if(chip&&bossIsVisible(frame.contentWindow,doc))chip.classList.add('show');
    };
    overlay.querySelector('.ws-boss-intro-start')?.addEventListener('click',close,{once:true});
    doc.body.appendChild(overlay);
    overlay.querySelector('.ws-boss-intro-start')?.focus();
  }

  function syncBossIntro(win,doc,level,active){
    const chip=ensureInfoChip(doc);
    if(active&&!wasActive){
      introShownForEncounter=false;
      if(chip)chip.classList.remove('show');
    }
    if(active&&!introShownForEncounter){
      introShownForEncounter=true;
      showBossIntro(doc,level,true);
    }
    if(!active){
      introShownForEncounter=false;
      doc.querySelector('.ws-boss-intro')?.remove();
      if(chip)chip.classList.remove('show');
    }
    wasActive=active;
  }

  function render(){
    try{
      const win=frame.contentWindow;
      const doc=frame.contentDocument;
      if(!win||!doc||!doc.body||!doc.head)return;
      ensureStyles(doc);
      const level=currentLevel(win,doc);
      const active=bossIsVisible(win,doc);
      syncBossIntro(win,doc,level,active);
      const roadmap=ensureRoadmap(doc);
      const key=level+':'+active;
      if(key===lastKey)return;
      lastKey=key;
      const status=roadmap.querySelector('.ws-boss-roadmap-head span:last-child');
      if(status)status.textContent=active?'BOSSKAMPF LÄUFT':'ALS NÄCHSTES';
      const track=roadmap.querySelector('.ws-boss-roadmap-track');
      if(!track)return;
      track.innerHTML='';
      for(let offset=0;offset<4;offset++){
        const idx=(level-1+offset)%bosses.length;
        const boss=bosses[idx];
        const card=doc.createElement('div');
        card.className='ws-boss-card'+(offset===0?' current':'');
        card.innerHTML=`<img src="${boss.sprite}" alt=""><div class="ws-boss-card-copy"><b>LEVEL ${idx+1}</b><small>${boss.name}</small></div>${offset===0?`<em>${active?'AKTUELL':'NÄCHSTER'}</em>`:''}`;
        track.appendChild(card);
      }
    }catch(err){console.warn('Word Scramble boss roadmap patch skipped',err)}
  }

  function start(){
    window.clearInterval(timer);
    lastKey='';
    wasActive=false;
    introShownForEncounter=false;
    render();
    timer=window.setInterval(render,300);
  }

  frame.addEventListener('load',start);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')start();
})();
