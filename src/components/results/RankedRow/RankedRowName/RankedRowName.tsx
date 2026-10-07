import { PREFIX_SEPARATOR } from "./RankedRowName.constants";

interface RankedRowNameProps {
  name: string;
  prefix?: string;
  isHeading?: boolean;
}

const NAME_CLASS_NAME =
  "min-h-5 min-w-0 text-base leading-5 font-bold text-gi-primary";
const PART_CLASS_NAME = "max-w-full min-w-0 truncate";
const QUIET_CLASS_NAME = "text-gi-primary/50";

export const RankedRowName = ({
  name,
  prefix = "",
  isHeading = false,
}: RankedRowNameProps) => {
  const Name = isHeading ? "h3" : "p";
  const marginClassName = isHeading ? "-my-[0.5px]" : "-my-0.5";

  if (prefix === "") {
    return (
      <Name
        data-testid="ranked-row-name"
        className={`${NAME_CLASS_NAME} truncate ${marginClassName}`}
      >
        {name}
      </Name>
    );
  }

  return (
    <Name
      data-testid="ranked-row-name"
      className={`${NAME_CLASS_NAME} flex flex-wrap gap-x-1 ${marginClassName}`}
    >
      <span
        data-testid="ranked-row-name-prefix"
        className={`${PART_CLASS_NAME} ${QUIET_CLASS_NAME}`}
      >
        {prefix}
      </span>{" "}
      <span data-testid="ranked-row-name-value" className={PART_CLASS_NAME}>
        <span className={QUIET_CLASS_NAME}>{PREFIX_SEPARATOR}</span> {name}
      </span>
    </Name>
  );
};
