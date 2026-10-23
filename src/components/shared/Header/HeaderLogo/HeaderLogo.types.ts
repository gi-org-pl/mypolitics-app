export type HeaderLogoProps = {
  // The visit the animation is played for. A new value starts it, unless it
  // is already playing; no value leaves the logo at rest.
  playId?: string;
};

// The two pieces a bar of the sign is split into by its gap: the axis on the
// left and the position on the right.
export type LogoPieceSide = "axis" | "position";

// The two colour families the sign is drawn in.
export type LogoColourFamily = "quiz" | "blue";

// A piece as it is drawn: its outline and the token class that fills it.
export type LogoPiece = {
  id: string;
  d: string;
  fillClassName: string;
};

// A piece of the sign at rest, as the brand file draws it.
export type LogoRestPiece = LogoPiece & {
  row: number;
  side: LogoPieceSide;
};

// Where a piece lies: the side of its bar, the top of the bar and where the
// gap of the bar starts.
export type LogoPieceGeometry = {
  side: LogoPieceSide;
  top: number;
  gapStart: number;
};

// Where the gap of a bar is at a moment of the animation, and the colour
// family its pieces have then.
export type LogoRowState = {
  gapStart: number;
  family: LogoColourFamily;
};

// One bar of the sign, in the units of the sign's own drawing.
export type LogoRow = {
  top: number;
  gapAtRest: number;
  fillClassNames: Record<LogoColourFamily, Record<LogoPieceSide, string>>;
};

// One movement of the gaps: from wherever they are to `gapByRow`, eased over
// `durationMs`, starting `startMs` after the row starts. Halfway through, each
// piece of the row takes its colour from `family` in one step.
export type LogoBeat = {
  startMs: number;
  durationMs: number;
  gapByRow: readonly number[];
  family: LogoColourFamily;
};

export type LogoAnimation = {
  pieces: readonly LogoPiece[];
  isPlaying: boolean;
};
