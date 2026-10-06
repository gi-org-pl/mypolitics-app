import type {
  NolanAxis,
  NolanComparison,
  NolanPosition,
} from "../NolanChart.types";
import { NolanRow } from "./NolanRow/NolanRow";

interface NolanRowsProps {
  id: string;
  horizontal: NolanAxis;
  vertical: NolanAxis;
  position: NolanPosition | null;
  color?: string;
  comparison?: NolanComparison;
}

export const NolanRows = ({
  id,
  horizontal,
  vertical,
  position,
  color,
  comparison,
}: NolanRowsProps) => (
  <div id={id} data-testid="nolan-chart-rows">
    <NolanRow
      axis={horizontal}
      coordinate={position?.x}
      lean={position?.poles.horizontal}
      color={color}
      otherParty={comparison?.party}
      otherValues={comparison?.horizontal}
    />
    <NolanRow
      axis={vertical}
      coordinate={position?.y}
      lean={position?.poles.vertical}
      color={color}
      otherParty={comparison?.party}
      otherValues={comparison?.vertical}
    />
  </div>
);
