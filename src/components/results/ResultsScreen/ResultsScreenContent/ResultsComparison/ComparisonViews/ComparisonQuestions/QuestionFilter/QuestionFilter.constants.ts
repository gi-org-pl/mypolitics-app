import { FOCUS_CLASS_NAME } from "@/constants/focus";

// The switch of the frame over Athena's Switch: the grey of the design while
// it is off, no shadow, and keyboard focus as an outline, like every other
// control of the screen.
export const FILTER_SWITCH_CLASS_NAME = `cursor-pointer shadow-none data-[state=unchecked]:bg-gi-dark-ash ${FOCUS_CLASS_NAME}`;
