import type { Orientation, PersonInput } from "@/types/orientation";
import { toTrimmedText } from "@/utils/text/toTrimmedText";
import { toWebAddress } from "@/utils/url/toWebAddress";

import { toOrientationColor } from "./toOrientationColor";

export const createPersonOrientation = (friend: PersonInput): Orientation => ({
  id: friend.resultId,
  type: "person",
  name: toTrimmedText(friend.name),
  imageUrl: toWebAddress(friend.imageUrl),
  color: toOrientationColor(friend.color),
});
