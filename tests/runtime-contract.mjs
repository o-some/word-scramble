import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const base = read('runtime/base.html');
const bootstrap = read('assets/patches/boss-abilities-1-3.js');
const bossUx = read('assets/patches/boss-ux-final-regression.js');
const sentences = read('assets/patches/variable-boss-words.js');
const rarities = read('assets/patches/word-rarities.js');
const progression = read('assets/patches/boss-progression-core.js');

assert.match(index, /\.\/runtime\/base\.html/, 'production entrypoint must use the repository-local base runtime');
assert.doesNotMatch(index, /tulasisland\/word-scramble-preview/i, 'production entrypoint must not depend on the legacy preview runtime');
assert.doesNotMatch(index, /syncBossTestTrigger|WS_BOSS_AFTER_WORDS/, 'legacy DOM-driven boss trigger must not return');
assert.match(index, /boss-progression-core\.js/, 'boss progression core must be part of the production composition');

assert.match(base, /__WS_BASE_RUNTIME__/, 'local base runtime contract missing');
assert.match(base, /BOSS_AFTER_NORMAL_ROUNDS=3/, 'boss threshold must be owned by the base state machine at three normal rounds');
assert.match(base, /s\.normal>=BOSS_AFTER_NORMAL_ROUNDS/, 'base state machine must own the normal-to-boss transition');
assert.doesNotMatch(base, /['"]PIRATE['"]/, 'legacy PIRATE fallback must not be part of the local base runtime');

assert.match(bootstrap, /LOCAL_BASE_URL/, 'bootstrap must enforce the local base runtime');
assert.match(bootstrap, /\['local-base'/, 'bootstrap must assert the local base runtime contract');
assert.match(bootstrap, /ws-stable-variable-boss-words/, 'sentence runtime must be in the deterministic pipeline');
assert.match(bootstrap, /ws-stable-word-rarities/, 'rarity runtime must be in the deterministic pipeline');
assert.doesNotMatch(bossUx, /installRoundTransitionContract/, 'boss UX must not own gameplay transition state');

assert.match(sentences, /const BOSS_SENTENCES=/, 'boss sentence pool missing');
for (let level = 1; level <= 10; level += 1) {
  assert.match(sentences, new RegExp(`\\n\\s*${level}:\\[`), `boss sentence pool missing for level ${level}`);
}
for (const label of ['STANDARD-WORT','BRONZE-WORT','SILBER-WORT','GOLD-WORT','EPISCHES WORT']) {
  assert.ok(rarities.includes(label), `rarity label missing: ${label}`);
}
assert.match(progression, /__WS_BOSS_PROGRESSION_CORE__/, 'boss progression core contract missing');
assert.match(progression, /wordScrambleBossLevel/, 'boss progression storage contract missing');

console.log('Word Scramble runtime contracts: PASS');
