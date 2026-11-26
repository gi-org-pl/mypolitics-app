import type {
  ComparisonView,
  ComparisonViewProps,
} from "../ResultsComparison.types";

export interface ComparisonViewsProps extends ComparisonViewProps {
  onViewChange: (view: ComparisonView) => void;
}
