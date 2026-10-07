import type { RankedComparison } from "@/types/results";

import type { RankedCategory } from "../HorizontalBarChart.types";
import { HorizontalBarChartCategoryList } from "./HorizontalBarChartCategoryList/HorizontalBarChartCategoryList";
import { HorizontalBarChartOpenCategory } from "./HorizontalBarChartOpenCategory/HorizontalBarChartOpenCategory";
import { getCategoryItems } from "./utils/getCategoryItems";
import { useOpenCategory } from "./utils/useOpenCategory";

interface HorizontalBarChartCategoriesProps {
  categories: RankedCategory[];
  comparison?: RankedComparison;
}

export const HorizontalBarChartCategories = ({
  categories,
  comparison,
}: HorizontalBarChartCategoriesProps) => {
  const items = getCategoryItems(categories);
  const { openKey, open, close, registerControl, returnControl } =
    useOpenCategory(items.map(({ key }) => key));
  const openItem = items.find(({ key }) => key === openKey);

  return openItem ? (
    <HorizontalBarChartOpenCategory
      category={openItem}
      comparison={comparison}
      controlRef={returnControl}
      onClose={close}
    />
  ) : (
    <HorizontalBarChartCategoryList
      categories={items}
      comparison={comparison}
      registerControl={registerControl}
      onOpen={open}
    />
  );
};
