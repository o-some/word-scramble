import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path, 'utf8');
const index = read('index.html');
const base = read('runtime/base.html');
const composition = read('assets/runtime-composition.js');
const abilities13 = read('assets/patches/boss-abilities-1-3-runtime.js');
const lifecycleBridge = read('assets/patches/boss-intro-lifecycle-bridge.js');
const abilities46 = read('assets/patches/boss-abilities-4-6.js');
const abilities710 = read('assets/patches/boss-abilities-7-10.js');
const bossUx = read('assets/patches/boss-ux-final-regression.js');
const sentences = read('assets/patches/variable-boss-words.js');
const rarities = read('assets/patches/word-rarities.js');
const progression = read('assets/patches/boss-progression-core.js');

assert.match(index, /const RELEASE='20260822-runtime-v9'/, 'production entrypoint must own one explicit runtime release');
assert.match(index, /window\.__WS_RUNTIME_RELEASE__=RELEASE/, 'runtime release must be globally shared');
assert.match(index, /\.\/runtime\/base\.html\?v='\+encodeURIComponent\(RELEASE\)/, 'base runtime must inherit the release');
assert.match(index, /assets\/runtime-composition\.js/, 'atomic runtime composition must be the production entrypoint');
assert.doesNotMatch(index, /boss-abilities-1-3\.js/, 'legacy combined bootstrap must not be loaded in production');
assert.doesNotMatch(index, /tulasisland\/word-scramble-preview/i, 'production entrypoint must not depend on the legacy preview runtime');

assert.match(base, /__WS_BASE_RUNTIME__/, 'local base runtime contract missing');
assert.match(base, /BOSS_AFTER_NORMAL_ROUNDS=3/, 'boss threshold must be owned by the base state machine at three normal rounds');
assert.match(base, /s\.normal>=BOSS_AFTER_NORMAL_ROUNDS/, 'base state machine must own the normal-to-boss transition');
assert.doesNotMatch(base, /['"]PIRATE['"]/, 'legacy PIRATE fallback must not be part of the local base runtime');

for (const modulePath of [
  'variable-boss-words.js','boss-abilities-4-6.js','boss-abilities-7-10.js','word-rarities.js','treasure-words.js',
  'boss-campaign-stars.js','boss-hints-v2.js','boss-victory-loot.js','tula-reactions-final-polish.js','boss-intro-visual-polish.js',
  'boss-ux-final-regression.js','boss-abilities-1-3-runtime.js'
]) assert.ok(composition.includes(modulePath), `atomic composition missing ${modulePath}`);
for (const legacyId of [
  'ws-treasure-words-loader','ws-boss-campaign-stars-loader','ws-boss-hints-v2-loader','ws-boss-victory-loot-loader',
  'ws-tula-final-polish-loader','ws-boss-intro-visual-polish-loader','ws-boss-ux-final-regression-loader'
]) assert.ok(composition.includes(legacyId), `legacy chain suppression missing ${legacyId}`);
assert.match(composition, /src\+'\?v='\+encodeURIComponent\(RELEASE\)/, 'every composed runtime module must be release-versioned');
assert.match(composition, /Gemischte Runtime-Versionen/, 'mixed runtime versions must fail visibly');
assert.match(composition, /__WS_BOSS_ABILITIES_1_3_ATOMIC__/, 'atomic composition must assert the separated boss 1-3 module');
assert.match(abilities13, /KAI MISCHT DIE ÜBRIGEN WÖRTER/, 'Kai must provide visible ability feedback after interaction');

assert.match(lifecycleBridge, /ws-boss-intro-closed/, 'boss intro lifecycle event missing');
assert.match(lifecycleBridge, /typeof render===['"]function['"]/, 'boss intro lifecycle must trigger the authoritative render path');
assert.doesNotMatch(bossUx, /installRoundTransitionContract/, 'boss UX must not own gameplay transition state');

assert.match(sentences, /const BOSS_SENTENCES=/, 'boss sentence pool missing');
for (let level = 1; level <= 10; level += 1) assert.match(sentences, new RegExp(`\\n\\s*${level}:\\[`), `boss sentence pool missing for level ${level}`);
for (const stage of ['A1','A2','B1','B2','C1','C2']) {
  assert.ok(sentences.includes(stage), `sentence difficulty stage missing: ${stage}`);
  assert.ok(progression.includes(stage), `campaign stage missing: ${stage}`);
}
assert.match(sentences, /const campaign=window\.WS_BOSS_CAMPAIGN/, 'boss sentence runtime must bind the authoritative campaign lifecycle');
assert.match(sentences, /campaign\.hit\(\)/, 'boss sentence success must invoke the authoritative campaign hit owner');
assert.match(sentences, /campaign\.finishTurn\(\)/, 'boss sentence completion must invoke the authoritative campaign completion owner');
assert.doesNotMatch(sentences, /currentLevel\(\)===7/, 'sentence runtime must not duplicate Thorne ability ownership');

assert.doesNotMatch(abilities710, /const answer=['"]PIRATE['"]/, 'Thorne must never use the legacy PIRATE answer');
assert.match(abilities710, /WS_GET_BOSS_ANSWER/, 'bosses 7-10 must use the current sentence answer');
assert.match(abilities710, /Zwei richtige Sätze/, 'Thorne ability must be sentence based');
assert.match(abilities46, /WS_BOSS_CAMPAIGN\?\.miss/, 'timed boss abilities must use campaign lifecycle misses');
for (const label of ['STANDARD-WORT','BRONZE-WORT','SILBER-WORT','GOLD-WORT','EPISCHES WORT']) assert.ok(rarities.includes(label), `rarity label missing: ${label}`);

assert.match(progression, /__WS_BOSS_PROGRESSION_CORE__/, 'boss progression core contract missing');
assert.match(progression, /wordScrambleBossLevelV2/, 'persistent boss progression storage contract missing');
assert.match(progression, /WS_BOSS_CAMPAIGN=/, 'authoritative boss lifecycle API missing');
assert.match(progression, /function hit\(/, 'boss hit owner missing');
assert.match(progression, /function finishTurn\(/, 'boss encounter completion owner missing');
assert.match(progression, /KAMPAGNE GESCHAFFT/, 'CEFR campaign completion overlay missing');
assert.match(progression, /A1 NEU STARTEN/, 'C2 completion restart path missing');

console.log('Word Scramble atomic runtime contracts: PASS');
