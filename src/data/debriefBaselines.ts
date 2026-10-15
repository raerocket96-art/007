export interface FilmDebriefBaseline {
  name: string;
  title: string;
  year?: number;
  outcome: string;
  debrief: string;
  casualties: string[];
  collateralImpact: string;
  comparisonRows?: Array<{
    category: string;
    originalFilm: string;
    simulationHint?: string;
  }>;
}

const normalize = (value: string) => value
  .toLowerCase()
  .replace(/\(\d{4}\)/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const BASELINES: FilmDebriefBaseline[] = [
  {
    name: "The Spy Who Loved Me (1977) — Canonical Film Baseline",
    title: "The Spy Who Loved Me",
    year: 1977,
    outcome: "Bond and Anya Amasova recover the submarine-tracking lead, identify Karl Stromberg as the architect of the submarine thefts, free the captured submarine crews aboard Liparus, prevent nuclear strikes on New York and Moscow, kill Stromberg, and destroy Atlantis. Jaws survives the final destruction.",
    debrief: "The canonical mission succeeds, but the Egypt intelligence trail is lethal: intermediaries connected to the microfilm are killed before Bond can preserve them as sources. The operation ultimately escalates into a large armed assault aboard Liparus and the destruction of Stromberg's Atlantis base.",
    casualties: [
      "Aziz Fekkesh (killed by Jaws)",
      "Max Kalba (killed by Jaws)",
      "Karl Stromberg (killed by Bond)",
      "Multiple Stromberg personnel and submarine crews killed during the Liparus battle"
    ],
    collateralImpact: "Major armed battle aboard Liparus; Atlantis is destroyed by torpedo. Civilian urban destruction is limited, while hostile infrastructure losses are extensive.",
    comparisonRows: [
      { category: "Microfilm / tracking intelligence", originalFilm: "Bond and Anya obtain the microfilm lead and use it to trace the submarine-tracking system toward Stromberg.", simulationHint: "microfilm tracking data" },
      { category: "Low-level sources", originalFilm: "Key Egypt intermediaries Fekkesh and Kalba are killed by Jaws before they can become protected intelligence sources.", simulationHint: "courier source protected alive" },
      { category: "Network exploitation", originalFilm: "The Egypt trail identifies the next link, but much of the network is exposed through pursuit after intermediaries are killed.", simulationHint: "handler architect benefactor network" },
      { category: "Primary strategic threat", originalFilm: "The nuclear-strike plan is ultimately stopped aboard Liparus and Atlantis.", simulationHint: "primary objective nuclear missiles strategic threat" },
      { category: "Friendly survival", originalFilm: "Bond and Anya survive the operation; captured submarine crews are freed, though combat losses occur.", simulationHint: "friendly asset loss agent survival" },
      { category: "Collateral / infrastructure", originalFilm: "Liparus becomes a major battle site and Atlantis is destroyed; urban civilian collateral remains comparatively limited.", simulationHint: "collateral infrastructure" }
    ]
  }
];

export function getFilmDebriefBaseline(titleOrCodename: string): FilmDebriefBaseline | null {
  const needle = normalize(titleOrCodename || "");
  if (!needle) return null;
  return BASELINES.find((baseline) => {
    const title = normalize(baseline.title);
    const name = normalize(baseline.name);
    return needle.includes(title) || title.includes(needle) || needle.includes(name) || name.includes(needle);
  }) || null;
}
