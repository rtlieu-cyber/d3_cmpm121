import { assert, assertEquals, assertNotEquals } from "@std/assert";
import { apply, type GameState, isPassable, terrainAt } from "./mod.ts";
import { possible_mats } from "./terrain.ts";
import { searchForTerrain } from "./test_helpers.ts";

// Each test has a Given-When-Then shape: https://martinfowler.com/bliki/GivenWhenThen.html
const SEED = 121;

// A state with the player just west of a cell that is, or is not, passable.
// Searching keeps these tests honest if the terrain formula changes.
function besideEasternCell(passable: boolean): GameState {
  for (let x = 2; x < 10_000; x++) {
    const here = isPassable(terrainAt(SEED, x, 0));
    const east = isPassable(terrainAt(SEED, x + 1, 0));
    if (here && east === passable) {
      return {
        seed: SEED,
        player: { x, y: 0 },
        inventory: {},
        changed_cells: [],
      };
    }
  }
  throw new Error("Found no suitable cell on this row.");
}

Deno.test("moving onto passable terrain moves the player", () => {
  const state = besideEasternCell(true);
  const { x, y } = state.player;

  const events = apply(state, { type: "move", direction: "east" });

  assertEquals(state.player, { x: x + 1, y });
  assertEquals(events, [{
    type: "moved",
    from: { x, y },
    to: { x: x + 1, y },
  }]);
});

Deno.test("a blocked move changes nothing and reports why", () => {
  const state = besideEasternCell(false);
  const snapshot = JSON.parse(JSON.stringify(state));
  const { x, y } = state.player;
  const target = { x: x + 1, y };

  const events = apply(state, { type: "move", direction: "east" });

  assertEquals(state, snapshot);
  assertEquals(events, [{
    type: "blocked",
    at: { x, y },
    toward: target,
    terrain: terrainAt(SEED, target.x, target.y),
  }]);
});

Deno.test("an event keeps its cells while state moves on", () => {
  const state = besideEasternCell(true);
  const { x, y } = state.player;

  const first = apply(state, { type: "move", direction: "east" });
  const second = apply(state, { type: "move", direction: "west" });
  apply(state, { type: "move", direction: "east" });

  // Both retained events still report the cells from when they happened, even
  // though state.player has since changed.
  assertEquals(first, [{
    type: "moved",
    from: { x, y },
    to: { x: x + 1, y },
  }]);
  assertEquals(second, [{
    type: "moved",
    from: { x: x + 1, y },
    to: { x, y },
  }]);
});

Deno.test("an event keeps its cells while state moves on, and there's harvesting", () => {
  const state = besideEasternCell(true);
  const { x, y } = state.player;

  const firstGather = apply(state, { type: "gather" });
  apply(state, { type: "move", direction: "east" });
  apply(state, { type: "gather" });
  const item = possible_mats[terrainAt(SEED, x, y)];
  assertNotEquals(firstGather[0], null);
  assert(firstGather[0]?.type === "gathered");
  assert(item !== null);
  assertEquals(firstGather[0].inventory, { [item]: 1 });
});

Deno.test("a harvestable terrain is harvested", () => {
  const state = searchForTerrain("scrap flats");
  const { x, y } = state.player;

  apply(state, { type: "gather" });
  const item = possible_mats[terrainAt(SEED, x, y)];
  assertNotEquals(item, null);
  if (item) {
    assertEquals(state.inventory[item], 1);
    assertEquals(state.changed_cells, [{ x, y }]);
    apply(state, { type: "gather" });
    assertEquals(state.inventory[item], 1);
  }
});
