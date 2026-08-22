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
        selected: s.sel.map(x=>String(x.l||'')),
        tiles: s.tiles.map(x=>String(x||'')),
        answer: String(currentAnswer()),
        checkBound: document.getElementById('check')?.onclick === check,
        checkType: typeof check,
        checkText: String(check).slice(0,220)
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
    before = state(driver)
    print("BEFORE_CHECK", before, flush=True)
    driver.execute_script("document.getElementById('check')?.click()")
    time.sleep(0.1)
    after = state(driver)
    print("AFTER_CHECK", after, flush=True)
    assert after["feedback"], f"check click produced no feedback; before={before}; after={after}"
    wait(driver, lambda d: not state(d)["feedback"], 3.0, "next normal round")


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
        wait(driver, lambda d: state(d)["boss"], 4, "boss state after three rounds")
        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.bossSide')"), 2, "boss visual")
        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-boss-intro')"), 4, "boss intro")
        driver.execute_script("document.querySelector('.ws-boss-intro-start')?.click()")
        wait(driver, lambda d: d.execute_script("return !document.querySelector('.ws-boss-intro')"), 2, "boss intro close")
        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.card.ws-boss-sentence-mode')"), 3, "boss sentence mode")
        prompt = driver.execute_script("return document.querySelector('.card.ws-boss-sentence-mode .prompt h1')?.textContent?.trim()||''")
        assert len(prompt.split()) >= 4, f"boss prompt is not a sentence: {prompt!r}"
        assert not any(x in prompt.upper() for x in ["PIRATE","BOSS-SCRAMBLE","BOSS LÄDT"]), f"legacy boss prompt returned: {prompt!r}"
        sel = ".ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10"
        wait(driver, lambda d: d.execute_script("return !!document.querySelector(arguments[0])", sel), 2, "boss ability badge")
        before_y = driver.execute_script("return document.querySelector(arguments[0]).getBoundingClientRect().top", sel)
        assert driver.execute_script("const t=document.querySelector('.card.ws-boss-sentence-mode .tiles .tile:not(.used)');if(!t)return false;t.click();return true"), "boss sentence tile missing"
        time.sleep(0.12)
        assert driver.execute_script("return !!document.querySelector(arguments[0])", sel), "boss ability badge disappeared after tile click"
        after_y = driver.execute_script("return document.querySelector(arguments[0]).getBoundingClientRect().top", sel)
        assert abs(after_y-before_y)<=2, f"boss ability badge shifted vertically: {before_y}->{after_y}"
        print("Word Scramble browser smoke: PASS", flush=True)
        print("Boss prompt:", prompt, flush=True)
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
