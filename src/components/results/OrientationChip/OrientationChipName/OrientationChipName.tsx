import {
  NAME_CLASS_NAME,
  NAME_SWITCH_CLASS_NAME,
  SHORT_NAME_SWITCH_CLASS_NAME,
} from "../OrientationChip.constants";
import { OrientationChipNamePair } from "./OrientationChipNamePair/OrientationChipNamePair";

interface OrientationChipNameProps {
  name: string;
  secondName?: string;
  shortName?: string;
}

export const OrientationChipName = ({
  name,
  secondName,
  shortName,
}: OrientationChipNameProps) => {
  const className = shortName
    ? `${NAME_CLASS_NAME} ${NAME_SWITCH_CLASS_NAME}`
    : NAME_CLASS_NAME;

  const fullName = secondName ? (
    <OrientationChipNamePair
      start={name}
      end={secondName}
      className={className}
    />
  ) : (
    <span className={`truncate ${className}`}>{name}</span>
  );

  if (!shortName) return fullName;

  return (
    <span
      data-testid="orientation-chip-name"
      className="@container flex min-w-0 flex-1 justify-center"
    >
      {fullName}
      <span
        aria-hidden="true"
        data-testid="orientation-chip-short-name"
        className={`truncate ${NAME_CLASS_NAME} ${SHORT_NAME_SWITCH_CLASS_NAME}`}
      >
        {shortName}
      </span>
    </span>
  );
};
