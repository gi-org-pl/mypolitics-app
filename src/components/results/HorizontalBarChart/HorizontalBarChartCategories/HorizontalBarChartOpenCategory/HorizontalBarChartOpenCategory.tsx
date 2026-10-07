import { useLingui } from "@lingui/react/macro";
import type { Ref } from "react";

import type { RankedComparison } from "@/types/results";

import { HorizontalBarChartControl } from "../../HorizontalBarChartControl/HorizontalBarChartControl";
import { HorizontalBarChartRows } from "../../HorizontalBarChartRows/HorizontalBarChartRows";
import type { CategoryItem } from "../HorizontalBarChartCategories.types";
import { HorizontalBarChartCategoryHeading } from "../HorizontalBarChartCategoryHeading/HorizontalBarChartCategoryHeading";

interface HorizontalBarChartOpenCategoryProps {
  category: CategoryItem;
  comparison?: RankedComparison;
  controlRef?: Ref<HTMLButtonElement>;
  onClose: () => void;
}

const DIVIDER_CLASS_NAME = "-mx-4 -mb-px border-b border-gi-ash px-4 pb-3";

export const HorizontalBarChartOpenCategory = ({
  category: { name, leader, rest },
  comparison,
  controlRef,
  onClose,
}: HorizontalBarChartOpenCategoryProps) => {
  const { t } = useLingui();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {!leader && (
          <div className={DIVIDER_CLASS_NAME}>
            <HorizontalBarChartCategoryHeading name={name} leader={null} />
          </div>
        )}
        <ol className="flex flex-col gap-3">
          {leader && (
            <li className={DIVIDER_CLASS_NAME}>
              <HorizontalBarChartCategoryHeading
                name={name}
                leader={leader}
                comparison={comparison}
              />
            </li>
          )}
          <HorizontalBarChartRows ranking={rest} comparison={comparison} />
        </ol>
      </div>
      <div className="-mx-4 -mb-4 flex">
        <HorizontalBarChartControl
          ref={controlRef}
          label={t`Wróć do kategorii`}
          isExpanded
          onClick={onClose}
        />
      </div>
    </div>
  );
};
