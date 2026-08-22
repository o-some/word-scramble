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
                "return {base:!!window.__WS_BASE_RUNTIME__, sentence:!!window.__WS_VARIABLE_BOSS_WORDS__, rarity:!!window.__WS_WORD_RARITIES__, core:document.documentElement.dataset.wsCoreRuntime||''};"
            )
        except Exception:
            diag = {}
        raise AssertionError(f"timeout waiting for {message}; diagnostics={diag}") from exc


def solve_normal(driver):
    wait(driver, lambda d: d.find_elements(By.CSS_SELECTOR, ".ws-word-rarity-title"), 5, "rarity badge")
    for _ in range(32):
        slots = driver.find_elements(By.CSS_SELECTOR, ".slots .slot")
        if slots and all("filled" in (slot.get_attribute("class") or "") for slot in slots):
            break
        hint = wait(driver, lambda d: d.find_element(By.ID, "hint"), 2, "hint button")
        driver.execute_script("arguments[0].click()", hint)
        time.sleep(0.02)
    slots = driver.find_elements(By.CSS_SELECTOR, ".slots .slot")
    assert slots and all("filled" in (slot.get_attribute("class") or "") for slot in slots), "hint did not fill normal answer"
    check = driver.find_element(By.ID, "check")
    driver.execute_script("arguments[0].click()", check)
    wait(driver, lambda d: d.find_elements(By.CSS_SELECTOR, ".feedback"), 1.5, "normal feedback")
    wait(driver, lambda d: not d.find_elements(By.CSS_SELECTOR, ".feedback"), 2.5, "next normal round")


def main():
    options = webdriver.ChromeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=390,844")
    options.add_argument("--blink-settings=imagesEnabled=false")
    options.page_load_strategy = "eager"

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(12)
    try:
        driver.get(BASE_URL)
        game_frame = wait(driver, lambda d: d.find_element(By.ID, "game"), 5, "game iframe")
        driver.switch_to.frame(game_frame)

        wait(driver, lambda d: d.execute_script("return !!window.__WS_BASE_RUNTIME__"), 5, "base runtime")
        wait(driver, lambda d: d.execute_script("return !!window.__WS_VARIABLE_BOSS_WORDS__"), 8, "sentence runtime")
        wait(driver, lambda d: d.execute_script("return !!window.__WS_WORD_RARITIES__"), 8, "rarity runtime")
        wait(driver, lambda d: d.find_elements(By.CSS_SELECTOR, ".ws-word-rarity-title"), 4, "initial rarity badge")

        solve_normal(driver)
        solve_normal(driver)
        solve_normal(driver)

        wait(driver, lambda d: d.find_elements(By.CSS_SELECTOR, ".bossSide"), 4, "boss state after three rounds")
        intro = wait(driver, lambda d: d.find_elements(By.CSS_SELECTOR, ".ws-boss-intro"), 4, "boss intro")[0]
        start = intro.find_element(By.CSS_SELECTOR, ".ws-boss-intro-start")
        driver.execute_script("arguments[0].click()", start)
        wait(driver, lambda d: not d.find_elements(By.CSS_SELECTOR, ".ws-boss-intro"), 2, "boss intro close")

        card = wait(driver, lambda d: d.find_elements(By.CSS_SELECTOR, ".card.ws-boss-sentence-mode"), 3, "boss sentence mode")[0]
        prompt = card.find_element(By.CSS_SELECTOR, ".prompt h1").text.strip()
        assert len(prompt.split()) >= 4, f"boss prompt is not a sentence: {prompt!r}"
        assert "PIRATE" not in prompt.upper() and "BOSS-SCRAMBLE" not in prompt.upper() and "BOSS LÄDT" not in prompt.upper(), f"legacy boss prompt returned: {prompt!r}"

        badge_selector = ".ws-boss-ability-badge,.ws-boss-ability-badge-4-6,.ws-boss-ability-badge-7-10"
        badge = wait(driver, lambda d: d.find_elements(By.CSS_SELECTOR, badge_selector), 2, "boss ability badge")[0]
        before_y = badge.rect["y"]
        tile = card.find_element(By.CSS_SELECTOR, ".tiles .tile:not(.used)")
        driver.execute_script("arguments[0].click()", tile)
        time.sleep(0.12)
        badges = driver.find_elements(By.CSS_SELECTOR, badge_selector)
        assert badges, "boss ability badge disappeared after tile click"
        after_y = badges[0].rect["y"]
        assert abs(after_y - before_y) <= 2, f"boss ability badge shifted vertically: before={before_y}, after={after_y}"

        print("Word Scramble browser smoke: PASS")
        print(f"Boss prompt: {prompt}")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
