import { HATCH_CLASS_NAME } from "@/constants/hatch";

// The mask of a bar that gives nothing away: the hatch over the whole track,
// from one end to the other. It is the same wherever it is drawn - it takes
// nothing in, so it cannot carry a value.
export const UniversalAxisMask = () => (
  <div
    data-testid="universal-axis-mask"
    className={`absolute inset-0 ${HATCH_CLASS_NAME}`}
  />
);
