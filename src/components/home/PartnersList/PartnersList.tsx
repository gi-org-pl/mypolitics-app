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
            className="max-h-8 w-auto max-w-full object-contain"
        />
    );

    return partner.www ? (
        <a
            href={partner.www}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center"
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
        <div className="w-full divide-y divide-border">
            {sections.map((section, sectionIndex) => (
                <div
                    key={sectionIndex}
                    className="grid gap-4 py-8 md:flex md:flex-wrap md:items-center md:gap-6"
                >
                    {section.title ? (
                        <span className="font-['Roboto'] text-[16px] font-bold leading-[140%] tracking-[-0.01em] text-gi-primary">
              {section.title}:
            </span>
                    ) : null}

                    <ul
                        className={
                            section.title
                                ? "grid grid-cols-4 items-center gap-4 md:flex md:flex-wrap md:gap-6"
                                : "grid grid-cols-4 items-center gap-4 md:flex md:flex-wrap md:gap-6"
                        }
                    >
                        {section.partners.map((partner) => (
                            <li key={partner.title} className="flex min-w-0 items-center">
                                <PartnerLogo partner={partner} />
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};
