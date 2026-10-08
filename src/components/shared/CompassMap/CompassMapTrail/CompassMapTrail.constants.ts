// Two positions are one place when they are the same to this many steps per
// unit: two decimals.
export const TRAIL_STEPS_PER_UNIT = 100;

// The line is drawn in a square of this size and stretched over the map, so a
// coordinate of the path is a percentage of the map's side.
export const TRAIL_VIEW_SIZE = 100;

// How far the curve leaves a point along its direction before it bends
// towards the next one, as a share of the distance between the two. A third
// gives round bends, and a bend never reaches further than the stretch it
// belongs to, however unevenly the points are spread.
export const TRAIL_BEND_SHARE = 1 / 3;

// The line: 2 px wide in the dot's colour, dashes of 4 px with gaps of 4 px,
// whatever the size of the map, with a light edge that keeps it visible on a
// filled quadrant of any colour.
export const TRAIL_CLASS_NAME =
  "size-full fill-none stroke-gi-light-primary stroke-2 drop-shadow-[0_0_1px_white] [stroke-dasharray:4_4]";
