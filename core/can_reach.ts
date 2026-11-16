import { possible_mats } from "./terrain.ts";
import { Recipe } from "./mod.ts";

export function checkReachable(recipes: Recipe[]) {
  const reachable = new Set(
    Object.values(possible_mats).flatMap((row) =>
      row.opensWith === null && row.yields !== null ? [row.yields] : []
    ),
  );

  while (true) {
    const current = reachable.size;
    for (const terrain of Object.values(possible_mats)) {
      if (terrain.opensWith === null || reachable.has(terrain.opensWith)) {
        if (terrain.yields !== null) reachable.add(terrain.yields);
      }
    }

    for (const recipe of recipes) {
      if (
        Object.keys(recipe.ingredients).every((item) => reachable.has(item))
      ) reachable.add(recipe.output);
    }

    if (current === reachable.size) {
      break;
    }
  }

  return recipes.filter((recipe) =>
    !Object.keys(recipe.ingredients).every((item) => reachable.has(item))
  );
}
