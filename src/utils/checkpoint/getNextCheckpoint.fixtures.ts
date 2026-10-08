import { CHECKPOINT_PRIORITY } from "@/constants/checkpoint";
import type {
  AxisClosenessDoubleCheckpointCard,
  AxisClosenessSingleCheckpointCard,
  AxisPuzzleCheckpointCard,
  CheckpointCard,
  CheckpointEngineInput,
  CheckpointRecord,
  CheckpointShownCard,
  CheckpointTriggerInput,
  CompassPoint,
  HalfwayCheckpointCard,
  NewTraitCheckpointCard,
  NolanPathCheckpointCard,
  PositionPuzzleCheckpointCard,
  RunningAxis,
  RunningCompass,
  RunningState,
  StatsCheckpointCard,
} from "@/types/checkpoint";
import type { NolanQuadrantKey, ResultEntry } from "@/types/results";
import { getQuadrantsVisited } from "@/utils/running-state/getQuadrantsVisited";
import { toRunningAxis } from "@/utils/running-state/toRunningAxis";
import { createOrientation } from "@/utils/vitest/createOrientation";
import { createSurvey } from "@/utils/vitest/createSurvey";

export const SEED = "0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35";

// The engine is a function of the state, so most cases need no quiz at all:
// a state is built by hand, at boundary `done` of a quiz of `all` questions.
export const createState = (
  done: number,
  all: number,
  overrides: Partial<RunningState> = {},
): RunningState => ({
  progress: {
    all,
    done,
    answered: done,
    skipped: 0,
    left: all - done,
    share: done / all,
    midpointBoundary: Math.ceil(all / 2),
  },
  timing: { timedQuestions: 0, minutesLeft: 8 },
  scores: {},
  axes: [],
  archetypes: [],
  unlockedTraits: [],
  compass: null,
  ...overrides,
});

// A two-sided axis "Lewica - Prawica" style: the start side is the negative
// one. The lean and the leading side are worked out as the running state
// does.
export const createTwoSidedAxis = (
  id: string,
  startValue?: number,
  endValue?: number,
  answered = 5,
): RunningAxis =>
  toRunningAxis(
    { id, answered },
    {
      orientation: createOrientation(`${id}-start`, `Start ${id}`),
      value: startValue,
    },
    {
      orientation: createOrientation(`${id}-end`, `Koniec ${id}`),
      value: endValue,
    },
  ) as RunningAxis;

export const createSingleAxis = (
  id: string,
  value?: number,
  answered = 5,
): RunningAxis =>
  toRunningAxis(
    { id, answered },
    { orientation: createOrientation(`${id}-only`, `Skala ${id}`), value },
  ) as RunningAxis;

// The archetypes of a state, closest first, one per closeness given.
export const createArchetypes = (
  values: (number | undefined)[],
): ResultEntry[] =>
  values.map((value, index) => ({
    orientation: createOrientation(
      `archetype-${index + 1}`,
      `Postać ${index + 1}`,
      { type: "identity" },
    ),
    value,
  }));

const QUADRANT_SIGNS: Record<NolanQuadrantKey, [x: number, y: number]> = {
  topLeft: [-1, 1],
  topRight: [1, 1],
  bottomLeft: [-1, -1],
  bottomRight: [1, -1],
};

// A point of a trail, well inside the quadrant named, reached at `done`.
export const createCompassPoint = (
  done: number,
  quadrant: NolanQuadrantKey,
  distance = 0.5,
): CompassPoint => {
  const [x, y] = QUADRANT_SIGNS[quadrant];

  return {
    x: x * distance,
    y: y * distance,
    level: "moderate",
    quadrant,
    done,
  };
};

// A compass whose trail has one point per quadrant given, reached at
// boundaries 1, 2, 3, ...
export const createCompass = (
  quadrants: NolanQuadrantKey[],
): RunningCompass => {
  const trail = quadrants.map((quadrant, index) =>
    createCompassPoint(index + 1, quadrant),
  );

  return { trail, quadrantsVisited: getQuadrantsVisited(trail) };
};

export const createRecord = (
  cardsShown: (CheckpointCard | CheckpointShownCard)[] = [],
): CheckpointRecord => ({
  cardsShown: cardsShown.map((item) =>
    "card" in item ? item : { card: item },
  ),
  timeSamples: [],
});

