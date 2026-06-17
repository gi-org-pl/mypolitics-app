import { Button } from "@gi/athena";
import { t } from "@lingui/core/macro";
import type React from "react";
import { useState } from "react";
import chevronIcon from "@/assets/icons/chevron.svg";
import infoIcon from "@/assets/icons/i.svg";
import { PersonalityDescription } from "./components/PersonalityDescription";
import { PersonalityIdentityRow } from "./components/PersonalityIdentityRow";
import { PersonalityModal } from "./components/PersonalityModal";
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const clampedPercent = Math.min(100, Math.max(0, identity.agreementPercent));
  const formattedPercent = clampedPercent.toFixed(1);
  const percentColorClass = getAgreementColor(clampedPercent);

  const handleAction = () => {
    if (mode === "expanded") {
      onToggleExpanded?.();
    } else {
      setIsModalOpen(true);
      onToggleModal?.();
    }
  };

  const ariaLabel =
    mode === "expanded" ? (expanded ? t`Zwiń` : t`Rozwiń`) : t`Szczegóły`;

  return (
    <div className="flex flex-col w-full gap-3 p-0 border-none shadow-none bg-transparent">
      {mode === "modal" && (
        <PersonalityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          identity={identity}
          title={identity.name}
          formattedPercent={formattedPercent}
          percentColorClass={percentColorClass}
        />
      )}

      {mode === "expanded" && (
        <PersonalityDescription
          text={expanded ? identity.description : identity.shortDescription}
        />
      )}

      <div className="flex items-center gap-3">
        <PersonalityIdentityRow
          imageUrl={identity.imageUrl}
          name={identity.name}
          title={title}
          formattedPercent={formattedPercent}
          percentColorClass={percentColorClass}
        />

        <Button
          isIconButton
          type="outlined"
          variant="primary"
          size="regular"
          className="shrink-0"
          onClick={handleAction}
          aria-label={ariaLabel}
        >
          {mode === "expanded" ? (
            <img
              src={chevronIcon}
              alt=""
              className={`w-3.5 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
            />
          ) : (
            <img src={infoIcon} alt="" className="h-4 w-auto" />
          )}
        </Button>
      </div>
    </div>
  );
};
