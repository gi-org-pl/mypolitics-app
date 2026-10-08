import { FOCUS_CLASS_NAME } from "./focus";
import { FORCED_COLORS_BORDER_CLASS_NAME } from "./forced-colors";

// A 48 px pill with a 16 px bold label on one line, over Athena's 40 px
// Button. The 1 px border is part of its 16 px side padding.
export const TALL_BUTTON_CLASS_NAME = `h-12 px-3.75 text-base leading-none font-bold ${FORCED_COLORS_BORDER_CLASS_NAME} ${FOCUS_CLASS_NAME}`;

// The quiet button beside or under a main one: its label alone, on whatever
// it stands on.
export const QUIET_BUTTON_CLASS_NAME = `${TALL_BUTTON_CLASS_NAME} bg-transparent hover:bg-gi-primary/10 active:bg-gi-primary/10`;
