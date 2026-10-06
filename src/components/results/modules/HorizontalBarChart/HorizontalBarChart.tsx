import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";
import { type Ref, useEffect, useRef, useState } from "react";

import chevronDownIcon from "@/assets/icons/chevron-down.svg";
import { ModuleWrapper } from "@/components/shared/ModuleWrapper/ModuleWrapper";

import { RankedRow } from "../RankedRow/RankedRow";
import { DEFAULT_VISIBLE_ROWS } from "./HorizontalBarChart.constants";
import type {
  HorizontalBarChartProps,
  RankedCategory,
  RankedEntry,
} from "./HorizontalBarChart.types";
import { getComparisonEntry } from "./utils/getComparisonEntry";
import { getRankedValue, sortRankedEntries } from "./utils/sortRankedEntries";

interface ControlOptions {
  label: string;
  isExpanded: boolean;
  className: string;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
}

type FocusTarget = number | "return" | null;

const CONTROL_CLASS_NAME =
  "relative h-[33px] w-full rounded-t-none rounded-b-2xl before:absolute before:inset-x-0 before:-inset-y-1.5 before:content-['']";
const QUIET_CONTROL_CLASS_NAME = "bg-transparent hover:bg-gi-ash";
const DIVIDER_CLASS_NAME = "-mx-4 -mb-px border-b border-gi-ash px-4 pb-3";

const toSingleLine = (text?: string): string =>
  typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";

const getVisibleRows = (visibleRows?: number): number =>
  typeof visibleRows === "number" &&
  Number.isInteger(visibleRows) &&
  visibleRows >= 1
    ? visibleRows
    : DEFAULT_VISIBLE_ROWS;

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

const getEntryId = (entry: RankedEntry): string => entry.orientation?.id ?? "";

const getCategoryRanking = (category?: RankedCategory) => {
  const ranking = sortRankedEntries(category?.entries);
  const [first] = ranking;
  const hasResult = (getRankedValue(first) ?? 0) > 0;

  return {
    name: toSingleLine(category?.name),
    ranking,
    leader: hasResult ? first : null,
    rest: hasResult ? ranking.slice(1) : ranking,
  };
};

const renderControl = ({
  label,
  isExpanded,
  className,
  onClick,
  ref,
}: ControlOptions) => (
  <Button
    ref={ref}
    type="ghost"
    variant="primary"
    size="small"
    isIconButton
    aria-label={label}
    aria-expanded={isExpanded}
    className={`${CONTROL_CLASS_NAME} ${className}`}
    onClick={onClick}
  >
    <img
      src={chevronDownIcon}
      alt=""
      className={isExpanded ? "rotate-180" : undefined}
    />
  </Button>
);

