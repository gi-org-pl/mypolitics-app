import { useLingui } from "@lingui/react/macro";

import { withKeys } from "@/utils/array/withKeys";

import { PartnerLogo } from "./PartnerLogo/PartnerLogo";
import type { PartnersSectionProps } from "./PartnersSection.types";

export const PartnersSection = ({ section }: PartnersSectionProps) => {
  const { t } = useLingui();
  const { title, partners } = section;

  return (
    <div className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:gap-6 md:py-6">
      {title && (
        <p className="shrink-0 text-base leading-[1.4] font-bold tracking-[-0.01em] text-gi-primary">
          {t`${title}:`}
        </p>
      )}

      <ul
        aria-label={title}
        className="flex flex-wrap items-center gap-x-6 gap-y-4"
      >
        {withKeys(partners, (partner) => partner.title).map(({ item, key }) => (
          <li key={key} className="flex items-center">
            <PartnerLogo partner={item} />
          </li>
        ))}
      </ul>
    </div>
  );
};
