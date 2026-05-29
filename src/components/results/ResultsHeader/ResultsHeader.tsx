import { Avatar, Button } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import MEGAPHONE_ICON from "@/assets/icons/megaphone.svg";
import {
  AGREEMENT_RING_CENTER,
  AGREEMENT_RING_RADIUS,
  AGREEMENT_RING_SIZE,
  AGREEMENT_RING_STROKE_WIDTH,
} from "./ResultsHeader.constants";
import type { ResultsHeaderProps } from "./ResultsHeader.types";
import {
  type AgreementLevel,
  getAgreementLevel,
} from "./utils/getAgreementLevel";

const agreementLevelClassNames: Record<AgreementLevel, string> = {
  high: "text-gi-green stroke-gi-green",
  mid: "text-gi-orange stroke-gi-orange",
  low: "text-gi-red stroke-gi-red",
};

function clampPercent(percent: number) {
  return Math.min(100, Math.max(0, percent));
}

export function ResultsHeader({
  id,
  name,
  slogan,
  imageUrl,
  agreementPercent,
  actionLabel,
  actionShortLabel,
  onActionClick,
}: ResultsHeaderProps) {
  const clampedPercent = clampPercent(agreementPercent);
  const roundedPercent = Math.round(clampedPercent);
  const agreementLevel = getAgreementLevel(clampedPercent);
  const circumference = 2 * Math.PI * AGREEMENT_RING_RADIUS;
  const strokeDashoffset = circumference * (1 - clampedPercent / 100);
  const shouldRenderAction = Boolean(actionLabel && onActionClick);
  const shortActionLabel = actionShortLabel ?? actionLabel;

  return (
    <section
      id={id}
      className="overflow-hidden rounded-lg bg-gi-dark-primary text-white"
    >
      <div className="flex items-center justify-between gap-4 p-4 md:justify-start md:p-6">
        <div className="min-w-0 md:order-2">
          <h2 className="text-2xl font-bold leading-tight">{name}</h2>
          <p
            className={`mt-1 text-base font-bold leading-6 ${agreementLevelClassNames[agreementLevel]}`}
          >
            {roundedPercent}% <Trans>pewności</Trans>
          </p>
        </div>

        <div className="relative size-16 shrink-0 md:order-1">
          <Avatar src={imageUrl} alt={name} size="large" className="size-14" />

          <svg
            viewBox={`0 0 ${AGREEMENT_RING_SIZE} ${AGREEMENT_RING_SIZE}`}
            className="absolute inset-0 size-16 -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={AGREEMENT_RING_CENTER}
              cy={AGREEMENT_RING_CENTER}
              r={AGREEMENT_RING_RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth={AGREEMENT_RING_STROKE_WIDTH}
              className="text-white/10"
            />
            <circle
              cx={AGREEMENT_RING_CENTER}
              cy={AGREEMENT_RING_CENTER}
              r={AGREEMENT_RING_RADIUS}
              fill="none"
              strokeWidth={AGREEMENT_RING_STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={agreementLevelClassNames[agreementLevel]}
            />
          </svg>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-gi-primary p-4 md:p-6">
        <div className="min-w-0">
          <div className="hidden items-center gap-2 text-sm font-bold text-white/70 md:flex">
            <img
              src={MEGAPHONE_ICON}
              alt=""
              aria-hidden="true"
              className="size-4 opacity-60"
            />
            <span>
              <Trans>Hasło</Trans>
            </span>
          </div>

          <p className="text-base font-bold leading-[120%] text-white">
            {slogan}
          </p>
        </div>

        <img
          src={MEGAPHONE_ICON}
          alt=""
          aria-hidden="true"
          className="size-5 shrink-0 opacity-30 md:hidden"
        />

        {shouldRenderAction ? (
          <Button
            type="ghost"
            variant="primary"
            size="small"
            onClick={onActionClick}
          >
            <span className="hidden sm:inline">{actionLabel}</span>
            <span className="sm:hidden">{shortActionLabel}</span>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
