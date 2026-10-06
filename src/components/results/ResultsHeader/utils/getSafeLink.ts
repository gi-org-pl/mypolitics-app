import { toSingleLine } from "@/utils/text/toSingleLine";

import type {
  ResultsHeaderLink,
  ResultsHeaderSafeLink,
} from "../ResultsHeader.types";

export const getSafeLink = (
  link?: ResultsHeaderLink,
): ResultsHeaderSafeLink | null => {
  if (typeof link?.url !== "string") return null;

  try {
    const { protocol, href } = new URL(link.url.trim());

    if (protocol !== "http:" && protocol !== "https:") return null;

    return { href, label: toSingleLine(link.label) || link.url.trim() };
  } catch {
    return null;
  }
};
