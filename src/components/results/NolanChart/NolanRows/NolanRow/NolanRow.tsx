import type { Orientation } from "@/types/orientation";

import { AxisRow } from "../../../AxisRow/AxisRow";
import type {
  NolanAxis,
  NolanAxisValues,
  NolanPoleSide,
} from "../../NolanChart.types";
import { getPoleName } from "../../utils/getPoleName";
import { getRowComparison } from "../../utils/getRowComparison";
import { getRowEntry } from "../../utils/getRowEntry";
import { getRowSideColor } from "../../utils/getRowSideColor";

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
      start={getRowEntry(axis.start, getRowSideColor("start", lean, color))}
      end={getRowEntry(axis.end, getRowSideColor("end", lean, color))}
      comparison={getRowComparison(otherOrientation, otherValues)}
    />
  </div>
);
