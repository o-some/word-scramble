(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  const VERSION='20260822-v2';
  const STAGES=['A1','A2','B1','B2','C1','C2'];
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

  function ensureStyles(doc){
    if(!doc?.head||doc.getElementById('ws-cefr-campaign-style'))return;
    const style=doc.createElement('style');
    style.id='ws-cefr-campaign-style';
    style.textContent=`
      .ws-cefr-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:7px!important}
      .ws-cefr-grid button{position:relative;min-height:54px!important}.ws-cefr-grid button:disabled{opacity:.38;filter:saturate(.5);cursor:not-allowed}.ws-cefr-grid button small{display:block;margin-top:2px;font-size:.42rem;opacity:.75}
      .ws-cefr-complete{position:fixed;z-index:190;inset:0;display:grid;place-items:center;padding:calc(16px + env(safe-area-inset-top)) 14px calc(16px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 25%,rgba(255,216,111,.22),transparent 34%),rgba(0,10,19,.90);-webkit-backdrop-filter:blur(13px);backdrop-filter:blur(13px)}
      .ws-cefr-complete-card{width:min(410px,100%);padding:23px 18px 19px;border:1px solid rgba(255,224,126,.95);border-radius:27px;background:radial-gradient(circle at 86% 5%,rgba(64,222,202,.13),transparent 30%),linear-gradient(155deg,rgba(5,60,91,.995),rgba(1,24,43,.995));box-shadow:inset 0 1px rgba(255,255,255,.14),0 30px 78px rgba(0,4,13,.68);text-align:center}
      .ws-cefr-complete-kicker{display:inline-flex;align-items:center;min-height:28px;padding:0 11px;border:1px solid rgba(239,199,102,.58);border-radius:999px;background:rgba(1,31,52,.78);color:#f3cc67;font-size:.52rem;font-weight:1000;letter-spacing:.12em}.ws-cefr-complete-icon{font-size:3rem;margin:14px 0 5px;filter:drop-shadow(0 8px 14px rgba(0,0,0,.35))}
      .ws-cefr-complete-card h2{margin:0;color:#fff0bd;font:900 1.65rem/1.05 Georgia,serif}.ws-cefr-complete-card p{margin:9px auto 15px;max-width:30ch;color:#d8eeee;font-size:.68rem;font-weight:750;line-height:1.45}.ws-cefr-complete-stage{display:inline-flex;align-items:center;justify-content:center;min-width:72px;height:42px;margin:1px 0 13px;border:1px solid rgba(112,217,173,.44);border-radius:14px;background:rgba(4,70,75,.27);color:#ffe18a;font-weight:1000;font-size:1rem}
      .ws-cefr-complete-start{width:100%;min-height:55px;border:1px solid #fff0a8;border-radius:16px;background:linear-gradient(#ffe895,#e3b13d 55%,#b97418);box-shadow:0 5px 0 #75430e;color:#092f4b;font-weight:1000;font-size:.76rem;cursor:pointer}
      @media(max-width:430px){.ws-cefr-complete-card{padding:19px 15px 16px;border-radius:24px}.ws-cefr-complete-card h2{font-size:1.42rem}.ws-cefr-complete-card p{font-size:.61rem}.ws-cefr-grid{grid-template-columns:repeat(2,1fr)!important}}
    `;
    doc.head.appendChild(style);
  }

  function install(doc){
    if(!doc?.documentElement||doc.getElementById('ws-boss-progression-core-runtime'))return;
    ensureStyles(doc);
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-progression-core-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_PROGRESSION_CORE__)return;
      window.__WS_BOSS_PROGRESSION_CORE__='${VERSION}';
      const STAGES=${JSON.stringify(STAGES)};
      const bosses=${JSON.stringify(bosses)};
      const STAGE_KEY='wordScrambleCefrStageV1';
      const UNLOCK_KEY='wordScrambleCefrUnlockedV1';
      const LEVEL_KEY='wordScrambleBossLevel';
      const FLAT_STARS_KEY='wordScrambleBossStarsV1';
      const STAGE_STARS_KEY='wordScrambleBossStarsByStageV1';
      const COMPLETE_KEY='wordScrambleCefrMasteredV1';
      const baseRender=render;

      const safeGet=(store,key,fallback)=>{try{const value=store.getItem(key);return value===null?fallback:value}catch{return fallback}};
      const safeSet=(store,key,value)=>{try{store.setItem(key,String(value))}catch{}};
      const parseJson=(value,fallback)=>{try{const out=JSON.parse(value);return out&&typeof out==='object'?out:fallback}catch{return fallback}};
      const stageIndex=value=>{const i=STAGES.indexOf(String(value||'').toUpperCase());return i<0?0:i;};
      const currentStage=()=>STAGES[stageIndex(safeGet(localStorage,STAGE_KEY,'A1'))];
      const unlockedIndex=()=>Math.max(0,Math.min(STAGES.length-1,Number(safeGet(localStorage,UNLOCK_KEY,'0'))||0));
      const level=()=>Math.max(1,Math.min(10,Number(safeGet(sessionStorage,LEVEL_KEY,'1'))||1));
      const saveLevel=value=>safeSet(sessionStorage,LEVEL_KEY,Math.max(1,Math.min(10,Number(value)||1)));

      function starsMap(){return parseJson(safeGet(localStorage,STAGE_STARS_KEY,'{}'),{});}
      function saveCurrentStageStars(stage=currentStage()){
        const map=starsMap();
        map[stage]=parseJson(safeGet(localStorage,FLAT_STARS_KEY,'{}'),{});
        safeSet(localStorage,STAGE_STARS_KEY,JSON.stringify(map));
      }
      function loadStageStars(stage){
        const map=starsMap();
        if(!Object.keys(map).length){
          const legacy=parseJson(safeGet(localStorage,FLAT_STARS_KEY,'{}'),{});
          if(Object.keys(legacy).length){map.A1=legacy;safeSet(localStorage,STAGE_STARS_KEY,JSON.stringify(map));}
        }
        safeSet(localStorage,FLAT_STARS_KEY,JSON.stringify(map[stage]||{}));
      }

      function resetRunForStage(){
        saveLevel(1);
        s.boss=false;s.normal=0;s.bossHp=3;s.bossMiss=0;s.feedback=null;s.sel=[];s.combo=0;s.lives=3;s.i=0;
      }

      function setStage(stage,{reset=true}={}){
        const next=STAGES[stageIndex(stage)];
        const nextIndex=stageIndex(next);
        if(nextIndex>unlockedIndex())return false;
        const previous=currentStage();
        saveCurrentStageStars(previous);
        safeSet(localStorage,STAGE_KEY,next);
        loadStageStars(next);
        if(reset){resetRunForStage();setup();}
        document.dispatchEvent(new CustomEvent('ws-cefr-stage-changed',{detail:{stage:next,index:nextIndex}}));
        return true;
      }

      function showStageComplete(completedStage,nextStage,mastered){
        document.querySelector('.ws-cefr-complete')?.remove();
        const overlay=document.createElement('div');overlay.className='ws-cefr-complete';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');
        overlay.innerHTML='<section class="ws-cefr-complete-card"><div class="ws-cefr-complete-kicker">🏆 KAMPAGNE GESCHAFFT</div><div class="ws-cefr-complete-icon">🐢✨</div><h2>'+(mastered?'Alle Sprachstufen gemeistert!':completedStage+' geschafft!')+'</h2><p>'+(mastered?'Du hast die komplette Reise von A1 bis C2 geschafft. Du kannst die Insel jetzt wieder ab A1 erobern.':'Alle 10 Bosse sind besiegt. Die nächste Sprachstufe ist freigeschaltet und die Boss-Kampagne beginnt wieder bei Pirat Kai.')+'</p><div class="ws-cefr-complete-stage">'+(mastered?'A1':nextStage)+'</div><button type="button" class="ws-cefr-complete-start">'+(mastered?'A1 NEU STARTEN':nextStage+' STARTEN')+'</button></section>';
        overlay.querySelector('.ws-cefr-complete-start')?.addEventListener('click',()=>{overlay.remove();if(mastered){safeSet(localStorage,UNLOCK_KEY,String(STAGES.length-1));safeSet(localStorage,STAGE_KEY,'A1');loadStageStars('A1');resetRunForStage();setup();}}, {once:true});
        document.body.appendChild(overlay);
      }

      function completeStage(){
        const completed=currentStage(),idx=stageIndex(completed),mastered=idx===STAGES.length-1;
        saveCurrentStageStars(completed);
        if(mastered){safeSet(localStorage,COMPLETE_KEY,'1');showStageComplete(completed,'A1',true);return {stage:completed,next:'A1',mastered:true};}
        const next=STAGES[idx+1];
        safeSet(localStorage,UNLOCK_KEY,String(Math.max(unlockedIndex(),idx+1)));
        safeSet(localStorage,STAGE_KEY,next);
        loadStageStars(next);
        resetRunForStage();
        showStageComplete(completed,next,false);
        document.dispatchEvent(new CustomEvent('ws-cefr-stage-changed',{detail:{stage:next,index:idx+1}}));
        return {stage:completed,next,mastered:false};
      }

      function hit(){if(!s.boss)return Number(s.bossHp)||0;s.bossHp=Math.max(0,(Number(s.bossHp)||0)-1);return s.bossHp;}
      function miss(){if(!s.boss)return Number(s.bossMiss)||0;s.bossMiss=Math.max(0,(Number(s.bossMiss)||0)+1);return s.bossMiss;}
      function finishTurn(){
        if(!s.boss)return {ended:false,victory:false};
        const victory=Number(s.bossHp)<=0,defeat=Number(s.bossMiss)>=3;
        if(!victory&&!defeat)return {ended:false,victory:false};
        const beatenLevel=level(),stage=currentStage();
        s.boss=false;s.normal=0;s.bossHp=3;s.bossMiss=0;s.i++;
        if(victory){
          if(beatenLevel>=10){completeStage();document.dispatchEvent(new CustomEvent('ws-boss-campaign-complete',{detail:{stage,level:10}}));}
          else{saveLevel(beatenLevel+1);document.dispatchEvent(new CustomEvent('ws-boss-level-advanced',{detail:{stage,level:beatenLevel+1}}));}
        }
        document.dispatchEvent(new CustomEvent(victory?'ws-boss-victory':'ws-boss-defeat',{detail:{stage,level:beatenLevel}}));
        return {ended:true,victory,defeat,stage,level:beatenLevel};
      }

      function decorateSettings(){
        const button=document.getElementById('level'),settings=document.getElementById('settings'),sheet=settings?.querySelector('.sheet'),grid=sheet?.querySelector('.diffs');
        if(button&&!button.dataset.wsCefrBound){button.dataset.wsCefrBound='1';button.onclick=()=>{decorateSettings();settings?.classList.remove('hidden');};}
        if(!sheet||!grid)return;
        const title=sheet.querySelector('h2');if(title&&title.textContent!=='Sprachstufe')title.textContent='Sprachstufe';
        grid.classList.add('ws-cefr-grid');
        const signature=currentStage()+'|'+unlockedIndex();
        if(grid.dataset.wsCefrSignature===signature)return;grid.dataset.wsCefrSignature=signature;grid.innerHTML='';
        STAGES.forEach((stage,i)=>{const b=document.createElement('button');b.type='button';b.dataset.cefr=stage;b.classList.toggle('on',stage===currentStage());b.disabled=i>unlockedIndex();b.innerHTML='<b>'+stage+'</b><small>'+(i>unlockedIndex()?'GESPERRT':stage===currentStage()?'AKTUELL':'FREIGESCHALTET')+'</small>';b.addEventListener('click',()=>{if(setStage(stage)){settings?.classList.add('hidden');}});grid.appendChild(b);});
      }

      function decorate(){
        const stage=currentStage();
        const label=document.getElementById('difficultyLabel');if(label&&label.textContent!==stage)label.textContent=stage;
        const levelButton=document.getElementById('level');const levelSmall=levelButton?.querySelector('small');if(levelSmall&&levelSmall.textContent!=='SPRACHSTUFE')levelSmall.textContent='SPRACHSTUFE';
        const brand=document.querySelector('.brand small');const brandText='DE → EN · '+stage;if(brand&&brand.textContent!==brandText)brand.textContent=brandText;
        if(s.boss){const lvl=level(),meta=bosses[lvl-1]||bosses[0],plate=document.querySelector('.bossPlate'),img=document.querySelector('.bossImg');if(plate)plate.textContent='LEVEL '+lvl+' · '+String(meta[0]).toUpperCase();if(img){const src=new URL(meta[1],window.parent.location.href).href+'?v=${VERSION}';if(img.dataset.wsBossLevel!==String(lvl)){img.dataset.wsBossLevel=String(lvl);img.src=src;img.alt=meta[0];}}}
        decorateSettings();
      }

      window.WS_GET_CEFR_STAGE=currentStage;
      window.WS_BOSS_CAMPAIGN={version:'${VERSION}',stages:STAGES.slice(),currentStage,currentLevel:level,unlockedIndex,hit,miss,finishTurn,setStage,saveCurrentStageStars};
      if(safeGet(localStorage,UNLOCK_KEY,null)===null)safeSet(localStorage,UNLOCK_KEY,'0');
      loadStageStars(currentStage());
      render=function(){baseRender();decorate();};
      render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  const start=()=>{try{install(frame.contentDocument)}catch(err){console.warn('Word Scramble boss progression core skipped',err)}};
  frame.addEventListener('load',start);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')start();
})();
