import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { ComponentType } from "react";

import {
  ComparisonView,
  type ComparisonViewProps,
} from "../ResultsComparison.types";
import { ComparisonQuestions } from "./ComparisonQuestions/ComparisonQuestions";
import { ComparisonResults } from "./ComparisonResults/ComparisonResults";

// The name of each view on the switch.
export const COMPARISON_VIEW_LABELS: Record<ComparisonView, MessageDescriptor> =
  {
    [ComparisonView.Results]: msg`Wyniki`,
    [ComparisonView.Questions]: msg`Pytania`,
  };

// What draws each view. A new view is one more row here, and in the table
// of the names.
export const COMPARISON_VIEW_CONTENT: Record<
  ComparisonView,
  ComponentType<ComparisonViewProps>
> = {
  [ComparisonView.Results]: ComparisonResults,
  [ComparisonView.Questions]: ComparisonQuestions,
};
