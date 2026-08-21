(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;
  const STORAGE_KEY='wordScrambleBossStarsV1';
  const bosses=window.WS_BOSS_META||[];
  let timer=0;

  function currentLevel(win,doc){
    const m=doc.querySelector('.bossPlate')?.textContent?.match(/LEVEL\s+(\d+)/i);
    if(m)return Math.max(1,Math.min(10,Number(m[1])||1));
    try{return Math.max(1,Math.min(10,Number(win.sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
  }
  function bossActive(win,doc){
    const img=doc.querySelector('.bossImg');
    if(!img)return false;
    const style=win.getComputedStyle(img);
    return style.display!=='none'&&style.visibility!=='hidden'&&Number(style.opacity||1)>0&&img.getClientRects().length>0;
  }
  function readStars(win){
    try{const v=JSON.parse(win.localStorage.getItem(STORAGE_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}
  }
  function levelsAround(level){
    if(level<=2)return [1,2,3,4];
    return [level-1,level,level+1,level+2].map(v=>((v-1)%10+10)%10+1);
  }
  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-campaign-stars-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-campaign-stars-style';
    style.textContent=`
      .ws-boss-roadmap-head .ws-campaign-count{color:#ffe18a!important}
      .ws-boss-card.ws-campaign-defeated{border-color:rgba(255,216,111,.58);background:linear-gradient(160deg,rgba(119,84,25,.26),rgba(16,70,73,.14));box-shadow:inset 0 0 0 1px rgba(255,216,111,.08)}
      .ws-boss-stars{display:block;margin-top:2px;color:#ffe18a;font-size:.26rem;line-height:1;letter-spacing:.02em;text-shadow:0 1px 3px rgba(0,0,0,.6)}
      .ws-boss-card .ws-defeated-mark{background:#7a641f!important;color:#fff0bd!important}
      .ws-boss-card.current .ws-boss-stars{font-size:.28rem}
      .ws-star-rules{margin:1px 0 11px;padding:7px 9px;border:1px solid rgba(239,199,102,.28);border-radius:12px;background:rgba(1,31,51,.52);color:#bfdfe0;font-size:.48rem;font-weight:850;line-height:1.35;text-align:center}.ws-star-rules b{color:#ffe18a}
      @media(max-width:430px){.ws-boss-stars{font-size:.22rem}.ws-boss-card.current .ws-boss-stars{font-size:.23rem}.ws-star-rules{font-size:.41rem;padding:6px 7px;margin-bottom:9px}}
    `;
    doc.head.appendChild(style);
  }
  function ensureStarRules(doc){
    const intro=doc.querySelector('.ws-boss-intro-card');
    if(!intro||intro.querySelector('.ws-star-rules'))return;
    const rule=doc.createElement('div');
    rule.className='ws-star-rules';
    rule.innerHTML='<b>STERNE</b> · 3★ ohne Fehler/Tipp · 2★ max. 1 Fehler + 1 Tipp · 1★ Sieg';
    intro.querySelector('.ws-boss-intro-start')?.insertAdjacentElement('beforebegin',rule);
  }
  function decorateRoadmap(){
    try{
      const win=frame.contentWindow,doc=frame.contentDocument;
      if(!win||!doc?.body||!doc.head||!bosses.length)return;
      ensureStyles(doc);ensureStarRules(doc);
      const roadmap=doc.querySelector('.ws-boss-roadmap');
      if(!roadmap)return;
      const level=currentLevel(win,doc),active=bossActive(win,doc),stars=readStars(win);
      const defeated=Object.values(stars).filter(v=>Number(v)>0).length;
      const head=roadmap.querySelector('.ws-boss-roadmap-head span:first-child');
      if(head){head.classList.add('ws-campaign-count');head.textContent='☠ BOSS-KAMPAGNE · '+defeated+'/10';}
      const track=roadmap.querySelector('.ws-boss-roadmap-track');
      if(!track)return;
      const wanted=levelsAround(level);
      const existing=Array.from(track.querySelectorAll('.ws-boss-card')).map(c=>Number(c.dataset.level||0));
      if(existing.length!==wanted.length||existing.some((v,i)=>v!==wanted[i])){
        track.innerHTML='';
        wanted.forEach(lvl=>{
          const boss=bosses[lvl-1];if(!boss)return;
          const best=Math.max(0,Math.min(3,Number(stars[lvl]||0))),current=lvl===level;
          const card=doc.createElement('div');
          card.dataset.level=String(lvl);
          card.className='ws-boss-card'+(current?' current':'')+(best?' ws-campaign-defeated':'');
          const mark=current?'<em>'+(active?'AKTUELL':'NÄCHSTER')+'</em>':(best?'<em class="ws-defeated-mark">✓</em>':'');
          const starLine=best?'<span class="ws-boss-stars" aria-label="'+best+' von 3 Sternen">'+'★'.repeat(best)+'☆'.repeat(3-best)+'</span>':'';
          card.innerHTML='<img src="'+boss.sprite+'" alt=""><div class="ws-boss-card-copy"><b>LEVEL '+lvl+'</b><small>'+boss.name+'</small>'+starLine+'</div>'+mark;
          track.appendChild(card);
        });
      }
    }catch(err){console.warn('Word Scramble campaign roadmap skipped',err)}
  }
  function installRuntime(doc){
    if(doc.getElementById('ws-boss-campaign-stars-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-campaign-stars-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_CAMPAIGN_STARS__)return;
      window.__WS_BOSS_CAMPAIGN_STARS__=true;
      const STORAGE_KEY='${STORAGE_KEY}',baseRender=render;
      let wasBoss=Boolean(s.boss),encounterHints=0,resultRecorded=false;
      const currentLevel=()=>{const m=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);if(m)return Math.max(1,Math.min(10,Number(m[1])||1));try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}};
      const readStars=()=>{try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}};
      const saveResult=level=>{const misses=Math.max(0,Number(s.bossMiss)||0),hints=Math.max(0,encounterHints),stars=misses===0&&hints===0?3:(misses<=1&&hints<=1?2:1),progress=readStars();progress[level]=Math.max(Number(progress[level]||0),stars);try{localStorage.setItem(STORAGE_KEY,JSON.stringify(progress));}catch{}const result={level,stars,misses,hints,best:Number(progress[level]||stars),at:Date.now()};try{sessionStorage.setItem('wordScrambleLastBossResultV1',JSON.stringify(result));}catch{}window.WS_LAST_BOSS_RESULT=result;document.dispatchEvent(new CustomEvent('ws-boss-campaign-updated',{detail:result}));};
      document.addEventListener('click',event=>{const button=event.target?.closest?.('#hint');if(button&&!button.disabled&&s.boss&&!s.feedback)encounterHints++;},true);
      render=function(){const nowBoss=Boolean(s.boss);if(nowBoss&&!wasBoss){encounterHints=0;resultRecorded=false;}if(nowBoss&&!resultRecorded&&Number(s.bossHp)<=0){resultRecorded=true;saveResult(currentLevel());}baseRender();wasBoss=Boolean(s.boss);};
      render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }
  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.head||!doc.documentElement)return;
      ensureStyles(doc);installRuntime(doc);
      doc.addEventListener('ws-boss-campaign-updated',decorateRoadmap);
      window.clearInterval(timer);decorateRoadmap();timer=window.setInterval(decorateRoadmap,260);
    }catch(err){console.warn('Word Scramble campaign stars skipped',err)}
  }
  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();

(()=>{
  const id='ws-boss-victory-loot-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-victory-loot.js';
  document.head.appendChild(script);
})();
