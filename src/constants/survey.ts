import type { DeclaredGender } from "@/types/orientation";
import type {
  DemographicsFieldId,
  EducationLevel,
  ResidenceAreaSize,
  SurveyAnswerKind,
  SurveyPhase,
  SurveySessionConfig,
} from "@/types/survey";
import { getResultLinkUrl } from "@/utils/survey/getResultLinkUrl";

// The API has no slugs, so the map is kept by hand: one entry per quiz that
// has a project in this API, from its slug to the identifier of the project.
// The slugs are predefined here until the API has them. The survey to read
// is the one the project names as its latest (`getLatestSurvey`), so a new
// version of a quiz needs no change here.
export const QUIZ_PROJECT_IDS: Record<string, string> = {
  mypolitics: "5ab50822-e95e-4c7c-a1d6-14aceb68f108",
  prezydencki2025: "69ef6c38-7292-4096-a9ef-a58e682dbfde",
};

export const RESULTS_URL = "https://mypolitics.pl/results";

// The seven phases of a session, in their fixed order.
export const SURVEY_PHASES: readonly SurveyPhase[] = [
  "category-select",
  "questions",
  "checkpoints",
  "demographics",
  "email-capture",
  "results-calculation",
  "short-results",
];

// Category select: the share of the visible categories of a quiz that may be
// picked, and the fewest visible categories the select is shown for.
export const MAX_CATEGORIES_RATIO = 0.5;
export const MIN_CATEGORIES_FOR_SELECT = 2;

export const ADULT_AGE = 18;

// The kinds in the order their answers are drawn: the scale, then the rest.
export const SURVEY_ANSWER_KINDS: readonly SurveyAnswerKind[] = [
  "strongly-agree",
  "agree",
  "disagree",
  "strongly-disagree",
  "custom",
];

// The API has no field for the step of the scale. A possible answer is an
// identifier, a text, a weight and orientations, and neither its place among
// the answers nor its weight tells the steps apart. So the step is read from
// the text, trimmed and in lower case: one table of wordings per language the
// app is in. A new language of the app needs its table here, and a test fails
// until it has one.
export const SURVEY_SCALE_ANSWER_KINDS_BY_LANGUAGE: Record<
  string,
  ReadonlyMap<string, SurveyAnswerKind>
> = {
  // Every wording of a scale question in the quizzes of the API.
  pl: new Map([
    ["zdecydowanie za", "strongly-agree"],
    ["częściowo za", "agree"],
    ["za", "agree"],
    ["częściowo przeciw", "disagree"],
    ["przeciw", "disagree"],
    ["zdecydowanie przeciw", "strongly-disagree"],
  ]),
  // "Agree" and "Disagree" are in quizzes of the API. No quiz is in English
  // yet, so the strong steps are the names the scale has in English.
  en: new Map([
    ["strongly agree", "strongly-agree"],
    ["agree", "agree"],
    ["disagree", "disagree"],
    ["strongly disagree", "strongly-disagree"],
  ]),
};

// Every wording of every language. The language a quiz was asked for is not
// looked at: an author writes the answers in the words they choose, and
// quizzes in Polish have answers in English.
//
// A wording that is not here makes its answer a custom one: it is drawn with
// its own text, can be picked and is handed in like any other - it only loses
// the look and the place of its step.
export const SURVEY_SCALE_ANSWER_KINDS: ReadonlyMap<string, SurveyAnswerKind> =
  new Map(
    Object.values(SURVEY_SCALE_ANSWER_KINDS_BY_LANGUAGE).flatMap((kinds) => [
      ...kinds,
    ]),
  );

export const DEMOGRAPHICS_FIELD_IDS: readonly DemographicsFieldId[] = [
  "age",
  "gender",
  "residenceAreaSize",
  "education",
];

export const DEMOGRAPHICS_MIN_AGE = 13;
export const DEMOGRAPHICS_MAX_AGE = 99;

export const DEMOGRAPHICS_GENDERS: readonly DeclaredGender[] = [
  "female",
  "male",
  "other",
  "prefer_not_to_share",
];

export const DEMOGRAPHICS_RESIDENCE_AREA_SIZES: readonly ResidenceAreaSize[] = [
  "village",
  "city_below_50k",
  "city_below_200k",
  "city_below_500k",
  "city_over_500k",
];

export const DEMOGRAPHICS_EDUCATION_LEVELS: readonly EducationLevel[] = [
  "primary",
  "basic_vocational",
  "secondary",
  "higher",
];

// The values the API accepts, in the order they are shown, and nothing else.
// There is no "under 18" value: the age list has one value per year.
export const DEMOGRAPHICS_VALUES: Record<
  DemographicsFieldId,
  readonly string[]
> = {
  age: Array.from(
    { length: DEMOGRAPHICS_MAX_AGE - DEMOGRAPHICS_MIN_AGE + 1 },
    (_, index) => String(DEMOGRAPHICS_MIN_AGE + index),
  ),
  gender: DEMOGRAPHICS_GENDERS,
  residenceAreaSize: DEMOGRAPHICS_RESIDENCE_AREA_SIZES,
  education: DEMOGRAPHICS_EDUCATION_LEVELS,
};

// Where the request for the result link goes: a value of the build, read once
// when the app starts. Absent unless the build has an `https` address.
export const RESULT_LINK_URL: string | undefined = getResultLinkUrl(
  import.meta.env.VITE_RESULTS_EMAIL_URL,
);
export const RESULT_LINK_TIMEOUT_MS = 10_000;

// Names the consent text of the e-mail card. It changes whenever that text
// changes, in the same commit.
export const EMAIL_CONSENT_WORDING = "marketing-v1";
export const EMAIL_MAX_LENGTH = 254;

// The one switch for the e-mail phase: on when the endpoint is configured.
export const SURVEY_SESSION_CONFIG: SurveySessionConfig = {
  isEmailSendingSetUp: RESULT_LINK_URL !== undefined,
};

// The record of a quiz is kept under `${key}:${surveyId}`.
export const SURVEY_SESSION_STORAGE_KEY = "mypolitics:survey-session";
export const SURVEY_SESSION_VERSION = 1;
