(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  const bosses=[
    ['Pirat Kai','./assets/bosses/level-01-pirat-kai.webp'],
    ['Kapitän Brax','./assets/bosses/level-02-kapitaen-brax.webp'],
    ['Blackfinn','./assets/bosses/level-03-blackfinn.webp'],
    ['Alt-Kapitän Roderick','./assets/bosses/level-04-alt-kapitaen-roderick.webp'],
    ['Piratenbaron Vargas','./assets/bosses/level-05-piratenbaron-vargas.webp'],
    ['Kapitän Ironhook','./assets/bosses/level-06-kapitaen-ironhook.webp'],
    ['Admiral Thorne','./assets/bosses/level-07-admiral-thorne.webp'],
    ['Kartenmeister Corvin','./assets/bosses/level-08-kartenmeister-corvin.webp'],
    ['Schattenfürst Azrak','./assets/bosses/level-09-schattenfuerst-azrak.webp'],
    ['Piratenkönig Varkos','./assets/bosses/level-10-piratenkoenig-varkos.webp']
  ];

  function install(doc){
    if(!doc?.documentElement||doc.getElementById('ws-boss-progression-core-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-progression-core-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_PROGRESSION_CORE__)return;
      window.__WS_BOSS_PROGRESSION_CORE__='20260822-v1';
      const bosses=${JSON.stringify(bosses)};
      const baseRender=render;
      let wasBoss=Boolean(s&&s.boss);
      let pendingVictory=false;
      const level=()=>{try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)))}catch{return 1}};
      const saveLevel=value=>{try{sessionStorage.setItem('wordScrambleBossLevel',String(value))}catch{}};
      const advance=()=>{const next=level()>=10?1:level()+1;saveLevel(next);document.dispatchEvent(new CustomEvent('ws-boss-level-advanced',{detail:{level:next}}));};
      const decorate=()=>{
        if(!s.boss)return;
        const lvl=level(),meta=bosses[lvl-1]||bosses[0];
        const plate=document.querySelector('.bossPlate');
        const img=document.querySelector('.bossImg');
        if(plate)plate.textContent='LEVEL '+lvl+' · '+String(meta[0]).toUpperCase();
        if(img){
          const src=new URL(meta[1],window.parent.location.href).href+'?v=20260822-progression-core';
          if(img.dataset.wsBossLevel!==String(lvl)){img.dataset.wsBossLevel=String(lvl);img.src=src;img.alt=meta[0];}
        }
      };
      render=function(){
        const now=Boolean(s&&s.boss);
        if(now&&Number(s.bossHp)<=0)pendingVictory=true;
        if(!now&&wasBoss&&pendingVictory){advance();pendingVictory=false;}
        baseRender();
        decorate();
        wasBoss=now;
      };
      render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  const start=()=>{try{install(frame.contentDocument)}catch(err){console.warn('Word Scramble boss progression core skipped',err)}};
  frame.addEventListener('load',start);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')start();
})();
