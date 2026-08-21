(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  const assets={
    waving:'https://o-some.github.io/tulasisland/assets/creative/tula_waving.webp',
    celebrating:'https://o-some.github.io/tulasisland/assets/creative/tula_celebrating.webp',
    surprised:'https://o-some.github.io/tulasisland/assets/creative/tula_surprised.webp'
  };

  function ensureStyles(doc){
    if(doc.getElementById('ws-tula-final-polish-style'))return;
    const style=doc.createElement('style');
    style.id='ws-tula-final-polish-style';
    style.textContent=`
      .tula.ws-tula-pop{animation:wsTulaPop .42s cubic-bezier(.18,.84,.25,1)}
      .tula.ws-tula-wobble{animation:wsTulaWobble .44s ease-out}
      .tula.ws-tula-glow{filter:drop-shadow(0 18px 14px #0008) drop-shadow(0 0 16px rgba(255,220,112,.38))!important}
      @keyframes wsTulaPop{0%{transform:translateY(4px) scale(.94)}45%{transform:translateY(-5px) scale(1.05)}100%{transform:translateY(0) scale(1)}}
      @keyframes wsTulaWobble{0%,100%{transform:translateX(0) rotate(0)}30%{transform:translateX(-5px) rotate(-3deg)}60%{transform:translateX(4px) rotate(2deg)}}
      .ws-tula-toast{position:fixed;z-index:112;left:max(8px,env(safe-area-inset-left));top:calc(148px + env(safe-area-inset-top));display:grid;grid-template-columns:43px minmax(0,1fr);align-items:center;gap:7px;width:min(178px,calc(100vw - 20px));padding:6px 8px;border:1px solid rgba(239,199,102,.58);border-radius:15px;background:linear-gradient(155deg,rgba(4,55,83,.97),rgba(1,27,47,.97));box-shadow:0 12px 28px rgba(0,7,17,.42),inset 0 1px rgba(255,255,255,.09);pointer-events:none;animation:wsTulaToast .92s ease both}
      .ws-tula-toast img{width:43px;height:43px;object-fit:contain;filter:drop-shadow(0 5px 5px rgba(0,0,0,.4))}.ws-tula-toast b{display:block;color:#ffe18a;font-size:.52rem;line-height:1.05}.ws-tula-toast span{display:block;margin-top:2px;color:#d9eeee;font-size:.43rem;font-weight:800;line-height:1.25}
      @keyframes wsTulaToast{0%{opacity:0;transform:translateY(-6px) scale(.96)}15%,78%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-3px) scale(.98)}}
      .ws-tula-intro{display:grid;grid-template-columns:52px 1fr;align-items:center;gap:8px;margin:0 0 10px;padding:7px 9px;border:1px solid rgba(112,217,173,.28);border-radius:14px;background:rgba(3,62,70,.24);text-align:left}.ws-tula-intro img{width:52px;height:52px;object-fit:contain}.ws-tula-intro b{display:block;color:#ffe18a;font-size:.55rem}.ws-tula-intro span{display:block;margin-top:2px;color:#d8eeee;font-size:.47rem;font-weight:800;line-height:1.3}
      .ws-tula-victory{position:absolute;right:8px;bottom:7px;width:66px;height:66px;object-fit:contain;filter:drop-shadow(0 8px 7px rgba(0,0,0,.42));animation:wsTulaVictory .66s .28s cubic-bezier(.18,.84,.25,1) both;pointer-events:none}
      @keyframes wsTulaVictory{0%{opacity:0;transform:translateY(14px) scale(.74) rotate(4deg)}100%{opacity:1;transform:translateY(0) scale(1) rotate(-2deg)}}
      @media(max-width:430px){.ws-tula-toast{top:calc(140px + env(safe-area-inset-top));grid-template-columns:38px minmax(0,1fr);width:min(164px,calc(100vw - 16px));padding:5px 7px}.ws-tula-toast img{width:38px;height:38px}.ws-tula-toast b{font-size:.47rem}.ws-tula-toast span{font-size:.39rem}.ws-tula-intro{grid-template-columns:45px 1fr;padding:6px 7px}.ws-tula-intro img{width:45px;height:45px}.ws-tula-intro span{font-size:.42rem}.ws-tula-victory{width:56px;height:56px}}
      @media(prefers-reduced-motion:reduce){.tula.ws-tula-pop,.tula.ws-tula-wobble,.ws-tula-toast,.ws-tula-victory{animation-duration:.08s!important;animation-delay:0s!important}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(doc.getElementById('ws-tula-final-polish-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-tula-final-polish-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_TULA_FINAL_POLISH__)return;
      window.__WS_TULA_FINAL_POLISH__=true;
      const assets=${JSON.stringify(assets)};
      const baseRender=render;
      let lastReaction='';
      let toastTimer=0;

      function animateTula(img,cls){
        if(!img)return;
        img.classList.remove('ws-tula-pop','ws-tula-wobble','ws-tula-glow');
        void img.offsetWidth;
        if(cls)img.classList.add(...cls.split(/\\s+/).filter(Boolean));
      }

      function setNormalReaction(){
        if(s.boss)return;
        const img=document.querySelector('.tula');
        const bubble=document.querySelector('.side .bubble');
        if(!img||!bubble)return;
        let key='idle:'+s.i+':'+s.normal,src=assets.waving,text='Los geht’s!',cls='';
        const rarity=(document.querySelector('.ws-word-rarity')?.textContent||'').toUpperCase();
        const treasure=Boolean(document.querySelector('.ws-treasure-badge'));
        if(s.feedback){
          key='feedback:'+s.i+':'+s.normal+':'+Boolean(s.feedback.ok)+':'+s.lives;
          if(s.feedback.ok){src=assets.celebrating;text='Stark gelöst!';cls='ws-tula-pop';}
          else if(Number(s.lives)<=0){src=assets.surprised;text='Kopf hoch – neuer Versuch!';cls='ws-tula-wobble';}
          else{src=assets.surprised;text='Fast – versuch’s nochmal!';cls='ws-tula-wobble';}
        }else if(treasure){
          key='treasure:'+s.i+':'+s.normal;src=assets.celebrating;text='Da ist ein Schatz! 🗝';cls='ws-tula-pop ws-tula-glow';
        }else if(rarity.includes('LEGENDÄR')){
          key='legendary:'+s.i+':'+s.normal;src=assets.celebrating;text='Legendäres Wort! 👑';cls='ws-tula-pop ws-tula-glow';
        }else if(rarity.includes('EPISCH')||rarity.includes('SELTEN')){
          key='rare:'+s.i+':'+s.normal;src=assets.celebrating;text='Seltenes Wort – stark!';cls='ws-tula-pop';
        }else if(Number(s.combo)>=5){
          key='combo:'+s.i+':'+s.normal+':'+s.combo;src=assets.celebrating;text='🔥 Combo x'+s.combo+'!';cls='ws-tula-pop';
        }
        img.src=src;
        bubble.textContent=text;
        if(key!==lastReaction){lastReaction=key;animateTula(img,cls);}
      }

      function showToast(type,text){
        const key=type+':'+text+':'+s.bossHp+':'+s.bossMiss+':'+s.i;
        if(key===lastReaction)return;
        lastReaction=key;
        document.querySelector('.ws-tula-toast')?.remove();
        clearTimeout(toastTimer);
        const toast=document.createElement('div');
        toast.className='ws-tula-toast';
        const src=type==='hit'?assets.celebrating:type==='miss'?assets.surprised:assets.waving;
        toast.innerHTML='<img src="'+src+'" alt=""><div><b>TULA</b><span>'+text+'</span></div>';
        document.body.appendChild(toast);
        toastTimer=setTimeout(()=>toast.remove(),980);
      }

      function setBossReaction(){
        if(!s.boss)return;
        if(s.feedback?.ok)showToast('hit','Treffer! Weiter so!');
        else if(s.feedback&&!s.feedback.ok&&Number(s.bossMiss)>=3)showToast('miss','Nicht aufgeben – du kommst wieder!');
        else if(s.feedback&&!s.feedback.ok)showToast('miss','Bleib dran – du schaffst das!');
      }

      render=function(){baseRender();setNormalReaction();setBossReaction();};
      render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function decorateSpecialUi(doc){
    const intro=doc.querySelector('.ws-boss-intro-card');
    if(intro&&!intro.querySelector('.ws-tula-intro')){
      const item=doc.createElement('div');
      item.className='ws-tula-intro';
      item.innerHTML=`<img src="${assets.surprised}" alt="Tula"><div><b>TULA</b><span>Ein Boss! Schau dir seine Fähigkeit an und bleib ruhig.</span></div>`;
      const ability=intro.querySelector('.ws-boss-ability');
      if(ability)ability.insertAdjacentElement('afterend',item);else intro.appendChild(item);
    }
    const victory=doc.querySelector('.ws-victory-card');
    if(victory&&!victory.querySelector('.ws-tula-victory')){
      const img=doc.createElement('img');
      img.className='ws-tula-victory';
      img.src=assets.celebrating;
      img.alt='Tula feiert';
      victory.appendChild(img);
    }
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.documentElement||!doc.body)return;
      ensureStyles(doc);
      installRuntime(doc);
      decorateSpecialUi(doc);
      const observer=new MutationObserver(()=>decorateSpecialUi(doc));
      observer.observe(doc.body,{childList:true,subtree:true});
    }catch(err){console.warn('Word Scramble Tula final polish skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
