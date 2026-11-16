# ALIEN FRONTIER

**CMPM 121 · D3 — World and Progression Modeling · Fall 2026**

**Alien Frontier** is a small, browser-based exploration and crafting game. You are stranded on an alien planet with an empty inventory and one mission: gather resources, build a **Rescue Beacon**, and signal an extraction vessel.

The world is procedurally generated from a seed. Explore with the arrow keys, harvest materials from different biomes, craft tools to overcome barriers, and assemble the final technology needed to escape. The game is presented inside a fixed-size, sci-fi arcade console with a Phaser grid, an inventory and crafting terminal, event messages, and synthesized sound.

**Source code:** https://github.com/rtlieu-cyber/d3_cmpm121\
**Play online:** Check the repository's GitHub Pages deployment once published and verified.

## How to play

| Control              | Action                                                        |
| -------------------- | ------------------------------------------------------------- |
| **Arrow keys**       | Move one tile at a time; holding an arrow continues movement. |
| **E**                | Gather a resource from the tile you occupy.                   |
| **Crafting buttons** | Craft an item when you have the required ingredients.         |
| **Sound: On/Off**    | Mute or unmute audio feedback.                                |
| **F5 / Refresh**     | Restart on the same seed with an empty inventory.             |

**Objective:** Craft the **Rescue Beacon**. Each resource-producing tile can be gathered **only once**, so explore for fresh tiles as your supplies run out. Crafting recipes display the ingredients you are missing.

### Terrain and resources

| Terrain           | Appearance  | Resource    | Access                 |
| ----------------- | ----------- | ----------- | ---------------------- |
| **Scrap Flats**   | Rust orange | Scrap Metal | Available immediately  |
| **Fungal Grove**  | Green       | Biofiber    | Available immediately  |
| **Toxic Marsh**   | Purple      | Ion Crystal | Requires a Filter Suit |
| **Basalt Cliffs** | Dark gray   | None        | Impassable             |

The **Filter Suit** is reusable: once crafted, it stays in your inventory and allows you to move into Toxic Marsh tiles. Basalt Cliffs remain impassable.

### Crafting recipes

| Crafted item         | Ingredients                                       | Purpose                                     |
| -------------------- | ------------------------------------------------- | ------------------------------------------- |
| **Insulated Wire**   | 2 Scrap Metal + 1 Biofiber                        | Basic component for more advanced equipment |
| **Filter Suit**      | 1 Insulated Wire + 2 Biofiber                     | Unlocks Toxic Marsh                         |
| **Power Cell**       | 2 Ion Crystals + 1 Scrap Metal                    | Powers the rescue equipment                 |
| **Signal Amplifier** | 1 Ion Crystal + 1 Insulated Wire                  | Boosts the distress signal                  |
| **Rescue Beacon**    | 1 Power Cell + 1 Signal Amplifier + 3 Scrap Metal | Ends the game with a victory message        |

The current crafting chain requires **8 Scrap Metal, 4 Biofiber, and 3 Ion Crystals** in total, assuming no wasted crafting. The recipes themselves are defined in [`core/recipes.ts`](core/recipes.ts).

### Progression

```text
START — crash-landed, empty inventory
  |
  v
Gather Scrap Metal + Biofiber
  |
  v
Craft Insulated Wire
  |
  v
Craft Filter Suit ──> Toxic Marsh becomes accessible
  |                          |
  |                          v
  |                    Gather Ion Crystals
  |                          |
  +--------------------------+
                             |
                             v
                 Craft Power Cell
                 Craft another Insulated Wire
                 Craft Signal Amplifier
                             |
                             v
                    Craft Rescue Beacon
                             |
                             v
              MISSION COMPLETE — Rescue inbound!
```

## Run locally

