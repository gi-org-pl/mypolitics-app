import type { ResultModuleValueReader } from "@/types/results";
import { getSafeColor } from "@/utils/color/getSafeColor";

// A colour is the saved value when it is a text that passes the app's colour
// check, without the space around it. Anything else, a key that is left out
// included, is no colour.
export const readColorValue: ResultModuleValueReader<"color"> = (_, value) =>
  typeof value === "string" ? getSafeColor(value) : undefined;
