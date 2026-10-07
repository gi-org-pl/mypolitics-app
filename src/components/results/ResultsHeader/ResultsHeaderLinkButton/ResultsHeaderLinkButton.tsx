import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import linkIcon from "@/assets/icons/link.svg";

import type { ResultsHeaderSafeLink } from "../ResultsHeader.types";

export const ResultsHeaderLinkButton = ({
  href,
  label,
}: ResultsHeaderSafeLink) => {
  const { t } = useLingui();

  return (
    <Button
      asChild
      type="ghost"
      variant="primary"
      size="small"
      className="h-8 max-w-full min-w-0 gap-2 rounded-full bg-gi-dark-ash px-4 text-base font-bold hover:bg-gi-ash-hover"
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t`${label} (otwiera się w nowej karcie)`}
      >
        <img src={linkIcon} alt="" className="shrink-0" />
        <span className="min-w-0 truncate">{label}</span>
      </a>
    </Button>
  );
};
