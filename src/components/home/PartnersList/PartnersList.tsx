import type React from "react";
import type { Partner, PartnersListProps } from "./PartnersList.types";

interface PartnerLogoProps {
  partner: Partner;
}

function PartnerLogo({ partner }: PartnerLogoProps) {
  const image = (
    <img
      src={partner.logoUrl}
      alt={partner.title}
      title={partner.title}
      className="max-h-4 w-auto object-contain"
    />
  );

  return partner.www ? (
    <a
      href={partner.www}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center"
    >
      {image}
    </a>
  ) : (
    image
  );
}

export const PartnersList: React.FC<PartnersListProps> = ({ sections }) => {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-y border-gi-primary/10">
      {sections.map((section, sectionIndex) => (
        <div
          key={sectionIndex}
          className="grid gap-y-2 border-y border-gi-primary/10 py-4 md:grid-cols-[auto_1fr] md:items-center md:gap-x-6 md:gap-y-4 md:py-6"
        >
          {section.title ? (
            <span className="text-center text-[16px] font-bold leading-[140%] tracking-[-0.01em] text-gi-primary md:text-left">
              {section.title}:
            </span>
          ) : null}

          <ul
            className={
              section.title
                ? "flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:justify-start"
                : "flex flex-wrap items-center justify-center gap-x-6 gap-y-4 md:col-span-2 md:justify-start"
            }
          >
            {section.partners.map((partner) => (
              <li key={partner.title} className="flex items-center">
                <PartnerLogo partner={partner} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
