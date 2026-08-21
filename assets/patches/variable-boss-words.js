(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  function installRuntime(doc){
    if(doc.getElementById('ws-variable-boss-words-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-variable-boss-words-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_VARIABLE_BOSS_WORDS__)return;
      window.__WS_VARIABLE_BOSS_WORDS__=true;

      const EXTRA_BOSS_WORDS=[
        ['Schiff','SHIP'],['Kompass','COMPASS'],['entdecken','DISCOVER'],['Horizont','HORIZON'],
        ['navigieren','NAVIGATE'],['Festung','FORTRESS'],['Schiffbruch','SHIPWRECK'],['Anker','ANCHOR'],
        ['Sturm','STORM'],['Strand','BEACH']
      ];
      const baseRender=render;
      const baseSetup=setup;
      const baseBind=bind;
      const baseCheck=check;
      let currentBossWord=null;
      let lastBossAnswer='';
      let thorneChain=0;

      const normalizePair=pair=>{
        if(!Array.isArray(pair)||pair.length<2)return null;
        const source=String(pair[0]||'').trim();
        const target=String(pair[1]||'').trim().toUpperCase();
        if(!source||!/^[A-Z]+$/.test(target))return null;
        return {source,target};
      };
      const bossPool=()=>{
        const source=[];
        try{if(typeof WORDS!=='undefined'&&Array.isArray(WORDS))source.push(...WORDS);}catch{}
        source.push(...EXTRA_BOSS_WORDS);
        const seen=new Set();
        return source.map(normalizePair).filter(Boolean).filter(word=>{
          if(seen.has(word.target))return false;
          seen.add(word.target);
          return true;
        });
      };
      const rangeForDifficulty=()=>s.diff==='hard'?[7,11]:s.diff==='medium'?[5,8]:[3,6];
      const chooseBossWord=()=>{
        const pool=bossPool();
        const [min,max]=rangeForDifficulty();
        let candidates=pool.filter(word=>word.target.length>=min&&word.target.length<=max&&word.target!==lastBossAnswer);
        if(!candidates.length)candidates=pool.filter(word=>word.target!==lastBossAnswer);
        if(!candidates.length)candidates=pool;
        const word=candidates[Math.floor(Math.random()*candidates.length)]||{source:'Insel',target:'ISLAND'};
        lastBossAnswer=word.target;
        return word;
      };
      const answer=()=>String(currentBossWord?.target||'').toUpperCase();
      const answerSignature=value=>Array.from(String(value||'')).sort().join('');
      const currentLevel=()=>{
        const match=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);
        if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
        try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
      };

      window.WS_GET_BOSS_WORD=()=>currentBossWord?{...currentBossWord}:null;
      window.WS_GET_BOSS_ANSWER=()=>answer();
      window.WS_GET_BOSS_PROMPT=()=>String(currentBossWord?.source||'');

      function ensureBossTiles(){
        if(!s.boss||!currentBossWord)return;
        const expected=answer();
        const existing=Array.isArray(s.tiles)?s.tiles.join('').toUpperCase():'';
        if(answerSignature(existing)!==answerSignature(expected))s.tiles=shuffle([...expected]);
      }

      function patchBossDom(){
        if(!s.boss||!currentBossWord)return;
        const target=answer();
        const prompt=document.querySelector('.prompt');
        const title=prompt?.querySelector('h1');
        const copy=prompt?.querySelector('p');
        if(title)title.textContent=currentBossWord.source;
        if(copy)copy.textContent='Übersetze ins Englische und setze das Bosswort aus den Buchstaben zusammen.';

        const slots=document.querySelector('.slots');
        if(slots){
          slots.style.setProperty('--n',String(target.length));
          const nodes=Array.from(slots.querySelectorAll('.slot'));
          while(nodes.length>target.length){nodes.pop()?.remove();}
          while(slots.querySelectorAll('.slot').length<target.length){
            const slot=document.createElement('div');
            slot.className='slot';
            slots.appendChild(slot);
          }
          Array.from(slots.querySelectorAll('.slot')).forEach((slot,i)=>{
            slot.classList.toggle('filled',Boolean(s.sel[i]));
            slot.textContent=s.sel[i]?.l||'';
          });
        }
        document.querySelector('.tiles')?.style.setProperty('--n',String(target.length));

        if(currentLevel()===7){
          const chain=document.querySelector('.ws-thorne-chain b');
          if(chain)chain.textContent=thorneChain===0?'0/2':'1/2';
        }
        if(currentLevel()===8){
          const first=target[0]||'';
          const tiles=Array.from(document.querySelectorAll('.tiles .tile[data-i]'));
          const wrong=tiles.find(btn=>btn.textContent.trim().toUpperCase()!==first)||tiles[0];
          document.querySelectorAll('.ws-corvin-route').forEach(el=>el.classList.remove('ws-corvin-route'));
          wrong?.classList.add('ws-corvin-route');
        }
      }

      function bindBoss(){
        const target=answer();
        document.querySelectorAll('.tile[data-i]').forEach(button=>{
          button.onclick=()=>{
            const index=Number(button.dataset.i);
            if(s.feedback||!Number.isFinite(index)||s.sel.length>=target.length||s.sel.some(v=>v.id===index))return;
            s.sel.push({id:index,l:s.tiles[index]});
            render();
          };
        });
        const undo=document.getElementById('undo');
        const clear=document.getElementById('clear');
        const hint=document.getElementById('hint');
        const checkButton=document.getElementById('check');
        if(undo)undo.onclick=()=>{if(!s.feedback){s.sel.pop();render();}};
        if(clear)clear.onclick=()=>{if(!s.feedback){s.sel=[];render();}};
        if(hint)hint.onclick=()=>{
          if(s.feedback)return;
          const k=s.sel.length;
          if(k>=target.length)return;
          const index=s.tiles.findIndex((letter,i)=>String(letter).toUpperCase()===target[k]&&!s.sel.some(v=>v.id===i));
          if(index>=0){s.sel.push({id:index,l:s.tiles[index]});render();}
        };
        if(checkButton)checkButton.onclick=check;
      }

      function resolveBossWord(ok,target){
        s.feedback={ok,msg:ok?'Sauber gelöst.':'Richtig wäre: '+target};
        if(ok){s.bossHp--;s.score+=180;s.shells++;s.combo++;}
        else s.bossMiss++;
        render();
        setTimeout(()=>{
          if(s.bossHp<=0||s.bossMiss>=3){
            s.boss=false;
            s.normal=0;
            s.bossHp=3;
            s.bossMiss=0;
            s.i++;
            currentBossWord=null;
            thorneChain=0;
          }
          s.feedback=null;
          setup();
        },1000);
      }

      setup=function(){
        if(!s.boss){
          currentBossWord=null;
          thorneChain=0;
          return baseSetup();
        }
        currentBossWord=chooseBossWord();
        const result=baseSetup();
        document.dispatchEvent(new CustomEvent('ws-boss-word-changed',{detail:{...currentBossWord,level:currentLevel()}}));
        return result;
      };

      bind=function(){
        if(!s.boss||!currentBossWord)return baseBind();
        bindBoss();
      };

      check=function(){
        if(!s.boss||!currentBossWord)return baseCheck();
        const target=answer();
        const value=s.sel.map(x=>String(x.l||'').toUpperCase()).join('');
        if(value.length!==target.length)return;
        const ok=value===target;
        if(currentLevel()===7){
          if(!ok){thorneChain=0;return resolveBossWord(false,target);}
          if(thorneChain===0){
            thorneChain=1;
            s.feedback={ok:true,msg:'Doppelschlag 1/2 – noch ein richtiges Wort!'};
            render();
            setTimeout(()=>{if(!s.boss)return;s.feedback=null;setup();},900);
            return;
          }
          thorneChain=0;
        }
        resolveBossWord(ok,target);
      };

      render=function(){
        if(s.boss&&currentBossWord)ensureBossTiles();
        baseRender();
        if(s.boss&&currentBossWord)patchBossDom();
      };

      if(s.boss)setup();else render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.documentElement)return;
      installRuntime(doc);
    }catch(err){console.warn('Word Scramble variable boss words skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
