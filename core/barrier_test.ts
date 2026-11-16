import { assertEquals } from "@std/assert";
import { apply, isPassable, terrainAt } from "./mod.ts";
import { searchForTerrain } from "./test_helpers.ts";

Deno.test("cannot pass to toxic marsh with empty inventory", () => {
  const state = searchForTerrain("toxic marsh");
  state.inventory = {};
  assertEquals(
    isPassable(
      terrainAt(state.seed, state.player.x, state.player.y),
      state.inventory,
    ),
    false,
  );
});

Deno.test("can pass to toxic marsh with filter suit", () => {
  const state = searchForTerrain("toxic marsh");
  state.inventory = {
    "filter suit": 1,
  };
  assertEquals(
    isPassable(
      terrainAt(state.seed, state.player.x, state.player.y),
      state.inventory,
    ),
    true,
  );
});

Deno.test("can harvest materials from toxic marsh with filter suit", () => {
  const state = searchForTerrain("toxic marsh");
  state.inventory = {
    "filter suit": 1,
    "ion crystal": 0,
  };
  apply(state, { type: "gather" });
  assertEquals(state.inventory["ion crystal"], 1);
});
