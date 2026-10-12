import { msg } from "@lingui/core/macro";

import type { QuizTabOption } from "./QuizSectionTabs.types";

// The tabs in the order they are drawn; the first one lists every quiz.
export const QUIZ_TABS: QuizTabOption[] = [
  { value: "all", label: msg`Wszystkie` },
  { value: "electoral", label: msg`Wyborcze` },
  { value: "social", label: msg`Społecznościowe` },
];

// Athena's Tabs is an underlined bar; the design draws the tabs as pills. The
// tab list keeps Athena's roles and keys and only changes its look.

// The row: on a narrow screen the pills are spread over the width as long as
// the three fit in one row; when they do not, they wrap and stand together at
// the left with the regular gap, as they do from the wide breakpoint. A
// wrapped row must not be spread, so the spreading starts at a width of the
// row itself (of the container around it), not of the screen: 24rem, the
// first step above the 382.4 px that the three pills and two gaps of the
// Polish labels take. The underline and its sliding marker are gone.
const TAB_LIST_CLASS_NAME =
  "flex! w-full! flex-wrap justify-start gap-2 border-b-0! max-md:@sm:justify-between md:w-max! md:max-w-full [&>[aria-hidden=true]]:hidden";

// A pill is 35 px high with its 1 px border: 7 px of padding around a 19 px
// line.
const TAB_CLASS_NAME =
  "[&>[role=tab]]:rounded-full [&>[role=tab]]:border [&>[role=tab]]:border-gi-primary/10 [&>[role=tab]]:px-3.75 [&>[role=tab]]:py-1.75 [&>[role=tab]]:leading-4.75 [&>[role=tab][aria-selected=false]:hover]:bg-gi-ash";

// Forced colours drop the fill, so the selected pill is underlined there.
const SELECTED_TAB_CLASS_NAME =
  "[&>[role=tab][aria-selected=true]]:bg-gi-primary [&>[role=tab][aria-selected=true]]:text-white forced-colors:[&>[role=tab][aria-selected=true]]:underline";

// The outline of FOCUS_CLASS_NAME (src/constants/focus.ts), written for the
// tabs inside the list: Athena draws their focus as a ring, which forced
// colours remove.
const TAB_FOCUS_CLASS_NAME =
  "[&>[role=tab]:focus-visible]:ring-0 [&>[role=tab]:focus-visible]:outline-2 [&>[role=tab]:focus-visible]:outline-offset-2 [&>[role=tab]:focus-visible]:outline-solid [&>[role=tab]:focus-visible]:outline-gi-primary";

export const TABS_CLASS_NAME = `${TAB_LIST_CLASS_NAME} ${TAB_CLASS_NAME} ${SELECTED_TAB_CLASS_NAME} ${TAB_FOCUS_CLASS_NAME}`;
