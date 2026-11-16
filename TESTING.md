# Alien Frontier — D3 Manual Test Script

This is the Step 7 browser test plan. It supplements the automated tests in `core/`; it does not replace them. A teammate who did **not** implement a feature should test it while the other records observations. **Do not check off steps until performed.**

## Setup

1. Run `deno task dev` at the repository root.
2. Open the printed local URL with `?seed=121` appended (the port may vary).
3. Keep browser Developer Tools (F12 → Console) available and ensure audio is on.
4. Reload before each group that needs an empty inventory or a fresh start.
5. Check results after animations finish. Core state can update before its presentation finishes.

**Controls:** Arrow keys move, **E** gathers from the current tile, crafting buttons make items, and **Sound: On/Off** toggles audio.

**Browser console checks:**

```js
game.state;
game.state.inventory;
game.state.changed_cells;
game.state.endgame;
game.controller.recorded.length;
document.getElementById("live").textContent;
document.getElementById("win-banner")?.hidden;
```

## Reference

| Terrain       | Color       | Resource    | Access               |
| ------------- | ----------- | ----------- | -------------------- |
| Scrap Flats   | Rust orange | Scrap Metal | From start           |
| Fungal Grove  | Green       | Biofiber    | From start           |
| Toxic Marsh   | Purple      | Ion Crystal | Requires Filter Suit |
| Basalt Cliffs | Dark gray   | None        | Never traversable    |

Recipes are in `core/recipes.ts`. Use that file if quantities change instead of treating these values as permanent.

| Output           | Current ingredients                               |
| ---------------- | ------------------------------------------------- |
| Insulated Wire   | 2 Scrap Metal + 1 Biofiber                        |
| Filter Suit      | 1 Insulated Wire + 2 Biofiber                     |
| Power Cell       | 2 Ion Crystals + 1 Scrap Metal                    |
| Signal Amplifier | 1 Ion Crystal + 1 Insulated Wire                  |
| Rescue Beacon    | 1 Power Cell + 1 Signal Amplifier + 3 Scrap Metal |

The current recipe chain requires at least **8 Scrap Metal, 4 Biofiber, and 3 Ion Crystals** in total (including two Insulated Wires).

## A. Startup, movement, and console

| ID  | Action                                                   | Expected result                                                                                  | Tested? |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------- |
| A01 | Load `?seed=121`.                                        | One Phaser canvas, one fixed-size arcade console, visible HUD, no browser errors.                | ☐       |
| A02 | Inspect `game.state`.                                    | Seed 121; player `{x:0,y:0}`; empty inventory and changed cells; `endgame:false`; no stored map. | ☐       |
| A03 | Tap Right once and wait.                                 | Marker moves one cell east, Position reads `1, 0`, System Log says `moved to 1, 0`.              | ☐       |
| A04 | Tap a second arrow during a movement animation.          | One pending input plays after the previous animation; no skipped tile.                           | ☐       |
| A05 | Hold an arrow, then release.                             | Repeated movement while held, then stops after pending movement finishes.                        | ☐       |
| A06 | Tap directions quickly and wait.                         | Marker and final HUD position match `game.state.player`.                                         | ☐       |
| A07 | Attempt to enter Basalt Cliffs.                          | Player remains in place; blocked message and bump presentation appear.                           | ☐       |
| A08 | Before making Filter Suit, attempt to enter Toxic Marsh. | Player is blocked; log identifies missing `filter suit`.                                         | ☐       |
| A09 | Compare `?seed=121` and `?seed=7`, then reload 121.      | Different seeds generate different layouts; same seed repeats same layout.                       | ☐       |
| A10 | Toggle browser fullscreen with F11.                      | Machine stays fixed-size and centered when it fits; game canvas is not stretched.                | ☐       |
| A11 | Resize browser shorter and scroll HUD cards.             | Header and sound button remain fixed; only middle HUD cards scroll.                              | ☐       |
| A12 | Press arrows while HUD has a scrollbar.                  | Arrows move player; page does not scroll instead.                                                | ☐       |

## B. Gathering and inventory

Reload to a fresh game first.

