import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { ComponentType } from "react";

import {
  ComparisonView,
  type ComparisonViewProps,
} from "../ResultsComparison.types";
import { ComparisonResults } from "./ComparisonResults/ComparisonResults";

// The name of each view on the switch.
export const COMPARISON_VIEW_LABELS: Record<ComparisonView, MessageDescriptor> =
  {
    [ComparisonView.Results]: msg`Wyniki`,
    [ComparisonView.Questions]: msg`Pytania`,
  };

// What draws each view. A view with no row here has nothing to draw yet: the
// list of questions is one more row.
export const COMPARISON_VIEW_CONTENT: Partial<
  Record<ComparisonView, ComponentType<ComparisonViewProps>>
> = {
  [ComparisonView.Results]: ComparisonResults,
};
