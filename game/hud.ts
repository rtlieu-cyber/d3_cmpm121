import { type GameEvent, type GameState, terrainAt } from "../core/mod.ts";
import { type Cell } from "../core/rules.ts";

function element(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function describe(event: GameEvent): string {
  switch (event.type) {
    case "moved":
      return `moved to ${event.to.x}, ${event.to.y}`;
    case "blocked":
      return `blocked by ${event.terrain} at ${event.toward.x}, ${event.toward.y}`;
    case "gathered":
      return `gathered ${event.item} from ${event.terrain}`;
  }
}

// The readout, as ordinary page elements that CSS can style and that assistive
// tools can read. It changes only as events play.
export class Hud {
  private readonly seed: number;
  private gatheredCells: Cell[] = [];

  constructor(state: GameState) {
    this.seed = state.seed;
    this.showPosition(state.player.x, state.player.y);
  }

  show(event: GameEvent) {
    element("live").textContent = describe(event);
    if (event.type === "moved") this.showPosition(event.to.x, event.to.y);
    if (event.type === "gathered") {
      this.gatheredCells.push({ ...event.at });
      this.showPosition(event.at.x, event.at.y);
    }
  }

  private showPosition(x: number, y: number) {
    const gathered = this.gatheredCells.some((cell) =>
      cell.x === x && cell.y === y
    );
    if (gathered) {
      element("terrain").textContent = ` ${
        terrainAt(this.seed, x, y)
      }: depleted`;
    } else element("terrain").textContent = terrainAt(this.seed, x, y);
    element("position").textContent = `${x}, ${y}`;
  }
}
