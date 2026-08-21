(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureOuterStyles(doc){
    if(doc.getElementById('ws-word-rarities-style'))return;
    const style=doc.createElement('style');
    style.id='ws-word-rarities-style';
    style.textContent=`
      .ws-word-rarity{display:inline-flex;align-items:center;gap:5px;margin:0 auto 9px;padding:4px 9px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(1,29,48,.82);font-size:.44rem;font-weight:1000;letter-spacing:.07em;box-shadow:inset 0 1px rgba(255,255,255,.08),0 6px 16px rgba(0,10,22,.22)}
      .ws-word-rarity small{font-size:.38rem;font-weight:900;letter-spacing:.03em;opacity:.88}
      .card.ws-rarity-uncommon{outline:1px solid rgba(112,217,173,.30);outline-offset:-7px}.card.ws-rarity-uncommon .ws-word-rarity{border-color:rgba(112,217,173,.62);color:#bff4db}.card.ws-rarity-uncommon .tile:not(.used){border-color:#b8efd6}
      .card.ws-rarity-rare{outline:1px solid rgba(102,185,255,.34);outline-offset:-7px}.card.ws-rarity-rare .ws-word-rarity{border-color:rgba(102,185,255,.70);color:#c9e7ff}.card.ws-rarity-rare .tile:not(.used){border-color:#a9d8ff;box-shadow:inset 0 2px #fff8,0 5px 0 #78460e,0 0 12px rgba(89,173,255,.16)}
      .card.ws-rarity-epic{outline:1px solid rgba(202,139,255,.40);outline-offset:-7px}.card.ws-rarity-epic .ws-word-rarity{border-color:rgba(202,139,255,.76);color:#ead2ff;background:linear-gradient(160deg,rgba(69,36,91,.88),rgba(25,24,58,.88))}.card.ws-rarity-epic .tile:not(.used){border-color:#d9a9ff;box-shadow:inset 0 2px #fff8,0 5px 0 #78460e,0 0 14px rgba(193,112,255,.22)}
      .card.ws-rarity-legendary{outline:1px solid rgba(255,220,112,.52);outline-offset:-7px}.card.ws-rarity-legendary .ws-word-rarity{border-color:rgba(255,224,126,.92);color:#fff0af;background:linear-gradient(160deg,rgba(104,65,16,.94),rgba(44,31,22,.94));box-shadow:inset 0 1px rgba(255,255,255,.18),0 0 18px rgba(255,206,79,.18)}.card.ws-rarity-legendary .tile:not(.used){border-color:#fff0a8;box-shadow:inset 0 2px #fff9,0 5px 0 #78460e,0 0 16px rgba(255,211,90,.26)}
      .ws-rarity-bonus-pop{position:absolute;z-index:19;left:50%;top:49%;transform:translate(-50%,-50%);padding:9px 12px;border:1px solid rgba(255,226,140,.86);border-radius:999px;background:rgba(2,34,54,.97);color:#fff0bd;font-size:.56rem;font-weight:1000;letter-spacing:.07em;pointer-events:none;box-shadow:0 10px 24px rgba(0,0,0,.38);animation:wsRarityPop .68s ease-out both}@keyframes wsRarityPop{0%{opacity:0;transform:translate(-50%,-42%) scale(.84)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.04)}100%{opacity:0;transform:translate(-50%,-60%) scale(.96)}}
      @media(max-width:430px){.ws-word-rarity{font-size:.38rem;padding:3px 7px;margin-bottom:7px}.ws-word-rarity small{font-size:.33rem}.ws-rarity-bonus-pop{font-size:.48rem;padding:7px 9px}}
      @media(prefers-reduced-motion:reduce){.ws-rarity-bonus-pop{animation-duration:.08s!important}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(doc.getElementById('ws-word-rarities-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-word-rarities-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_WORD_RARITIES__)return;
      window.__WS_WORD_RARITIES__=true;

      const rarities=[
        {key:'normal',label:'NORMAL',icon:'⚓',weight:58,score:0,shells:0},
        {key:'uncommon',label:'UNGEWÖHNLICH',icon:'🐚',weight:24,score:10,shells:0},
        {key:'rare',label:'SELTEN',icon:'🧭',weight:11,score:20,shells:0},
        {key:'epic',label:'EPISCH',icon:'💎',weight:5,score:35,shells:1},
        {key:'legendary',label:'LEGENDÄR',icon:'👑',weight:2,score:60,shells:2}
      ];
      const baseRender=render;
      const baseSetup=setup;
      const baseCheck=check;
      let current=null;
      let rewardGranted=false;

      function pickRarity(){
        let roll=Math.random()*100;
        for(const rarity of rarities){
          if(roll<rarity.weight)return rarity;
          roll-=rarity.weight;
        }
        return rarities[0];
      }

      function chooseForWord(){
        current=s.boss?null:pickRarity();
        rewardGranted=false;
      }

      function rarityClass(){return current&&current.key!=='normal'?'ws-rarity-'+current.key:'';}

      function renderRarity(){
        const card=document.querySelector('.card');
        if(!card||s.boss||!current)return;
        card.classList.remove('ws-rarity-uncommon','ws-rarity-rare','ws-rarity-epic','ws-rarity-legendary');
        const cls=rarityClass();
        if(cls)card.classList.add(cls);
        let badge=card.querySelector('.ws-word-rarity');
        if(!badge){
          badge=document.createElement('div');
          badge.className='ws-word-rarity';
          const prompt=card.querySelector('.prompt');
          if(prompt)prompt.insertAdjacentElement('beforebegin',badge);else card.prepend(badge);
        }
        const bonus=[];
        if(current.score)bonus.push('+'+current.score+' P');
        if(current.shells)bonus.push('+'+current.shells+' 🐚');
        badge.innerHTML='<span>'+current.icon+' '+current.label+'</span>'+(bonus.length?'<small>'+bonus.join(' · ')+'</small>':'');
      }

      function showBonus(){
        if(!current||(current.score===0&&current.shells===0))return;
        document.querySelector('.ws-rarity-bonus-pop')?.remove();
        const card=document.querySelector('.card');
        if(!card)return;
        const pop=document.createElement('div');
        pop.className='ws-rarity-bonus-pop';
        const bonus=[];
        if(current.score)bonus.push('+'+current.score+' PUNKTE');
        if(current.shells)bonus.push('+'+current.shells+' 🐚');
        pop.textContent=current.icon+' '+current.label+' · '+bonus.join(' · ');
        card.appendChild(pop);
        setTimeout(()=>pop.remove(),760);
      }

      check=function(){
        if(s.boss||!current)return baseCheck();
        if(s.feedback)return;
        const answer=cur()[1].toUpperCase();
        const value=s.sel.map(x=>x.l).join('');
        if(value.length!==answer.length)return baseCheck();
        if(value!==answer)return baseCheck();
        if(rewardGranted)return;
        rewardGranted=true;
        baseCheck();
        if(current.score)s.score+=current.score;
        if(current.shells)s.shells+=current.shells;
        if(s.feedback&&current.key!=='normal'){
          const bonus=[];
          if(current.score)bonus.push('+'+current.score+' Punkte');
          if(current.shells)bonus.push('+'+current.shells+' Muschel'+(current.shells===1?'':'n'));
          s.feedback.msg+=' '+current.label+': '+bonus.join(' · ')+'.';
        }
        render();
        showBonus();
      };

      render=function(){baseRender();renderRarity();};
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
    }catch(err){console.warn('Word Scramble rarities skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();

(()=>{
  const id='ws-treasure-words-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/treasure-words.js';
  document.head.appendChild(script);
})();
