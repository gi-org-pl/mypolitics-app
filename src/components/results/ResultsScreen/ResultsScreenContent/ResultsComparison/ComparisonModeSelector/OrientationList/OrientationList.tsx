import { useLingui } from "@lingui/react/macro";
import { useState } from "react";

import { SearchField } from "@/components/results/SearchField/SearchField";
import { containsText } from "@/utils/text/containsText";

import type { OrientationListProps } from "./OrientationList.types";
import { OrientationListItem } from "./OrientationListItem/OrientationListItem";

// The orientations a taker can compare with, as a list to pick one from, and
// a search field over it. The search narrows the list by name, ignoring
// letter case; it is kept only while the list is shown. Picking an
// orientation starts the comparison at once.
export const OrientationList = ({
  orientations,
  onPick,
}: OrientationListProps) => {
  const { t } = useLingui();
  const [search, setSearch] = useState("");
  const listed = orientations.filter(({ name }) => containsText(name, search));

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 rounded-2xl border border-gi-ash p-3">
      <SearchField
        label={t`Szukaj po nazwie`}
        value={search}
        onChange={setSearch}
      />
      <ul className="flex min-w-0 flex-col gap-2 empty:hidden">
        {listed.map((orientation) => (
          <li key={orientation.id} className="flex min-w-0">
            <OrientationListItem orientation={orientation} onPick={onPick} />
          </li>
        ))}
      </ul>
    </div>
  );
};
