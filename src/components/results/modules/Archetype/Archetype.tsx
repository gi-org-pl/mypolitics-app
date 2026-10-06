import { Avatar, Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import { type ReactNode, useState } from "react";

import alignLeftIcon from "@/assets/icons/align-left.svg";
import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import plusIcon from "@/assets/icons/plus.svg";
import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";
import { UniversalAxis } from "@/components/shared/UniversalAxis/UniversalAxis";
import { MATCH_BAND_COLORS } from "@/constants/results";
import { getMatchBand } from "@/utils/results/getMatchBand";

import { getComparisonEntry } from "../HorizontalBarChart/utils/getComparisonEntry";
import { RankedRow } from "../RankedRow/RankedRow";
import type { RankedEntry } from "../RankedRow/RankedRow.types";
import { PREVIEW_IMAGES } from "./Archetype.constants";
import type {
  ArchetypeEntry,
  ArchetypeProps,
  ArchetypeView,
} from "./Archetype.types";
import { getArchetypeRanking } from "./utils/getArchetypeRanking";

interface ControlOptions {
  view: ArchetypeView;
  label: string;
  className: string;
  children: ReactNode;
}

const CONTROL_CLASS_NAME =
  "relative h-[33px] min-w-0 flex-1 gap-2 rounded-none first:rounded-bl-2xl last:rounded-br-2xl before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']";
const QUIET_CONTROL_CLASS_NAME = "bg-transparent hover:bg-gi-ash";
const DIVIDER_CLASS_NAME = "-mx-4 -mb-px border-gi-ash";
const PREVIEW_ITEM_CLASS_NAME =
  "size-4 shrink-0 rounded-full border border-gi-dark-ash bg-white";

const toSingleLine = (text?: string): string =>
  typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";

const toDescription = (text?: string): string =>
  typeof text === "string"
    ? text
        .replace(/\r\n?/g, "\n")
        .trim()
        .replace(/\n\s*\n/g, "\n\n")
    : "";

const toRankedEntry = (archetype: ArchetypeEntry): RankedEntry => ({
  orientation: {
    ...archetype.orientation,
    color: MATCH_BAND_COLORS[getMatchBand(archetype.match)],
  },
  value: archetype.match,
});

const withKeys = <Item,>(
  items: Item[],
  getId: (item: Item) => string,
): { item: Item; key: string }[] => {
  const seen = new Map<string, number>();

  return items.map((item) => {
    const id = getId(item);
    const occurrence = seen.get(id) ?? 0;

    seen.set(id, occurrence + 1);

    return { item, key: `${id}-${occurrence}` };
  });
};

const getArchetypeId = (archetype: ArchetypeEntry): string =>
  archetype.orientation?.id ?? "";

const getPreviewImages = (ranking: ArchetypeEntry[]): string[] =>
  ranking
    .map(({ orientation }) => toSingleLine(orientation?.imageUrl))
    .filter((imageUrl) => imageUrl !== "")
    .slice(0, PREVIEW_IMAGES);

const renderDescription = (text: string) => (
  <p
    data-testid="archetype-description"
    className="text-base leading-[19px] wrap-anywhere whitespace-pre-line text-gi-primary"
  >
    {text}
  </p>
);

export const Archetype = ({
  title,
  archetypes,
  comparison,
  onStatsClick,
  onInfoClick,
}: ArchetypeProps) => {
  const { t } = useLingui();
  const [view, setView] = useState<ArchetypeView>("summary");

  const { leader, rest } = getArchetypeRanking(archetypes);

  const renderCard = (children?: ReactNode) => (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {children}
    </ModuleWrapper>
  );

  if (!leader) return renderCard();

  const isMatched = getMatchBand(leader.match) !== "none";
  const shortDescription = isMatched
    ? toDescription(leader.shortDescription)
    : "";
  const fullDescription = isMatched
    ? toDescription(leader.fullDescription)
    : "";
  const ranking = isMatched ? rest : [leader, ...rest];
  const previewImages = getPreviewImages(ranking);

  const hasDescription =
    fullDescription !== "" && fullDescription !== shortDescription;
  const hasRanking = rest.length > 0;
  const isUnavailable =
    (view === "description" && !hasDescription) ||
    (view === "ranking" && !hasRanking);
  const openView = isUnavailable ? "summary" : view;

  const leaderEntry = toRankedEntry(leader);

  const renderLeader = () => (
    <div className="flex min-w-0 flex-col gap-2">
      <h3
        data-testid="archetype-leader-name"
        className={`-my-[0.5px] min-h-5 min-w-0 truncate text-base leading-5 font-bold ${isMatched ? "text-gi-primary" : "text-gi-primary/50"}`}
      >
        {isMatched
          ? toSingleLine(leader.orientation?.name)
          : t`Brak dopasowania`}
      </h3>
      <UniversalAxis
        start={
          isMatched && typeof leaderEntry.value === "number"
            ? { orientation: leaderEntry.orientation, value: leaderEntry.value }
            : undefined
        }
        comparison={
          isMatched
            ? getComparisonEntry(comparison, leader.orientation?.id)
            : undefined
        }
        marker={false}
      />
    </div>
  );

  const renderView = () => {
    if (openView === "description") return renderDescription(fullDescription);

    if (openView === "ranking") {
      return (
        <ol className="flex flex-col gap-4">
          {withKeys(ranking, getArchetypeId).map(({ item, key }) => (
            <li key={key}>
              <RankedRow
                entry={toRankedEntry(item)}
                comparison={getComparisonEntry(
                  comparison,
                  item.orientation?.id,
                )}
              />
            </li>
          ))}
        </ol>
      );
    }

    return shortDescription === "" ? null : renderDescription(shortDescription);
  };

  const renderControl = ({
    view: controlView,
    label,
    className,
    children,
  }: ControlOptions) => {
    const isOpen = openView === controlView;

    return (
      <Button
        key={controlView}
        type="ghost"
        variant="primary"
        size="small"
        isIconButton
        aria-label={label}
        aria-expanded={isOpen}
        className={`${CONTROL_CLASS_NAME} ${isOpen ? "" : QUIET_CONTROL_CLASS_NAME} ${className}`}
        onClick={() => setView(isOpen ? "summary" : controlView)}
      >
        {children}
      </Button>
    );
  };

  const viewContent = renderView();

  return renderCard(
    <div className="flex flex-col gap-4">
      {renderLeader()}
      {viewContent !== null && (
        <>
          <hr className={DIVIDER_CLASS_NAME} />
          {viewContent}
        </>
      )}
      {(hasDescription || hasRanking) && (
        <div
          data-testid="archetype-foot"
          className="-mx-4 -mb-4 flex border-t border-gi-ash"
        >
          {hasDescription &&
            renderControl({
              view: "description",
              label: t`Pełny opis`,
              className: "",
              children: <img src={alignLeftIcon} alt="" />,
            })}
          {hasRanking &&
            renderControl({
              view: "ranking",
              label: t`Ranking`,
              className: hasDescription ? "border-l border-gi-ash" : "",
              children: (
                <>
                  {previewImages.length > 0 && (
                    <span
                      data-testid="archetype-ranking-preview"
                      className="flex shrink-0 -space-x-1"
                    >
                      {withKeys(previewImages, (imageUrl) => imageUrl).map(
                        ({ item, key }) => (
                          <Avatar
                            key={key}
                            size="small"
                            src={item}
                            alt=""
                            dataTestId="archetype-ranking-preview-image"
                            className={PREVIEW_ITEM_CLASS_NAME}
                          />
                        ),
                      )}
                      {ranking.length > previewImages.length && (
                        <span
                          data-testid="archetype-ranking-preview-more"
                          className={`flex items-center justify-center ${PREVIEW_ITEM_CLASS_NAME}`}
                        >
                          <img src={plusIcon} alt="" />
                        </span>
                      )}
                    </span>
                  )}
                  <img
                    src={chevronDownIcon}
                    alt=""
                    className={
                      openView === "ranking" ? "rotate-180" : undefined
                    }
                  />
                </>
              ),
            })}
        </div>
      )}
    </div>,
  );
};
