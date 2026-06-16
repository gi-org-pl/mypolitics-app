import { Avatar, Button } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import MEGAPHONE_ICON from "@/assets/vectors/megaphone.svg";
import {
  AGREEMENT_MAX_PERCENT,
  AGREEMENT_MIN_PERCENT,
  AGREEMENT_RING_CENTER,
  AGREEMENT_RING_RADIUS,
  AGREEMENT_RING_SIZE,
  AGREEMENT_RING_STROKE_WIDTH,
} from "./ResultsHeader.constants";
import type { AgreementLevel, ResultsHeaderProps } from "./ResultsHeader.types";
import { getAgreementLevel } from "./utils/getAgreementLevel";

const agreementLevelClassNames: Record<AgreementLevel, string> = {
  high: "text-gi-green",
  mid: "text-gi-orange",
  low: "text-gi-red",
};

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
  const clampPercent = (percent: number) =>
    Math.min(AGREEMENT_MAX_PERCENT, Math.max(AGREEMENT_MIN_PERCENT, percent));

  const clampedPercent = clampPercent(agreementPercent);
  const roundedPercent = Math.round(clampedPercent);
  const agreementLevel = getAgreementLevel(clampedPercent);
  const circumference = 2 * Math.PI * AGREEMENT_RING_RADIUS;
  const strokeDashoffset =
    circumference * (1 - clampedPercent / AGREEMENT_MAX_PERCENT);
  const shouldRenderActionButton = Boolean(actionLabel && onActionClick);
  const shortActionLabel = actionShortLabel ?? actionLabel;

  const renderAvatar = () => (
    <div className="relative size-16 shrink-0 md:order-1">
      <Avatar
        src={imageUrl}
        alt={name}
        size="large"
        className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2"
      />

      <svg
        viewBox={`0 0 ${AGREEMENT_RING_SIZE} ${AGREEMENT_RING_SIZE}`}
        className="pointer-events-none absolute inset-0 z-10 size-16"
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
          stroke="currentColor"
          strokeWidth={AGREEMENT_RING_STROKE_WIDTH}
          strokeLinecap="square"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={agreementLevelClassNames[agreementLevel]}
        />
      </svg>
    </div>
  );

  const renderHeader = () => (
    <div className="flex min-h-[90px] items-center justify-between gap-4 bg-gi-dark-primary px-6 py-4 md:justify-start">
      <div className="min-w-0 md:order-2">
        <h2 className="text-2xl font-bold leading-[150%]">{name}</h2>
        <p
          className={`text-base font-bold leading-[150%] ${agreementLevelClassNames[agreementLevel]}`}
        >
          <Trans>{roundedPercent}% pewności</Trans>
        </p>
      </div>

      {renderAvatar()}
    </div>
  );

  const renderFooter = () => (
    <div className="flex min-h-[43px] items-center justify-between gap-2 border-t border-white/10 bg-gi-dark-primary px-6 py-3 md:min-h-20 md:gap-4 md:py-4">
      <div className="min-w-0">
        <div className="hidden items-center gap-2 text-base font-bold leading-[120%] text-white/10 md:flex">
          <img
            src={MEGAPHONE_ICON}
            alt=""
            aria-hidden="true"
            className="size-4"
          />
          <span>
            <Trans>Hasło</Trans>
          </span>
        </div>

        <p className="text-base font-bold leading-[120%] text-white">
          {slogan}
        </p>
      </div>

      {shouldRenderActionButton ? (
        <Button
          type="ghost"
          variant="primary"
          size="regular"
          onClick={onActionClick}
          aria-label={actionLabel}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          <span aria-hidden="true" className="hidden sm:inline">
            {actionLabel}
          </span>
          <span aria-hidden="true" className="sm:hidden">
            {shortActionLabel}
          </span>
        </Button>
      ) : (
        <img
          src={MEGAPHONE_ICON}
          alt=""
          aria-hidden="true"
          className="size-4 shrink-0 opacity-30 md:hidden"
        />
      )}
    </div>
  );

  return (
    <section
      id={id}
      className="w-full overflow-hidden bg-gi-dark-primary text-white"
    >
      {renderHeader()}
      {renderFooter()}
    </section>
  );
}
