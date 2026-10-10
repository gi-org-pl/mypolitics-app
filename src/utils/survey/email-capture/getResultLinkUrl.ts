import { toWebAddress } from "@/utils/url/toWebAddress";

// The address of the endpoint that sends the result link, as the build was
// given it. Encrypted or not at all: anything that is not an `https` web
// address counts as not configured.
export const getResultLinkUrl = (value?: string | null): string | undefined => {
  const address = toWebAddress(value);

  return address !== undefined && new URL(address).protocol === "https:"
    ? address
    : undefined;
};
