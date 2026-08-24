from __future__ import annotations

import os
import time
from urllib.parse import parse_qs, urlparse
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.environ.get("WS_SMOKE_URL", "http://127.0.0.1:4173/word-scramble/index.html?runtime-smoke=1")


def state(driver):
    return driver.execute_script("""
      return {
        feedback: !!s.feedback, normal: Number(s.normal||0), boss: !!s.boss,
        bossHp: Number(s.bossHp||0), bossMiss: Number(s.bossMiss||0),
        level: Number(sessionStorage.getItem('wordScrambleBossLevel')||1),
        stage: String(window.WS_GET_CEFR_STAGE?.()||'A1'),
        campaign: !!window.WS_BOSS_CAMPAIGN,
        selected: s.sel.map(x=>String(x.l||'')), selectedIds: s.sel.map(x=>Number(x.id)),
        tiles: s.tiles.map(x=>String(x||'')),
        answer: String(typeof WS_GET_BOSS_ANSWER==='function' && s.boss ? WS_GET_BOSS_ANSWER() : currentAnswer()),
        units: typeof WS_GET_BOSS_UNITS==='function' ? WS_GET_BOSS_UNITS().map(String) : []
      };
    """)


def wait(driver, predicate, timeout=8, message="condition"):
    try:
        return WebDriverWait(driver, timeout, poll_frequency=0.05).until(predicate)
    except TimeoutException as exc:
        try: diag = state(driver)
        except Exception: diag = {}
        raise AssertionError(f"timeout waiting for {message}; diagnostics={diag}") from exc


def assert_atomic_release(driver):
    release = driver.execute_script("return String(window.parent.__WS_RUNTIME_RELEASE__||'')")
    assert release == '20260824-runtime-v11', f"unexpected runtime release: {release!r}"
    wait(driver, lambda d: d.execute_script("return window.parent.document.documentElement.dataset.wsRuntimeComposition==='ready'"), 8, "atomic runtime composition")
    sources = driver.execute_script("""
      return [...window.parent.document.scripts]
        .filter(s=>s.src && (s.src.includes('/assets/') || s.src.includes('/runtime/')))
        .map(s=>s.src);
    """)
    assert sources, "no composed runtime scripts found"
    for src in sources:
        version = parse_qs(urlparse(src).query).get('v', [''])[0]
        assert version == release, f"mixed/unversioned runtime script: {src} (expected {release})"
    legacy_scripts = driver.execute_script("""
      return [...window.parent.document.querySelectorAll('script')]
        .filter(s=>['ws-treasure-words-loader','ws-boss-campaign-stars-loader','ws-boss-hints-v2-loader','ws-boss-victory-loot-loader','ws-tula-final-polish-loader','ws-boss-intro-visual-polish-loader','ws-boss-ux-final-regression-loader'].includes(s.id))
        .map(s=>s.src);
    """)
    assert legacy_scripts == [], f"legacy self-loading chain became active: {legacy_scripts}"


def click_next_correct_word(driver, preferred_id=None):
    st = state(driver)
    units = [u.upper() for u in st["units"]]
    selected = [u.upper() for u in st["selected"]]
    assert len(selected) < len(units), f"no next word available: {st}"
    wanted = units[len(selected)]
    clicked = driver.execute_script("""
      const wanted=arguments[0],preferred=arguments[1];
      const buttons=[...document.querySelectorAll('.tiles .tile[data-i]:not(.used)')];
      let target=null;
      if(preferred!==null && preferred!==undefined){
        const p=buttons.find(btn=>Number(btn.dataset.i)===Number(preferred) && !btn.disabled && String(s.tiles[Number(btn.dataset.i)]||'').toUpperCase()===wanted);
        if(p)target=p;
      }
      if(!target)target=buttons.find(btn=>!btn.disabled&&String(s.tiles[Number(btn.dataset.i)]||'').toUpperCase()===wanted);
      if(!target)return false;target.click();return true;
    """, wanted, preferred_id)
    assert clicked, f"could not click next correct word {wanted}: {st}"
    time.sleep(0.06)


def solve_normal(driver):
    wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"), 5, "rarity badge")
    for _ in range(32):
        filled,total=driver.execute_script("const a=[...document.querySelectorAll('.slots .slot')];return[a.filter(x=>x.classList.contains('filled')).length,a.length]")
        if total and filled==total: break
        driver.execute_script("document.getElementById('hint')?.click()")
        time.sleep(0.02)
    driver.execute_script("document.getElementById('check')?.click()")
    wait(driver,lambda d:state(d)["feedback"],1.5,"normal feedback")
    wait(driver,lambda d:not state(d)["feedback"],3.0,"next normal round")


