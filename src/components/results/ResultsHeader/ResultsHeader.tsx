import { Avatar, Button, Tabs } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import linkIcon from "@/assets/icons/link.svg";
import megaphoneIcon from "@/assets/icons/megaphone.svg";
import questionMarkIcon from "@/assets/icons/question-mark.svg";
import { getMatchBand, type MatchBand } from "@/utils/results/getMatchBand";

import type {
  ResultsHeaderLink,
  ResultsHeaderProps,
  ResultsTab,
} from "./ResultsHeader.types";

const BAND_CLASS_NAME: Record<Exclude<MatchBand, "none">, string> = {
  partial: "text-gi-orange",
  match: "text-gi-green",
};

const IMAGE_CLASS_NAME = "absolute inset-[5px] size-[55px] rounded-full";

const TABS_CLASS_NAME =
  "-mt-px! border-t! border-b-0! border-gi-dark-ash! bg-white [&>[aria-hidden=true]]:hidden! [&>[role=tab]]:min-w-0! [&>[role=tab]]:px-4! [&>[role=tab]]:py-2! [&>[role=tab]]:leading-[19px]! [&>[role=tab][aria-selected=true]]:bg-gi-ash!";

const toSingleLine = (text?: string): string =>
  typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";

const clampConfidence = (confidence: number): number =>
  Math.min(100, Math.max(0, confidence));

const getSafeLink = (
  link?: ResultsHeaderLink,
): { href: string; label: string } | null => {
  if (typeof link?.url !== "string") return null;

  try {
    const { protocol, href } = new URL(link.url.trim());

    if (protocol !== "http:" && protocol !== "https:") return null;

    return { href, label: toSingleLine(link.label) || link.url.trim() };
  } catch {
    return null;
  }
};

const toResultsTab = (value: string): ResultsTab =>
  value === "comparison" ? "comparison" : "results";

export const ResultsHeader = ({
  orientation,
  confidence,
  slogan,
  link,
  activeTab,
  onTabChange,
}: ResultsHeaderProps) => {
  const { t } = useLingui();

  const band = orientation ? getMatchBand(confidence) : "none";
  const result =
    band !== "none" && orientation && typeof confidence === "number"
      ? {
          name: orientation.name,
          imageUrl: orientation.imageUrl,
          confidence: clampConfidence(confidence),
          className: BAND_CLASS_NAME[band],
        }
      : null;

  const sloganText = result ? toSingleLine(slogan) : "";
  const safeLink = result ? getSafeLink(link) : null;
  const hasExtras = sloganText !== "" || safeLink !== null;

  const renderConfidence = (exactValue: number, className: string) => {
    const value = Math.round(exactValue);

    return (
      <p
        data-testid="results-header-confidence"
        className={`text-sm leading-[1.5] font-bold ${className}`}
      >
        {t`${value}% pewności`}
      </p>
    );
  };

  const renderLink = ({ href, label }: { href: string; label: string }) => (
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

  return (
    <div className="@container w-full min-w-0">
      <div className="flex flex-col gap-6 bg-gi-ash p-4 @xl:flex-row @xl:items-center @xl:justify-between @xl:min-h-[115px] @xl:gap-2.5 @xl:px-6 @xl:py-4.5">
        <div className="flex min-h-[67px] min-w-0 items-center gap-4">
          {result ? (
            <div
              className={`relative size-[65px] shrink-0 ${result.className}`}
            >
              <svg
                aria-hidden="true"
                data-testid="results-header-ring"
                viewBox="0 0 65 65"
                className="absolute inset-0 size-full"
              >
                <circle
                  cx="32.5"
                  cy="32.5"
                  r="32.5"
                  className="fill-current opacity-10"
                />
                <circle
                  data-testid="results-header-ring-arc"
                  cx="32.5"
                  cy="32.5"
                  r="30"
                  pathLength={100}
                  strokeDasharray={`${result.confidence} 100`}
                  strokeWidth="5"
                  className="fill-none stroke-current"
                />
              </svg>
              {result.imageUrl ? (
                <Avatar
                  src={result.imageUrl}
                  dataTestId="results-header-image"
                  className={`${IMAGE_CLASS_NAME} bg-gi-dark-primary`}
                />
              ) : (
                <div
                  data-testid="results-header-image-placeholder"
                  className={`${IMAGE_CLASS_NAME} bg-gi-dark-ash`}
                />
              )}
            </div>
          ) : (
            <div className="relative size-[65px] shrink-0 rounded-full bg-gi-red/5">
              <div
                className={`${IMAGE_CLASS_NAME} flex items-center justify-center bg-white`}
              >
                <img
                  src={questionMarkIcon}
                  alt=""
                  data-testid="results-header-question-mark"
                />
              </div>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="line-clamp-2 text-2xl leading-[1.5] font-bold wrap-break-word text-gi-primary">
              {result ? result.name : t`Brak dopasowania`}
            </h1>
            {result && renderConfidence(result.confidence, result.className)}
          </div>
        </div>
        {hasExtras && (
          <div
            data-testid="results-header-extras"
            className="flex min-w-0 flex-wrap items-center gap-2.5 @xl:max-w-1/2 @xl:shrink-0 @xl:flex-col @xl:flex-nowrap @xl:items-end"
          >
            {sloganText !== "" && (
              <p
                data-testid="results-header-slogan"
                className="flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-gi-dark-ash px-2 py-[7px] text-base font-bold text-gi-primary"
              >
                <img src={megaphoneIcon} alt="" className="shrink-0" />
                <span className="min-w-0 truncate leading-[18px]">
                  {sloganText}
                </span>
              </p>
            )}
            {safeLink && renderLink(safeLink)}
          </div>
        )}
      </div>
      <Tabs
        isFullWidth
        value={activeTab}
        onValueChange={(value) => onTabChange(toResultsTab(value))}
        items={[
          { value: "results", label: t`Twoje wyniki` },
          { value: "comparison", label: t`Tryb porównania` },
        ]}
        className={TABS_CLASS_NAME}
      />
    </div>
  );
};
