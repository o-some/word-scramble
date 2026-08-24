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
    try{if(typeof win.__WS_BOSS_ENCOUNTER_ACTIVE__==='function')return Boolean(win.__WS_BOSS_ENCOUNTER_ACTIVE__());}catch{}
    return Boolean(doc.querySelector('.bossSide'));
  }
  function readStars(win){
    try{const v=JSON.parse(win.localStorage.getItem(STORAGE_KEY)||'{}');return v&&typeof v==='object'?v:{};}catch{return {};}
  }
  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-campaign-stars-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-campaign-stars-style';
    style.textContent=`
      .ws-boss-roadmap{pointer-events:auto!important}
      .ws-boss-roadmap-head .ws-campaign-count{color:#ffe18a!important}
      .ws-boss-card.ws-campaign-defeated{border-color:rgba(255,216,111,.58);background:linear-gradient(160deg,rgba(119,84,25,.26),rgba(16,70,73,.14));box-shadow:inset 0 0 0 1px rgba(255,216,111,.08)}
      .ws-boss-stars{display:block;margin-top:2px;color:#ffe18a;font-size:.26rem;line-height:1;letter-spacing:.02em;text-shadow:0 1px 3px rgba(0,0,0,.6)}
      .ws-boss-card .ws-defeated-mark{background:#7a641f!important;color:#fff0bd!important}
      .ws-boss-card.current .ws-boss-stars{font-size:.28rem}
      .ws-star-rules{margin:1px 0 11px;padding:7px 9px;border:1px solid rgba(239,199,102,.28);border-radius:12px;background:rgba(1,31,51,.52);color:#bfdfe0;font-size:.48rem;font-weight:850;line-height:1.35;text-align:center}.ws-star-rules b{color:#ffe18a}
      .ws-boss-dossier{position:fixed;z-index:138;inset:0;display:grid;place-items:center;padding:calc(14px + env(safe-area-inset-top)) 12px calc(14px + env(safe-area-inset-bottom));background:radial-gradient(circle at 50% 28%,rgba(29,116,150,.20),transparent 34%),rgba(0,10,20,.84);-webkit-backdrop-filter:blur(11px);backdrop-filter:blur(11px)}
      .ws-boss-dossier-card{width:min(390px,100%);max-height:calc(100dvh - 30px);overflow:auto;box-sizing:border-box;padding:17px 16px 15px;border:1px solid rgba(255,216,111,.90);border-radius:25px;background:radial-gradient(circle at 84% 8%,rgba(55,219,199,.12),transparent 30%),linear-gradient(155deg,rgba(5,59,91,.995),rgba(1,24,43,.995));box-shadow:inset 0 1px rgba(255,255,255,.13),0 28px 70px rgba(0,4,13,.64);text-align:center}
      .ws-boss-dossier-kicker{display:inline-flex;align-items:center;min-height:26px;padding:0 10px;border:1px solid rgba(239,199,102,.55);border-radius:999px;color:#f3cc67;font-size:.50rem;font-weight:950;letter-spacing:.12em;background:rgba(1,31,52,.76)}
      .ws-boss-dossier-portrait{height:145px;display:grid;place-items:end center;margin:2px 0 -2px}.ws-boss-dossier-portrait img{max-width:155px;max-height:155px;object-fit:contain;filter:drop-shadow(0 15px 12px rgba(0,0,0,.58))}
      .ws-boss-dossier-level{margin:2px 0 2px;color:#a9d7d8;font-size:.54rem;font-weight:950;letter-spacing:.12em}.ws-boss-dossier h2{margin:0 0 10px;color:#fff0bd;font:900 1.35rem/1 Georgia,serif}
      .ws-boss-dossier-status{display:inline-flex;align-items:center;min-height:26px;padding:0 9px;border-radius:999px;border:1px solid rgba(112,217,173,.30);background:rgba(5,70,74,.28);color:#d8eeee;font-size:.48rem;font-weight:950;margin-bottom:10px}
      .ws-boss-dossier-ability{padding:11px 12px;border:1px solid rgba(239,199,102,.36);border-radius:16px;background:rgba(255,255,255,.045);text-align:left}.ws-boss-dossier-ability small{display:block;color:#efc766;font-size:.46rem;font-weight:1000;letter-spacing:.10em}.ws-boss-dossier-ability b{display:block;margin:4px 0;color:#fff0bd;font-size:.82rem}.ws-boss-dossier-ability p{margin:0;color:#d8eeee;font-size:.62rem;font-weight:700;line-height:1.42}
      .ws-boss-dossier-stars{margin:10px 0 8px;color:#ffe18a;font-size:1rem;letter-spacing:.05em}.ws-boss-dossier-close{width:100%;min-height:48px;border:1px solid #fff0a8;border-radius:15px;background:linear-gradient(#ffe895,#e3b13d 55%,#b97418);box-shadow:0 4px 0 #75430e;color:#092f4b;font-weight:1000;font-size:.72rem;cursor:pointer}
      @media(max-width:430px){.ws-boss-stars{font-size:.22rem}.ws-boss-card.current .ws-boss-stars{font-size:.23rem}.ws-star-rules{font-size:.41rem;padding:6px 7px;margin-bottom:9px}.ws-boss-dossier-card{padding:14px 13px 13px;border-radius:22px}.ws-boss-dossier-portrait{height:122px}.ws-boss-dossier-portrait img{max-width:132px;max-height:132px}}
      @media(prefers-reduced-motion:reduce){.ws-boss-dossier,.ws-boss-dossier-card{scroll-behavior:auto!important}}
    `;
    doc.head.appendChild(style);
  }
  function ensureStarRules(doc){
    const intro=doc.querySelector('.ws-boss-intro-card');
    if(!intro||intro.querySelector('.ws-star-rules'))return;
    const rule=doc.createElement('div');
    rule.className='ws-star-rules';
    rule.innerHTML='<b>STERNE</b> · 3★ ohne Fehler/Hilfe · 2★ max. 1 Fehler + 1 Hilfe · 1★ Sieg';
    intro.querySelector('.ws-boss-intro-start')?.insertAdjacentElement('beforebegin',rule);
  }
  function showDossier(level){
    try{
      const win=frame.contentWindow,doc=frame.contentDocument;
      if(!win||!doc?.body)return;
      const lvl=Math.max(1,Math.min(10,Number(level)||1));
      const boss=bosses[lvl-1];if(!boss)return;
      const stars=readStars(win),best=Math.max(0,Math.min(3,Number(stars[lvl]||0))),current=currentLevel(win,doc)===lvl;
      const status=current?'AKTUELLER BOSS':best?'BESIEGT':'NOCH NICHT ERREICHT';
      doc.querySelector('.ws-boss-dossier')?.remove();
      const overlay=doc.createElement('div');
      overlay.className='ws-boss-dossier';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.setAttribute('aria-label',boss.name+' Boss-Dossier');
      overlay.innerHTML=`<section class="ws-boss-dossier-card"><div class="ws-boss-dossier-kicker">☠ BOSS-DOSSIER</div><div class="ws-boss-dossier-portrait"><img src="${boss.sprite}" alt="${boss.name}"></div><p class="ws-boss-dossier-level">LEVEL ${lvl}</p><h2>${boss.name}</h2><div class="ws-boss-dossier-status">${status}</div><div class="ws-boss-dossier-ability"><small>BESONDERE FÄHIGKEIT</small><b>${boss.ability}</b><p>${boss.description}</p></div><div class="ws-boss-dossier-stars" aria-label="${best} von 3 Sternen">${best?'★'.repeat(best)+'☆'.repeat(3-best):'☆☆☆'}</div><button type="button" class="ws-boss-dossier-close">SCHLIESSEN</button></section>`;
      const onKey=event=>{if(event.key==='Escape')close();};
      const close=()=>{doc.removeEventListener('keydown',onKey);overlay.remove();};
      overlay.querySelector('.ws-boss-dossier-close')?.addEventListener('click',close,{once:true});
      overlay.addEventListener('click',event=>{if(event.target===overlay)close();});
      doc.addEventListener('keydown',onKey);
      doc.body.appendChild(overlay);
      overlay.querySelector('.ws-boss-dossier-close')?.focus();
    }catch(err){console.warn('Word Scramble boss dossier skipped',err)}
  }
  function decorateRoadmap(){
    try{
      const win=frame.contentWindow,doc=frame.contentDocument;
      if(!win||!doc?.body||!doc.head||!bosses.length)return;
      ensureStyles(doc);ensureStarRules(doc);
      const roadmap=doc.querySelector('.ws-boss-roadmap');
      if(!roadmap)return;
      const level=currentLevel(win,doc),stars=readStars(win);
      const defeated=Object.values(stars).filter(v=>Number(v)>0).length;
      const head=roadmap.querySelector('.ws-boss-roadmap-head span:first-child');
      if(head){head.classList.add('ws-campaign-count');head.textContent='☠ BOSS-KAMPAGNE · '+defeated+'/10';}
      const status=roadmap.querySelector('.ws-boss-roadmap-head span:last-child');
      if(status)status.textContent='ANTIPPEN FÜR INFO';
      const track=roadmap.querySelector('.ws-boss-roadmap-track');
      if(!track)return;
      const cards=Array.from(track.querySelectorAll('.ws-boss-card'));
      if(cards.length!==bosses.length)return;
      roadmap.dataset.wsCampaignLevel=String(level);
      cards.forEach(card=>{
        const lvl=Math.max(1,Math.min(10,Number(card.dataset.level)||1));
        const best=Math.max(0,Math.min(3,Number(stars[lvl]||0)));
        card.classList.toggle('ws-campaign-defeated',best>0);
        const copy=card.querySelector('.ws-boss-card-copy');
        if(copy){
          let starLine=copy.querySelector('.ws-boss-stars');
          if(!starLine){starLine=doc.createElement('span');starLine.className='ws-boss-stars';copy.appendChild(starLine);}
          starLine.textContent=best?'★'.repeat(best)+'☆'.repeat(3-best):'☆☆☆';
          if(best)starLine.setAttribute('aria-label',best+' von 3 Sternen');else starLine.removeAttribute('aria-label');
        }
        const current=card.classList.contains('current');
        const defeatedMark=card.querySelector('.ws-defeated-mark');
        if(best&&!current&&!defeatedMark){const mark=doc.createElement('em');mark.className='ws-defeated-mark';mark.textContent='✓';card.appendChild(mark);}
        else if((!best||current)&&defeatedMark)defeatedMark.remove();
      });
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
      document.addEventListener('ws-hint-used',event=>{if(s.boss&&event.detail?.type)encounterHints++;});
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
  const id='ws-boss-hints-v2-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-hints-v2.js';
  document.head.appendChild(script);
})();

(()=>{
  const id='ws-boss-victory-loot-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-victory-loot.js';
  document.head.appendChild(script);
})();