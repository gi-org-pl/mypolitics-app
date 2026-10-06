import { Avatar } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import type { CSSProperties } from "react";

import { HATCH_CLASS_NAME } from "@/constants/hatch";
import { getSafeColor } from "@/utils/color/getSafeColor";

import { toSingleLine } from "../utils/toSingleLine";
import type { TraitPillProps } from "./TraitPill.types";
import { isLightColor } from "./utils/isLightColor";

export const TraitPill = ({ item, party }: TraitPillProps) => {
  const { t } = useLingui();

  const { name: trait, holder } = item;
  const name = toSingleLine(party?.name);
  const isTheirs = party !== undefined && holder !== "taker";
  const isHatched = isTheirs && holder === "other";

  const safeColor = getSafeColor(item.color);
  const isLight = isLightColor(safeColor);

  const description = isHatched
    ? t`${trait} - tylko ${name}`
    : t`${trait} - wspólna z: ${name}`;

  return (
    <li
      data-testid="trait-pill"
      data-holder={holder}
      className="flex max-w-full min-w-0 items-center"
    >
      <div
        data-testid="trait-pill-body"
        className={`flex h-8 min-w-0 items-center gap-2 rounded-lg px-4 ${safeColor ? "bg-(--trait-color)" : "bg-gi-dark-gray"} ${isLight ? "text-gi-primary" : "text-white"} ${isHatched ? HATCH_CLASS_NAME : ""}`}
        style={
          safeColor
            ? ({ "--trait-color": safeColor } as CSSProperties)
            : undefined
        }
      >
        {item.imageUrl && (
          <img
            data-testid="trait-pill-image"
            src={item.imageUrl}
            alt=""
            className={`-mx-2 size-8 shrink-0 object-cover ${isLight ? "brightness-0" : ""}`}
          />
        )}
        <span
          aria-hidden={isTheirs || undefined}
          className="min-w-0 truncate text-base leading-5 font-bold"
        >
          {trait}
        </span>
        {isTheirs && <span className="sr-only">{description}</span>}
      </div>
      {isTheirs && (
        <Avatar
          size="small"
          src={party.imageUrl}
          dataTestId="trait-pill-avatar"
          className="-ml-[11px] size-[22px] shrink-0 rounded-full border border-gi-primary bg-gi-ash"
        />
      )}
    </li>
  );
};