export const createTriggerInput = (
  overrides: Partial<CheckpointTriggerInput> = {},
): CheckpointTriggerInput => ({
  survey: createSurvey(),
  entries: [],
  state: createState(20, 40),
  record: createRecord(),
  seed: SEED,
  ...overrides,
});

export const createEngineInput = (
  overrides: Partial<CheckpointEngineInput> = {},
): CheckpointEngineInput => ({
  ...createTriggerInput(),
  isOptedOut: false,
  enabledTypes: CHECKPOINT_PRIORITY,
  ...overrides,
});

// One card of every type and variant, as the engine would hand them over.

export const halfwayCard: HalfwayCheckpointCard = {
  type: "halfway",
  boundary: 20,
  line: { pool: "halfway", index: 0 },
  percent: 50,
  minutes: 7,
};

export const singleClosenessCard: AxisClosenessSingleCheckpointCard = {
  type: "axis-closeness",
  boundary: 12,
  line: { pool: "axis-closeness-single", index: 1 },
  axisId: "decentralisation",
  variant: "single",
  entry: {
    orientation: createOrientation("decentralisation", "Decentralizacja"),
    value: 83,
  },
};

export const doubleClosenessCard: AxisClosenessDoubleCheckpointCard = {
  type: "axis-closeness",
  boundary: 18,
  line: { pool: "axis-closeness-double", index: 2 },
  axisId: "europe",
  variant: "double",
  start: {
    orientation: createOrientation("federalism", "Federalizm"),
    value: 20,
  },
  end: {
    orientation: createOrientation("euroscepticism", "Eurosceptycyzm"),
    value: 60,
  },
  leadingSide: "end",
};

export const newTraitCard: NewTraitCheckpointCard = {
  type: "new-trait",
  boundary: 30,
  line: { pool: "new-trait", index: 0 },
  trait: createOrientation("monarchism", "Monarchizm"),
};

export const partialPathCard: NolanPathCheckpointCard = {
  type: "nolan-path",
  boundary: 12,
  line: { pool: "nolan-path-partial", index: 0 },
  variant: "partial",
  count: 2,
  trail: [createCompassPoint(1, "topLeft"), createCompassPoint(2, "topRight")],
  isSecondPath: false,
};

export const fullPathCard: NolanPathCheckpointCard = {
  type: "nolan-path",
  boundary: 40,
  line: { pool: "nolan-path-full", index: 1 },
  variant: "full",
  count: 4,
  trail: [
    createCompassPoint(1, "topLeft"),
    createCompassPoint(2, "topRight"),
    createCompassPoint(3, "bottomRight"),
    createCompassPoint(4, "bottomLeft"),
  ],
  isSecondPath: false,
};

export const statsForCard: StatsCheckpointCard = {
  type: "stats",
  boundary: 6,
  line: { pool: "stats-for", index: 0 },
  questionId: "q1",
  thesis: "Podatki powinny być niższe.",
  side: "for",
  counts: { for: 80, against: 900, noAnswer: 20 },
  percent: 8,
};

export const statsAgainstCard: StatsCheckpointCard = {
  ...statsForCard,
  line: { pool: "stats-against", index: 2 },
  side: "against",
  counts: { for: 900, against: 80, noAnswer: 20 },
};

export const axisPuzzleCard: AxisPuzzleCheckpointCard = {
  type: "axis-puzzle",
  boundary: 24,
  line: { pool: "axis-puzzle-ask", index: 1 },
  axisId: "economy",
  start: {
    orientation: createOrientation("free-market", "Wolny rynek"),
    value: 70,
  },
  end: {
    orientation: createOrientation("interventionism", "Interwencjonizm"),
    value: 30,
  },
  leadingSide: "start",
};

const [leader, secondArchetype, thirdArchetype] = createArchetypes([
  72, 60, 41,
]);

export const positionPuzzleCard: PositionPuzzleCheckpointCard = {
  type: "position-puzzle",
  boundary: 55,
  line: { pool: "position-puzzle-ask", index: 2 },
  leader: leader.orientation,
  closeness: 72,
  options: [
    secondArchetype.orientation,
    leader.orientation,
    thirdArchetype.orientation,
  ],
};

export const allCards: CheckpointCard[] = [
  statsForCard,
  statsAgainstCard,
  newTraitCard,
  positionPuzzleCard,
  partialPathCard,
  fullPathCard,
  singleClosenessCard,
  doubleClosenessCard,
  axisPuzzleCard,
  halfwayCard,
];
