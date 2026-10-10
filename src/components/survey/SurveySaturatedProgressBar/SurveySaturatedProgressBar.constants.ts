export const BAR_ANIMATION_MS = 300;

// The bar of the questionnaire: a track that shows on the ash frame. Under
// reduced motion the fill takes its value at once. Forced colours drop both
// fills, so the track gets a border and the fill a system colour there: an
// empty bar and a full one can still be told apart.
export const BAR_CLASS_NAME =
  "bg-gi-dark-ash motion-reduce:*:transition-none forced-colors:border forced-colors:border-[CanvasText] forced-colors:*:bg-[Highlight]";
