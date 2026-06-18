import { Button, Modal } from "@gi/athena";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import type React from "react";
import { useState } from "react";
import chevronIcon from "@/assets/icons/chevron.svg";
import type { IdentityInfoElement } from "../ResultIdentityPersonality.types";
import { PersonalityDescription } from "./PersonalityDescription";
import { PersonalityIdentityRow } from "./PersonalityIdentityRow";

interface PersonalityModalProps {
  isOpen: boolean;
  onClose: () => void;
  identity: IdentityInfoElement;
  title?: string;
  formattedPercent: string;
  percentColorClass: string;
}

export const PersonalityModal: React.FC<PersonalityModalProps> = ({
  isOpen,
  onClose,
  identity,
  title,
  formattedPercent,
  percentColorClass,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || <Trans>Tożsamość</Trans>}
    >
      <div className="flex flex-col gap-3">
        <PersonalityDescription
          text={isExpanded ? identity.description : identity.shortDescription}
        />

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
            className={`w-12 h-12 shrink-0`}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? t`Zwiń` : t`Rozwiń`}
          >
            <img
              src={chevronIcon}
              alt=""
              className={`w-3.5 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      </div>
    </Modal>
  );
};
