// Forced colours drop the fill of a filled control, which would leave its
// content floating: a transparent border is drawn in a system colour there
// and keeps the shape of the control, without changing its look anywhere
// else. The border is part of the size of the control.
export const FORCED_COLORS_BORDER_CLASS_NAME = "border border-transparent";
