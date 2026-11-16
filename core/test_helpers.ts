import { GameState } from "./rules.ts";
import { type Terrain } from "./terrain.ts";
import { terrainAt } from "./terrain.ts";

const SEED = 121;

export function searchForTerrain(targetTerrain: Terrain): GameState {
  for (let x = 1; x < 10_000; x++) {
    for (let y = 1; y < 10_000; y++) {
      if (terrainAt(SEED, x, y) === targetTerrain) {
        return {
          seed: SEED,
          player: { x, y },
          inventory: {},
          changed_cells: [],
          endgame: false,
        };
      }
    }
  }
  throw new Error("Found no terrain");
}
