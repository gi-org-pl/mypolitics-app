import { useLingui } from "@lingui/react/macro";
import type { CSSProperties } from "react";

import { getLongestWordLength } from "@/utils/text/getLongestWordLength";
import { toSingleLine } from "@/utils/text/toSingleLine";

import {
  NAME_SIZE_BESIDE_EXTRAS_CLASS_NAME,
  NAME_SIZE_CLASS_NAME,
} from "./ResultsHeader.constants";
import type { ResultsHeaderProps } from "./ResultsHeader.types";
import { ResultsHeaderConfidence } from "./ResultsHeaderConfidence/ResultsHeaderConfidence";
import { ResultsHeaderLinkButton } from "./ResultsHeaderLinkButton/ResultsHeaderLinkButton";
import { ResultsHeaderNoMatchMark } from "./ResultsHeaderNoMatchMark/ResultsHeaderNoMatchMark";
import { ResultsHeaderRing } from "./ResultsHeaderRing/ResultsHeaderRing";
import { ResultsHeaderSlogan } from "./ResultsHeaderSlogan/ResultsHeaderSlogan";
import { ResultsHeaderTabs } from "./ResultsHeaderTabs/ResultsHeaderTabs";
import { getHeaderResult } from "./utils/getHeaderResult";
import { getSafeLink } from "./utils/getSafeLink";

export const ResultsHeader = ({
  orientation,
  confidence,
  linkLabel,
  activeTab,
  onTabChange,
}: ResultsHeaderProps) => {
  const { t } = useLingui();

  const result = getHeaderResult(orientation, confidence);
  const name = result ? result.name : t`Brak dopasowania`;
  const sloganText = result ? toSingleLine(orientation?.slogan) : "";
  const safeLink = result
    ? getSafeLink(orientation?.websiteUrl, linkLabel)
    : null;
  const hasExtras = sloganText !== "" || safeLink !== null;

  return (
    <div className="@container w-full min-w-0">
      <div className="flex flex-col gap-6 bg-gi-ash p-4 @xl:flex-row @xl:items-center @xl:justify-between @xl:min-h-[115px] @xl:gap-2.5 @xl:px-6 @xl:py-4.5">
        <div className="flex min-h-[67px] min-w-0 items-center gap-4">
          {result ? (
            <ResultsHeaderRing
              confidence={result.confidence}
              band={result.band}
              imageUrl={result.imageUrl}
            />
          ) : (
            <ResultsHeaderNoMatchMark />
          )}
          <div className="min-w-0">
            <h1
              className={`line-clamp-2 leading-[1.5] font-bold wrap-break-word text-gi-primary ${NAME_SIZE_CLASS_NAME} ${hasExtras ? NAME_SIZE_BESIDE_EXTRAS_CLASS_NAME : ""}`}
              style={
                {
                  "--name-letters": Math.max(1, getLongestWordLength(name)),
                } as CSSProperties
              }
            >
              {name}
            </h1>
            {result && (
              <ResultsHeaderConfidence
                confidence={result.confidence}
                band={result.band}
              />
            )}
          </div>
        </div>
        {hasExtras && (
          <div
            data-testid="results-header-extras"
            className="flex min-w-0 flex-wrap items-center gap-2.5 @xl:max-w-1/2 @xl:shrink-0 @xl:flex-col @xl:flex-nowrap @xl:items-end"
          >
            {sloganText !== "" && <ResultsHeaderSlogan text={sloganText} />}
            {safeLink && (
              <ResultsHeaderLinkButton
                href={safeLink.href}
                label={safeLink.label}
              />
            )}
          </div>
        )}
      </div>
      <ResultsHeaderTabs activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
