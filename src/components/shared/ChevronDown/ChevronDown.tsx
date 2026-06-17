import { Button } from "@gi/athena";
import type { MouseEvent, ReactElement } from "react";
import { twMerge } from "tailwind-merge";

export type ChevronDownProps = {
  isExpanded?: boolean;
  "aria-label": string;
  className?: string;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

function ChevronDownIcon({
  isExpanded,
  className,
}: {
  isExpanded?: boolean;
  className?: string;
}): ReactElement {
  return (
    <svg
      width="14"
      height="16"
      viewBox="0 0 14 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={twMerge(
        "pointer-events-none h-4 w-4 shrink-0 text-gi-primary transition-transform duration-300 ease-in-out motion-reduce:transition-none",
        isExpanded && "rotate-180",
        className,
      )}
    >
      <path
        d="M6.46966 11.9211L0.396437 5.84786C0.103531 5.55496 0.103531 5.08008 0.396437 4.78721L1.10478 4.07886C1.39719 3.78646 1.87109 3.7859 2.16419 4.07761L7 8.89077L11.8358 4.07761C12.1289 3.7859 12.6028 3.78646 12.8952 4.07886L13.6035 4.78721C13.8964 5.08011 13.8964 5.55499 13.6035 5.84786L7.53034 11.9211C7.23744 12.214 6.76256 12.214 6.46966 11.9211Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronDown({
  isExpanded = false,
  "aria-label": ariaLabel,
  className,
  onClick,
}: ChevronDownProps): ReactElement {
  return (
    <Button
      type="ghost"
      variant="primary"
      isIconButton
      className={twMerge(
        "size-12 h-12 w-12 shrink-0 ring-1 ring-inset ring-gi-primary",
        className,
      )}
      aria-expanded={isExpanded}
      aria-label={ariaLabel}
      LeftIcon={<ChevronDownIcon isExpanded={isExpanded} />}
      onClick={onClick}
    />
  );
}
