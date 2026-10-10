import {
  MAP_CLIP_CLASS_NAME,
  MAP_POINT_CLASS_NAME,
} from "../../NolanChart.constants";
import type { NolanPosition } from "../../NolanChart.types";
import { getPositionStyle } from "../../utils/getPositionStyle";

interface TakerDotProps {
  position: NolanPosition;
  isOnDarkFill?: boolean;
}

export const TakerDot = ({ position, isOnDarkFill = false }: TakerDotProps) => {
  const style = getPositionStyle(position);

  return (
    <>
      <div className={MAP_CLIP_CLASS_NAME}>
        <div
          data-testid="nolan-chart-halo"
          className={`${MAP_POINT_CLASS_NAME} size-14 bg-gi-primary/25`}
          style={style}
        />
      </div>
      <div
        data-testid="nolan-chart-dot"
        className={`${MAP_POINT_CLASS_NAME} size-6 border-2 border-gi-primary bg-gi-light-primary ${isOnDarkFill ? "ring-2 ring-white" : ""}`}
        style={style}
      />
    </>
  );
};
