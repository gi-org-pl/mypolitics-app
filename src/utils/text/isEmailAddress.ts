import { EMAIL_MAX_LENGTH } from "@/constants/survey";

// Whether a text has the shape of an e-mail address, the space around it
// aside: exactly one `@`, something before it, and after it a domain with a
// dot and something on each side of every dot; no whitespace, and no longer
// than an address can be. A filter against obvious slips, not a proof: an
// address with a typo in it passes.
export const isEmailAddress = (text: string): boolean => {
  const address = text.trim();

  if (address.length > EMAIL_MAX_LENGTH || /\s/.test(address)) return false;

  const [localPart, domain, ...otherParts] = address.split("@");

  if (!localPart || !domain || otherParts.length > 0) return false;

  const labels = domain.split(".");

  return labels.length > 1 && labels.every((label) => label !== "");
};
