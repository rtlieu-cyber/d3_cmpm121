import { assert, assertEquals } from "@std/assert";
import { apply } from "./mod.ts";
import { newGame } from "./rules.ts";
import { blueprints } from "./mod.ts";
import { possible_mats } from "./terrain.ts";

const SEED = 121;

Deno.test("successful craft with enough ingredients", () => {
  const state = newGame(SEED);
  state.inventory = {
    "scrap metal": 2,
    "biofiber": 1,
  };

  const craft = apply(state, { type: "craft", recipe: blueprints[0] });
  assert(craft[0]?.type === "craftedSuccess");
  assertEquals(state.inventory, {
    "insulated wire": 1,
    "scrap metal": 0,
    "biofiber": 0,
  });
});

Deno.test("crafting failure with insufficient ingredients", () => {
  const state = newGame(SEED);
  state.inventory = {
    "scrap metal": 1,
    "biofiber": 1,
  };

  const snapshot = JSON.parse(JSON.stringify(state));

  const craft = apply(state, { type: "craft", recipe: blueprints[0] });
  assert(craft[0]?.type === "craftedFailure");
  assertEquals(state, snapshot);
  assertEquals(craft[0]?.missing, { "scrap metal": 1 });
});

Deno.test("content test", () => {
  const materials = Object.values(possible_mats).filter((item) =>
    item !== null
  );
  const outputs = blueprints.map((recipe) => recipe.output);
  const validItems = new Set([...materials, ...outputs]);

  for (const blueprint of blueprints) {
    for (const item of Object.keys(blueprint.ingredients)) {
      assert(validItems.has(item));
    }
  }
});