def dismiss_intro(driver):
    if driver.execute_script("return !!document.querySelector('.ws-boss-intro')"):
        driver.execute_script("document.querySelector('.ws-boss-intro-start')?.click()")
        wait(driver,lambda d:d.execute_script("return !document.querySelector('.ws-boss-intro')"),2,"boss intro close")


def fill_current_boss_sentence(driver):
    for _ in range(180):
        st=state(driver)
        if st["units"] and len(st["selected"])==len(st["units"]): return
        click_next_correct_word(driver)
    raise AssertionError(f"could not fill boss sentence: {state(driver)}")


def solve_boss_sentence(driver):
    fill_current_boss_sentence(driver)
    time.sleep(0.62)
    st=state(driver)
    if len(st["selected"])<len(st["units"]): fill_current_boss_sentence(driver)
    before=state(driver)
    assert len(before["selected"])==len(before["units"]),f"boss ability changed answer immediately before check: {before}"
    driver.execute_script("document.getElementById('check')?.click()")
    wait(driver,lambda d:state(d)["feedback"],1.5,"boss feedback")
    return before,state(driver)


def start_boss_after_normal_rounds(driver):
    wait(driver,lambda d:state(d)["boss"],4,"boss state after normal rounds")
    wait(driver,lambda d:d.execute_script("return !!document.querySelector('.bossSide')"),2,"boss visual")
    wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-boss-intro')"),4,"boss intro")
    dismiss_intro(driver)
    wait(driver,lambda d:d.execute_script("return !!document.querySelector('.card.ws-boss-sentence-mode')"),3,"boss sentence mode")


def force_boss(driver,level,hp=1):
    driver.execute_script("""
      localStorage.setItem('wordScrambleBossLevelV2',String(arguments[0]));sessionStorage.setItem('wordScrambleBossLevel',String(arguments[0]));
      s.boss=true;s.bossHp=arguments[1];s.bossMiss=0;s.normal=3;s.feedback=null;s.sel=[];setup();
    """,level,hp)
    wait(driver,lambda d:state(d)["boss"] and state(d)["level"]==level,2,f"force boss {level}")
    time.sleep(0.12);dismiss_intro(driver)
    wait(driver,lambda d:d.execute_script("return !!document.querySelector('.card.ws-boss-sentence-mode')"),2,f"boss {level} sentence mode")


def sealed_slot_index(driver):
    return driver.execute_script("""
      const slots=[...document.querySelectorAll('.slots .slot')],sealed=document.querySelector('.slot.ws-vargas-sealed');
      return sealed?slots.indexOf(sealed):-1;
    """)


def assert_roadmap_current(driver, level):
    selector=f'.ws-boss-card.current[data-level="{level}"]'
    wait(driver,lambda d:d.execute_script("return !!document.querySelector(arguments[0])",selector),2.0,f"roadmap current boss {level}")
    if 3 <= level <= 8:
        wait(driver,lambda d:d.execute_script("""
          const track=document.querySelector('.ws-boss-roadmap-track'),cur=document.querySelector('.ws-boss-card.current');
          if(!track||!cur)return false;const a=track.getBoundingClientRect(),b=cur.getBoundingClientRect();
          return Math.abs(((a.left+a.right)/2)-((b.left+b.right)/2)) < 24;
        """),2.0,"roadmap current boss centered")
    driver.execute_script("document.querySelector(arguments[0])?.click()",selector)
    wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-boss-intro')"),1.5,"roadmap boss info click")
    dismiss_intro(driver)


