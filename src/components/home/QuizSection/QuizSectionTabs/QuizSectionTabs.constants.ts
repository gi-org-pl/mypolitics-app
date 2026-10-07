// Athena's Tabs is an underlined bar; the design draws the tabs as pills. The
// tab list keeps Athena's roles and keys and only changes its look.

// The row: pills spread over the width on a narrow screen and wrap when they
// do not fit; from the wide breakpoint they stand together at the left. The
// underline and its sliding marker are gone.
const TAB_LIST_CLASS_NAME =
  "flex! w-full! flex-wrap justify-between gap-2 border-b-0! md:w-max! md:max-w-full md:justify-start [&>[aria-hidden=true]]:hidden";

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
export const TAB_FOCUS_CLASS_NAME =
  "[&>[role=tab]:focus-visible]:ring-0 [&>[role=tab]:focus-visible]:outline-2 [&>[role=tab]:focus-visible]:outline-offset-2 [&>[role=tab]:focus-visible]:outline-solid [&>[role=tab]:focus-visible]:outline-gi-primary";

export const TABS_CLASS_NAME = `${TAB_LIST_CLASS_NAME} ${TAB_CLASS_NAME} ${SELECTED_TAB_CLASS_NAME} ${TAB_FOCUS_CLASS_NAME}`;
