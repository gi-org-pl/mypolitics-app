import {
  PILL_TAB_CLASS_NAME,
  PILL_TAB_FOCUS_CLASS_NAME,
  PILL_TAB_LIST_CLASS_NAME,
  SELECTED_PILL_TAB_CLASS_NAME,
} from "@/constants/tabs";

// The row: the pills share the width equally, 8 px apart. Each starts from
// 136 px and its label stays on one line, so when the row is too narrow for
// all of them side by side they stand under each other, each as wide as the
// row, instead of cutting a label.
const TAB_ROW_CLASS_NAME =
  "flex! w-full! flex-wrap gap-2 [&>[role=tab]]:min-w-0 [&>[role=tab]]:flex-auto [&>[role=tab]]:basis-34 [&>[role=tab]]:whitespace-nowrap";

export const PILL_TABS_CLASS_NAME = `${PILL_TAB_LIST_CLASS_NAME} ${TAB_ROW_CLASS_NAME} ${PILL_TAB_CLASS_NAME} ${SELECTED_PILL_TAB_CLASS_NAME} ${PILL_TAB_FOCUS_CLASS_NAME}`;
