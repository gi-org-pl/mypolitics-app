import { t } from "@lingui/core/macro";
import { Avatar } from "@gi/athena";
import { cn } from "@/lib/utils";
import { normalizePercentages } from "./utils/normalizePercentages";
import { type ResultsAxisProps, type AxisSideKey } from "./ResultsAxis.types";

export const ResultsAxis = ({
  id,
  left,
  right,
  isHighlighted = true,
  onSideClick,
}: ResultsAxisProps) => {
  const { left: leftPercent, right: rightPercent } = normalizePercentages(
    left.value,
    right.value
  );

  const highestValue = Math.max(left.value, right.value);
  const isLeftSide = left.value >= right.value;
  const isEqual = left.value === right.value && left.value === 50;

  const isInteractive = Boolean(onSideClick);

  const renderIcon = (sideKey: AxisSideKey) => {
    const side = sideKey === "left" ? left : right;
    const percentage = sideKey === "left" ? leftPercent : rightPercent;
    const isZero = percentage === 0;
    
    // Icon badge background: side color if highlighted and value > 0, otherwise gray
    const bgClass = isHighlighted && !isZero ? `bg-${side.color}` : "bg-gi-gray";
    
    return (
      <div
        className={cn(
          "absolute top-1/2 z-40 -translate-y-1/2 transition-colors",
          sideKey === "left" ? "left-[-16px]" : "right-[-16px]"
        )}
      >
        <Avatar
          src={side.iconUrl}
          alt={side.name}
          size="small"
          className={cn(
            "size-8 border-none shadow-sm",
            bgClass,
            sideKey === "right" && "[&_img]:scale-x-[-1]"
          )}
        />
      </div>
    );
  };

  const renderSegment = (sideKey: AxisSideKey) => {
    const side = sideKey === "left" ? left : right;
    const percentage = sideKey === "left" ? leftPercent : rightPercent;
    
    if (percentage === 0) return null;

    // Segment color: brand color mixed with black (using 80% opacity in Tailwind 4)
    // or muted if not highlighted.
    const segmentBgClass = isHighlighted ? `bg-${side.color}/80` : "bg-gi-ash";
    const labelColorClass = isHighlighted ? "text-white" : "text-gi-dark-gray";

    const Component = isInteractive ? "button" : "div";

    return (
      <Component
        type={isInteractive ? "button" : undefined}
        onClick={isInteractive ? () => onSideClick?.(sideKey) : undefined}
        aria-label={t`${side.name}`}
        className={cn(
          "relative flex h-full items-center justify-center transition-all",
          sideKey === "left" ? "rounded-l-full" : "rounded-r-full",
          isInteractive ? "cursor-pointer hover:brightness-95 focus-visible:z-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-primary" : "cursor-default"
        )}
        style={{ width: `${percentage}%` }}
      >
        <div className={cn("absolute inset-0 -z-10 h-full w-full", segmentBgClass, sideKey === "left" ? "rounded-l-full" : "rounded-r-full")} />

        {highestValue === side.value && (
          <span className={cn("z-10 text-[0.75rem] font-bold leading-none", labelColorClass)}>
            {Math.round(percentage)}%
          </span>
        )}

        {/* Boundary Knob / Divider Circle */}
        {((sideKey === "left" ? isLeftSide : !isLeftSide) || isEqual) && (
          <div
            className={cn(
              "absolute top-0 bottom-0 z-20 size-6 rounded-full transition-all",
              sideKey === "left" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"
            )}
            style={{
              backgroundColor: isHighlighted ? `var(--color-${side.color})` : "var(--color-gi-gray)",
              filter: "brightness(0.6)",
              transform: isEqual 
                ? `translate(${sideKey === "left" ? "8px" : "-8px"}, 0)` 
                : `translate(${sideKey === "left" ? "12px" : "-12px"}, 0)`
            }}
          />
        )}
      </Component>
    );
  };

  return (
    <div 
      id={id} 
      className="flex min-h-[52px] w-full flex-col justify-between gap-1" 
      data-testid="results-axis"
    >
      <div className="flex w-full justify-between items-center px-0.5">
        <h2 className="text-[1rem] leading-none font-bold text-gi-primary">{left.name}</h2>
        <h2 className="text-[1rem] leading-none font-bold text-gi-primary text-right">{right.name}</h2>
      </div>

      <div
        className={cn(
          "relative flex h-6 w-[calc(100%-32px)] self-center items-center justify-between",
          "bg-gi-ash/30 rounded-full overflow-visible",
          !isHighlighted && "shadow-[0_0_0_1px_var(--color-gi-ash)]"
        )}
      >
        {renderIcon("left")}
        {renderSegment("left")}
        <div className="flex-1" />
        {renderSegment("right")}
        {renderIcon("right")}
      </div>
    </div>
  );
};



