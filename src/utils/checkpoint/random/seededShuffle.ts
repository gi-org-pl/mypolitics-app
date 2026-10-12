import { getSeededRandom } from "./getSeededRandom";

// A new array with the same items in an order that depends only on the seed,
// the purpose and the round. Each round is a purpose of its own, so the order
// of one round says nothing about the next.
export const seededShuffle = <Item>(
  items: readonly Item[],
  seed: string,
  purpose: string,
  round = 0,
): Item[] => {
  const shuffled = [...items];
  const roundPurpose = `${purpose}:${round}`;

  for (let last = shuffled.length - 1; last > 0; last -= 1) {
    const picked = Math.floor(
      getSeededRandom(seed, roundPurpose, last) * (last + 1),
    );

    [shuffled[last], shuffled[picked]] = [shuffled[picked], shuffled[last]];
  }

  return shuffled;
};
