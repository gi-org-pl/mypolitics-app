import { useLingui } from "@lingui/react/macro";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";

const CONTROL_CLASS_NAME =
  "relative flex h-[33px] w-full cursor-pointer items-center justify-center rounded-b-2xl outline-none transition-colors duration-300 before:absolute before:inset-x-0 before:-top-3 before:bottom-0 before:content-[''] focus-visible:ring-[3px] focus-visible:ring-gi-secondary/50 focus-visible:ring-inset";

interface OpenControlProps {
  isOpen: boolean;
  controlsId: string;
  onToggle: () => void;
}

export const OpenControl = ({
  isOpen,
  controlsId,
  onToggle,
}: OpenControlProps) => {
  const { t } = useLingui();

  return (
    <button
      type="button"
      aria-expanded={isOpen}
      aria-controls={isOpen ? controlsId : undefined}
      aria-label={isOpen ? t`Ukryj osie` : t`Pokaż osie`}
      className={`${CONTROL_CLASS_NAME} ${
        isOpen
          ? "bg-gi-ash hover:bg-gi-dark-ash"
          : "border-t border-gi-ash hover:bg-gi-ash/50"
      }`}
      onClick={() => onToggle()}
    >
      <img
        src={chevronDownIcon}
        alt=""
        className={isOpen ? "rotate-180" : ""}
      />
    </button>
  );
};
