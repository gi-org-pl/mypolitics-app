import {
  MAP_CLIP_CLASS_NAME,
  MAP_POINT_CLASS_NAME,
} from "../CompassMap.constants";
import type { CompassMapPoint } from "../CompassMap.types";
import { getPositionStyle } from "../utils/getPositionStyle";

interface TakerDotProps {
  position: CompassMapPoint;
}

export const TakerDot = ({ position }: TakerDotProps) => {
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
        className={`${MAP_POINT_CLASS_NAME} size-6 border-2 border-gi-primary bg-gi-light-primary`}
        style={style}
      />
    </>
  );
};
