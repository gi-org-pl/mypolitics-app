import { ComparisonMode } from "@/types/comparison";
import type { Orientation } from "@/types/orientation";
import type { QuizResult } from "@/types/results";
import type { Survey, SurveyResult } from "@/types/survey";
import { getOfferedOrientations } from "@/utils/comparison/getOfferedOrientations";
import {
  identityFriendResult,
  identityQuizResult,
  identityResultQuiz,
} from "@/utils/result-modules/identityQuizResult.fixtures";
import { friendQuizResult } from "@/utils/result-modules/resolvedModules.fixtures";
import { resolveResult } from "@/utils/result-modules/resolveResult";
import {
  moduleQuiz,
  moduleQuizResult,
} from "@/utils/result-modules/resolveResult.fixtures";

import { INITIAL_COMPARISON_STATE } from "./ResultsComparison.constants";
import {
  type ChoosingState,
  type ComparingState,
  type ComparisonContext,
  ComparisonStatus,
  ComparisonView,
  type FetchingState,
  FriendRefusal,
  type RefusedState,
} from "./ResultsComparison.types";
import { toComparingState } from "./utils/toComparingState";
import { toFriendSide } from "./utils/toFriendSide";

// Two sides of a comparison for the stories and the tests of the tab. Nothing
// here is read from the API, and the people are made up.

export const TAKER_ID = "3f0c2a52-6f7b-4d53-9a55-0d5f1b9f3c11";
export const FRIEND_ID = "5218cde2-beac-4234-a0a7-c72f46e979a8";
export const FRIEND_NAME = "Znajomy";

const toResult = (
  survey: Survey,
  result: QuizResult,
  id: string,
): SurveyResult => ({ ...result, id, isCalculated: true, surveyId: survey.id });

const toTaker = (survey: Survey, result: QuizResult): ComparisonContext => ({
  survey,
  result: toResult(survey, result, TAKER_ID),
  resolved: resolveResult(survey, result),
});

// The quiz that has one record of every module type: its taker, and a friend
// with another result of it.
export const moduleTaker = toTaker(moduleQuiz, moduleQuizResult);

export const moduleFriendResult = toResult(
  moduleQuiz,
  friendQuizResult,
  FRIEND_ID,
);

export const moduleOrientations: Orientation[] =
  getOfferedOrientations(moduleQuiz);

export const friendComparison: ComparingState = toComparingState(
  toFriendSide(moduleFriendResult, FRIEND_NAME),
  moduleTaker,
);

// The taker compared with the first offered orientation of that quiz.
export const orientationComparison: ComparingState = toComparingState(
  { mode: ComparisonMode.Orientation, orientation: moduleOrientations[0] },
  moduleTaker,
);

// The identity quiz: a taker who is a green progressive, and a friend who is
// a conservative libertarian.
export const identityTaker = toTaker(identityResultQuiz, identityQuizResult);

export const identityOrientations: Orientation[] =
  getOfferedOrientations(identityResultQuiz);

export const identityFriendComparison: ComparingState = toComparingState(
  toFriendSide(
    toResult(identityResultQuiz, identityFriendResult, FRIEND_ID),
    FRIEND_NAME,
  ),
  identityTaker,
);

// A comparison with both views on its switch, as it will be once the list of
// questions is drawn.
export const twoViewComparison: ComparingState = {
  ...identityFriendComparison,
  views: [ComparisonView.Results, ComparisonView.Questions],
};

const toGlyphUrl = (shape: string): string =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white">${shape}</svg>`,
  )}`;

// Four orientations as the design draws its example list: each with a colour
// and a white glyph.
export const exampleOrientations: Orientation[] = [
  {
    id: "progressivism",
    type: "ideology",
    name: "Progresywizm",
    color: "#9b59b6",
    imageUrl: toGlyphUrl(
      '<path d="M6 15l4-4 3 3 5-6v3h1V7h-4v1h2l-4 5-3-3-5 5z"/>',
    ),
  },
  {
    id: "traditionalism",
    type: "ideology",
    name: "Tradycjonalizm",
    color: "#1abc9c",
    imageUrl: toGlyphUrl('<path d="M8 6h8v2l-3 4 3 4v2H8v-2l3-4-3-4z"/>'),
  },
  {
    id: "interventionism",
    type: "ideology",
    name: "Interwencjonizm",
    color: "#e74c3c",
    imageUrl: toGlyphUrl('<circle cx="12" cy="12" r="5"/>'),
  },
  {
    id: "free-market",
    type: "ideology",
    name: "Wolny rynek",
    color: "#2ecc71",
    imageUrl: toGlyphUrl('<rect x="6" y="8" width="12" height="8" rx="1"/>'),
  },
];

// The states of the choice.
export const choosingFriend: ChoosingState = INITIAL_COMPARISON_STATE;

export const choosingOrientation: ChoosingState = {
  ...INITIAL_COMPARISON_STATE,
  mode: ComparisonMode.Orientation,
};

export const choosingWithInvalidId: ChoosingState = {
  ...INITIAL_COMPARISON_STATE,
  friendId: "5218cde2-beac",
};

export const fetchingFriend: FetchingState = {
  status: ComparisonStatus.Fetching,
  mode: ComparisonMode.Friend,
  friendId: FRIEND_ID,
  requestedId: FRIEND_ID,
};

const toRefused = (refusal: FriendRefusal, friendId: string): RefusedState => ({
  status: ComparisonStatus.Refused,
  mode: ComparisonMode.Friend,
  friendId,
  refusal,
});

export const refusedOwn = toRefused(FriendRefusal.Own, TAKER_ID);
export const refusedOtherSurvey = toRefused(
  FriendRefusal.OtherSurvey,
  FRIEND_ID,
);
export const refusedUnreadable = toRefused(FriendRefusal.Unreadable, FRIEND_ID);
