import {
  blueprints,
  checkRecipe,
  type Command,
  type GameState,
} from "../core/mod.ts";

export class RecipeBook {
  private readonly buttons: HTMLButtonElement[] = [];
  private readonly state: GameState;
  constructor(
    listElement: HTMLUListElement,
    state: GameState,
    sendCommand: (command: Command) => void,
  ) {
    this.state = state;
    const recipeList = listElement;
    recipeList?.replaceChildren();
    for (const blueprint of blueprints) {
      const recipe_element = document.createElement("li");
      const crafting_button = document.createElement("button");
      crafting_button.textContent = `${blueprint.output}`;
      recipe_element.append(crafting_button);
      crafting_button.addEventListener("click", (event) => {
        sendCommand({ type: "craft", recipe: blueprint });
        if (event.detail > 0) {
          crafting_button.blur();
        }
      });
      recipeList.append(recipe_element);
      this.buttons.push(crafting_button);
    }
    this.buttonCheck();
  }

  buttonCheck() {
    blueprints.forEach((blueprint, index) => {
      const recipe = checkRecipe(this.state, blueprint);
      const ready = Object.keys(recipe).length;
      if (ready === 0) {
        this.buttons[index].textContent = `${blueprint.output}`;
      } else {
        this.buttons[index].textContent = `${blueprint.output}, missing: ${
          Object.entries(recipe).map(([item, count]) => `${item}: ${count}`)
            .join(", ")
        }`;
      }
    });
  }
}
