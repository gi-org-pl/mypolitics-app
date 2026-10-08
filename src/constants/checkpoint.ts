import { msg } from "@lingui/core/macro";

import type {
  CheckpointOutcome,
  CheckpointPoolId,
  CheckpointPools,
  CheckpointType,
  ScoreTotal,
} from "@/types/checkpoint";
import type { OrientationType } from "@/types/orientation";

// A time sample counts as this many seconds at most.
export const TIME_SAMPLE_CAP_SECONDS = 60;
// With fewer timed questions the taker's own pace is not used, and the time
// left comes from the survey's average finish time.
export const MIN_TIMED_QUESTIONS = 5;
export const MIN_MINUTES_LEFT = 1;
export const SECONDS_PER_MINUTE = 60;

// The share of done questions that makes a boundary the midpoint.
export const MIDPOINT_SHARE = 0.5;

// The types of an axis, as the API sends them.
export const AXIS_TYPE = "axis";
export const COMPASS_X_AXIS_TYPE = "compass_x_axis";
export const COMPASS_Y_AXIS_TYPE = "compass_y_axis";

// The lean of an axis with one orientation is measured from here.
export const SINGLE_AXIS_MIDPOINT = 50;

// The API has no mark for an archetype, so the type stands in for it.
export const ARCHETYPE_ORIENTATION_TYPE: OrientationType = "identity";

export const EMPTY_SCORE_TOTAL: ScoreTotal = { points: 0, maximum: 0 };

// The checkpoint engine.

// The card types in priority order, the highest first.
export const CHECKPOINT_PRIORITY: readonly CheckpointType[] = [
  "stats",
  "new-trait",
  "position-puzzle",
  "nolan-path",
  "axis-closeness",
  "axis-puzzle",
  "halfway",
];

// The one type that says nothing about the taker: every other type beats it.
export const GENERIC_CHECKPOINT_TYPE: CheckpointType = "halfway";

// Pacing. A card may appear only after this many done questions, with this
// many left, this many questions after the previous card, and while fewer
// cards than the cap were shown.
export const CHECKPOINT_MIN_DONE = 5;
export const CHECKPOINT_MIN_LEFT = 4;
export const CHECKPOINT_MIN_GAP = 6;
export const CHECKPOINT_MAX_CARDS = 6;
// The rate: card number k comes no earlier than boundary (k - 1) x R, where R
// is this many questions, or one part of the quiz cut into this many parts
// when that is more.
export const CHECKPOINT_RATE_QUESTIONS = 10;
export const CHECKPOINT_RATE_PARTS = 6;

// An axis gets a card with this many answered questions behind it and a clear
// lean: a value for a single axis, a number of points between the two sides
// for a two-sided one.
export const AXIS_CARD_MIN_ANSWERED = 5;
export const SINGLE_AXIS_MIN_VALUE = 70;
export const TWO_SIDED_AXIS_MIN_LEAN = 15;

// The position puzzle: the archetypes a quiz needs, the points the leader has
// to be ahead of the runner-up, the archetypes right behind the leader that
// the distractors are drawn from, and how many are drawn. The closeness the
// leader needs is `PARTIAL_MATCH_FROM` of the results.
export const POSITION_PUZZLE_MIN_ARCHETYPES = 3;
export const POSITION_PUZZLE_MIN_SEPARATION = 5;
export const POSITION_PUZZLE_DISTRACTOR_SOURCES = 4;
export const POSITION_PUZZLE_DISTRACTORS = 2;
// The purposes of its two seeded draws.
export const POSITION_PUZZLE_DISTRACTORS_DRAW = "position-puzzle-distractors";
export const POSITION_PUZZLE_ORDER_DRAW = "position-puzzle-order";

// The Nolan path: the done questions and the visited quadrants it needs, and
// the quadrants a compass has.
export const NOLAN_PATH_MIN_DONE = 10;
export const NOLAN_PATH_MIN_QUADRANTS = 2;
export const NOLAN_PATH_ALL_QUADRANTS = 4;

// The stats chart: the highest share of the taker's side, in percent, the
// takers who have to have answered the question, and the lowest percent a
// card prints.
export const STATS_MAX_PERCENT = 10;
export const STATS_MIN_SAMPLE = 100;
export const STATS_MIN_PERCENT = 1;

// The halfway card prints no more minutes than this.
export const HALFWAY_MAX_MINUTES = 99;

export const WHOLE_PERCENT = 100;

// The seed of every draw of a session that has none.
export const FALLBACK_SEED = "mypolitics";

// The pools a puzzle draws its reveal line from. A type that is not here has
// no reveal.
export const CHECKPOINT_REVEAL_POOLS: Partial<
  Record<CheckpointType, Record<CheckpointOutcome, CheckpointPoolId>>
