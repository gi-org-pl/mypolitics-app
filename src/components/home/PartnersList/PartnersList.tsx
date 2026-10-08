import { withKeys } from "@/utils/array/withKeys";

import type { PartnersListProps } from "./PartnersList.types";
import { PartnersSection } from "./PartnersSection/PartnersSection";

export const PartnersList = ({ sections }: PartnersListProps) => {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="w-full divide-y divide-gi-primary/10 border-y border-gi-primary/10">
      {withKeys(sections, (section) => section.title ?? "").map(
        ({ item, key }) => (
          <PartnersSection key={key} section={item} />
        ),
      )}
    </div>
  );
};
