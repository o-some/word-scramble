(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureStyles(doc){
    if(doc.getElementById('ws-kai-sentence-style'))return;
    const style=doc.createElement('style');
    style.id='ws-kai-sentence-style';
    style.textContent=`
      .card.ws-kai-sentence-mode .prompt h1{font-size:clamp(1.05rem,4vw,1.45rem)!important;line-height:1.2!important;max-width:24ch!important;margin-left:auto!important;margin-right:auto!important}
      .card.ws-kai-sentence-mode .prompt p{max-width:36ch!important;margin-left:auto!important;margin-right:auto!important}
      .card.ws-kai-sentence-mode .slots{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:6px!important;margin:8px auto 10px!important;min-height:44px!important}
      .card.ws-kai-sentence-mode .slots .slot{width:auto!important;min-width:52px!important;max-width:100%!important;height:auto!important;min-height:36px!important;padding:6px 9px!important;box-sizing:border-box!important;border-radius:10px!important;font-size:.66rem!important;line-height:1.05!important;white-space:nowrap!important}
      .card.ws-kai-sentence-mode .tiles{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:7px!important;margin:8px auto!important}
      .card.ws-kai-sentence-mode .tiles .tile{width:auto!important;min-width:52px!important;max-width:100%!important;height:auto!important;min-height:40px!important;padding:7px 10px!important;box-sizing:border-box!important;font-size:.69rem!important;line-height:1.05!important;white-space:nowrap!important}
      .card.ws-kai-sentence-mode .slot.ws-anchor-ghost:not(.filled)::after{font-size:.58rem!important;line-height:1.05!important;padding:4px!important;text-align:center!important}
      @media(max-width:430px){
        .card.ws-kai-sentence-mode .prompt h1{font-size:.98rem!important;max-width:22ch!important}
        .card.ws-kai-sentence-mode .prompt p{font-size:.52rem!important;line-height:1.25!important}
        .card.ws-kai-sentence-mode .slots{gap:4px!important;margin:5px auto 7px!important;min-height:38px!important}
        .card.ws-kai-sentence-mode .slots .slot{min-width:44px!important;min-height:31px!important;padding:5px 7px!important;font-size:.56rem!important}
        .card.ws-kai-sentence-mode .tiles{gap:5px!important;margin:6px auto!important}
        .card.ws-kai-sentence-mode .tiles .tile{min-width:44px!important;min-height:35px!important;padding:6px 8px!important;font-size:.58rem!important}
      }
    `;
    doc.head.appendChild(style);
  }

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
      const KAI_SENTENCES={
        easy:[
          {source:'Tula sieht die Insel.',target:'TULA SEES THE ISLAND'},
          {source:'Wir segeln zum Hafen.',target:'WE SAIL TO THE HARBOR'},
          {source:'Das Schiff folgt der Karte.',target:'THE SHIP FOLLOWS THE MAP'},
          {source:'Der Pirat sucht den Schatz.',target:'THE PIRATE LOOKS FOR THE TREASURE'}
        ],
        medium:[
          {source:'Der Pirat versteckt den goldenen Schlüssel.',target:'THE PIRATE HIDES THE GOLDEN KEY'},
          {source:'Unser Schiff fährt durch den starken Sturm.',target:'OUR SHIP SAILS THROUGH THE STRONG STORM'},
          {source:'Der Kapitän sucht eine sichere Insel.',target:'THE CAPTAIN LOOKS FOR A SAFE ISLAND'},
          {source:'Tula findet die Karte im alten Hafen.',target:'TULA FINDS THE MAP IN THE OLD HARBOR'}
        ],
        hard:[
          {source:'Der mutige Pirat findet den Schatz vor Sonnenuntergang.',target:'THE BRAVE PIRATE FINDS THE TREASURE BEFORE SUNSET'},
          {source:'Wir folgen der alten Karte durch den Sturm.',target:'WE FOLLOW THE OLD MAP THROUGH THE STORM'},
          {source:'Tula bringt den goldenen Kompass sicher zum Hafen.',target:'TULA BRINGS THE GOLDEN COMPASS SAFELY TO THE HARBOR'},
          {source:'Der Kapitän versteckt die Karte unter dem alten Deck.',target:'THE CAPTAIN HIDES THE MAP UNDER THE OLD DECK'}
        ]
      };
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
        return {source,target,sentence:false};
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
      const currentLevel=()=>{
        const match=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);
        if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
        try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
      };
      const chooseBossWord=()=>{
        const pool=bossPool();
        const [min,max]=rangeForDifficulty();
        let candidates=pool.filter(word=>word.target.length>=min&&word.target.length<=max&&word.target!==lastBossAnswer);
        if(!candidates.length)candidates=pool.filter(word=>word.target!==lastBossAnswer);
        if(!candidates.length)candidates=pool;
        const word=candidates[Math.floor(Math.random()*candidates.length)]||{source:'Insel',target:'ISLAND',sentence:false};
        lastBossAnswer=word.target;
        return word;
      };
      const chooseKaiSentence=()=>{
        const pool=KAI_SENTENCES[s.diff]||KAI_SENTENCES.medium;
        let candidates=pool.filter(item=>item.target!==lastBossAnswer);
        if(!candidates.length)candidates=pool;
        const sentence=candidates[Math.floor(Math.random()*candidates.length)]||KAI_SENTENCES.easy[0];
        lastBossAnswer=sentence.target;
        return {source:sentence.source,target:sentence.target.toUpperCase(),sentence:true};
      };
      const chooseBossChallenge=()=>currentLevel()===1?chooseKaiSentence():chooseBossWord();
      const answer=()=>String(currentBossWord?.target||'').toUpperCase();
      const units=()=>{
        if(!currentBossWord)return [];
        return currentBossWord.sentence?answer().split(/\\s+/).filter(Boolean):Array.from(answer());
      };
      const unitSignature=value=>Array.from(value||[]).map(v=>String(v||'').toUpperCase()).sort().join('|');

      window.WS_GET_BOSS_WORD=()=>currentBossWord?{...currentBossWord}:null;
      window.WS_GET_BOSS_ANSWER=()=>answer();
      window.WS_GET_BOSS_PROMPT=()=>String(currentBossWord?.source||'');
      window.WS_GET_BOSS_UNITS=()=>units().slice();
      window.WS_IS_BOSS_SENTENCE_MODE=()=>Boolean(currentBossWord?.sentence);

      function ensureBossTiles(){
        if(!s.boss||!currentBossWord)return;
        const expected=units();
        const existing=Array.isArray(s.tiles)?s.tiles:[];
        if(unitSignature(existing)!==unitSignature(expected)){
          const shuffled=shuffle([...expected]);
          if(shuffled.length>1&&shuffled.join('|')===expected.join('|'))shuffled.push(shuffled.shift());
          s.tiles=shuffled;
          s.sel=[];
        }
      }

      function patchBossDom(){
        if(!s.boss||!currentBossWord)return;
        const targetUnits=units();
        const card=document.querySelector('.card');
        card?.classList.toggle('ws-kai-sentence-mode',Boolean(currentBossWord.sentence));
        const prompt=document.querySelector('.prompt');
        const title=prompt?.querySelector('h1');
        const copy=prompt?.querySelector('p');
        if(title)title.textContent=currentBossWord.source;
        if(copy)copy.textContent=currentBossWord.sentence
          ?'Übersetze den ganzen Satz ins Englische und ordne die Wörter richtig.'
          :'Übersetze ins Englische und setze das Bosswort aus den Buchstaben zusammen.';

        const slots=document.querySelector('.slots');
        if(slots){
          slots.style.setProperty('--n',String(targetUnits.length));
          const nodes=Array.from(slots.querySelectorAll('.slot'));
          while(nodes.length>targetUnits.length){nodes.pop()?.remove();}
          while(slots.querySelectorAll('.slot').length<targetUnits.length){
            const slot=document.createElement('div');
            slot.className='slot';
            slots.appendChild(slot);
          }
          Array.from(slots.querySelectorAll('.slot')).forEach((slot,i)=>{
            slot.classList.toggle('filled',Boolean(s.sel[i]));
            slot.textContent=s.sel[i]?.l||'';
          });
        }
        document.querySelector('.tiles')?.style.setProperty('--n',String(targetUnits.length));

        if(currentLevel()===7){
          const chain=document.querySelector('.ws-thorne-chain b');
          if(chain)chain.textContent=thorneChain===0?'0/2':'1/2';
        }
        if(currentLevel()===8){
          const first=targetUnits[0]||'';
          const tiles=Array.from(document.querySelectorAll('.tiles .tile[data-i]'));
          const wrong=tiles.find(btn=>btn.textContent.trim().toUpperCase()!==first)||tiles[0];
          document.querySelectorAll('.ws-corvin-route').forEach(el=>el.classList.remove('ws-corvin-route'));
          wrong?.classList.add('ws-corvin-route');
        }
      }

      function bindBoss(){
        const targetUnits=units();
        document.querySelectorAll('.tile[data-i]').forEach(button=>{
          button.onclick=()=>{
            const index=Number(button.dataset.i);
            if(s.feedback||!Number.isFinite(index)||s.sel.length>=targetUnits.length||s.sel.some(v=>v.id===index))return;
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
          if(k>=targetUnits.length)return;
          const index=s.tiles.findIndex((unit,i)=>String(unit).toUpperCase()===targetUnits[k]&&!s.sel.some(v=>v.id===i));
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
        currentBossWord=chooseBossChallenge();
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
        const selected=s.sel.map(x=>String(x.l||'').toUpperCase());
        const targetUnits=units();
        if(selected.length!==targetUnits.length)return;
        const value=currentBossWord.sentence?selected.join(' '):selected.join('');
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
      ensureStyles(doc);
      if(Array.isArray(window.WS_BOSS_META)&&window.WS_BOSS_META[0]){
        window.WS_BOSS_META[0].description='Kai wirbelt die Wörter deiner Übersetzung durcheinander. Übersetze den ganzen Satz und bringe die Wörter in die richtige Reihenfolge.';
      }
      installRuntime(doc);
    }catch(err){console.warn('Word Scramble variable boss words skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
