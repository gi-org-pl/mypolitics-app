import { msg } from "@lingui/core/macro";

import {
  PILL_TAB_CLASS_NAME,
  PILL_TAB_FOCUS_CLASS_NAME,
  SELECTED_PILL_TAB_CLASS_NAME,
} from "@/constants/tabs";

import type { QuizTabOption } from "./QuizSectionTabs.types";

// The tabs in the order they are drawn; the first one lists every quiz.
export const QUIZ_TABS: QuizTabOption[] = [
  { value: "all", label: msg`Wszystkie` },
  { value: "electoral", label: msg`Wyborcze` },
  { value: "social", label: msg`Społecznościowe` },
];

// Athena's Tabs is an underlined bar; the design draws the tabs as pills. The
// tab list keeps Athena's roles and keys and only changes its look: the look
// of a pill is the one every list of pill tabs has (src/constants/tabs.ts).

// The row: on a narrow screen the pills are spread over the width as long as
// the three fit in one row; when they do not, they wrap and stand together at
// the left with the regular gap, as they do from the wide breakpoint. A
// wrapped row must not be spread, so the spreading starts at a width of the
// row itself (of the container around it), not of the screen: 24rem, the
// first step above the 382.4 px that the three pills and two gaps of the
// Polish labels take. The underline and its sliding marker are gone.
const TAB_LIST_CLASS_NAME =
  "flex! w-full! flex-wrap justify-start gap-2 border-b-0! max-md:@sm:justify-between md:w-max! md:max-w-full [&>[aria-hidden=true]]:hidden";

export const TABS_CLASS_NAME = `${TAB_LIST_CLASS_NAME} ${PILL_TAB_CLASS_NAME} ${SELECTED_PILL_TAB_CLASS_NAME} ${PILL_TAB_FOCUS_CLASS_NAME}`;
