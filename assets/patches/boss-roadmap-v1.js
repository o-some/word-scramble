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
      .bossSide{overflow:visible!important}
      .bossImg{width:184px!important;max-height:350px!important;margin-left:-34px!important;filter:drop-shadow(0 22px 19px rgba(0,0,0,.68)) drop-shadow(0 0 18px rgba(255,216,111,.34))!important}
      .bossPlate{position:relative!important;z-index:6!important;padding:5px 10px!important;border:1px solid rgba(255,216,111,.62)!important;border-radius:999px!important;background:linear-gradient(180deg,rgba(4,48,76,.96),rgba(1,27,47,.96))!important;color:#ffe18a!important;box-shadow:inset 0 1px rgba(255,255,255,.10),0 6px 18px rgba(0,0,0,.26)!important;text-shadow:0 2px 5px rgba(0,0,0,.55)!important}
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
      @media(max-width:430px){
        .bossImg{width:160px!important;max-height:315px!important;margin-left:-28px!important}
        .ws-boss-roadmap{width:calc(100vw - 10px);padding:4px 5px 5px;border-radius:12px}
        .ws-boss-roadmap-head{font-size:.40rem;margin-bottom:3px}.ws-boss-roadmap-head span:last-child{font-size:.31rem}
        .ws-boss-roadmap-track{gap:3px}.ws-boss-card{grid-template-columns:29px minmax(0,1fr);height:38px;padding:2px 3px 2px 2px;border-radius:8px}.ws-boss-card img{width:29px;height:32px}.ws-boss-card-copy b{font-size:.25rem}.ws-boss-card-copy small{font-size:.24rem}.ws-boss-card em{font-size:.17rem}
      }
      @media(max-width:355px){.ws-boss-card{grid-template-columns:27px minmax(0,1fr)}.ws-boss-card img{width:27px;height:30px}.ws-boss-card-copy small{font-size:.22rem}}
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