export const HorizontalBarChart = ({
  title,
  entries,
  categories,
  visibleRows,
  comparison,
  onStatsClick,
  onInfoClick,
}: HorizontalBarChartProps) => {
  const { t } = useLingui();
  const [isListOpen, setIsListOpen] = useState(false);
  const [openCategoryIndex, setOpenCategoryIndex] = useState<number | null>(
    null,
  );
  const categoryControls = useRef(new Map<number, HTMLButtonElement>());
  const returnControl = useRef<HTMLButtonElement>(null);
  const focusTarget = useRef<FocusTarget>(null);

  useEffect(() => {
    const target = focusTarget.current;

    focusTarget.current = null;

    if (target === "return") returnControl.current?.focus();
    if (typeof target === "number") {
      categoryControls.current.get(target)?.focus();
    }
  });

  const renderRows = (ranking: RankedEntry[]) =>
    withKeys(ranking, getEntryId).map(({ item, key }) => (
      <li key={key}>
        <RankedRow
          entry={item}
          comparison={getComparisonEntry(comparison, item.orientation?.id)}
        />
      </li>
    ));

  const renderCategoryHeading = (name: string, leader: RankedEntry | null) => (
    <RankedRow
      isHeading
      prefix={name}
      entry={leader ?? { orientation: { id: "", name: t`Brak wyniku` } }}
      comparison={
        leader
          ? getComparisonEntry(comparison, leader.orientation?.id)
          : undefined
      }
    />
  );

  const getCategoryControlName = (name: string): string =>
    name ? t`Pokaż kategorię: ${name}` : t`Pokaż kategorię`;

  const renderFlatList = () => {
    const ranking = sortRankedEntries(entries);
    const limit = getVisibleRows(visibleRows);
    const hasFold = ranking.length > limit;
    const isFolded = hasFold && !isListOpen;

    if (ranking.length === 0) return null;

    return (
      <div className="flex flex-col gap-4">
        <ol className="flex flex-col gap-2">
          {renderRows(isFolded ? ranking.slice(0, limit) : ranking)}
        </ol>
        {hasFold && (
          <div className="-mx-4 -mb-4 flex">
            {renderControl({
              label: isFolded ? t`Pokaż wszystkie` : t`Pokaż mniej`,
              isExpanded: !isFolded,
              className: isFolded ? QUIET_CONTROL_CLASS_NAME : "",
              onClick: () => setIsListOpen(isFolded),
            })}
          </div>
        )}
      </div>
    );
  };

  const renderCategoryList = (list: RankedCategory[]) => {
    if (list.length === 0) return null;

    const items = list.map((category, index) => ({
      index,
      ...getCategoryRanking(category),
    }));

    return (
      <ul className="-mb-4 flex flex-col gap-4">
        {withKeys(items, ({ name }) => name).map(({ item, key }) => (
          <li key={key} data-testid="horizontal-bar-chart-category">
            {renderCategoryHeading(item.name, item.leader)}
            {item.ranking.length > 0 ? (
              <div className="-mx-4 flex">
                {renderControl({
                  label: getCategoryControlName(item.name),
                  isExpanded: false,
                  className: `border-b border-gi-ash ${QUIET_CONTROL_CLASS_NAME}`,
                  onClick: () => {
                    focusTarget.current = "return";
                    setOpenCategoryIndex(item.index);
                  },
                  ref: (node) => {
                    if (node) categoryControls.current.set(item.index, node);
                    else categoryControls.current.delete(item.index);
                  },
                })}
              </div>
            ) : (
              <div className="-mx-4 h-4 rounded-b-2xl border-b border-gi-ash" />
            )}
          </li>
        ))}
      </ul>
    );
  };

  const renderOpenCategory = (category: RankedCategory, index: number) => {
    const { name, leader, rest } = getCategoryRanking(category);

    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          {!leader && (
            <div className={DIVIDER_CLASS_NAME}>
              {renderCategoryHeading(name, leader)}
            </div>
          )}
          <ol className="flex flex-col gap-3">
            {leader && (
              <li className={DIVIDER_CLASS_NAME}>
                {renderCategoryHeading(name, leader)}
              </li>
            )}
            {renderRows(rest)}
          </ol>
        </div>
        <div className="-mx-4 -mb-4 flex">
          {renderControl({
            label: t`Wróć do kategorii`,
            isExpanded: true,
            className: "",
            onClick: () => {
              focusTarget.current = index;
              setOpenCategoryIndex(null);
            },
            ref: returnControl,
          })}
        </div>
      </div>
    );
  };

  const renderBody = () => {
    if (!Array.isArray(categories)) return renderFlatList();

    const openCategory =
      openCategoryIndex === null ? undefined : categories[openCategoryIndex];

    return openCategory && openCategoryIndex !== null
      ? renderOpenCategory(openCategory, openCategoryIndex)
      : renderCategoryList(categories);
  };

  return (
    <ModuleWrapper
      title={title}
      onStatsClick={onStatsClick}
      onInfoClick={onInfoClick}
    >
      {renderBody()}
    </ModuleWrapper>
  );
};
