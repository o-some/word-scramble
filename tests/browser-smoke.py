from __future__ import annotations

import os
import time
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.environ.get("WS_SMOKE_URL", "http://127.0.0.1:4173/word-scramble/index.html?runtime-smoke=1")


def state(driver):
    return driver.execute_script("""
      return {
        feedback: !!s.feedback,
        normal: Number(s.normal||0),
        boss: !!s.boss,
        bossHp: Number(s.bossHp||0),
        bossMiss: Number(s.bossMiss||0),
        level: Number(sessionStorage.getItem('wordScrambleBossLevel')||1),
        selected: s.sel.map(x=>String(x.l||'')),
        tiles: s.tiles.map(x=>String(x||'')),
        answer: String(typeof WS_GET_BOSS_ANSWER==='function' && s.boss ? WS_GET_BOSS_ANSWER() : currentAnswer()),
        units: typeof WS_GET_BOSS_UNITS==='function' ? WS_GET_BOSS_UNITS().map(String) : [],
        checkBound: document.getElementById('check')?.onclick === check,
        checkType: typeof check,
        checkText: String(check).slice(0,260)
      };
    """)


def wait(driver, predicate, timeout=8, message="condition"):
    try:
        return WebDriverWait(driver, timeout, poll_frequency=0.05).until(predicate)
    except TimeoutException as exc:
        try:
            diag = state(driver)
        except Exception:
            diag = {}
        raise AssertionError(f"timeout waiting for {message}; diagnostics={diag}") from exc


def solve_normal(driver):
    wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"), 5, "rarity badge")
    for _ in range(32):
        filled, total = driver.execute_script("const a=[...document.querySelectorAll('.slots .slot')];return[a.filter(x=>x.classList.contains('filled')).length,a.length]")
        if total and filled == total:
            break
        driver.execute_script("document.getElementById('hint')?.click()")
        time.sleep(0.02)
    filled, total = driver.execute_script("const a=[...document.querySelectorAll('.slots .slot')];return[a.filter(x=>x.classList.contains('filled')).length,a.length]")
    assert total and filled == total, "hint did not fill normal answer"
    driver.execute_script("document.getElementById('check')?.click()")
    wait(driver, lambda d: state(d)["feedback"], 1.5, "normal feedback")
    wait(driver, lambda d: not state(d)["feedback"], 3.0, "next normal round")


def fill_current_boss_sentence(driver):
    for _ in range(120):
        st = state(driver)
        units = [u.upper() for u in st["units"]]
        selected = [u.upper() for u in st["selected"]]
        if units and len(selected) == len(units):
            return
        assert units, f"boss sentence units missing: {st}"
        next_unit = units[len(selected)]
        clicked = driver.execute_script("""
          const wanted=arguments[0];
          const buttons=[...document.querySelectorAll('.tiles .tile[data-i]:not(.used)')];
          const target=buttons.find(btn=>!btn.disabled && String(s.tiles[Number(btn.dataset.i)]||'').toUpperCase()===wanted);
          if(!target)return false;
          target.click();
          return true;
        """, next_unit)
        if not clicked:
            time.sleep(0.06)
        else:
            time.sleep(0.025)
    raise AssertionError(f"could not fill boss sentence: {state(driver)}")


def solve_boss_sentence(driver):
    fill_current_boss_sentence(driver)
    before = state(driver)
    driver.execute_script("document.getElementById('check')?.click()")
    wait(driver, lambda d: state(d)["feedback"], 1.5, "boss feedback")
    after = state(driver)
    return before, after


def start_boss(driver):
    wait(driver, lambda d: state(d)["boss"], 4, "boss state after normal rounds")
    wait(driver, lambda d: d.execute_script("return !!document.querySelector('.bossSide')"), 2, "boss visual")
    wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-boss-intro')"), 4, "boss intro")
    driver.execute_script("document.querySelector('.ws-boss-intro-start')?.click()")
    wait(driver, lambda d: d.execute_script("return !document.querySelector('.ws-boss-intro')"), 2, "boss intro close")
    wait(driver, lambda d: d.execute_script("return !!document.querySelector('.card.ws-boss-sentence-mode')"), 3, "boss sentence mode")


def main():
    options = webdriver.ChromeOptions()
    for arg in ["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--disable-background-networking","--disable-component-update","--window-size=390,844","--blink-settings=imagesEnabled=false"]:
        options.add_argument(arg)
    options.page_load_strategy = "none"
    driver = webdriver.Chrome(options=options)
    driver.set_script_timeout(10)
    try:
        try:
            driver.execute_cdp_cmd("Network.enable", {})
            driver.execute_cdp_cmd("Network.setBlockedURLs", {"urls": ["https://o-some.github.io/tulasisland/*"]})
        except Exception:
            pass
        driver.get(BASE_URL)
        game_frame = wait(driver, lambda d: d.find_element(By.ID, "game"), 5, "game iframe")
        driver.switch_to.frame(game_frame)
        wait(driver, lambda d: d.execute_script("return !!window.__WS_BASE_RUNTIME__"), 5, "base runtime")
        wait(driver, lambda d: d.execute_script("return !!window.__WS_VARIABLE_BOSS_WORDS__"), 8, "sentence runtime")
        wait(driver, lambda d: d.execute_script("return !!window.__WS_WORD_RARITIES__"), 8, "rarity runtime")
        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"), 4, "initial rarity badge")

        solve_normal(driver); solve_normal(driver); solve_normal(driver)
        start_boss(driver)

        prompt = driver.execute_script("return document.querySelector('.card.ws-boss-sentence-mode .prompt h1')?.textContent?.trim()||''")
        assert len(prompt.split()) >= 4, f"boss prompt is not a sentence: {prompt!r}"
        assert not any(x in prompt.upper() for x in ["PIRATE","BOSS-SCRAMBLE","BOSS LÄDT"]), f"legacy boss prompt returned: {prompt!r}"

        ability_selector = ".ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10"
        wait(driver, lambda d: d.execute_script("return !!document.querySelector(arguments[0])", ability_selector), 2, "boss ability badge")
        before_y = driver.execute_script("return document.querySelector(arguments[0]).getBoundingClientRect().top", ability_selector)

        observed_hp = []
        for expected_after in [2, 1, 0]:
            before, after = solve_boss_sentence(driver)
            observed_hp.append((before["bossHp"], after["bossHp"]))
            assert after["bossHp"] == expected_after, f"boss HP did not decrement to {expected_after}: before={before}; after={after}"
            if expected_after > 0:
                wait(driver, lambda d: not state(d)["feedback"], 3.0, f"next boss sentence at HP {expected_after}")
                wait(driver, lambda d: state(d)["boss"] and bool(state(d)["units"]), 2.0, "next boss sentence ready")

        wait(driver, lambda d: not state(d)["boss"], 3.5, "boss exit after HP zero")
        wait(driver, lambda d: state(d)["level"] == 2, 2.0, "advance to boss level 2")
        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"), 3.0, "rarity after boss victory")

        assert driver.execute_script("return !!document.querySelector(arguments[0])", ability_selector) is False, "boss ability badge remained in normal mode"
        print("Word Scramble boss lifecycle smoke: PASS", flush=True)
        print("Boss prompt:", prompt, flush=True)
        print("Boss HP transitions:", observed_hp, flush=True)
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
