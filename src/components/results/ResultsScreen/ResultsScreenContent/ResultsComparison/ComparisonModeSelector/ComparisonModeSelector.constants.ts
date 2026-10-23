import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";

import { ComparisonMode } from "@/types/comparison";

// The modes in the order they are drawn: the friend first.
export const COMPARISON_MODES = [
  ComparisonMode.Friend,
  ComparisonMode.Orientation,
] as const satisfies readonly ComparisonMode[];

// The name of each mode on its tab.
export const COMPARISON_MODE_LABELS: Record<ComparisonMode, MessageDescriptor> =
  {
    [ComparisonMode.Friend]: msg`Ze znajomym`,
    [ComparisonMode.Orientation]: msg`Z orientacją`,
  };
