import { IS_CHOICE_OPEN } from "../ResultsComparison.constants";
import type {
  ChoosingState,
  ComparisonState,
  RefusedState,
} from "../ResultsComparison.types";

// Whether the taker can choose the other side in this state.
export const isChoiceOpen = (
  state: ComparisonState,
): state is ChoosingState | RefusedState => IS_CHOICE_OPEN[state.status];
