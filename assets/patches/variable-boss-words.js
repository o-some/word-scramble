(()=>{
  'use strict';

  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-sentence-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-sentence-style';
    style.textContent=`
      .card.ws-boss-sentence-mode .prompt h1{font-size:clamp(1rem,3.8vw,1.38rem)!important;line-height:1.2!important;max-width:28ch!important;margin-left:auto!important;margin-right:auto!important}
      .card.ws-boss-sentence-mode .prompt p{max-width:38ch!important;margin-left:auto!important;margin-right:auto!important}
      .card.ws-boss-sentence-mode .slots{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:6px!important;margin:8px auto 10px!important;min-height:44px!important}
      .card.ws-boss-sentence-mode .slots .slot{width:auto!important;min-width:52px!important;max-width:100%!important;height:auto!important;min-height:36px!important;padding:6px 9px!important;box-sizing:border-box!important;border-radius:10px!important;font-size:.66rem!important;line-height:1.05!important;white-space:nowrap!important}
      .card.ws-boss-sentence-mode .tiles{display:flex!important;flex-wrap:wrap!important;justify-content:center!important;align-items:center!important;gap:7px!important;margin:8px auto!important}
      .card.ws-boss-sentence-mode .tiles .tile{width:auto!important;min-width:52px!important;max-width:100%!important;height:auto!important;min-height:40px!important;padding:7px 10px!important;box-sizing:border-box!important;font-size:.69rem!important;line-height:1.05!important;white-space:nowrap!important}
      .card.ws-boss-sentence-mode .slot.ws-anchor-ghost:not(.filled)::after{font-size:.58rem!important;line-height:1.05!important;padding:4px!important;text-align:center!important}
      .card.ws-boss-sentence-mode .tile.ws-decoy,.card.ws-boss-sentence-mode .tile.ws-varkos-decoy{min-width:64px!important;padding-left:10px!important;padding-right:10px!important;font-size:.6rem!important;letter-spacing:.02em}
      @media(max-width:430px){
        .card.ws-boss-sentence-mode .prompt h1{font-size:.94rem!important;max-width:25ch!important}
        .card.ws-boss-sentence-mode .prompt p{font-size:.50rem!important;line-height:1.25!important}
        .card.ws-boss-sentence-mode .slots{gap:4px!important;margin:5px auto 7px!important;min-height:38px!important}
        .card.ws-boss-sentence-mode .slots .slot{min-width:42px!important;min-height:31px!important;padding:5px 7px!important;font-size:.54rem!important}
        .card.ws-boss-sentence-mode .tiles{gap:5px!important;margin:6px auto!important}
        .card.ws-boss-sentence-mode .tiles .tile{min-width:42px!important;min-height:35px!important;padding:6px 8px!important;font-size:.56rem!important}
        .card.ws-boss-sentence-mode .tile.ws-decoy,.card.ws-boss-sentence-mode .tile.ws-varkos-decoy{min-width:54px!important;font-size:.51rem!important}
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

      const BOSS_SENTENCES={
        1:[
          {source:'Tula sieht die Insel hinter dem alten Leuchtturm.',target:'TULA SEES THE ISLAND BEHIND THE OLD LIGHTHOUSE'},
          {source:'Wir segeln mit der Karte sicher durch den Hafen.',target:'WE SAIL SAFELY THROUGH THE HARBOR WITH THE MAP'},
          {source:'Der junge Pirat sucht den Schatz vor Sonnenuntergang.',target:'THE YOUNG PIRATE LOOKS FOR THE TREASURE BEFORE SUNSET'}
        ],
        2:[
          {source:'Kapitän Brax versteckt ein wichtiges Wort vor deiner Mannschaft.',target:'CAPTAIN BRAX HIDES AN IMPORTANT WORD FROM YOUR CREW'},
          {source:'Tula folgt dem ruhigen Schiff durch den dichten Morgennebel.',target:'TULA FOLLOWS THE QUIET SHIP THROUGH THE THICK MORNING FOG'},
          {source:'Der Kapitän bewacht den goldenen Schlüssel unter seinem Mantel.',target:'THE CAPTAIN GUARDS THE GOLDEN KEY UNDER HIS COAT'}
        ],
        3:[
          {source:'Blackfinn legt eine falsche Spur zwischen die richtigen Hinweise.',target:'BLACKFINN PLACES A FALSE CLUE BETWEEN THE CORRECT SIGNS'},
          {source:'Die Mannschaft erkennt den Köder bevor das Schiff den Felsen erreicht.',target:'THE CREW SPOTS THE DECOY BEFORE THE SHIP REACHES THE ROCKS'},
          {source:'Tula prüft jedes Wort bevor sie der geheimen Karte vertraut.',target:'TULA CHECKS EVERY WORD BEFORE SHE TRUSTS THE SECRET MAP'}
        ],
        4:[
          {source:'Wir müssen den Leuchtturm erreichen bevor der Sturm zurückkehrt.',target:'WE MUST REACH THE LIGHTHOUSE BEFORE THE STORM RETURNS'},
          {source:'Roderick gibt der Mannschaft nur wenig Zeit für die sichere Route.',target:'RODERICK GIVES THE CREW LITTLE TIME FOR THE SAFE ROUTE'},
          {source:'Tula ordnet die Wörter schnell bevor die letzte Glocke erklingt.',target:'TULA ORDERS THE WORDS QUICKLY BEFORE THE FINAL BELL RINGS'}
        ],
        5:[
          {source:'Der Baron versiegelt den zweiten Platz bis die Glocke erklingt.',target:'THE BARON SEALS THE SECOND PLACE UNTIL THE BELL RINGS'},
          {source:'Vargas schützt die Schatzkammer mit einem schweren goldenen Schloss.',target:'VARGAS PROTECTS THE TREASURE ROOM WITH A HEAVY GOLDEN LOCK'},
          {source:'Die Mannschaft wartet kurz bevor sie den nächsten Platz benutzen kann.',target:'THE CREW WAITS BRIEFLY BEFORE IT CAN USE THE NEXT PLACE'}
        ],
        6:[
          {source:'Ironhook zieht ein gewähltes Wort zurück auf das alte Deck.',target:'IRONHOOK PULLS A CHOSEN WORD BACK ONTO THE OLD DECK'},
          {source:'Der Enterhaken reißt einen Teil deiner Lösung aus der Reihe.',target:'THE GRAPPLING HOOK PULLS PART OF YOUR ANSWER OUT OF LINE'},
          {source:'Tula setzt das verlorene Wort ruhig wieder an seinen Platz.',target:'TULA CALMLY PUTS THE LOST WORD BACK IN ITS PLACE'}
        ],
        7:[
          {source:'Admiral Thorne verlangt zwei richtige Sätze für einen starken Treffer.',target:'ADMIRAL THORNE DEMANDS TWO CORRECT SENTENCES FOR A STRONG HIT'},
          {source:'Tula folgt dem nördlichen Stern über das stille dunkle Meer.',target:'TULA FOLLOWS THE NORTHERN STAR ACROSS THE QUIET DARK SEA'},
          {source:'Die Mannschaft muss zweimal hintereinander die richtige Route finden.',target:'THE CREW MUST FIND THE CORRECT ROUTE TWICE IN A ROW'}
        ],
        8:[
          {source:'Corvins Karte zeigt auf eine Bucht hinter den schwarzen Felsen.',target:'CORVINS MAP POINTS TO A BAY BEHIND THE BLACK ROCKS'},
          {source:'Eine falsche Fährte versucht die Mannschaft vom richtigen Weg abzulenken.',target:'A FALSE TRAIL TRIES TO LEAD THE CREW AWAY FROM THE RIGHT PATH'},
          {source:'Tula vertraut den Wörtern mehr als dem blinkenden Zeichen auf der Karte.',target:'TULA TRUSTS THE WORDS MORE THAN THE FLASHING SIGN ON THE MAP'}
        ],
        9:[
          {source:'Dunkle Schatten verdecken zwei Wörter bevor sie wieder sichtbar werden.',target:'DARK SHADOWS COVER TWO WORDS BEFORE THEY BECOME VISIBLE AGAIN'},
          {source:'Azrak hüllt einen Teil der Lösung in kalten violetten Nebel.',target:'AZRAK WRAPS PART OF THE ANSWER IN COLD PURPLE FOG'},
          {source:'Tula merkt sich die Reihenfolge auch wenn die Wörter verschwinden.',target:'TULA REMEMBERS THE ORDER EVEN WHEN THE WORDS DISAPPEAR'}
        ],
        10:[
          {source:'Der Piratenkönig prüft jede Fähigkeit vor dem letzten goldenen Tor.',target:'THE PIRATE KING TESTS EVERY SKILL BEFORE THE FINAL GOLDEN GATE'},
          {source:'Varkos verbindet Schatten Köder und Zeitdruck in seiner letzten Prüfung.',target:'VARKOS COMBINES SHADOWS DECOYS AND TIME PRESSURE IN HIS FINAL TRIAL'},
          {source:'Tula führt ihre Mannschaft sicher durch die schwerste Prüfung der Insel.',target:'TULA LEADS HER CREW SAFELY THROUGH THE HARDEST TRIAL ON THE ISLAND'}
        ]
      };
      const DECOY_WORDS=['ALWAYS','NEVER','CANNON','MOON','SECRET','CAPTAIN','ISLAND','STORM','ANCHOR','COMPASS'];
      const baseRender=render;
      const baseSetup=setup;
      const baseBind=bind;
      const baseCheck=check;
      let currentBossWord=null;
      let lastBossAnswer='';
      let thorneChain=0;

      const currentLevel=()=>{
        const match=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);
        if(match)return Math.max(1,Math.min(10,Number(match[1])||1));
        try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}
      };
      const chooseBossSentence=()=>{
        const level=currentLevel();
        const pool=BOSS_SENTENCES[level]||BOSS_SENTENCES[1];
        let candidates=pool.filter(item=>item.target!==lastBossAnswer);
        if(!candidates.length)candidates=pool;
        const sentence=candidates[Math.floor(Math.random()*candidates.length)]||pool[0];
        lastBossAnswer=sentence.target;
        return {source:sentence.source,target:sentence.target.toUpperCase(),sentence:true,level};
      };
      const answer=()=>String(currentBossWord?.target||'').toUpperCase();
      const units=()=>answer().split(/\\s+/).filter(Boolean);
      const unitSignature=value=>Array.from(value||[]).map(v=>String(v||'').toUpperCase()).sort().join('|');

      window.WS_GET_BOSS_WORD=()=>currentBossWord?{...currentBossWord}:null;
      window.WS_GET_BOSS_ANSWER=()=>answer();
      window.WS_GET_BOSS_PROMPT=()=>String(currentBossWord?.source||'');
      window.WS_GET_BOSS_UNITS=()=>units().slice();
      window.WS_IS_BOSS_SENTENCE_MODE=()=>Boolean(currentBossWord?.sentence);

      function chooseDecoy(){
        const used=new Set(units());
        return DECOY_WORDS.find(word=>!used.has(word))||'CANNON';
      }

      function patchSentenceDecoys(){
        if(!s.boss||!currentBossWord)return;
        const decoy=chooseDecoy();
        document.querySelectorAll('.tile.ws-decoy').forEach(el=>{
          if(el.dataset.wsSentenceDecoy==='1')return;
          el.dataset.wsSentenceDecoy='1';
          el.textContent=decoy;
          el.setAttribute('aria-label',decoy+', Köderwort');
        });
        document.querySelectorAll('.tile.ws-varkos-decoy').forEach(el=>{
          if(el.dataset.wsSentenceDecoy==='1')return;
          el.dataset.wsSentenceDecoy='1';
          el.textContent=decoy;
          el.setAttribute('aria-label',decoy+', königliches Köderwort');
        });
      }

      function patchAbilityCopy(){
        const lvl=currentLevel();
        const labels={1:'Deckschrubber-Trick',2:'Verdecktes Wort',3:'Köderwort',4:'Zeitdruck',5:'Versiegelter Platz',6:'Enterhaken',7:'Doppelschlag',8:'Falsche Fährte',9:'Schattenfluch',10:'Königsprüfung'};
        const badge=document.querySelector('.ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10');
        if(badge&&labels[lvl]&&badge.textContent!==labels[lvl])badge.textContent=labels[lvl];
        if(lvl===7){
          const chain=document.querySelector('.ws-thorne-chain');
          if(chain){
            const value=thorneChain===0?'0/2':'1/2';
            const html='⚔️ DOPPELSCHLAG · <b>'+value+'</b> · Zwei richtige Sätze für einen Treffer';
            if(chain.innerHTML!==html)chain.innerHTML=html;
          }
        }
        if(lvl===5){
          const note=document.querySelector('.ws-vargas-note');
          const text='Vargas versiegelt den zweiten Satzplatz kurz.';
          if(note&&note.textContent!==text)note.textContent=text;
        }
      }

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
        card?.classList.add('ws-boss-sentence-mode');
        card?.classList.remove('ws-kai-sentence-mode');
        const prompt=document.querySelector('.prompt');
        const title=prompt?.querySelector('h1');
        const copy=prompt?.querySelector('p');
        if(title)title.textContent=currentBossWord.source;
        if(copy)copy.textContent='Übersetze den ganzen Satz ins Englische und ordne die Wörter richtig.';

        const slots=document.querySelector('.slots');
        if(slots){
          slots.style.setProperty('--n',String(targetUnits.length));
          const nodes=Array.from(slots.querySelectorAll('.slot'));
          while(nodes.length>targetUnits.length){nodes.pop()?.remove();}
          while(slots.querySelectorAll('.slot').length<targetUnits.length){
            const slot=document.createElement('div');slot.className='slot';slots.appendChild(slot);
          }
          Array.from(slots.querySelectorAll('.slot')).forEach((slot,i)=>{
            slot.classList.toggle('filled',Boolean(s.sel[i]));
            slot.textContent=s.sel[i]?.l||'';
          });
        }
        document.querySelector('.tiles')?.style.setProperty('--n',String(targetUnits.length));

        if(currentLevel()===8){
          const first=targetUnits[0]||'';
          const tiles=Array.from(document.querySelectorAll('.tiles .tile[data-i]'));
          const wrong=tiles.find(btn=>btn.textContent.trim().toUpperCase()!==first)||tiles[0];
          document.querySelectorAll('.ws-corvin-route').forEach(el=>el.classList.remove('ws-corvin-route'));
          wrong?.classList.add('ws-corvin-route');
        }
        patchSentenceDecoys();
        patchAbilityCopy();
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

      function resolveBossSentence(ok,target){
        s.feedback={ok,msg:ok?'Satz richtig gelöst.':'Richtig wäre: '+target};
        if(ok){s.bossHp--;s.score+=180;s.shells++;s.combo++;}
        else s.bossMiss++;
        render();
        setTimeout(()=>{
          if(s.bossHp<=0||s.bossMiss>=3){
            s.boss=false;s.normal=0;s.bossHp=3;s.bossMiss=0;s.i++;currentBossWord=null;thorneChain=0;
          }
          s.feedback=null;setup();
        },1000);
      }

      setup=function(){
        if(!s.boss){currentBossWord=null;thorneChain=0;return baseSetup();}
        currentBossWord=chooseBossSentence();
        const result=baseSetup();
        document.dispatchEvent(new CustomEvent('ws-boss-word-changed',{detail:{...currentBossWord,level:currentLevel()}}));
        return result;
      };

      bind=function(){if(!s.boss||!currentBossWord)return baseBind();bindBoss();};

      check=function(){
        if(!s.boss||!currentBossWord)return baseCheck();
        const target=answer();
        const selected=s.sel.map(x=>String(x.l||'').toUpperCase());
        const targetUnits=units();
        if(selected.length!==targetUnits.length)return;
        const value=selected.join(' ');
        const ok=value===target;
        if(currentLevel()===7){
          if(!ok){thorneChain=0;return resolveBossSentence(false,target);}
          if(thorneChain===0){
            thorneChain=1;
            s.feedback={ok:true,msg:'Doppelschlag 1/2 – noch ein richtiger Satz!'};
            render();
            setTimeout(()=>{if(!s.boss)return;s.feedback=null;setup();},900);
            return;
          }
          thorneChain=0;
        }
        resolveBossSentence(ok,target);
      };

      render=function(){
        if(s.boss&&currentBossWord)ensureBossTiles();
        baseRender();
        if(s.boss&&currentBossWord)patchBossDom();
      };

      const target=document.getElementById('game')||document.body;
      if(target)new MutationObserver(()=>{if(s.boss&&currentBossWord){patchSentenceDecoys();patchAbilityCopy();}}).observe(target,{childList:true,subtree:true});

      if(s.boss)setup();else render();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.documentElement)return;
      ensureStyles(doc);
      installRuntime(doc);
    }catch(err){console.warn('Word Scramble boss sentence mode skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
