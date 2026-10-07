import { toSingleLine } from "@/utils/text/toSingleLine";
import { toWebAddress } from "@/utils/url/toWebAddress";

import type { ResultsHeaderSafeLink } from "../ResultsHeader.types";

export const getSafeLink = (
  websiteUrl?: string,
  label?: string,
): ResultsHeaderSafeLink | null => {
  const href = toWebAddress(websiteUrl);

  return href ? { href, label: toSingleLine(label) || href } : null;
};
