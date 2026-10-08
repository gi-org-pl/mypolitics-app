import { useLingui } from "@lingui/react/macro";

import { withKeys } from "@/utils/array/withKeys";

import { PartnerLogo } from "./PartnerLogo/PartnerLogo";
import type { PartnersSectionProps } from "./PartnersSection.types";

export const PartnersSection = ({ section }: PartnersSectionProps) => {
  const { t } = useLingui();
  const { title, partners } = section;

  return (
    <div className="flex flex-col gap-2 py-6 md:flex-row md:items-center md:gap-6">
      {title && (
        <p className="text-base leading-[1.4] font-bold tracking-[-0.01em] wrap-break-word text-gi-primary md:max-w-1/3 md:shrink-0">
          {t`${title}:`}
        </p>
      )}

      <ul aria-label={title} className="flex flex-wrap items-center gap-5">
        {withKeys(partners, (partner) => partner.title).map(({ item, key }) => (
          <li key={key} className="flex items-center">
            <PartnerLogo partner={item} />
          </li>
        ))}
      </ul>
    </div>
  );
};
