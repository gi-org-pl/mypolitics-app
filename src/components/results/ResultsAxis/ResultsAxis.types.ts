export interface AxisSide {
  name: string; // side label, e.g. "Left" / "Right" (caller supplies real names)
  iconUrl: string; // SVG/img URL for this side's icon
  value: number; // 0–100 raw weight for this side
  color: string; // this side's brand colour (a palette token, see notes)
}

export type AxisSideKey = "left" | "right";

export interface ResultsAxisProps {
  id?: string; // optional DOM id / anchor target
  left: AxisSide;
  right: AxisSide;
  isHighlighted?: boolean; // default true — colored vs muted/greyed
  onSideClick?: (side: AxisSideKey) => void; // fired when a side is clicked
}
