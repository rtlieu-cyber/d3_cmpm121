export type Recipe = {
  output: string;
  ingredients: Record<string, number>;
};

export const blueprints: Recipe[] = [
  {
    output: "insulated wire",
    ingredients: { "scrap metal": 2, "biofiber": 1 },
  },
  {
    output: "filter suit",
    ingredients: { "insulated wire": 1, "biofiber": 2 },
  },
  {
    output: "power cell",
    ingredients: { "ion crystal": 2, "scrap metal": 1 },
  },
  {
    output: "signal amplifier",
    ingredients: { "ion crystal": 1, "insulated wire": 1 },
  },
  {
    output: "rescue beacon",
    ingredients: { "power cell": 1, "signal amplifier": 1, "scrap metal": 3 },
  },
];
