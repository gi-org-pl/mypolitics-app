import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import { Agreement } from "@/types/comparison";

// How two sides stand on a question, in a word. Wherever a comparison shows
// agreement by a tint or a mark, this word says the same to someone who
// cannot tell the two apart.
export const AGREEMENT_LABELS: Record<Agreement, MessageDescriptor> = {
  [Agreement.Agree]: msg`Zgodność`,
  [Agreement.Disagree]: msg`Niezgodność`,
  [Agreement.Neither]: msg`Brak porównania`,
};
