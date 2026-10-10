import { Avatar } from "@gi-org-pl/athena";
import type { CSSProperties } from "react";

import { HATCH_LIGHT_CLASS_NAME } from "@/constants/hatch";
import { getSafeColor } from "@/utils/color/getSafeColor";
import { toSingleLine } from "@/utils/text/toSingleLine";

import type { TraitPillProps } from "./TraitPill.types";
import { getPillHolder } from "./utils/getPillHolder";
import { isLightColor } from "./utils/isLightColor";
import { useTraitDescription } from "./utils/useTraitDescription";

// One trait as a pill: its icon, then its name, on its colour. In a
// comparison it also says whose the trait is - an avatar of the other side,
// and hatching when only they hold it. It is a single item and not a list
// item: a parent that draws several puts each in an item of its own list.
export const TraitPill = ({
  orientation,
  holder = "taker",
  otherOrientation,
}: TraitPillProps) => {
  const name = toSingleLine(orientation.name);
  const pillHolder = getPillHolder(holder, otherOrientation);
  const isTheirs = pillHolder !== "taker";
  const isHatched = pillHolder === "other";
  const description = useTraitDescription(
    name,
    pillHolder,
    otherOrientation?.name,
  );

  const safeColor = getSafeColor(orientation.color);
  const isLight = isLightColor(safeColor);

  return (
    <div
      data-testid="trait-pill"
      data-holder={holder}
      className="flex max-w-full min-w-0 items-center"
    >
      <div
        data-testid="trait-pill-body"
        className={`flex h-8 min-w-0 items-center gap-2 rounded-lg px-4 ${safeColor ? "bg-(--trait-color)" : "bg-gi-dark-gray"} ${isLight ? "text-gi-primary" : "text-white"} ${isHatched ? HATCH_LIGHT_CLASS_NAME : ""}`}
        style={
          safeColor
            ? ({ "--trait-color": safeColor } as CSSProperties)
            : undefined
        }
      >
        {orientation.imageUrl && (
          <img
            data-testid="trait-pill-image"
            src={orientation.imageUrl}
            alt=""
            className={`-mx-2 size-8 shrink-0 object-cover ${isLight ? "brightness-0" : ""}`}
          />
        )}
        <span
          aria-hidden={isTheirs || undefined}
          className="min-w-0 truncate text-base leading-5 font-bold"
        >
          {name}
        </span>
        {isTheirs && <span className="sr-only">{description}</span>}
      </div>
      {isTheirs && (
        <Avatar
          size="small"
          src={otherOrientation?.imageUrl}
          dataTestId="trait-pill-avatar"
          className="-ml-[11px] size-[22px] shrink-0 rounded-full border border-gi-primary bg-gi-ash"
        />
      )}
    </div>
  );
};