| ID  | Action                                                                   | Expected result                                                      | Tested? |
| --- | ------------------------------------------------------------------------ | -------------------------------------------------------------------- | ------- |
| B01 | Stand on Scrap Flats and press E once.                                   | Exactly 1 Scrap Metal added; log reports gathering from Scrap Flats. | ☐       |
| B02 | Press E again without moving.                                            | No second reward; inventory unchanged.                               | ☐       |
| B03 | Leave the tile, return, and press E.                                     | Still no second reward; tile remains depleted.                       | ☐       |
| B04 | Gather from a different, untouched Scrap Flats tile.                     | Another Scrap Metal added.                                           | ☐       |
| B05 | Gather from Fungal Grove.                                                | Exactly 1 Biofiber added; correct terrain/log shown.                 | ☐       |
| B06 | Compare inventory HUD to `game.state.inventory` after animations settle. | Names and quantities match.                                          | ☐       |
| B07 | Inspect `game.state.changed_cells`.                                      | Each harvested tile is recorded once, even after repeated E presses. | ☐       |

## C. Crafting

| ID  | Action                                                  | Expected result                                                               | Tested? |
| --- | ------------------------------------------------------- | ----------------------------------------------------------------------------- | ------- |
| C01 | Inspect recipes with an empty inventory.                | Five recipe buttons appear; unavailable recipes indicate missing ingredients. | ☐       |
| C02 | Click Insulated Wire before collecting enough material. | Failure message lists missing ingredients; inventory unchanged.               | ☐       |
| C03 | Gather the required inputs for Insulated Wire.          | Button updates to no longer report missing ingredients.                       | ☐       |
| C04 | Craft Insulated Wire.                                   | Ingredients deducted, one Insulated Wire added, success logged.               | ☐       |
| C05 | Attempt to craft it again without enough ingredients.   | Failure message; no negative inventory or extra output.                       | ☐       |
| C06 | Gather required resources and craft Filter Suit.        | Filter Suit appears in inventory; crafting inputs are consumed.               | ☐       |
| C07 | Check recipe labels after gathering and crafting.       | Missing-item counts update to reflect inventory.                              | ☐       |
| C08 | Click a recipe with mouse, then press arrow keys.       | Game movement resumes; focus does not trap controls.                          | ☐       |

## D. Terrain barrier and late-game progression

| ID  | Action                                               | Expected result                                       | Tested? |
| --- | ---------------------------------------------------- | ----------------------------------------------------- | ------- |
| D01 | Try to enter Toxic Marsh without Filter Suit.        | Movement blocked.                                     | ☐       |
| D02 | Craft Filter Suit, then enter Toxic Marsh.           | Movement permitted; Filter Suit remains in inventory. | ☐       |
| D03 | Press E on untouched Toxic Marsh.                    | One Ion Crystal added.                                | ☐       |
| D04 | Press E again there.                                 | No extra Ion Crystal from same tile.                  | ☐       |
| D05 | Collect requirements for Power Cell and craft it.    | Materials subtracted; Power Cell added.               | ☐       |
| D06 | Craft another Insulated Wire, then Signal Amplifier. | Materials subtracted; Signal Amplifier added.         | ☐       |
| D07 | Enter Toxic Marsh again afterward.                   | Filter Suit still grants passage.                     | ☐       |

## E. Rescue Beacon and victory banner

| ID  | Action                                                  | Expected result                                                                                  | Tested? |
| --- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------- |
| E01 | Load a fresh game.                                      | `game.state.endgame` false and `#win-banner` hidden.                                             | ☐       |
| E02 | Collect and craft all requirements for Rescue Beacon.   | Rescue Beacon recipe becomes craftable.                                                          | ☐       |
| E03 | Craft Rescue Beacon.                                    | Core emits `craftedSuccess` and then `gameEnded`; `endgame` true.                                | ☐       |
| E04 | Wait for ending presentation.                           | Mission Complete victory banner appears over display; Objective changes to rescue-complete text. | ☐       |
| E05 | Inspect banner in fullscreen and smaller browser sizes. | Legible, centered over game display, no inappropriate stretching.                                | ☐       |
| E06 | Press arrows and E after victory.                       | State and inventory do not change.                                                               | ☐       |
| E07 | Attempt to craft again after victory.                   | State and inventory do not change.                                                               | ☐       |
| E08 | Reload.                                                 | Fresh game starts and banner hides again.                                                        | ☐       |

