import { Tabs } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react/macro";

import type { ResultsHeaderProps } from "../ResultsHeader.types";
import { toResultsTab } from "./utils/toResultsTab";

type ResultsHeaderTabsProps = Pick<
  ResultsHeaderProps,
  "activeTab" | "onTabChange"
>;

const TABS_CLASS_NAME =
  "-mt-px! border-t! border-b-0! border-gi-dark-ash! bg-white [&>[aria-hidden=true]]:hidden! [&>[role=tab]]:min-w-0! [&>[role=tab]]:px-4! [&>[role=tab]]:py-2! [&>[role=tab]]:leading-[19px]! [&>[role=tab][aria-selected=true]]:bg-gi-ash!";

export const ResultsHeaderTabs = ({
  activeTab,
  onTabChange,
}: ResultsHeaderTabsProps) => {
  const { t } = useLingui();

  return (
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
  );
};
