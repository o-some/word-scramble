from __future__ import annotations

import os
import subprocess
import tempfile
import time
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
        campaignMarker: String(window.__WS_BOSS_PROGRESSION_CORE__||''),
        campaignScript: !!document.getElementById('ws-boss-progression-core-runtime'),
        selected: s.sel.map(x=>String(x.l||'')), tiles: s.tiles.map(x=>String(x||'')),
        answer: String(typeof WS_GET_BOSS_ANSWER==='function' && s.boss ? WS_GET_BOSS_ANSWER() : currentAnswer()),
        units: typeof WS_GET_BOSS_UNITS==='function' ? WS_GET_BOSS_UNITS().map(String) : [],
        checkBound: document.getElementById('check')?.onclick === check, checkType: typeof check,
        checkText: String(check).slice(0,320)
      };
    """)


def wait(driver, predicate, timeout=8, message="condition"):
    try:
        return WebDriverWait(driver, timeout, poll_frequency=0.05).until(predicate)
    except TimeoutException as exc:
        try: diag = state(driver)
        except Exception: diag = {}
        raise AssertionError(f"timeout waiting for {message}; diagnostics={diag}") from exc


def diagnose_campaign_runtime(driver):
    text = driver.execute_script("return document.getElementById('ws-boss-progression-core-runtime')?.textContent || ''")
    print('CAMPAIGN_RUNTIME_DIAG', state(driver), flush=True)
    if not text:
        print('Campaign runtime element missing entirely', flush=True)
        return
    path = '/tmp/ws-campaign-injected-runtime.js'
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(text)
    result = subprocess.run(['node', '--check', path], text=True, capture_output=True)
    print('CAMPAIGN_RUNTIME_NODE_CHECK_RC', result.returncode, flush=True)
    if result.stdout:
        print(result.stdout, flush=True)
    if result.stderr:
        print(result.stderr, flush=True)


def solve_normal(driver):
    wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"), 5, "rarity badge")
    for _ in range(32):
        filled,total=driver.execute_script("const a=[...document.querySelectorAll('.slots .slot')];return[a.filter(x=>x.classList.contains('filled')).length,a.length]")
        if total and filled==total: break
        driver.execute_script("document.getElementById('hint')?.click()")
        time.sleep(0.02)
    filled,total=driver.execute_script("const a=[...document.querySelectorAll('.slots .slot')];return[a.filter(x=>x.classList.contains('filled')).length,a.length]")
    assert total and filled==total,"hint did not fill normal answer"
    driver.execute_script("document.getElementById('check')?.click()")
    wait(driver,lambda d:state(d)["feedback"],1.5,"normal feedback")
    wait(driver,lambda d:not state(d)["feedback"],3.0,"next normal round")


def dismiss_intro(driver):
    if driver.execute_script("return !!document.querySelector('.ws-boss-intro')"):
        driver.execute_script("document.querySelector('.ws-boss-intro-start')?.click()")
        wait(driver,lambda d:d.execute_script("return !document.querySelector('.ws-boss-intro')"),2,"boss intro close")


def fill_current_boss_sentence(driver):
    for _ in range(180):
        st=state(driver);units=[u.upper() for u in st["units"]];selected=[u.upper() for u in st["selected"]]
        if units and len(selected)==len(units): return
        assert units,f"boss sentence units missing: {st}"
        next_unit=units[len(selected)]
        clicked=driver.execute_script("""
          const wanted=arguments[0];const buttons=[...document.querySelectorAll('.tiles .tile[data-i]:not(.used)')];
          const target=buttons.find(btn=>!btn.disabled&&String(s.tiles[Number(btn.dataset.i)]||'').toUpperCase()===wanted);
          if(!target)return false;target.click();return true;
        """,next_unit)
        time.sleep(0.04 if clicked else 0.07)
    raise AssertionError(f"could not fill boss sentence: {state(driver)}")


def solve_boss_sentence(driver):
    fill_current_boss_sentence(driver)
    time.sleep(0.58)
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


def assert_ability_visible(driver,level):
    selectors={1:'.ws-boss-ability-badge',2:'.ws-brax-hidden',3:'.ws-decoy',4:'.ws-roderick-timer',5:'.ws-vargas-sealed',6:'.ws-boss-ability-badge-4-6',7:'.ws-thorne-chain',8:'.ws-corvin-route',9:'.ws-azrak-shadow',10:'.ws-varkos-mode'}
    selector=selectors[level]
    wait(driver,lambda d:d.execute_script("return !!document.querySelector(arguments[0])",selector),2.8,f"boss {level} ability {selector}")
    if level==1:
        st=state(driver);first=st["units"][0].upper()
        driver.execute_script("""const wanted=arguments[0];const btn=[...document.querySelectorAll('.tiles .tile[data-i]:not(.used)')].find(x=>String(s.tiles[Number(x.dataset.i)]||'').toUpperCase()===wanted);btn?.click();""",first)
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-kai-shuffled,.ws-kai-toast')"),1.0,"Kai visible shuffle")
        driver.execute_script("s.sel=[];render()")


def main():
    options=webdriver.ChromeOptions()
    for arg in ["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--disable-background-networking","--disable-component-update","--window-size=390,844","--blink-settings=imagesEnabled=false"]: options.add_argument(arg)
    options.page_load_strategy="none";driver=webdriver.Chrome(options=options);driver.set_script_timeout(10)
    try:
        try:
            driver.execute_cdp_cmd("Network.enable",{});driver.execute_cdp_cmd("Network.setBlockedURLs",{"urls":["https://o-some.github.io/tulasisland/*"]})
        except Exception: pass
        driver.get(BASE_URL);game_frame=wait(driver,lambda d:d.find_element(By.ID,"game"),5,"game iframe");driver.switch_to.frame(game_frame)
        wait(driver,lambda d:d.execute_script("return !!window.__WS_BASE_RUNTIME__"),5,"base runtime")
        wait(driver,lambda d:d.execute_script("return !!window.__WS_VARIABLE_BOSS_WORDS__"),8,"sentence runtime")
        wait(driver,lambda d:d.execute_script("return !!window.__WS_WORD_RARITIES__"),8,"rarity runtime")
        try:
            wait(driver,lambda d:d.execute_script("return !!window.WS_BOSS_CAMPAIGN"),5,"campaign runtime")
        except AssertionError:
            diagnose_campaign_runtime(driver)
            raise
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"),4,"initial rarity badge")
        assert state(driver)["stage"]=='A1',f"campaign must start at A1: {state(driver)}"

        solve_normal(driver);solve_normal(driver);solve_normal(driver);start_boss_after_normal_rounds(driver);assert_ability_visible(driver,1)
        observed_hp=[]
        for expected_after in [2,1,0]:
            before,after=solve_boss_sentence(driver);observed_hp.append((before["bossHp"],after["bossHp"]));assert after["bossHp"]==expected_after,f"boss HP did not decrement to {expected_after}: before={before}; after={after}"
            if expected_after>0:
                wait(driver,lambda d:not state(d)["feedback"],3.0,f"next boss sentence at HP {expected_after}");wait(driver,lambda d:state(d)["boss"] and bool(state(d)["units"]),2.0,"next boss sentence ready")
        wait(driver,lambda d:not state(d)["boss"],3.5,"boss 1 exit after HP zero");wait(driver,lambda d:state(d)["level"]==2,2.0,"advance to boss level 2");wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"),3.0,"rarity after boss victory")

        for level in range(2,11):
            force_boss(driver,level,1);assert_ability_visible(driver,level)
            if level==7:
                before,after=solve_boss_sentence(driver);assert after["bossHp"]==1,f"Thorne first sentence must charge 1/2 without damage: {after}";wait(driver,lambda d:not state(d)["feedback"],2.5,"Thorne second sentence");before,after=solve_boss_sentence(driver)
            else: before,after=solve_boss_sentence(driver)
            assert after["bossHp"]==0,f"boss {level} final hit failed: before={before}; after={after}"
            wait(driver,lambda d:not state(d)["boss"],3.5,f"boss {level} exit")

        wait(driver,lambda d:state(d)["stage"]=='A2',2.0,"advance CEFR stage to A2")
        wait(driver,lambda d:state(d)["level"]==1,2.0,"reset boss campaign to level 1 at A2")
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-cefr-complete')"),2.0,"CEFR completion overlay")
        text=driver.execute_script("return document.querySelector('.ws-cefr-complete')?.textContent||''")
        assert 'A1 geschafft' in text and 'A2 STARTEN' in text,f"wrong CEFR completion copy: {text!r}"
        driver.execute_script("document.querySelector('.ws-cefr-complete-start')?.click()")
        wait(driver,lambda d:d.execute_script("return !document.querySelector('.ws-cefr-complete')"),1.5,"close CEFR completion overlay")
        wait(driver,lambda d:d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"),2.5,"A2 normal round rarity")

        print("Word Scramble full boss campaign: PASS",flush=True);print("Boss 1 HP transitions:",observed_hp,flush=True);print("Next CEFR stage:",state(driver)["stage"],flush=True)
    finally: driver.quit()

if __name__=='__main__': main()
