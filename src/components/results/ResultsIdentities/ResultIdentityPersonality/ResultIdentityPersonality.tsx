import { Avatar, Button } from "@gi/athena";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import type React from "react";
import type { ResultIdentityPersonalityProps } from "./ResultIdentityPersonality.types";
import { getAgreementColor } from "./utils/getAgreementColor";

export const ResultIdentityPersonality: React.FC<
  ResultIdentityPersonalityProps
> = ({
  identity,
  mode,
  expanded = false,
  onToggleExpanded,
  onToggleModal,
  title,
}) => {
  const { name, imageUrl, agreementPercent } = identity;

  const clampedPercent = Math.min(100, Math.max(0, agreementPercent));
  const roundedPercent = Math.round(clampedPercent);
  const percentColorClass = getAgreementColor(roundedPercent);

  const handleAction = () => {
    if (mode === "expanded") {
      onToggleExpanded?.();
    } else {
      onToggleModal?.();
    }
  };

  const ActionIcon =
    mode === "expanded" ? (expanded ? ChevronUp : ChevronDown) : Info;

  const ariaLabel =
    mode === "expanded"
      ? expanded
        ? t`Zwiń`
        : t`Rozwiń`
      : t`Szczegóły`;

  return (
    <div className="flex flex-col w-full border border-gi-ash rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 py-3 px-4">
        <Avatar
          src={imageUrl}
          alt={name}
          size="medium"
          className="size-12 shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-gi-primary/50 mb-0.5">
            {title || <Trans>Tożsamość</Trans>}{" "}
            <span className={percentColorClass}>
              <Trans>({roundedPercent}%)</Trans>
            </span>
          </div>
          <div className="font-bold text-gi-primary truncate text-sm sm:text-base">
            {name}
          </div>
        </div>

        <Button
          isIconButton
          type="ghost"
          variant="primary"
          size="regular"
          className="w-12 h-12 shrink-0 [&_svg]:size-6 [&_svg_*]:fill-none [&_svg_*]:stroke-current [&_svg_*]:stroke-2"
          onClick={handleAction}
          aria-label={ariaLabel}
        >
          <ActionIcon />
        </Button>
      </div>

      {mode === "expanded" && expanded && (
        <div className="px-4 pb-4 text-sm text-gi-primary border-t border-gi-ash/50 bg-gi-ash/5">
          {identity.slogan && (
            <div className="italic font-medium text-gi-primary/70 mb-2 mt-4">
              "{identity.slogan}"
            </div>
          )}
          {identity.shortDescription && (
            <div className="font-bold mb-2">
              {identity.shortDescription}
            </div>
          )}
          <div className="leading-relaxed">{identity.description}</div>
        </div>
      )}
    </div>
  );
};
