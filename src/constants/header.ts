import { FOCUS_CLASS_NAME } from "./focus";

// The pills of the header: the navigation, "sign in" and the account. 40 px
// high, a 16 px bold label, the light primary colour - filled for the page
// the person is on, a tint of it otherwise.
export const HEADER_PILL_CLASS_NAME = `px-3 text-base leading-none font-bold ${FOCUS_CLASS_NAME}`;
export const HEADER_PILL_ACTIVE_CLASS_NAME = "bg-gi-light-primary text-white";
export const HEADER_PILL_IDLE_CLASS_NAME =
  "bg-gi-light-primary/10 text-gi-light-primary hover:bg-gi-light-primary/20";
