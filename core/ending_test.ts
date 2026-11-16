import { assertEquals } from "@std/assert";
import { apply, newGame } from "./rules.ts";
import { blueprints } from "./mod.ts";

Deno.test("ended game, make sure no commands run", () => {
  const state = newGame(121);
  state.endgame = true;
  const snapshot = JSON.parse(JSON.stringify(state));
  assertEquals(apply(state, { type: "move", direction: "east" }), []);
  assertEquals(state, snapshot);
  assertEquals(apply(state, { type: "gather" }), []);
  assertEquals(state, snapshot);
  assertEquals(apply(state, { type: "craft", recipe: blueprints[0] }), []);
  assertEquals(state, snapshot);
});
