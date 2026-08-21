(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  const abilityNames={1:'Deckschrubber-Trick',2:'Verdeckter Buchstabe',3:'Köderbuchstabe'};
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let timer=0;
  let lastWordKey='';
  let revealTimer=0;

  function level(win,doc){
    const match=doc.querySelector('.bossPlate')?.textContent?.match(/LEVEL\s+(\d+)/i);
    if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
    try{return Math.max(1,Math.min(10,Number(win.sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
  }

  function bossActive(win,doc){
    const img=doc.querySelector('.bossImg');
    if(!img)return false;
    const style=win.getComputedStyle(img);
    return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>0&&img.getClientRects().length>0;
  }

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-abilities-1-3-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-abilities-1-3-style';
    style.textContent=`
      .ws-boss-ability-badge{display:inline-flex;align-items:center;gap:5px;margin:0 auto 8px;padding:4px 8px;border:1px solid rgba(239,199,102,.55);border-radius:999px;background:rgba(1,32,53,.82);color:#ffe18a;font-size:.44rem;font-weight:950;letter-spacing:.06em;box-shadow:inset 0 1px rgba(255,255,255,.08)}
      .ws-boss-ability-badge::before{content:'☠';font-size:.56rem}
      .tiles .tile.ws-kai-shuffled{animation:wsKaiShuffle .34s cubic-bezier(.2,.84,.24,1)}
      @keyframes wsKaiShuffle{0%{transform:translateX(0) rotate(0)}35%{transform:translateX(var(--ws-shift,5px)) rotate(var(--ws-rot,2deg))}70%{transform:translateX(calc(var(--ws-shift,5px) * -.45)) rotate(calc(var(--ws-rot,2deg) * -.6))}100%{transform:translateX(0) rotate(0)}}
      .tiles .tile.ws-brax-hidden{position:relative;color:transparent!important;text-shadow:none!important}
      .tiles .tile.ws-brax-hidden::after{content:'?';position:absolute;inset:0;display:grid;place-items:center;color:#fff0bd;font:1000 1.15rem Georgia,serif;text-shadow:0 2px 5px rgba(0,0,0,.45)}
      .tiles .tile.ws-brax-reveal{animation:wsBraxReveal .34s ease-out}
      @keyframes wsBraxReveal{0%{filter:brightness(1.8);transform:scale(1.08)}100%{filter:none;transform:scale(1)}}
      .tiles .tile.ws-decoy{position:relative;border-color:#ef8e8e!important;background:linear-gradient(#ffd4aa,#d99053 58%,#9a4e2b)!important;color:#4a1f18!important;box-shadow:inset 0 2px rgba(255,255,255,.4),0 5px 0 #66301e!important}
      .tiles .tile.ws-decoy::before{content:'?';position:absolute;top:-5px;right:-5px;width:15px;height:15px;display:grid;place-items:center;border-radius:50%;background:#5a2430;color:#ffe8c4;font-size:.48rem;font-weight:1000;border:1px solid #ef8e8e}
      .tiles .tile.ws-decoy.ws-decoy-hit{animation:wsDecoyHit .42s ease-out}
      @keyframes wsDecoyHit{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px) rotate(-3deg)}50%{transform:translateX(5px) rotate(3deg)}75%{transform:translateX(-3px) rotate(-2deg)}}
      .ws-decoy-note{position:absolute;z-index:15;left:50%;top:52%;transform:translate(-50%,-50%);padding:7px 10px;border:1px solid #ef8e8e;border-radius:999px;background:rgba(83,30,39,.96);color:#fff0bd;font-size:.55rem;font-weight:1000;letter-spacing:.08em;pointer-events:none;box-shadow:0 8px 20px rgba(0,0,0,.35)}
      @media(max-width:430px){.ws-boss-ability-badge{font-size:.38rem;padding:3px 7px;margin-bottom:6px}.tiles .tile.ws-decoy::before{width:13px;height:13px;font-size:.42rem}}
      @media(prefers-reduced-motion:reduce){.tiles .tile.ws-kai-shuffled,.tiles .tile.ws-brax-reveal,.tiles .tile.ws-decoy.ws-decoy-hit{animation-duration:.08s!important}}
    `;
    doc.head.appendChild(style);
  }

  function cleanup(doc){
    window.clearTimeout(revealTimer);
    revealTimer=0;
    doc.querySelectorAll('.ws-boss-ability-badge,.ws-decoy-note').forEach(el=>el.remove());
    doc.querySelectorAll('.tile.ws-decoy').forEach(el=>el.remove());
    doc.querySelectorAll('.tile.ws-brax-hidden').forEach(el=>el.classList.remove('ws-brax-hidden'));
    doc.querySelectorAll('.tile.ws-kai-shuffled').forEach(el=>el.classList.remove('ws-kai-shuffled'));
    lastWordKey='';
  }

  function badge(doc,lvl){
    const card=doc.querySelector('.card');
    if(!card)return;
    let el=card.querySelector('.ws-boss-ability-badge');
    if(!el){
      el=doc.createElement('div');
      el.className='ws-boss-ability-badge';
      const label=card.querySelector('.label');
      if(label)label.insertAdjacentElement('beforebegin',el);else card.prepend(el);
    }
    el.textContent=abilityNames[lvl]||'';
  }

  function wordKey(doc,lvl){
    const prompt=doc.querySelector('.prompt h1')?.textContent?.trim()||'';
    const tiles=Array.from(doc.querySelectorAll('.tiles .tile:not(.ws-decoy)')).map(x=>x.textContent.trim()).sort().join('');
    return `${lvl}|${prompt}|${tiles}`;
  }

  function kai(doc){
    const box=doc.querySelector('.tiles');
    if(!box)return;
    const tiles=Array.from(box.querySelectorAll('.tile:not(.ws-decoy)'));
    if(tiles.length<3)return;
    const reordered=tiles.slice();
    if(reordered.length%2===0)reordered.reverse();
    else reordered.push(reordered.shift());
    reordered.forEach((tile,i)=>{
      box.appendChild(tile);
      tile.style.setProperty('--ws-shift',`${i%2===0?6:-6}px`);
      tile.style.setProperty('--ws-rot',`${i%2===0?2:-2}deg`);
      tile.classList.remove('ws-kai-shuffled');
      void tile.offsetWidth;
      tile.classList.add('ws-kai-shuffled');
    });
  }

  function brax(doc){
    const tiles=Array.from(doc.querySelectorAll('.tiles .tile:not(.used):not(.ws-decoy)'));
    if(tiles.length<3)return;
    const target=tiles[Math.floor(tiles.length/2)];
    target.classList.add('ws-brax-hidden');
    revealTimer=window.setTimeout(()=>{
      target.classList.remove('ws-brax-hidden');
      target.classList.add('ws-brax-reveal');
      window.setTimeout(()=>target.classList.remove('ws-brax-reveal'),420);
    },2800);
  }

  function blackfinn(doc){
    const box=doc.querySelector('.tiles');
    if(!box||box.querySelector('.ws-decoy'))return;
    const used=new Set(Array.from(box.querySelectorAll('.tile')).map(x=>x.textContent.trim().toUpperCase()));
    const letter=Array.from(alphabet).find(ch=>!used.has(ch))||'X';
    const fake=doc.createElement('button');
    fake.type='button';
    fake.className='tile ws-decoy';
    fake.textContent=letter;
    fake.setAttribute('aria-label',`${letter}, möglicher Köderbuchstabe`);
    fake.addEventListener('click',ev=>{
      ev.preventDefault();
      ev.stopPropagation();
      fake.classList.remove('ws-decoy-hit');void fake.offsetWidth;fake.classList.add('ws-decoy-hit');
      doc.querySelector('.ws-decoy-note')?.remove();
      const note=doc.createElement('div');
      note.className='ws-decoy-note';
      note.textContent='KÖDER!';
      doc.querySelector('.card')?.appendChild(note);
      window.setTimeout(()=>note.remove(),650);
    });
    const children=Array.from(box.children);
    const insertAt=Math.min(children.length,Math.max(1,Math.floor(children.length/2)));
    if(children[insertAt])box.insertBefore(fake,children[insertAt]);else box.appendChild(fake);
  }

  function render(){
    try{
      const win=frame.contentWindow;
      const doc=frame.contentDocument;
      if(!win||!doc?.body||!doc.head)return;
      ensureStyles(doc);
      const active=bossActive(win,doc);
      const lvl=level(win,doc);
      if(!active||lvl<1||lvl>3){cleanup(doc);return;}
      badge(doc,lvl);
      const key=wordKey(doc,lvl);
      if(!key||key===lastWordKey)return;
      lastWordKey=key;
      window.clearTimeout(revealTimer);
      doc.querySelectorAll('.tile.ws-decoy').forEach(el=>el.remove());
      doc.querySelectorAll('.tile.ws-brax-hidden').forEach(el=>el.classList.remove('ws-brax-hidden'));
      if(lvl===1)kai(doc);
      if(lvl===2)brax(doc);
      if(lvl===3)blackfinn(doc);
    }catch(err){console.warn('Word Scramble boss abilities 1-3 skipped',err)}
  }

  function start(){
    window.clearInterval(timer);
    lastWordKey='';
    render();
    timer=window.setInterval(render,180);
  }

  frame.addEventListener('load',start);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')start();
})();

(()=>{
  const id='ws-boss-abilities-4-6-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-abilities-4-6.js';
  document.head.appendChild(script);
})();

(()=>{
  const id='ws-boss-abilities-7-10-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-abilities-7-10.js';
  script.addEventListener('load',()=>{
    const rarityId='ws-word-rarities-loader';
    if(document.getElementById(rarityId))return;
    const rarity=document.createElement('script');
    rarity.id=rarityId;
    rarity.src='./assets/patches/word-rarities.js';
    document.head.appendChild(rarity);
  },{once:true});
  document.head.appendChild(script);
})();
