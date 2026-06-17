import { Avatar } from "@gi/athena";
import { Trans } from "@lingui/react/macro";
import type React from "react";
import personalityIcon from "@/assets/images/results/resultIdentities/icon.png";

interface PersonalityIdentityRowProps {
  imageUrl?: string;
  name: string;
  title?: string;
  formattedPercent: string;
  percentColorClass: string;
}

export const PersonalityIdentityRow: React.FC<PersonalityIdentityRowProps> = ({
  imageUrl,
  name,
  title,
  formattedPercent,
  percentColorClass,
}) => (
  <>
    <Avatar
      src={imageUrl || personalityIcon}
      alt={name}
      size="medium"
      className="shrink-0 bg-transparent"
    />

    <div className="flex-1 min-w-0">
      <div className="text-sm font-bold text-gi-primary/50 mb-0.5">
        {title || <Trans>Tożsamość</Trans>}{" "}
        <span className={percentColorClass}>
          <Trans>({formattedPercent}%)</Trans>
        </span>
      </div>
      <div className="font-bold text-gi-primary truncate text-sm sm:text-base">
        {name}
      </div>
    </div>
  </>
);
