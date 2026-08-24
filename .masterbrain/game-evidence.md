# MasterBrain Game Pipeline Dry-Run Revalidation Evidence

## Candidate
- Project: Tula's Island – Word Scramble
- Repository: `o-some/word-scramble`
- Baseline main: `ac594046c99ac63954164fe6da0a89ff92c29cf4`
- Dry-run branch: `masterbrain/game-pipeline-dry-run-revalidate`
- Scope: `.masterbrain/**` only
- Candidate workflow: `32679180161`

## Historical chain
- PR #42 proved the pipeline correctly blocked on the existing `ROADMAP-CENTER-L6` regression instead of inventing a green result.
- PR #43 repaired the roadmap-centering ownership race in a separately scoped branch and merged as `ac594046c99ac63954164fe6da0a89ff92c29cf4`.
- Repair-head workflow `32678385289` completed successfully, including the full campaign and roadmap-centering smoke.

## Capability honesty
- Repository read/write: PROVEN
- Existing Selenium cold-start browser smoke: VERIFIED IN REPO
- Automated runtime/browser CI on repair head: PASS
- Automated runtime/browser CI on this candidate: BLOCKED after two browser-smoke failures
- Real device: NOT TESTED
- Production gameplay mutation in this dry run: NONE

## Scope verification
The revalidation branch was created directly from repaired `main` and changes only:
- `.masterbrain/game-design.yml`
- `.masterbrain/impact-scope.yml`
- `.masterbrain/game-quality.yml`
- `.masterbrain/game-test-matrix.yml`
- `.masterbrain/game-evidence.md`

No gameplay, runtime, asset, test, workflow or handoff file is changed by this documentation-only branch.

## Revision-bound automated evidence
Workflow run: `32679180161`

Attempt 1:
- runtime source-of-truth contract: PASS
- critical patch syntax: PASS
- Selenium cold-start browser smoke: FAIL

Unchanged rerun / attempt 2:
- runtime source-of-truth contract: PASS
- critical patch syntax: PASS
- Selenium cold-start browser smoke: FAIL again

Repeated failure:
`timeout waiting for boss feedback`

Repeated Level-6 diagnostics show:
- Boss: Level 6 / Ironhook / Enterhaken
- answer: `THE GRAPPLING HOOK PULLS PART OF YOUR ANSWER OUT OF LINE`
- expected units: 11
- selected after timeout: 10
- missing final token: `LINE`
- feedback: false

The previous `timeout waiting for roadmap current boss centered` condition is not the current failure.

## Root-cause assessment
The Level-6 ability intentionally performs repeated delayed pulls: once the selected-answer length reaches its next trigger, Ironhook disables the check button, waits roughly 360 ms, pops a selected word, advances the next trigger, rerenders and may schedule another pull.

The current smoke solver fills the sentence, waits, refills when a pull reduced the selection, and then clicks `check` without explicitly waiting for the Ironhook pull cycle/check-button state to become stable. In both candidate failures the final `LINE` token is pulled back out around the check attempt, leaving no boss feedback.

Classification: `IRONHOOK-SMOKE-SYNC-L6` — a reproducible QA-harness synchronization race around an intentional boss mechanic. This evidence does not by itself prove a real-device gameplay defect.

## Independent review
Status: `BLOCKED_EXISTING_QA`

Critical blocker:
- revision-bound browser gameplay gate fails twice at Level 6 because the smoke solver is not synchronized with the repeated Ironhook pull cycle.

Quality score:
- NOT FINALIZED. The provisional weighted assessment would exceed the numeric threshold, but critical blockers override aggregate scoring.

## Repair-loop decision
No test or gameplay repair is allowed inside this documentation-only revalidation.

Safe next step:
1. create a separate explicitly scoped QA repair branch from current `main`;
2. keep the intentional Ironhook gameplay mechanic unchanged;
3. make the smoke solver wait for a stable, enabled check state / completed pull cycle before submission;
4. add/retain an assertion that repeated Ironhook pulls really occurred;
5. rerun the full browser campaign regression, not only Level 6;
6. return to this dry-run evidence only after that repair is independently green.

## Release decision
- Dry-run documentation branch: REVIEW COMPLETE / BLOCKED
- Game automated release quality gate: BLOCKED
- Production gameplay changed by this branch: NO
- Merge to production: NOT PERFORMED
- Real-device certification: NOT CLAIMED
