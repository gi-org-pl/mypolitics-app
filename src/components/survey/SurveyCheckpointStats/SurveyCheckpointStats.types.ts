// The keys of the card's `counts`, in the order they are drawn.
export type StatsSliceId = "for" | "against" | "noAnswer";

export interface StatsSlice {
  id: StatsSliceId;
  from: number; // where the slice starts, as a share of the circle, 0-1
  to: number; // where it ends
}

// The three shares of the description, as whole percents.
export type StatsShares = Record<StatsSliceId, number>;

// The three names, translated: the legend and the description use them.
export type StatsSliceNames = Record<StatsSliceId, string>;
