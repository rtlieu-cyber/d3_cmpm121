import { assert, assertEquals } from "@std/assert";
import { apply, type Command, type GameEvent, newGame } from "./mod.ts";
import run from "./run.json" with { type: "json" };

// The recording contains the starting seed
// and the commands from a complete playthrough.
const seed: number = run.seed;
const commands = run.commands as Command[];

// Replay the entire game without opening a browser.
function replay() {
  const state = newGame(seed);
  const events: GameEvent[] = [];

  for (const command of commands) {
    events.push(...apply(state, command));
  }

  return { state, events };
}

// Step 6: A complete run must finish the game.
Deno.test("recorded playthrough reaches victory", () => {
  assert(commands.length > 0, "Recording must contain commands");

  const result = replay();

  assertEquals(result.state.endgame, true);

  assert(
    result.events.some((event) => event.type === "gameEnded"),
    "The Rescue Beacon must trigger gameEnded",
  );

  console.log(`Completed in ${commands.length} commands`);
});

// Step 6: Same seed + commands = same result.
Deno.test("complete playthrough is deterministic", () => {
  const first = replay();

  // Allow the clock to change between runs.
  const start = Date.now();
  while (Date.now() === start) {
    // Wait for the next millisecond.
  }

  const second = replay();

  assertEquals(first.state, second.state);
  assertEquals(first.events, second.events);
});

// State and events must remain JSON-serializable.
Deno.test("complete playthrough survives JSON serialization", () => {
  const result = replay();

  assertEquals(
    JSON.parse(JSON.stringify(result)),
    result,
  );
});
