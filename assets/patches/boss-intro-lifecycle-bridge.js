(()=>{
  'use strict';
  const frame=document.getElementById('game');
  if(!frame)return;

  function install(){
    try{
      const doc=frame.contentDocument;
      if(!doc?.documentElement||doc.getElementById('ws-boss-intro-lifecycle-runtime'))return;
      const runtime=doc.createElement('script');
      runtime.id='ws-boss-intro-lifecycle-runtime';
      runtime.textContent=`(()=>{
        if(window.__WS_BOSS_INTRO_LIFECYCLE_BRIDGE__)return;
        window.__WS_BOSS_INTRO_LIFECYCLE_BRIDGE__='20260822-v1';
        document.addEventListener('click',event=>{
          const button=event.target?.closest?.('.ws-boss-intro-start');
          if(!button)return;
          setTimeout(()=>{
            document.dispatchEvent(new CustomEvent('ws-boss-intro-closed',{detail:{boss:Boolean(typeof s!=='undefined'&&s.boss)}}));
            if(typeof s!=='undefined'&&s.boss&&typeof render==='function')render();
          },0);
        });
      })();`;
      doc.documentElement.appendChild(runtime);
    }catch(err){console.warn('Word Scramble boss intro lifecycle bridge skipped',err)}
  }

  frame.addEventListener('load',install);
  if(frame.contentDocument?.readyState==='complete'||frame.contentDocument?.readyState==='interactive')install();
})();
