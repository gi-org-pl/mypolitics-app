export interface Partner {
  title: string;
  logoUrl: string;
  www?: string;
}

export interface PartnerSection {
  title?: string;
  partners: Partner[];
}

/**
 * All string values (section.title, partner.title) must be translated at the call site.
 * PartnersList only adds the colon after a section title.
 */
export interface PartnersListProps {
  sections: PartnerSection[];
}
