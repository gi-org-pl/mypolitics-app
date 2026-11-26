import type {
  HorizontalBarComparison,
  RankedCategory,
} from "../HorizontalBarChart.types";
import { HorizontalBarChartCategoryList } from "./HorizontalBarChartCategoryList/HorizontalBarChartCategoryList";
import { HorizontalBarChartOpenCategory } from "./HorizontalBarChartOpenCategory/HorizontalBarChartOpenCategory";
import { getCategoryItems } from "./utils/getCategoryItems";
import { useOpenCategory } from "./utils/useOpenCategory";

interface HorizontalBarChartCategoriesProps {
  categories: RankedCategory[];
  comparison?: HorizontalBarComparison;
}

export const HorizontalBarChartCategories = ({
  categories,
  comparison,
}: HorizontalBarChartCategoriesProps) => {
  const items = getCategoryItems(categories, comparison);
  const { openKey, open, close, registerControl, returnControl } =
    useOpenCategory(items.map(({ key }) => key));
  const openItem = items.find(({ key }) => key === openKey);

  return openItem ? (
    <HorizontalBarChartOpenCategory
      category={openItem}
      comparison={openItem.comparison}
      controlRef={returnControl}
      onClose={close}
    />
  ) : (
    <HorizontalBarChartCategoryList
      categories={items}
      registerControl={registerControl}
      onOpen={open}
    />
  );
};
