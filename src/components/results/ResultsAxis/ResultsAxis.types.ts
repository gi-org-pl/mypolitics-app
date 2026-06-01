export interface AxisSide {
  name: string;
  iconUrl: string;
  value: number;
  color: string;
}

export type AxisSideKey = "left" | "right";

export interface ResultsAxisProps {
  id?: string;
  left: AxisSide;
  right: AxisSide;
  isHighlighted?: boolean;
  onSideClick?: (side: AxisSideKey) => void;
}