def assert_ability_visible(driver,level):
    selectors={1:'.ws-boss-ability-badge',2:'.ws-brax-hidden',3:'.ws-decoy',4:'.ws-roderick-timer',5:'.ws-vargas-sealed',6:'.ws-boss-ability-badge-4-6',7:'.ws-thorne-chain',8:'.ws-corvin-decoy',9:'.ws-azrak-shadow',10:'.ws-varkos-mode'}
    selector=selectors[level]
    wait(driver,lambda d:d.execute_script("return !!document.querySelector(arguments[0])",selector),2.8,f"boss {level} ability {selector}")
    if level==1:
        st=state(driver);first=st["units"][0].upper()
        driver.execute_script("""const wanted=arguments[0];const btn=[...document.querySelectorAll('.tiles .tile[data-i]:not(.used)')].find(x=>String(s.tiles[Number(x.dataset.i)]||'').toUpperCase()===wanted);btn?.click();""",first)
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-kai-shuffled,.ws-kai-toast')"),1.0,"Kai visible shuffle")
        driver.execute_script("s.sel=[];render()")
    elif level==4:
        value=driver.execute_script("return parseFloat(document.querySelector('.ws-roderick-timer-head b')?.textContent||'0')")
        assert value >= 14.0, f"Roderick timer did not start near 15s: {value}"
    elif level==5:
        total=len(state(driver)["units"])
        assert sealed_slot_index(driver)==1, f"Vargas must start on word 2, got slot {sealed_slot_index(driver)}"
        click_next_correct_word(driver)
        expected=min(4,total-1)
        wait(driver,lambda d:sealed_slot_index(d)==expected,1.0,"Vargas blockade moves from word 2 by three positions")
        while len(state(driver)["selected"])<min(4,total-1): click_next_correct_word(driver)
        if total>5:
            expected=min(7,total-1)
            wait(driver,lambda d:sealed_slot_index(d)==expected,1.0,"Vargas blockade moves again by three positions")
        while len(state(driver)["selected"])<max(0,total-1): click_next_correct_word(driver)
        wait(driver,lambda d:sealed_slot_index(d)==-1,1.0,"Vargas blockade disappears with one slot left")
    elif level==6:
        while len(state(driver)["selected"])<2: click_next_correct_word(driver)
        wait(driver,lambda d:len(state(d)["selected"])==1,1.4,"Ironhook pulls word 2")
        while len(state(driver)["selected"])<5: click_next_correct_word(driver)
        wait(driver,lambda d:len(state(d)["selected"])==4,1.4,"Ironhook repeats on word 5")
    elif level==8:
        decoy=driver.execute_script("return String(document.querySelector('.ws-corvin-decoy')?.textContent||'').toUpperCase()")
        units=[u.upper() for u in state(driver)["units"]]
        assert decoy and decoy not in units, f"Corvin decoy must be a foreign word: {decoy} vs {units}"
    elif level==9:
        shadow=driver.execute_script("""
          const el=document.querySelector('.tile.ws-azrak-shadow');
          return el?{id:Number(el.dataset.i),word:String(s.tiles[Number(el.dataset.i)]||'').toUpperCase()}:null;
        """)
        assert shadow and shadow["id"]>=0, f"Azrak shadow target missing: {shadow}"
        for _ in range(len(state(driver)["units"])+2):
            st=state(driver)
            if shadow["id"] in st["selectedIds"]: break
            next_word=st["units"][len(st["selected"])].upper()
            preferred=shadow["id"] if next_word==shadow["word"] else None
            click_next_correct_word(driver,preferred)
        wait(driver,lambda d:shadow["id"] in state(d)["selectedIds"],1.0,"Azrak shadow word placed correctly")
        wait(driver,lambda d:d.execute_script("""
          const old=arguments[0],remaining=[...document.querySelectorAll('.tiles .tile[data-i]:not(.used)')];
          const next=document.querySelector('.tile.ws-azrak-shadow');
          return remaining.length===0 || (!!next && Number(next.dataset.i)!==Number(old));
        """,shadow["id"]),1.0,"Azrak shadow moves to another word")


def complete_stage_via_campaign_owner(driver, expected_current, expected_next=None, mastered=False):
    assert state(driver)["stage"] == expected_current
    driver.execute_script("""
      localStorage.setItem('wordScrambleBossLevelV2','10');sessionStorage.setItem('wordScrambleBossLevel','10');
      s.boss=true;s.bossHp=1;s.bossMiss=0;s.normal=3;s.feedback=null;s.sel=[];
      WS_BOSS_CAMPAIGN.hit();WS_BOSS_CAMPAIGN.finishTurn();setup();
    """)
    wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-cefr-complete')"),2.0,f"{expected_current} completion overlay")
    text=driver.execute_script("return document.querySelector('.ws-cefr-complete')?.textContent||''")
    if mastered:
        assert 'Alle Sprachstufen gemeistert' in text and 'A1 NEU STARTEN' in text
        assert state(driver)["stage"]=='C2'
    else:
        assert expected_next is not None
        assert f'{expected_current} geschafft' in text and f'{expected_next} STARTEN' in text
        wait(driver,lambda d:state(d)["stage"]==expected_next,1.5,f"advance {expected_current} to {expected_next}")
        wait(driver,lambda d:state(d)["level"]==1,1.5,f"reset boss level at {expected_next}")
    driver.execute_script("document.querySelector('.ws-cefr-complete-start')?.click()")
    wait(driver,lambda d:d.execute_script("return !document.querySelector('.ws-cefr-complete')"),1.5,"close CEFR completion overlay")
    if mastered: wait(driver,lambda d:state(d)["stage"]=='A1' and state(d)["level"]==1,2.0,"restart campaign at A1 after C2")


