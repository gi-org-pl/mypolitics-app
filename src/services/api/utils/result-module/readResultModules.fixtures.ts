// A list of result modules as the back-end contract of the spec describes it,
// one record of each type. No quiz sends the list yet, so the quiz and its
// identifiers are made up.

export const QUIZ_ORIENTATION_IDS = [
  "socialist",
  "liberal",
  "conservative",
  "party-left",
  "party-right",
  "green",
  "hidden",
];

export const QUIZ_AXIS_IDS = ["economy", "society", "compass-x", "compass-y"];

export const resultModulesResponse: unknown = [
  {
    id: "module-header",
    type: "header",
    position: 0,
    column: "start",
    orientationIds: ["socialist", "liberal", "conservative"],
    axisIds: [],
    values: [
      { key: "description", value: "Tożsamość, do której jest ci najbliżej." },
      { key: "label.link", value: "Zobacz stronę" },
    ],
  },
  {
    id: "module-single-axis",
    type: "single_axis",
    position: 1,
    column: "start",
    orientationIds: ["green"],
    axisIds: [],
    values: [{ key: "marker", value: 60 }],
  },
  {
    id: "module-double-axis",
    type: "double_axis",
    position: 2,
    column: "end",
    orientationIds: [],
    axisIds: ["economy"],
    values: [
      { key: "description", value: "Jak blisko ci do każdej ze stron osi." },
      { key: "marker", value: "none" },
    ],
  },
  {
    id: "module-multi-axis",
    type: "multi_axis",
    position: 3,
    column: "start",
    orientationIds: [],
    axisIds: ["economy", "society"],
    values: [
      { key: "title", value: "Ideologie" },
      { key: "groupBy", value: "category" },
    ],
  },
  {
    id: "module-horizontal-bar",
    type: "horizontal_bar",
    position: 4,
    column: "end",
    orientationIds: ["party-left", "party-right"],
    axisIds: [],
    values: [
      { key: "title", value: "Partie" },
      { key: "description", value: "Partie powiązane z twoją tożsamością." },
      { key: "selection", value: "linked_to_leader" },
      { key: "visibleRows", value: 5 },
    ],
  },
  {
    id: "module-nolan-chart",
    type: "nolan_chart",
    position: 5,
    column: "start",
    orientationIds: [],
    axisIds: ["compass-x", "compass-y"],
    values: [
      { key: "label.centre", value: "Centrum" },
      { key: "label.horizontalStartModerate", value: "Umiarkowany socjalizm" },
      { key: "label.horizontalEndExtreme", value: "Wolny rynek" },
      { key: "label.verticalEndModerate", value: "Umiarkowany konserwatyzm" },
      { key: "label.topLeftExtreme", value: "Autorytarna lewica" },
      { key: "label.topLeftExtremeShort", value: "Aut. lewica" },
      { key: "color.topLeft", value: "#ef4444" },
      { key: "color.topRight", value: "oklch(74.6% 0.16 232.661)" },
      { key: "color.bottomLeft", value: "rgb(16 185 129)" },
      { key: "color.bottomRight", value: "#7c3aed" },
    ],
  },
  {
    id: "module-archetype",
    type: "archetype",
    position: 6,
    column: "end",
    orientationIds: ["socialist", "liberal", "conservative"],
    axisIds: [],
    values: [{ key: "title", value: "Tożsamość" }],
  },
  {
    id: "module-traits",
    type: "traits",
    position: 7,
    column: "start",
    orientationIds: ["green", "hidden"],
    axisIds: [],
    values: [{ key: "title", value: "Cechy" }],
  },
];
