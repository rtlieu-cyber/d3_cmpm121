import { checkReachable } from "./can_reach.ts";
import { Recipe } from "./mod.ts";
import { blueprints } from "./recipes.ts";
import { assertEquals } from "@std/assert";

Deno.test("make sure a material is reachable when you have the correct opensWith item", () => {
  assertEquals(checkReachable(blueprints), []);
});

Deno.test("make sure a broken table returns a recipe", () => {
  const recipe: Recipe[] = [{
    output: "test item",
    ingredients: { "item_you_cant_get": 1 },
  }];
  assertEquals(checkReachable(recipe), recipe);
});
