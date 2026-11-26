import { msg } from "@lingui/core/macro";

import {
  type ResultsNoticeStatus,
  ResultsScreenStatus,
} from "../ResultsScreen.types";
import type { ResultsNotice } from "./ResultsScreenNotice.types";

// What the screen says in each state that has no result to show, and whether
// it offers to load again. Loading is a status that is on its way; every
// other notice is the heading of the page, announced when it appears.
export const RESULTS_NOTICES: Record<ResultsNoticeStatus, ResultsNotice> = {
  [ResultsScreenStatus.Loading]: {
    role: "status",
    title: msg`Wczytujemy wynik…`,
    isHeading: false,
    canRetry: false,
  },
  [ResultsScreenStatus.NotFound]: {
    role: "alert",
    title: msg`Nie znaleźliśmy takiego wyniku`,
    line: msg`Sprawdź, czy adres jest pełny.`,
    isHeading: true,
    canRetry: false,
  },
  [ResultsScreenStatus.NotReady]: {
    role: "alert",
    title: msg`Wynik nie jest jeszcze gotowy`,
    isHeading: true,
    canRetry: true,
  },
  [ResultsScreenStatus.Failed]: {
    role: "alert",
    title: msg`Nie udało się wczytać wyniku`,
    isHeading: true,
    canRetry: true,
  },
  [ResultsScreenStatus.NotConfigured]: {
    role: "alert",
    title: msg`Ten quiz nie ma jeszcze widoku wyników`,
    isHeading: true,
    canRetry: false,
  },
};
