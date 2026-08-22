from __future__ import annotations

import os
import time
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.environ.get("WS_SMOKE_URL", "http://127.0.0.1:4173/word-scramble/index.html?runtime-smoke=1")


def wait(driver, predicate, timeout=8, message="condition"):
    try:
        return WebDriverWait(driver, timeout, poll_frequency=0.05).until(predicate)
    except TimeoutException as exc:
        try:
            diag = driver.execute_script(
                "return {base:!!window.__WS_BASE_RUNTIME__, sentence:!!window.__WS_VARIABLE_BOSS_WORDS__, rarity:!!window.__WS_WORD_RARITIES__, core:document.documentElement.dataset.wsCoreRuntime||'', feedback:!!window.s?.feedback, normal:Number(window.s?.normal||0), boss:!!window.s?.boss};"
            )
        except Exception:
            diag = {}
        raise AssertionError(f"timeout waiting for {message}; diagnostics={diag}") from exc


def solve_normal(driver):
    wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-word-rarity-title')"), 5, "rarity badge")
    for _ in range(32):
        filled, total = driver.execute_script(
            "const s=[...document.querySelectorAll('.slots .slot')]; return [s.filter(x=>x.classList.contains('filled')).length,s.length];"
        )
        if total and filled == total:
            break
        driver.execute_script("document.getElementById('hint')?.click()")
        time.sleep(0.02)
    filled, total = driver.execute_script(
        "const s=[...document.querySelectorAll('.slots .slot')]; return [s.filter(x=>x.classList.contains('filled')).length,s.length];"
    )
    assert total and filled == total, "hint did not fill normal answer"
    driver.execute_script("document.getElementById('check')?.click()")
    wait(driver, lambda d: d.execute_script("return !!window.s?.feedback"), 1.5, "normal feedback")
    wait(driver, lambda d: d.execute_script("return !window.s?.feedback"), 3.0, "next normal round")


def main():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-background-networking")
    options.add_argument("--disable-component-update")
    options.add_argument("--window-size=390,844")
    options.add_argument("--blink-settings=imagesEnabled=false")
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

        solve_normal(driver)
        solve_normal(driver)
        solve_normal(driver)

        wait(driver, lambda d: d.execute_script("return !!window.s?.boss"), 4, "boss state after three rounds")
        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.bossSide')"), 2, "boss visual")
        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.ws-boss-intro')"), 4, "boss intro")
        driver.execute_script("document.querySelector('.ws-boss-intro-start')?.click()")
        wait(driver, lambda d: d.execute_script("return !document.querySelector('.ws-boss-intro')"), 2, "boss intro close")

        wait(driver, lambda d: d.execute_script("return !!document.querySelector('.card.ws-boss-sentence-mode')"), 3, "boss sentence mode")
        prompt = driver.execute_script("return document.querySelector('.card.ws-boss-sentence-mode .prompt h1')?.textContent?.trim()||''")
        assert len(prompt.split()) >= 4, f"boss prompt is not a sentence: {prompt!r}"
        assert "PIRATE" not in prompt.upper() and "BOSS-SCRAMBLE" not in prompt.upper() and "BOSS LÄDT" not in prompt.upper(), f"legacy boss prompt returned: {prompt!r}"

        badge_selector = ".ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10"
        wait(driver, lambda d: d.execute_script("return !!document.querySelector(arguments[0])", badge_selector), 2, "boss ability badge")
        before_y = driver.execute_script("return document.querySelector(arguments[0]).getBoundingClientRect().top", badge_selector)
        clicked = driver.execute_script("const t=document.querySelector('.card.ws-boss-sentence-mode .tiles .tile:not(.used)'); if(!t)return false; t.click(); return true;")
        assert clicked, "boss sentence tile missing"
        time.sleep(0.12)
        assert driver.execute_script("return !!document.querySelector(arguments[0])", badge_selector), "boss ability badge disappeared after tile click"
        after_y = driver.execute_script("return document.querySelector(arguments[0]).getBoundingClientRect().top", badge_selector)
        assert abs(after_y - before_y) <= 2, f"boss ability badge shifted vertically: before={before_y}, after={after_y}"

        print("Word Scramble browser smoke: PASS")
        print(f"Boss prompt: {prompt}")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