def main():
    options=webdriver.ChromeOptions()
    for arg in ["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--disable-background-networking","--disable-component-update","--window-size=390,844","--blink-settings=imagesEnabled=false"]: options.add_argument(arg)
    options.page_load_strategy="none";driver=webdriver.Chrome(options=options);driver.set_script_timeout(10)
    try:
        driver.get(BASE_URL)
        game_frame=wait(driver,lambda d:d.find_element(By.ID,"game"),5,"game iframe")
        driver.switch_to.frame(game_frame)
        wait(driver,lambda d:d.execute_script("return !!window.__WS_BASE_RUNTIME__"),5,"base runtime")
        wait(driver,lambda d:d.execute_script("return !!window.__WS_VARIABLE_BOSS_WORDS__"),8,"sentence runtime")
        wait(driver,lambda d:d.execute_script("return !!window.__WS_WORD_RARITIES__"),8,"rarity runtime")
        wait(driver,lambda d:d.execute_script("return !!window.WS_BOSS_CAMPAIGN"),8,"campaign runtime")
        assert_atomic_release(driver)
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"),4,"initial rarity badge")
        assert state(driver)["stage"]=='A1'

        solve_normal(driver);solve_normal(driver);solve_normal(driver);start_boss_after_normal_rounds(driver);assert_ability_visible(driver,1)
        observed_hp=[]
        for expected_after in [2,1,0]:
            before,after=solve_boss_sentence(driver);observed_hp.append((before["bossHp"],after["bossHp"]));assert after["bossHp"]==expected_after
            if expected_after>0:
                wait(driver,lambda d:not state(d)["feedback"],3.0,f"next boss sentence at HP {expected_after}")
                wait(driver,lambda d:state(d)["boss"] and bool(state(d)["units"]),2.0,"next boss sentence ready")
        wait(driver,lambda d:not state(d)["boss"],3.5,"boss 1 exit after HP zero")
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.tula') && !document.querySelector('.bossSide')"),2.0,"return to Tula after boss victory")
        wait(driver,lambda d:state(d)["level"]==2,2.0,"advance to boss level 2")
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"),3.0,"rarity after boss victory")

        for level in range(2,11):
            force_boss(driver,level,1)
            if level==6: assert_roadmap_current(driver,level)
            assert_ability_visible(driver,level)
            if level==7:
                before,after=solve_boss_sentence(driver);assert after["bossHp"]==1
                chain_text=driver.execute_script("return document.querySelector('.ws-thorne-chain')?.textContent||''")
                assert '1 / 2 RICHTIG' in chain_text, f"Thorne 1/2 state not prominent: {chain_text!r}"
                assert driver.execute_script("return document.querySelector('.ws-thorne-chain')?.classList.contains('is-charged')")
                wait(driver,lambda d:not state(d)["feedback"],3.0,"Thorne second sentence")
                before,after=solve_boss_sentence(driver)
            else: before,after=solve_boss_sentence(driver)
            assert after["bossHp"]==0,f"boss {level} final hit failed: before={before}; after={after}"
            wait(driver,lambda d:not state(d)["boss"],3.5,f"boss {level} exit")

        wait(driver,lambda d:state(d)["stage"]=='A2',2.0,"advance CEFR stage to A2")
        wait(driver,lambda d:state(d)["level"]==1,2.0,"reset boss campaign to level 1 at A2")
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-cefr-complete')"),2.0,"A1 completion overlay")
        driver.execute_script("document.querySelector('.ws-cefr-complete-start')?.click()")
        wait(driver,lambda d:d.execute_script("return !document.querySelector('.ws-cefr-complete')"),1.5,"close A1 completion overlay")
        for current,next_stage in [('A2','B1'),('B1','B2'),('B2','C1'),('C1','C2')]: complete_stage_via_campaign_owner(driver,current,next_stage)
        complete_stage_via_campaign_owner(driver,'C2',mastered=True)
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"),2.5,"A1 rarity after full C2 restart")

        print("Word Scramble boss mechanics + roadmap + full campaign: PASS",flush=True)
        print("Release: 20260824-runtime-v11",flush=True)
        print("Boss 1 HP transitions:",observed_hp,flush=True)
        print("Boss mechanics verified: Vargas roaming seal, Ironhook repeated pulls, Thorne 1/2, Corvin foreign decoy, Azrak moving shadow",flush=True)
        print("Current boss roadmap centering/click: PASS",flush=True)
        print("CEFR chain: A1 -> A2 -> B1 -> B2 -> C1 -> C2 -> A1",flush=True)
    finally: driver.quit()

if __name__=='__main__': main()
