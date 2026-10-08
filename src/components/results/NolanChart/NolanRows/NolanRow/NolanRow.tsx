import type { Orientation } from "@/types/orientation";
import type { NolanAxisValues, NolanPoleSide } from "@/types/results";

import { AxisRow } from "../../../AxisRow/AxisRow";
import type { NolanAxis } from "../../NolanChart.types";
import { getPoleName } from "../../utils/getPoleName";
import { getRowComparison } from "../../utils/getRowComparison";
import { getRowEntry } from "../../utils/getRowEntry";

interface NolanRowProps {
  axis: NolanAxis;
  coordinate?: number;
  lean?: NolanPoleSide;
  color?: string;
  otherOrientation?: Orientation;
  otherValues?: NolanAxisValues;
}

export const NolanRow = ({
  axis,
  coordinate,
  lean,
  color,
  otherOrientation,
  otherValues,
}: NolanRowProps) => (
  <div className="border-t border-gi-ash p-4">
    <AxisRow
      name={axis.name}
      leadName={getPoleName(axis, lean, coordinate)}
      start={getRowEntry(axis.start, lean === "start" ? color : undefined)}
      end={getRowEntry(axis.end, lean === "end" ? color : undefined)}
      comparison={getRowComparison(otherOrientation, otherValues)}
    />
  </div>
);
