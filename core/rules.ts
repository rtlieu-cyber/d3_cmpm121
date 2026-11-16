// The rules of the game. There is no clock here: a command updates the state at
// once, and the events it returns are a record of what happened. Whoever called
// apply() decides how, or whether, to show them over time.

// import { getTruncationContextLengthFromEnv } from "jsr:@std/internal@^1.0.12/truncate-build-message";
import { isPassable, type Terrain, terrainAt } from "./terrain.ts";
// import { tokenize } from "jsr:@std/internal@^1.0.12/diff-str";
import { possible_mats } from "./terrain.ts";
import { capstone, type Recipe } from "./recipes.ts";

export type Cell = { x: number; y: number };

export type Direction = "north" | "south" | "east" | "west";

// Plain data that survives JSON. Terrain is absent because the seed can recompute
// it: besides the seed, only what the player has caused belongs here.
export type GameState = {
  seed: number;
  player: Cell;
  inventory: Record<string, number>;
  changed_cells: Cell[];
  endgame: boolean;
};

// Command: https://gameprogrammingpatterns.com/command.html
export type Command = { type: "move"; direction: Direction } | {
  type: "gather";
} | { type: "craft"; recipe: Recipe };

// Domain Event: https://martinfowler.com/eaaDev/DomainEvent.html
export type GameEvent =
  | { type: "moved"; from: Cell; to: Cell }
  | { type: "blocked"; at: Cell; toward: Cell; terrain: Terrain }
  | {
    type: "gathered";
    at: Cell;
    terrain: Terrain;
    item: string;
    inventory: Record<string, number>;
  }
  | {
    type: "craftedSuccess";
    inventory: Record<string, number>;
    output: string;
  }
  | {
    type: "craftedFailure";
    inventory: Record<string, number>;
    output: string;
    missing: Record<string, number>;
  }
  | {
    type: "gameEnded";
  };

const STEPS: Record<Direction, Cell> = {
  north: { x: 0, y: -1 },
  south: { x: 0, y: 1 },
  east: { x: 1, y: 0 },
  west: { x: -1, y: 0 },
};

// Singleton, avoided on purpose: tests make as many games as they need. https://gameprogrammingpatterns.com/singleton.html
export function newGame(seed: number): GameState {
  return {
    seed,
    player: { x: 0, y: 0 },
    inventory: {},
    changed_cells: [],
    endgame: false,
  };
}

// The single way in. It updates the state it is given and returns the events.
export function apply(state: GameState, command: Command): GameEvent[] {
  if (state.endgame === true) {
    return [];
  }
  switch (command.type) {
    case "move":
      return move(state, command.direction);
    case "gather":
      return gather(state);
    case "craft":
      return craft(state, command.recipe);
  }
}

function move(state: GameState, direction: Direction): GameEvent[] {
  const step = STEPS[direction];
  // Events are retained and played back later, while state keeps changing. So an
  // event gets cells of its own, never an object that state still holds.
  // Aliasing Bug: https://martinfowler.com/bliki/AliasingBug.html
  // Cells in events act as a Value Object: https://martinfowler.com/bliki/ValueObject.html
  const from = { ...state.player };
  const to = { x: from.x + step.x, y: from.y + step.y };
  const terrain = terrainAt(state.seed, to.x, to.y);
  if (!isPassable(terrain, state.inventory)) {
    return [{ type: "blocked", at: from, toward: to, terrain }];
  }
  state.player.x = to.x;
  state.player.y = to.y;
  return [{ type: "moved", from, to }];
}

function gather(state: GameState): GameEvent[] {
  const terrain = terrainAt(state.seed, state.player.x, state.player.y);
  const item = possible_mats[terrain].yields;
  if (
    !state.changed_cells.some((cell) =>
      cell.x === state.player.x && cell.y === state.player.y
    )
  ) {
    if (item) {
      state.inventory[item] = (state.inventory[item] ?? 0) + 1;
      state.changed_cells.push({ ...state.player });
      return [{
        type: "gathered",
        at: { ...state.player },
        terrain: terrain,
        item: item,
        inventory: { ...state.inventory },
      }];
    }
  }
  return [];
}

function craft(state: GameState, recipe: Recipe): GameEvent[] {
  const checkIngredients = checkRecipe(state, recipe);
  if (Object.keys(checkIngredients).length === 0) {
    for (const [item, required] of Object.entries(recipe.ingredients)) {
      state.inventory[item] = state.inventory[item] - required;
    }
    state.inventory[recipe.output] = (state.inventory[recipe.output] ?? 0) + 1;
    if (recipe.output === capstone) {
      state.endgame = true;
      return [{
        type: "craftedSuccess",
        inventory: { ...state.inventory },
        output: recipe.output,
      }, {
        type: "gameEnded",
      }];
    }
    return [{
      type: "craftedSuccess",
      inventory: { ...state.inventory },
      output: recipe.output,
    }];
  } else {
    return [{
      type: "craftedFailure",
      output: recipe.output,
      inventory: { ...state.inventory },
      missing: checkIngredients,
    }];
  }
}

export function checkRecipe(state: GameState, recipe: Recipe) {
  const missing: Record<string, number> = {};
  for (const [item, required] of Object.entries(recipe.ingredients)) {
    const owned = state.inventory[item] ?? 0;
    const difference = Math.max(0, required - owned);
    if (difference > 0) {
      missing[item] = difference;
    }
  }
  return missing;
}
