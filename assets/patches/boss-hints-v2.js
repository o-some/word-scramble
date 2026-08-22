(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  function ensureStyles(doc){
    if(doc.getElementById('ws-boss-hints-v2-style'))return;
    const style=doc.createElement('style');
    style.id='ws-boss-hints-v2-style';
    style.textContent=`
      #hint.ws-boss-help-button{position:relative}
      #hint.ws-boss-help-button.ws-hint-suggested{border-color:#ffe18a!important;box-shadow:0 0 0 1px rgba(255,225,138,.20),0 0 16px rgba(255,210,82,.26)!important;animation:wsHintSuggest 2.8s ease-in-out infinite}
      @keyframes wsHintSuggest{0%,100%{filter:brightness(1)}50%{filter:brightness(1.16)}}
      .ws-hint-menu{position:absolute;z-index:32;left:8px;right:8px;bottom:70px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;padding:7px;border:1px solid rgba(255,216,111,.72);border-radius:15px;background:linear-gradient(160deg,rgba(4,54,82,.98),rgba(1,27,47,.99));box-shadow:0 16px 34px rgba(0,8,20,.52),inset 0 1px rgba(255,255,255,.08);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
      .ws-hint-choice{min-height:44px;padding:5px 4px;border:1px solid rgba(239,199,102,.38);border-radius:11px;background:rgba(255,255,255,.055);color:#fff0bd;font-size:.49rem;font-weight:950;line-height:1.15;cursor:pointer}.ws-hint-choice b{display:block;margin-bottom:2px;color:#ffe18a;font-size:.62rem}.ws-hint-choice:disabled{opacity:.38;cursor:not-allowed}.ws-hint-choice:active:not(:disabled){transform:translateY(1px)}
      .tile.ws-trail-candidate{outline:2px solid rgba(112,217,173,.92)!important;outline-offset:2px!important;box-shadow:inset 0 2px rgba(255,255,255,.44),0 5px 0 #78460e,0 0 18px rgba(112,217,173,.30)!important}
      .tile.ws-trail-candidate::after{content:'🧭';position:absolute;top:-10px;left:50%;transform:translateX(-50%);font-size:.72rem;filter:drop-shadow(0 2px 4px rgba(0,0,0,.45))}
      .slot.ws-anchor-ghost:not(.filled){position:relative}.slot.ws-anchor-ghost:not(.filled)::after{content:attr(data-ws-ghost);position:absolute;inset:0;display:grid;place-items:center;color:#ffe18a;font:900 .9rem Georgia,serif;opacity:.58;text-shadow:0 0 8px rgba(255,216,111,.45)}
      .ws-hint-note{position:absolute;z-index:31;left:50%;bottom:128px;transform:translateX(-50%);max-width:calc(100% - 18px);padding:7px 10px;border:1px solid rgba(112,217,173,.58);border-radius:999px;background:rgba(2,52,67,.97);color:#e5f5ef;font-size:.48rem;font-weight:950;line-height:1.25;text-align:center;pointer-events:none;box-shadow:0 10px 24px rgba(0,0,0,.36)}
      .ws-hint-note.anchor{border-color:rgba(239,199,102,.62);background:rgba(55,40,23,.97);color:#fff0bd}
      @media(max-width:430px){.ws-hint-menu{left:6px;right:6px;bottom:64px;padding:5px;gap:4px}.ws-hint-choice{min-height:42px;font-size:.42rem;padding:4px 3px}.ws-hint-choice b{font-size:.55rem}.ws-hint-note{bottom:116px;font-size:.42rem;padding:6px 8px}}
      @media(prefers-reduced-motion:reduce){#hint.ws-boss-help-button.ws-hint-suggested{animation:none!important;box-shadow:0 0 0 1px rgba(255,225,138,.24),0 0 12px rgba(255,210,82,.22)!important}}
    `;
    doc.head.appendChild(style);
  }

  function installRuntime(doc){
    if(doc.getElementById('ws-boss-hints-v2-runtime'))return;
    const runtime=doc.createElement('script');
    runtime.id='ws-boss-hints-v2-runtime';
    runtime.textContent=`(()=>{
      if(window.__WS_BOSS_HINTS_V2__)return;
      window.__WS_BOSS_HINTS_V2__=true;
      const baseBind=bind;
      let trailTimer=0,anchorTimer=0;

      const currentAnswer=()=>typeof WS_GET_BOSS_ANSWER==='function'?String(WS_GET_BOSS_ANSWER()||'').toUpperCase():'';
      const sentenceMode=()=>typeof WS_IS_BOSS_SENTENCE_MODE==='function'&&Boolean(WS_IS_BOSS_SENTENCE_MODE());
      const currentUnits=()=>{
        if(typeof WS_GET_BOSS_UNITS==='function'){
          const value=WS_GET_BOSS_UNITS();
          if(Array.isArray(value)&&value.length)return value.map(x=>String(x||'').toUpperCase());
        }
        return Array.from(currentAnswer());
      };
      const currentLevel=()=>{const m=document.querySelector('.bossPlate')?.textContent?.match(/LEVEL\\s+(\\d+)/i);if(m)return Math.max(1,Math.min(10,Number(m[1])||1));try{return Math.max(1,Math.min(10,Number(sessionStorage.getItem('wordScrambleBossLevel')||1)));}catch{return 1;}};
      const emitHint=type=>document.dispatchEvent(new CustomEvent('ws-hint-used',{detail:{type:type,level:currentLevel(),answerLength:currentUnits().length}}));

      function clearTrail(){clearTimeout(trailTimer);trailTimer=0;document.querySelectorAll('.ws-trail-candidate').forEach(el=>el.classList.remove('ws-trail-candidate'));document.querySelector('.ws-hint-note:not(.anchor)')?.remove();}
      function clearAnchor(){clearTimeout(anchorTimer);anchorTimer=0;document.querySelectorAll('.ws-anchor-ghost').forEach(el=>{el.classList.remove('ws-anchor-ghost');delete el.dataset.wsGhost;});document.querySelector('.ws-hint-note.anchor')?.remove();}
      function closeMenu(){document.querySelector('.ws-hint-menu')?.remove();}
      function cleanup(){closeMenu();clearTrail();clearAnchor();}
      function showNote(text,anchor){document.querySelectorAll('.ws-hint-note').forEach(el=>el.remove());const card=document.querySelector('.card');if(!card)return;const note=document.createElement('div');note.className='ws-hint-note'+(anchor?' anchor':'');note.textContent=text;card.appendChild(note);return note;}

      function trail(){
        closeMenu();clearTrail();
        const units=currentUnits(),next=units[s.sel.length];
        if(!s.boss||!next||s.feedback)return;
        const unused=Array.from(document.querySelectorAll('.tiles .tile[data-i]:not(.used)')).filter(btn=>!btn.disabled);
        const correct=unused.find(btn=>btn.textContent.trim().toUpperCase()===next);
        if(!correct)return;
        const others=unused.filter(btn=>btn!==correct&&btn.textContent.trim().toUpperCase()!==next);
        for(let i=others.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=others[i];others[i]=others[j];others[j]=t;}
        const picks=[correct,...others.slice(0,2)];
        for(let i=picks.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=picks[i];picks[i]=picks[j];picks[j]=t;}
        picks.forEach(btn=>btn.classList.add('ws-trail-candidate'));
        showNote(sentenceMode()?'🧭 Fährte: Das nächste Wort ist eines der markierten Wörter.':'🧭 Fährte: Der nächste Buchstabe ist einer der markierten Buchstaben.',false);
        emitHint('trail');
        trailTimer=setTimeout(clearTrail,2800);
      }

      function anchor(){
        closeMenu();clearAnchor();
        const units=currentUnits();
        if(!s.boss||!units.length||s.feedback||Number(s.bossMiss)<2)return;
        const slots=Array.from(document.querySelectorAll('.slots .slot'));
        const first=units[0]||'',last=units[units.length-1]||'';
        if(slots[0]&&!slots[0].classList.contains('filled')){slots[0].classList.add('ws-anchor-ghost');slots[0].dataset.wsGhost=first;}
        const end=slots[units.length-1];
        if(end&&!end.classList.contains('filled')){end.classList.add('ws-anchor-ghost');end.dataset.wsGhost=last;}
        showNote('⚓ Rettungsanker: START '+first+' · ENDE '+last,true);
        emitHint('anchor');
        anchorTimer=setTimeout(clearAnchor,3000);
      }

      function unitHint(){
        closeMenu();cleanup();
        const units=currentUnits(),k=s.sel.length;
        if(!s.boss||!units.length||k>=units.length||s.feedback)return;
        const index=s.tiles.findIndex((unit,i)=>String(unit).toUpperCase()===units[k]&&!s.sel.some(v=>v.id===i));
        if(index<0)return;
        emitHint(sentenceMode()?'word':'letter');
        s.sel.push({id:index,l:s.tiles[index]});
        render();
      }

      function openMenu(){
        if(document.querySelector('.ws-hint-menu')){closeMenu();return;}
        const card=document.querySelector('.card');if(!card)return;
        const isSentence=sentenceMode();
        const menu=document.createElement('div');menu.className='ws-hint-menu';menu.setAttribute('role','menu');
        menu.innerHTML=isSentence
          ?'<button type="button" class="ws-hint-choice" data-h="trail"><b>🧭 Fährte</b>3 mögliche Wörter</button><button type="button" class="ws-hint-choice" data-h="anchor"><b>⚓ Anker</b>Start + Ende</button><button type="button" class="ws-hint-choice" data-h="unit"><b>💡 Wort</b>setzt 1 Wort</button>'
          :'<button type="button" class="ws-hint-choice" data-h="trail"><b>🧭 Fährte</b>3 mögliche Buchstaben</button><button type="button" class="ws-hint-choice" data-h="anchor"><b>⚓ Anker</b>Start + Ende</button><button type="button" class="ws-hint-choice" data-h="unit"><b>💡 Buchstabe</b>setzt 1 Buchstaben</button>';
        const anchorBtn=menu.querySelector('[data-h="anchor"]');if(anchorBtn){anchorBtn.disabled=Number(s.bossMiss)<2;anchorBtn.title=anchorBtn.disabled?'Nach 2 Bossfehlern verfügbar':'Rettungsanker verwenden';}
        menu.querySelector('[data-h="trail"]')?.addEventListener('click',trail);
        menu.querySelector('[data-h="anchor"]')?.addEventListener('click',anchor);
        menu.querySelector('[data-h="unit"]')?.addEventListener('click',unitHint);
        card.appendChild(menu);
      }

      function enhanceBossHint(){
        const hint=document.getElementById('hint');
        if(!hint||!s.boss||!currentUnits().length)return;
        hint.classList.add('ws-boss-help-button');
        hint.classList.toggle('ws-hint-suggested',Number(s.bossMiss)>=1);
        hint.innerHTML='🧭<br>Hilfe';
        hint.setAttribute('aria-label','Boss-Hilfe öffnen');
        const unit=sentenceMode()?'Wort':'Buchstabe';
        hint.title=Number(s.bossMiss)>=2?'Fährte, Rettungsanker oder '+unit:'Fährte oder '+unit;
        const disabled=hint.disabled;
        hint.onclick=()=>{if(disabled||hint.disabled||s.feedback)return;openMenu();};
      }

      bind=function(){
        baseBind();
        if(!s.boss){cleanup();return;}
        enhanceBossHint();
      };
      bind();
    })();`;
    doc.documentElement.appendChild(runtime);
  }

  function install(){
    try{const doc=frame.contentDocument;if(!doc?.head||!doc.documentElement)return;ensureStyles(doc);installRuntime(doc);}catch(err){console.warn('Word Scramble boss hints v2 skipped',err)}
  }
  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();

(()=>{
  const id='ws-boss-intro-visual-polish-loader';
  if(document.getElementById(id))return;
  const script=document.createElement('script');
  script.id=id;
  script.src='./assets/patches/boss-intro-visual-polish.js';
  document.head.appendChild(script);
})();
