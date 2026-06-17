import { Avatar } from "@gi/athena";
import { t } from "@lingui/core/macro";
import { cn } from "@/lib/utils";
import { type AxisSideKey, type ResultsAxisProps } from "./ResultsAxis.types";
import { normalizePercentages } from "./utils/normalizePercentages";

export const ResultsAxis = ({
  id,
  left,
  right,
  isHighlighted = true,
  onSideClick,
}: ResultsAxisProps) => {
  const { left: leftPercent, right: rightPercent } = normalizePercentages(
    left.value,
    right.value,
  );

  const visualLeftPercent = 5 + leftPercent * 0.9;

  const highestValue = Math.max(left.value, right.value);

  const isInteractive = Boolean(onSideClick);

  const renderIcon = (sideKey: AxisSideKey) => {
    const side = sideKey === "left" ? left : right;
    const percentage = sideKey === "left" ? leftPercent : rightPercent;
    const isZero = percentage === 0;

    const color = isHighlighted && !isZero ? side.color : "gi-gray";

    const Component = isInteractive ? "button" : "div";

    return (
      <Component
        type={isInteractive ? "button" : undefined}
        onClick={isInteractive ? () => onSideClick?.(sideKey) : undefined}
        aria-label={t`${side.name}`}
        className={cn(
          "absolute top-1/2 z-50 -translate-y-1/2 transition-all",
          sideKey === "left" ? "-left-4" : "-right-4",
          isInteractive ? "cursor-pointer hover:scale-110 active:scale-95" : "",
        )}
      >
        <Avatar
          src={side.iconUrl}
          alt={side.name}
          size="small"
          color={color}
          className={cn(
            "size-8 border-none shadow-sm",
            sideKey === "right" && "[&_img]:scale-x-[-1]",
          )}
        />
      </Component>
    );
  };

  const renderSegment = (sideKey: AxisSideKey) => {
    const side = sideKey === "left" ? left : right;
    const percentage = sideKey === "left" ? leftPercent : rightPercent;
    const visualWidth =
      sideKey === "left" ? visualLeftPercent : 100 - visualLeftPercent;

    const segmentBgClass = isHighlighted ? "" : "bg-gi-ash";
    const labelColorClass = isHighlighted ? "text-white" : "text-gi-dark-gray";

    const segmentBgStyle = isHighlighted
      ? { backgroundColor: `var(--color-${side.color})` }
      : {};

    const Component = isInteractive ? "button" : "div";

    return (
      <Component
        type={isInteractive ? "button" : undefined}
        onClick={isInteractive ? () => onSideClick?.(sideKey) : undefined}
        aria-label={t`${side.name}`}
        className={cn(
          "relative flex h-full items-center justify-center transition-all",
          isInteractive
            ? "cursor-pointer hover:brightness-95 focus-visible:z-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gi-primary"
            : "cursor-default",
        )}
        style={{ width: `${visualWidth}%` }}
      >
        {percentage > 0 && (
          <>
            <div
              className={cn(
                "absolute inset-0 -z-10 h-full w-full",
                segmentBgClass,
              )}
              style={segmentBgStyle}
            />

            {(percentage >= 25 || highestValue === side.value) && (
              <span
                className={cn(
                  "z-10 text-[0.75rem] font-bold leading-none",
                  labelColorClass,
                )}
              >
                {Math.round(percentage)}%
              </span>
            )}
          </>
        )}
      </Component>
    );
  };

  const renderKnob = () => {
    const knobPosition = visualLeftPercent;
    const activeSide = left.value >= right.value ? left : right;

    return (
      <div
        className={cn(
          "pointer-events-none absolute top-0 bottom-0 z-20 size-6 rounded-full transition-all -translate-x-1/2 shadow-sm",
        )}
        style={{
          left: `${knobPosition}%`,
          backgroundColor: isHighlighted
            ? `var(--color-${activeSide.color})`
            : "var(--color-gi-gray)",
          filter: "brightness(0.6)",
        }}
      />
    );
  };

  return (
    <div
      id={id}
      className="flex min-h-[52px] w-full flex-col justify-between gap-1"
      data-testid="results-axis"
    >
      <div className="flex w-full justify-between items-center px-0.5">
        <h2 className="text-[1rem] leading-none font-bold text-gi-primary">
          {left.name}
        </h2>
        <h2 className="text-[1rem] leading-none font-bold text-gi-primary text-right">
          {right.name}
        </h2>
      </div>

      <div
        className={cn(
          "relative flex h-6 w-[calc(100%-32px)] self-center items-center",
          "bg-transparent overflow-visible",
          !isHighlighted && "shadow-[0_0_0_1px_var(--color-gi-ash)]",
        )}
      >
        <div className="absolute inset-0 bg-gi-ash/30 rounded-full overflow-hidden flex">
          <div className="absolute inset-0 border-y border-gi-primary/10 -z-20" />

          {renderSegment("left")}
          {renderSegment("right")}
        </div>
        {renderIcon("left")}
        {renderIcon("right")}
        {renderKnob()}
      </div>
    </div>
  );
};