> = {
  "axis-puzzle": { hit: "axis-puzzle-hit", miss: "axis-puzzle-miss" },
  "position-puzzle": {
    hit: "position-puzzle-hit",
    miss: "position-puzzle-miss",
  },
};

// The lines every pool starts with. Polish is the source; the English lines
// are in the English catalog. Each message carries the name of its pool as
// its context, so that equal texts in two pools stay separate entries. The
// order of the lines is part of what a seed draws: do not reorder them
// without a reason.
export const CHECKPOINT_POOLS: CheckpointPools = {
  halfway: [
    {
      leadIn: msg({
        message: "Jesteś na półmetku",
        context: "checkpoint-halfway",
      }),
      statement: msg({
        message:
          "To już prawie koniec, pozostałe pytania zajmą ok. {minutes} min.",
        context: "checkpoint-halfway",
      }),
    },
    {
      leadIn: msg({ message: "Połowa za Tobą", context: "checkpoint-halfway" }),
      statement: msg({
        message: "Reszta pytań zajmie ok. {minutes} min.",
        context: "checkpoint-halfway",
      }),
    },
    {
      leadIn: msg({
        message: "Teraz już z górki",
        context: "checkpoint-halfway",
      }),
      statement: msg({
        message: "Do końca quizu zostało ok. {minutes} min.",
        context: "checkpoint-halfway",
      }),
    },
  ],
  "axis-closeness-single": [
    {
      leadIn: msg({
        message: "To już wiemy",
        context: "checkpoint-axis-closeness-single",
      }),
      statement: msg({
        message: "Twój wynik na skali „{orientation}” jest wysoki!",
        context: "checkpoint-axis-closeness-single",
      }),
    },
    {
      leadIn: msg({
        message: "Tu nie ma wątpliwości",
        context: "checkpoint-axis-closeness-single",
      }),
      statement: msg({
        message: "Na skali „{orientation}” wypadasz wysoko.",
        context: "checkpoint-axis-closeness-single",
      }),
    },
    {
      leadIn: msg({
        message: "Jedno jest jasne",
        context: "checkpoint-axis-closeness-single",
      }),
      statement: msg({
        message: "Skala „{orientation}”: jak dotąd wysoki wynik.",
        context: "checkpoint-axis-closeness-single",
      }),
    },
  ],
  "axis-closeness-double": [
    {
      leadIn: msg({
        message: "Tego już jesteśmy pewni",
        context: "checkpoint-axis-closeness-double",
      }),
      statement: msg({
        message:
          "Twój wynik po stronie „{leading}” jest wyższy niż po stronie „{other}”!",
        context: "checkpoint-axis-closeness-double",
      }),
    },
    {
      leadIn: msg({
        message: "To widać coraz wyraźniej",
        context: "checkpoint-axis-closeness-double",
      }),
      statement: msg({
        message:
          "„{leading}” czy „{other}”? Na tym etapie quizu bliżej Ci do pierwszej z tych stron.",
        context: "checkpoint-axis-closeness-double",
      }),
    },
    {
      leadIn: msg({
        message: "Szala się przechyla",
        context: "checkpoint-axis-closeness-double",
      }),
      statement: msg({
        message:
          "Jak dotąd strona „{leading}” wyprzedza u Ciebie stronę „{other}”.",
        context: "checkpoint-axis-closeness-double",
      }),
    },
  ],
  "new-trait": [
    {
      leadIn: msg({
        message: "A to niespodzianka!",
        context: "checkpoint-new-trait",
      }),
      statement: msg({
        message: "Masz nową cechę: „{trait}”... to dobrze, niedobrze?",
        context: "checkpoint-new-trait",
      }),
    },
    {
      leadIn: msg({
        message: "Proszę, proszę",
        context: "checkpoint-new-trait",
      }),
      statement: msg({
        message: "Do Twojego profilu trafia cecha „{trait}”. Co Ty na to?",
        context: "checkpoint-new-trait",
      }),
    },
    {
      leadIn: msg({
        message: "Nowość w kolekcji",
        context: "checkpoint-new-trait",
      }),
      statement: msg({
        message:
          "Cecha „{trait}” jest od teraz Twoja. Dobrze to czy źle? Ocena należy do Ciebie.",
        context: "checkpoint-new-trait",
      }),
    },
  ],
  "nolan-path-partial": [
    {
      leadIn: msg({
        message: "Co ja tu robię?",
        context: "checkpoint-nolan-path-partial",
      }),
      statement: msg({
        message:
          "W trakcie wykonywania quizu Twoja pozycja przeszła już przez {count} ćwiartki kompasu!",
        context: "checkpoint-nolan-path-partial",
      }),
    },
    {
      leadIn: msg({
        message: "Niezła wędrówka",
        context: "checkpoint-nolan-path-partial",
      }),
      statement: msg({
        message:
          "Masz już za sobą {count} ćwiartki kompasu, a quiz jeszcze trwa.",
        context: "checkpoint-nolan-path-partial",
      }),
    },
    {
      leadIn: msg({
        message: "Trochę Cię nosi",
        context: "checkpoint-nolan-path-partial",
      }),
      statement: msg({
        message:
          "Twoje odpowiedzi prowadzą już przez {count} ćwiartki kompasu.",
        context: "checkpoint-nolan-path-partial",
      }),
    },
  ],
  "nolan-path-full": [
    {
      leadIn: msg({
        message: "Wielka przeprawa!",
        context: "checkpoint-nolan-path-full",
      }),
      statement: msg({
        message: "Wszystkie ćwiartki kompasu są już za Tobą.",
        context: "checkpoint-nolan-path-full",
      }),
    },
    {
      leadIn: msg({
        message: "Dookoła kompasu",
        context: "checkpoint-nolan-path-full",
      }),
      statement: msg({
        message: "Twoja pozycja odwiedziła już każdą z czterech ćwiartek.",
        context: "checkpoint-nolan-path-full",
      }),
    },
    {
      leadIn: msg({
        message: "Komplet!",
        context: "checkpoint-nolan-path-full",
      }),
      statement: msg({
        message: "Cztery ćwiartki kompasu zaliczone, a quiz jeszcze trwa.",
        context: "checkpoint-nolan-path-full",
      }),
    },
  ],
  "stats-for": [
    {
      leadIn: msg({ message: "Rzadki okaz", context: "checkpoint-stats-for" }),
      statement: msg({
        message:
          "Należysz do {percent}% osób, które popierają tezę „{thesis}”.",
        context: "checkpoint-stats-for",
      }),
    },
    {
      leadIn: msg({ message: "Niewielu Was", context: "checkpoint-stats-for" }),
      statement: msg({
        message: "Tezę „{thesis}” popiera tylko {percent}% osób. Ty też.",
        context: "checkpoint-stats-for",
      }),
    },
    {
      leadIn: msg({
        message: "Jesteś w małej grupie",
        context: "checkpoint-stats-for",
      }),
      statement: msg({
        message: "Tylko {percent}% osób jest za tezą „{thesis}”.",
        context: "checkpoint-stats-for",
      }),
    },
  ],
  "stats-against": [
    {
      leadIn: msg({
        message: "Rzadki okaz",
        context: "checkpoint-stats-against",
      }),
      statement: msg({
        message:
          "Należysz do {percent}% osób, które nie zgadzają się z tezą „{thesis}”.",
        context: "checkpoint-stats-against",
      }),
    },
    {
      leadIn: msg({ message: "Pod prąd", context: "checkpoint-stats-against" }),
      statement: msg({
        message: "Tezę „{thesis}” odrzuca tylko {percent}% osób. Ty też.",
        context: "checkpoint-stats-against",
      }),
    },
    {
      leadIn: msg({
        message: "Jesteś w małej grupie",
        context: "checkpoint-stats-against",
      }),
      statement: msg({
        message: "Tylko {percent}% osób jest przeciw tezie „{thesis}”.",
        context: "checkpoint-stats-against",
      }),
    },
  ],
  "axis-puzzle-ask": [
    {
      leadIn: msg({
        message: "Jak myślisz?",
        context: "checkpoint-axis-puzzle-ask",
      }),
      statement: msg({
        message: "Do czego jest Tobie bliżej? Zgadnij teraz!",
        context: "checkpoint-axis-puzzle-ask",
      }),
    },
    {
      leadIn: msg({
        message: "Mała zagadka",
        context: "checkpoint-axis-puzzle-ask",
      }),
      statement: msg({
        message: "Która strona tej osi jest Ci bliższa? Wybierz jedną!",
        context: "checkpoint-axis-puzzle-ask",
      }),
    },
    {
      leadIn: msg({
        message: "Sprawdźmy intuicję",
        context: "checkpoint-axis-puzzle-ask",
      }),
      statement: msg({
        message: "Po której stronie wypadasz na tym etapie quizu? Zgadnij!",
        context: "checkpoint-axis-puzzle-ask",
      }),
    },
  ],
  "axis-puzzle-hit": [
    {
      leadIn: msg({
        message: "Trafione!",
        context: "checkpoint-axis-puzzle-hit",
      }),
      statement: msg({
        message: "Na tym etapie quizu bliżej Ci do strony „{leading}”.",
        context: "checkpoint-axis-puzzle-hit",
      }),
    },
    {
      leadIn: msg({
        message: "Znasz siebie",
        context: "checkpoint-axis-puzzle-hit",
      }),
      statement: msg({
        message: "Jak dotąd wygrywa u Ciebie strona „{leading}”.",
        context: "checkpoint-axis-puzzle-hit",
      }),
    },
    {
      leadIn: msg({
        message: "Bez pudła",
        context: "checkpoint-axis-puzzle-hit",
      }),
      statement: msg({
        message:
          "Tak, na tym etapie quizu prowadzi u Ciebie strona „{leading}”.",
        context: "checkpoint-axis-puzzle-hit",
      }),
    },
  ],
  "axis-puzzle-miss": [
    {
      leadIn: msg({
        message: "A to ciekawe!",
        context: "checkpoint-axis-puzzle-miss",
      }),
      statement: msg({
        message: "Wyszło inaczej, niż się spodziewasz.",
        context: "checkpoint-axis-puzzle-miss",
      }),
    },
    {
      leadIn: msg({
        message: "Niespodzianka",
        context: "checkpoint-axis-puzzle-miss",
      }),
      statement: msg({
        message: "Na tym etapie quizu bliżej Ci jednak do strony „{leading}”.",
        context: "checkpoint-axis-puzzle-miss",
      }),
    },
    {
      leadIn: msg({
        message: "No proszę",
        context: "checkpoint-axis-puzzle-miss",
      }),
      statement: msg({
        message: "Twoje odpowiedzi wskazują jak dotąd na stronę „{leading}”.",
        context: "checkpoint-axis-puzzle-miss",
      }),
    },
  ],
  "position-puzzle-ask": [
    {
      leadIn: msg({
        message: "Jak myślisz?",
        context: "checkpoint-position-puzzle-ask",
      }),
      statement: msg({
        message:
          "Do jednej z opcji jest Tobie bardzo blisko, zgadnij do której!",
        context: "checkpoint-position-puzzle-ask",
      }),
    },
    {
      leadIn: msg({
        message: "Zgadnij, kto to",
        context: "checkpoint-position-puzzle-ask",
      }),
      statement: msg({
        message:
          "Jedna z tych postaci jest teraz najbliżej Twoich odpowiedzi. Która?",
        context: "checkpoint-position-puzzle-ask",
      }),
    },
    {
      leadIn: msg({
        message: "Czas na typowanie",
        context: "checkpoint-position-puzzle-ask",
      }),
      statement: msg({
        message:
          "Tylko do jednej z tych opcji jest Ci naprawdę blisko. Wskaż ją!",
        context: "checkpoint-position-puzzle-ask",
      }),
    },
  ],
  "position-puzzle-hit": [
    {
      leadIn: msg({
        message: "Trafione!",
        context: "checkpoint-position-puzzle-hit",
      }),
      statement: msg({
        message: "{position} jest do Ciebie bardzo blisko na tym etapie quizu.",
        context: "checkpoint-position-puzzle-hit",
      }),
    },
    {
      leadIn: msg({
        message: "Jest!",
        context: "checkpoint-position-puzzle-hit",
      }),
      statement: msg({
        message: "Na tym etapie quizu najbliżej Ciebie jest {position}.",
        context: "checkpoint-position-puzzle-hit",
      }),
    },
    {
      leadIn: msg({
        message: "Dobre oko",
        context: "checkpoint-position-puzzle-hit",
      }),
      statement: msg({
        message:
          "Postać najbliższa Twoim odpowiedziom to jak dotąd {position}.",
        context: "checkpoint-position-puzzle-hit",
      }),
    },
  ],
  "position-puzzle-miss": [
    {
      leadIn: msg({
        message: "Pudło!",
        context: "checkpoint-position-puzzle-miss",
      }),
      statement: msg({
        message: "Ktoś inny jest Tobie najbliższy. Kto? Teraz nie powiemy!",
        context: "checkpoint-position-puzzle-miss",
      }),
    },
    {
      leadIn: msg({
        message: "Nie tym razem",
        context: "checkpoint-position-puzzle-miss",
      }),
      statement: msg({
        message:
          "Najbliżej Ciebie jest inna postać. Która? To się okaże w wynikach.",
        context: "checkpoint-position-puzzle-miss",
      }),
    },
    {
      leadIn: msg({
        message: "Zagadka trwa",
        context: "checkpoint-position-puzzle-miss",
      }),
      statement: msg({
        message:
          "To nie ta opcja. Kto jest najbliżej? Odpowiedź czeka w wynikach.",
        context: "checkpoint-position-puzzle-miss",
      }),
    },
  ],
};

// The answer counts of the stats chart: how long ago they may have been
// computed, at most, to be used. It stands below the pools so that their
// lines keep their places in the catalogs.
export const ANSWER_COUNTS_MAX_AGE_HOURS = 24;
