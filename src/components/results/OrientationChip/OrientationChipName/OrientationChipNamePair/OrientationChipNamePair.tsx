import { Trans } from "@lingui/react/macro";

interface OrientationChipNamePairProps {
  start: string;
  end: string;
  className: string;
}

export const OrientationChipNamePair = ({
  start,
  end,
  className,
}: OrientationChipNamePairProps) => {
  const startName = <span className="truncate">{start}</span>;
  const endName = <span className="truncate">{end}</span>;

  return (
    <span
      data-testid="orientation-chip-name-pair"
      className={`grid auto-cols-[minmax(0,auto)] grid-flow-col whitespace-pre ${className}`}
    >
      <Trans>
        {startName} / {endName}
      </Trans>
    </span>
  );
};
