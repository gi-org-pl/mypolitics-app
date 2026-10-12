import { FALLBACK_SEED } from "@/constants/checkpoint";

// The multipliers and the first state of the string hash (xmur3), the step of
// the generator (mulberry32), and the number of values 32 bits can hold.
const HASH_START = 1_779_033_703;
const HASH_MIX = 3_432_918_353;
const HASH_FINISH_FIRST = 2_246_822_507;
const HASH_FINISH_SECOND = 3_266_489_909;
const GENERATOR_STEP = 0x6d_2b_79_f5;
const UINT32_RANGE = 4_294_967_296;

// A string as one 32-bit number.
const hashText = (text: string): number => {
  let hash = HASH_START ^ text.length;

  for (let index = 0; index < text.length; index += 1) {
    hash = Math.imul(hash ^ text.charCodeAt(index), HASH_MIX);
    hash = (hash << 13) | (hash >>> 19);
  }

  hash = Math.imul(hash ^ (hash >>> 16), HASH_FINISH_FIRST);
  hash = Math.imul(hash ^ (hash >>> 13), HASH_FINISH_SECOND);

  return hash ^ (hash >>> 16);
};

// A number in [0, 1) that depends only on the three arguments: the same in
// every browser and on every device, and unrelated for another purpose or
// another draw. The seed and the purpose are hashed into the start of a small
// generator, and the draw is its place in the generator's sequence. Integer
// arithmetic only; no clock, no `Math.random`, no `crypto`. A seed that is
// missing or empty is replaced by a fixed one.
export const getSeededRandom = (
  seed: string,
  purpose: string,
  draw = 0,
): number => {
  const usedSeed =
    typeof seed === "string" && seed !== "" ? seed : FALLBACK_SEED;
  // The length in front keeps "ab" + "c" apart from "a" + "bc".
  const start = hashText(`${usedSeed.length}:${usedSeed}:${purpose}`);
  let state = (start + Math.imul(draw + 1, GENERATOR_STEP)) | 0;

  state = Math.imul(state ^ (state >>> 15), state | 1);
  state ^= state + Math.imul(state ^ (state >>> 7), state | 61);

  return ((state ^ (state >>> 14)) >>> 0) / UINT32_RANGE;
};
