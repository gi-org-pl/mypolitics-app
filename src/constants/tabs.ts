// Athena's Tabs is an underlined bar; where the design draws tabs as pills,
// the tab list keeps Athena's roles and keys and only changes its look. This
// is the part of that look every list of pill tabs has; how the pills stand
// in their row is up to each list.

// The underline of the row and its sliding marker are gone.
export const PILL_TAB_LIST_CLASS_NAME =
  "border-b-0! [&>[aria-hidden=true]]:hidden";

// A pill is 35 px high with its 1 px border: 7 px of padding around a 19 px
// line.
export const PILL_TAB_CLASS_NAME =
  "[&>[role=tab]]:rounded-full [&>[role=tab]]:border [&>[role=tab]]:border-gi-primary/10 [&>[role=tab]]:px-3.75 [&>[role=tab]]:py-1.75 [&>[role=tab]]:leading-4.75 [&>[role=tab][aria-selected=false]:hover]:bg-gi-ash";

// Forced colours drop the fill, so the selected pill is underlined there.
export const SELECTED_PILL_TAB_CLASS_NAME =
  "[&>[role=tab][aria-selected=true]]:bg-gi-primary [&>[role=tab][aria-selected=true]]:text-white forced-colors:[&>[role=tab][aria-selected=true]]:underline";

// The outline of FOCUS_CLASS_NAME (src/constants/focus.ts), written for the
// tabs inside the list: Athena draws their focus as a ring, which forced
// colours remove.
export const PILL_TAB_FOCUS_CLASS_NAME =
  "[&>[role=tab]:focus-visible]:ring-0 [&>[role=tab]:focus-visible]:outline-2 [&>[role=tab]:focus-visible]:outline-offset-2 [&>[role=tab]:focus-visible]:outline-solid [&>[role=tab]:focus-visible]:outline-gi-primary";
