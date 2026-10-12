import { ICON_MASK_CLASS_NAME } from "@/constants/icon";

// The pill of a line: 35 px with one row of text, its hairline border part of
// the 16 px beside the text and the 8 px over it. A text longer than the
// field is wide wraps inside the pill. The pill fades in when it arrives, in
// one CSS transition from its starting style; under reduced motion it is
// simply there.
export const LINE_CLASS_NAME =
  "flex max-w-full items-center gap-2 rounded-2xl border border-gi-dark-ash bg-white/90 px-3.75 py-1.75 text-center text-base leading-[19px] font-bold wrap-break-word transition-opacity duration-300 ease-out starting:opacity-0 motion-reduce:transition-none";

// The current line is drawn in the accent colour, a finished one in the
// colour of the text.
export const CURRENT_LINE_CLASS_NAME = "text-cyan-500";
export const FINISHED_LINE_CLASS_NAME = "text-gi-primary";

// The spinner of the current line turns without end, and stands still under
// reduced motion. Forced colours replace its fill, so it is given the system
// colour of the text there.
export const SPINNER_CLASS_NAME = `${ICON_MASK_CLASS_NAME} size-4 mask-contain animate-spin motion-reduce:animate-none forced-colors:bg-[color:CanvasText]`;
