import { useLingui } from "@lingui/react/macro";

import type { RankedComparison } from "@/types/results";

import { HorizontalBarChartControl } from "../../HorizontalBarChartControl/HorizontalBarChartControl";
import type { CategoryItem } from "../HorizontalBarChartCategories.types";
import { HorizontalBarChartCategoryHeading } from "../HorizontalBarChartCategoryHeading/HorizontalBarChartCategoryHeading";

interface HorizontalBarChartCategoryListProps {
  categories: CategoryItem[];
  comparison?: RankedComparison;
  registerControl?: (key: string) => (node: HTMLButtonElement | null) => void;
  onOpen: (key: string) => void;
}

export const HorizontalBarChartCategoryList = ({
  categories,
  comparison,
  registerControl,
  onOpen,
}: HorizontalBarChartCategoryListProps) => {
  const { t } = useLingui();

  return (
    <ul className="-mb-4 flex flex-col gap-4">
      {categories.map(({ key, name, leader, ranking }) => (
        <li key={key} data-testid="horizontal-bar-chart-category">
          <HorizontalBarChartCategoryHeading
            name={name}
            leader={leader}
            comparison={comparison}
          />
          {ranking.length > 0 ? (
            <div className="-mx-4 flex">
              <HorizontalBarChartControl
                ref={registerControl?.(key)}
                label={name ? t`Pokaż kategorię: ${name}` : t`Pokaż kategorię`}
                isExpanded={false}
                isQuiet
                hasDivider
                onClick={() => onOpen(key)}
              />
            </div>
          ) : (
            <div className="-mx-4 h-4 rounded-b-2xl border-b border-gi-ash" />
          )}
        </li>
      ))}
    </ul>
  );
};
