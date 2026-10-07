export const toWebAddress = (address?: string | null): string | undefined => {
  if (typeof address !== "string") return undefined;

  const trimmedAddress = address.trim();

  try {
    const { protocol } = new URL(trimmedAddress);

    return protocol === "http:" || protocol === "https:"
      ? trimmedAddress
      : undefined;
  } catch {
    return undefined;
  }
};
