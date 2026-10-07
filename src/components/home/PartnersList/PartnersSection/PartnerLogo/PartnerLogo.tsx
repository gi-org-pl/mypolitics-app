import { FOCUS_CLASS_NAME } from "@/constants/focus";

import type { PartnerLogoProps } from "./PartnerLogo.types";

export const PartnerLogo = ({ partner }: PartnerLogoProps) => {
  const logo = (
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
      className={`inline-flex items-center rounded-sm ${FOCUS_CLASS_NAME}`}
    >
      {logo}
    </a>
  ) : (
    logo
  );
};
