(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  const bosses=[
    ['Pirat Kai','https://o-some.github.io/word-scramble/assets/bosses/level-01-pirat-kai.webp?v=dbx-master-20260821'],
    ['Kapitän Brax','https://o-some.github.io/word-scramble/assets/bosses/level-02-kapitaen-brax.webp?v=dbx-master-20260821'],
    ['Blackfinn','https://o-some.github.io/word-scramble/assets/bosses/level-03-blackfinn.webp?v=dbx-master-20260821'],
    ['Alt-Kapitän Roderick','https://o-some.github.io/word-scramble/assets/bosses/level-04-alt-kapitaen-roderick.webp?v=dbx-master-20260821'],
    ['Piratenbaron Vargas','https://o-some.github.io/word-scramble/assets/bosses/level-05-piratenbaron-vargas.webp?v=dbx-master-20260821'],
    ['Kapitän Ironhook','https://o-some.github.io/word-scramble/assets/bosses/level-06-kapitaen-ironhook.webp?v=dbx-master-20260821'],
    ['Admiral Thorne','https://o-some.github.io/word-scramble/assets/bosses/level-07-admiral-thorne.webp?v=dbx-master-20260821'],
    ['Kartenmeister Corvin','https://o-some.github.io/word-scramble/assets/bosses/level-08-kartenmeister-corvin.webp?v=dbx-master-20260821'],
    ['Schattenfürst Azrak','https://o-some.github.io/word-scramble/assets/bosses/level-09-schattenfuerst-azrak.webp?v=dbx-master-20260821'],
    ['Piratenkönig Varkos','https://o-some.github.io/word-scramble/assets/bosses/level-10-piratenkoenig-varkos.webp?v=dbx-master-20260821']
  ];

  let timer=0;
  let lastKey='';

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
      /* Boss layout: give the character real stage space instead of squeezing it into the original 88px rail. */
      .game:has(.bossSide){grid-template-columns:minmax(0,1fr) 154px!important;gap:6px!important}
      .bossSide{overflow:visible!important;z-index:7!important;min-width:0!important;padding:58px 0 50px!important;isolation:isolate!important}
      .bossSide::before{left:43%!important;bottom:74px!important;width:172px!important;height:220px!important}
      .bossImg{width:222px!important;max-width:none!important;max-height:390px!important;margin-left:-54px!important;margin-right:-14px!important;position:relative!important;z-index:5!important;object-fit:contain!important;object-position:center bottom!important;filter:drop-shadow(0 24px 20px rgba(0,0,0,.72)) drop-shadow(0 0 22px rgba(255,216,111,.38))!important}

      /* Restore the original absolute badge behavior and anchor it high above the boss. */
      .bossPlate{position:absolute!important;z-index:8!important;top:7px!important;left:-22px!important;right:-6px!important;margin:0!important;padding:6px 9px!important;border:1px solid rgba(255,216,111,.78)!important;border-radius:13px!important;background:linear-gradient(180deg,rgba(4,48,76,.98),rgba(1,27,47,.98))!important;color:#ffe18a!important;text-align:center!important;font:900 .64rem/1.12 Georgia,serif!important;box-shadow:inset 0 1px rgba(255,255,255,.12),0 7px 20px rgba(0,0,0,.32),0 0 14px rgba(255,216,111,.12)!important;text-shadow:0 2px 5px rgba(0,0,0,.58)!important}

      /* Make pause unmistakable as an action, not just a decorative icon. */
      #pause.ws-pause-button{width:72px!important;min-width:72px!important;height:48px!important;border-radius:15px!important;border-color:rgba(255,216,111,.92)!important;background:linear-gradient(160deg,rgba(7,67,98,.99),rgba(1,29,49,.99))!important;box-shadow:inset 0 1px rgba(255,255,255,.13),0 8px 19px rgba(0,10,23,.40),0 0 0 1px rgba(255,216,111,.08)!important}
      #pause.ws-pause-button::before{top:7px!important;width:20px!important;height:18px!important;background:linear-gradient(90deg,#ffe18a 0 6px,transparent 6px 14px,#ffe18a 14px 20px)!important}
      #pause.ws-pause-button::after{content:'PAUSE'!important;bottom:5px!important;color:#fff0bd!important;font-size:.48rem!important;font-weight:1000!important;letter-spacing:.10em!important;text-shadow:0 2px 4px rgba(0,0,0,.45)!important}

      .ws-boss-roadmap{position:fixed;z-index:60;left:50%;bottom:max(6px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(500px,calc(100vw - 14px));box-sizing:border-box;padding:5px 6px 6px;border:1px solid rgba(239,199,102,.64);border-radius:15px;background:linear-gradient(155deg,rgba(3,49,76,.95),rgba(1,25,44,.96));box-shadow:inset 0 1px rgba(255,255,255,.08),0 10px 25px rgba(0,8,20,.40);pointer-events:none;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
      .ws-boss-roadmap-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 2px 4px;color:#ffe18a;font-size:.48rem;font-weight:950;letter-spacing:.08em}
      .ws-boss-roadmap-head span:last-child{color:#a9d7d8;font-size:.38rem;letter-spacing:.02em;white-space:nowrap}
      .ws-boss-roadmap-track{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px}
      .ws-boss-card{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:3px;min-width:0;height:43px;padding:3px 5px 3px 3px;box-sizing:border-box;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:linear-gradient(160deg,rgba(255,255,255,.07),rgba(255,255,255,.025));overflow:hidden}
      .ws-boss-card.current{border-color:rgba(255,216,111,.80);background:linear-gradient(160deg,rgba(239,199,102,.18),rgba(31,142,153,.12));box-shadow:inset 0 0 0 1px rgba(255,216,111,.08),0 0 12px rgba(255,216,111,.09)}
      .ws-boss-card img{width:34px;height:36px;object-fit:contain;filter:drop-shadow(0 4px 4px rgba(0,0,0,.55))}
      .ws-boss-card-copy{min-width:0;text-align:left}
      .ws-boss-card-copy b{display:block;color:#ffe18a;font-size:.30rem;line-height:1;margin-bottom:2px}
      .ws-boss-card-copy small{display:block;color:#dcefee;font-size:.29rem;font-weight:900;line-height:1.08;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .ws-boss-card em{position:absolute;top:2px;right:2px;padding:2px 3px;border-radius:999px;background:#a84f2e;color:#fff6d8;font-size:.20rem;font-style:normal;font-weight:950;line-height:1}

      @media(max-width:500px){
        .game:has(.bossSide){grid-template-columns:minmax(0,1fr) 104px!important;gap:4px!important}
        .bossSide{padding:50px 0 46px!important}
        .bossImg{width:182px!important;max-height:330px!important;margin-left:-68px!important;margin-right:-10px!important}
        .bossPlate{top:4px!important;left:-34px!important;right:-4px!important;padding:5px 7px!important;font-size:.54rem!important}
        #pause.ws-pause-button{width:64px!important;min-width:64px!important;height:46px!important}
        #pause.ws-pause-button::after{font-size:.43rem!important}
      }

      @media(max-width:430px){
        .bossImg{width:168px!important;max-height:315px!important;margin-left:-64px!important;margin-right:-8px!important}
        .ws-boss-roadmap{width:calc(100vw - 10px);padding:4px 5px 5px;border-radius:12px}
        .ws-boss-roadmap-head{font-size:.40rem;margin-bottom:3px}.ws-boss-roadmap-head span:last-child{font-size:.31rem}
        .ws-boss-roadmap-track{gap:3px}.ws-boss-card{grid-template-columns:29px minmax(0,1fr);height:38px;padding:2px 3px 2px 2px;border-radius:8px}.ws-boss-card img{width:29px;height:32px}.ws-boss-card-copy b{font-size:.25rem}.ws-boss-card-copy small{font-size:.24rem}.ws-boss-card em{font-size:.17rem}
      }
      @media(max-width:355px){
        .game:has(.bossSide){grid-template-columns:minmax(0,1fr) 92px!important}
        .bossImg{width:154px!important;margin-left:-59px!important}
        .bossPlate{left:-30px!important;font-size:.50rem!important}
        #pause.ws-pause-button{width:60px!important;min-width:60px!important}
        .ws-boss-card{grid-template-columns:27px minmax(0,1fr)}.ws-boss-card img{width:27px;height:30px}.ws-boss-card-copy small{font-size:.22rem}
      }
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

  function render(){
    try{
      const win=frame.contentWindow;
      const doc=frame.contentDocument;
      if(!win||!doc||!doc.body||!doc.head)return;
      ensureStyles(doc);
      const level=currentLevel(win,doc);
      const active=bossIsVisible(win,doc);
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
        const [name,src]=bosses[idx];
        const card=doc.createElement('div');
        card.className='ws-boss-card'+(offset===0?' current':'');
        card.innerHTML=`<img src="${src}" alt=""><div class="ws-boss-card-copy"><b>LEVEL ${idx+1}</b><small>${name}</small></div>${offset===0?`<em>${active?'AKTUELL':'NÄCHSTER'}</em>`:''}`;
        track.appendChild(card);
      }
    }catch(err){console.warn('Word Scramble boss roadmap patch skipped',err)}
  }

  function start(){
    window.clearInterval(timer);
    lastKey='';
    render();
    timer=window.setInterval(render,300);
  }

  frame.addEventListener('load',start);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')start();
})();