## F. Sound and keyboard accessibility

| ID  | Action                                                 | Expected result                                                   | Tested? |
| --- | ------------------------------------------------------ | ----------------------------------------------------------------- | ------- |
| F01 | With Sound On, move across a tile.                     | A person hears a movement tick.                                   | ☐       |
| F02 | Bump into blocked terrain.                             | A person hears a low bump sound.                                  | ☐       |
| F03 | Gather an item and craft one successfully.             | Distinct gathering and crafting sounds are audible.               | ☐       |
| F04 | Click Sound button once.                               | Label changes to `Sound: off`; actions are muted.                 | ☐       |
| F05 | Click Sound button again.                              | Label changes to `Sound: on`; confirmation chime audible.         | ☐       |
| F06 | Tab to Sound button and press Space.                   | Button toggles from keyboard.                                     | ☐       |
| F07 | Observe System Log while movement/crafting is playing. | `#live` reflects most recently _played_ event, not future events. | ☐       |
| F08 | Set browser zoom to 200% or use high-DPI display.      | Grid remains crisp and essential UI is reachable.                 | ☐       |

## G. Automated tests and recorded run

Run:

```sh
deno task fmt
deno task test
deno task ci
```

If `core/run.json` and `core/replay_test.ts` exist, check that the run starts on its stored seed, completes with `endgame === true`, and produces identical state **and events** when replayed twice. Record actual results, not assumed ones.

- Playthrough command count: **________**
- Tuning change after measuring count, or reason for keeping current balance: **________**
- Automated test result/date: **________**

## H. Required Step 7 bug promotion: red → green

**Promotion rule:** A bug discovered by hand must become a permanent failing test in `core/` **before** the fix, unless the bug is strictly in `game/`, in which case add a precise repeatable manual test here. You **still need at least one** core bug promoted to a failing-then-passing test.

1. Have the teammate who did **not** implement the feature run its tests while the other writes down exact actions and observations.
2. For a core bug, write a regression test next to the relevant rule (such as `core/rules_test.ts` or `core/recipes_test.ts`) that calls `apply()` and asserts expected behavior.
3. Run `deno task test` **before fixing the code**. Confirm an assertion fails (red). A type-check error alone is not the red assertion.
4. Have the _other teammate_ fix the core rule; rerun `deno task test` and `deno task ci` to verify green.
5. For a purely browser/client bug, add a permanent regression case to this script; continue looking for one core bug as well.
6. If no real core bug exists after honest testing, follow the assignment's fallback: one partner temporarily plants a core bug not caught by existing tests, the other discovers it and writes the failing test, and the first partner restores/corrects the implementation. **Disclose that the bug was planted.**
7. To demonstrate red/green in the walkthrough, temporarily undo the fix locally, run the failing test, then restore the fix and rerun tests. Do not commit failing code or bypass hooks.

### Bug report template

- Test ID:
- Seed:
- Tester/date:
- Actions (exact commands/inputs):
- Expected result:
- Actual result:
- Core or client issue?:
- Regression test file (or new manual test row):
- Failing assertion observed (red):
- Fix/commit:
- Passing assertion observed (green):

## I. Final sign-off

- [ ] A teammate other than the feature author followed the relevant manual tests.
- [ ] Someone actually heard and verified the audio cues.
- [ ] Keyboard-only movement and Sound button were checked.
- [ ] Victory was reached and the victory banner verified.
- [ ] At least one core bug was promoted to a regression test (or explicitly planted per fallback).
- [ ] Red assertion was observed before the fix; green afterward.
- [ ] `deno task ci` passed after all changes.
- [ ] `README.md` states the game goal, live URL, how to play, local run commands, and how to add a recipe.

**Tester:** __________\
**Partner/note-taker:** __________\
**Date:** __________\
**Overall observed result:** __________