**Requirements:** [Deno](https://docs.deno.com/runtime/getting_started/installation/) and [Git](https://git-scm.com/downloads).

```sh
git clone https://github.com/rtlieu-cyber/d3_cmpm121.git
cd d3_cmpm121
deno task setup
deno task dev
```

Open the local address printed in your terminal. To choose a reproducible world, append a seed to the URL:

```text
?seed=121
```

For example, if Vite prints `http://localhost:5173/`, use `http://localhost:5173/?seed=121`. The port may differ.

## Project structure and architecture

```text
core/
  rules.ts              Game state, commands, events, gathering, crafting, victory
  terrain.ts            Seeded terrain, yields, and movement barriers
  recipes.ts            Data-driven crafting blueprints and final capstone
  can_reach.ts          Crafting-chain reachability analysis
  mod.ts                Public core API
  *_test.ts             Unit, content, ending, and determinism tests
  run.json              Recorded complete playthrough (seed 121)
  replay_test.ts        Full-game replay and deterministic outcome tests

game/
  main.ts               Wires together game systems
  controller.ts         Keyboard input, command queue, command recording
  presenter.ts          Plays events in sequence
  grid/grid_view.ts     Phaser-based terrain and player display
  hud.ts                Inventory, status, event log, victory presentation
  recipe_book.ts        Crafting button presentation
  sounds.ts             Web Audio feedback
  style.css             Arcade console, HUD, and victory banner

index.html               Game layout and victory overlay
TESTING.md               Manual test plan and bug-promotion procedure
README.md                Project documentation
```

The design deliberately separates **game rules from presentation**:

- **Core (`core/`)** contains deterministic rules and plain-data state. `apply(state, command)` updates the state immediately and returns events. The core does not depend on the browser, game client, or Phaser.
- **Client (`game/`)** receives player commands, queues and presents events, and displays the current experience. Only `game/grid/` imports Phaser; the HUD and crafting UI are ordinary HTML/CSS.
- **Event order** matters: the core may update immediately, but the presenter plays visual and audio feedback in order so that the HUD does not show future events before animations finish.

Relevant patterns include **Command**, **Domain Event**, **Event Queue**, **Observer**, **Mediator**, **Facade**, **Humble Object**, and **Hexagonal Architecture**. Recipes and terrain definitions are data-driven rather than separate classes for each item or biome.

### How to add a crafting recipe

1. Open [`core/recipes.ts`](core/recipes.ts).
2. Add a new object to the `blueprints` array, following the existing `Recipe` type:

   ```ts
   {
     output: "example device",
     ingredients: { "scrap metal": 1, "biofiber": 1 },
   }
   ```

3. Make sure each ingredient is obtainable through terrain yields or an earlier recipe. If introducing a new gatherable resource, update the terrain data in `core/terrain.ts` as well.
4. Run `deno task test` and check the reachability/content tests. Run `deno task ci` before committing.

The crafting UI reads the blueprint list, so adding a valid recipe to the table also adds its crafting button.

## Testing and reproducibility

Automated tests run the **core without a browser**. The repository contains tests for movement and barriers, gathering, recipes, reachability, the game ending, determinism, and a recorded complete playthrough.

The recorded run in [`core/run.json`](core/run.json) uses **seed 121** and contains **52 commands**: 31 moves, 15 gathering commands, and 6 crafting commands. [`core/replay_test.ts`](core/replay_test.ts) applies those commands to a fresh game, checks for victory, and compares repeated runs for identical states and events.

```sh
deno task test       # Core tests, including the full-game replay
deno task ci         # Formatting, lint, types, tests, boundary, build
```

For browser-level verification, follow [`TESTING.md`](TESTING.md). It covers navigation, UI, gathering, crafting, barriers, audio, victory, and the required **red/green regression-test** process. Manual tests are performed by a person; they are not included in `deno task ci`.

Useful browser developer-console commands:

```js
game.state; // Current logical state
game.controller.recorded.length; // Number of commands used so far
game.state.endgame; // true after Rescue Beacon is crafted
```

To copy the currently recorded commands from Chrome/Edge developer tools:

```js
copy(JSON.stringify({
  seed: game.state.seed,
  commands: game.controller.recorded,
}));
```

### Development commands

| Command              | Purpose                                      |
| -------------------- | -------------------------------------------- |
| `deno task setup`    | Install dependencies and configure Git hooks |
| `deno task dev`      | Start the local development server           |
| `deno task fmt`      | Format files                                 |
| `deno task lint`     | Run lint checks                              |
| `deno task check`    | Type-check the project                       |
| `deno task test`     | Run core tests                               |
| `deno task boundary` | Verify core/client import boundaries         |
| `deno task build`    | Build the production site                    |
| `deno task preview`  | Preview the production build                 |
| `deno task ci`       | Run all required automated checks            |

## Team contributions

This project was developed collaboratively for **UCSC CMPM 121 D3**.

- **Weichen Sun (Allen):** Alien Frontier visual theme, arcade-console and HUD layout, progression planning, victory banner/presentation, command recording, full-game replay/testing contributions, and documentation.
- **Rayden Lieu:** Core gathering and crafting systems, recipe/terrain modeling, barrier and reachability implementation, and supporting tests.

Contributions evolved during development; the Git commit history provides the authoritative breakdown of changes and authorship.

## Credits and acknowledgements

The project builds on the instructor-provided CMPM 121 D3 starter. Its tooling was adapted from the [CMPM 121 Fall 2026 D2 starter](https://github.com/ucsc-cmpm-121-f26/d2-starter), and the Phaser setup follows the instructor's E4 starter. The original scaffold README noted instructor-directed development with Anthropic Claude agent assistance. Original dependencies retain their respective licenses; this README does not assign a new license to the starter material.
