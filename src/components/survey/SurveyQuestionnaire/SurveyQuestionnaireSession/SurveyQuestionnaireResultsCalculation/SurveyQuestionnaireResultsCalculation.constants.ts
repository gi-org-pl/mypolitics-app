import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import type { SurveyResultState } from "@/types/survey";

import type { HandInState } from "./SurveyQuestionnaireResultsCalculation.types";

// What the card can say while it waits: the same pool in every quiz. It is
// content - adding, removing or rewording a line changes strings and nothing
// else. The order here is the order of the frame; the order on screen is
// drawn for each session.
export const RESULTS_CALCULATION_POOL: readonly MessageDescriptor[] = [
  msg`Prostujemy osie`,
  msg`Liczymy, nie oceniamy`,
  msg`Szukamy Twojej ćwiartki`,
  msg`Panowie, liczymy głosy`,
  msg`Rozpoczynamy trzecie czytanie`,
  msg`Przeliczamy jeszcze raz`,
  msg`Liczymy, ale się cieszymy`,
  msg`Sprawdzamy czy przekraczasz próg`,
  msg`Dzielimy przez zero`,
  msg`Rozdajemy 100 milionów`,
  msg`Zaglądamy do teczek`,
  msg`Kolorujemy wykresy`,
  msg`Jesteśmy za, a nawet przeciw`,
  msg`Czytamy programy partii`,
  msg`Zgłaszamy wniosek formalny`,
  msg`Obradujemy przy okrągłym stole`,
  msg`Słuchamy wywiadów w telewizji`,
];

// A line is current for this long, then the next one arrives.
export const LINE_INTERVAL_MS = 1200;
// The shortest stay of the card is MIN_LINES x LINE_INTERVAL_MS.
export const MIN_LINES = 5;
// What the field holds. The last line stays current until the run ends.
export const MAX_LINES = 8;

export const CREATE_RESULT_TIMEOUT_MS = 10_000;
// The pause between the answer to one read of the result and the next read.
export const RESULT_READ_INTERVAL_MS = 1000;
// How long a stored result is waited for before the run gives up.
export const RESULT_WAIT_MS = 30_000;

// The purpose of the seeded draw that orders the lines.
export const RESULTS_CALCULATION_DRAW = "results-calculation";

// The result state the frame reads, for each state of the hand-in. A failure
// of either step is what turns reset on.
export const RESULT_STATES: Record<HandInState, SurveyResultState> = {
  sending: "sending",
  created: "created",
  calculated: "calculated",
  "not-saved": "failed",
  "not-ready": "failed",
};

// The states in which the result is stored: step 1 has ended.
export const STORED_HAND_IN_STATES: readonly HandInState[] = [
  "created",
  "calculated",
  "not-ready",
];

// The states in which a run has ended in a failure, and can be tried again.
export const FAILED_HAND_IN_STATES: readonly HandInState[] = [
  "not-saved",
  "not-ready",
];
