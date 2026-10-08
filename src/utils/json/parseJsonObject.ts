export const parseJsonObject = (
  text: string,
): Record<string, unknown> | undefined => {
  try {
    const value: unknown = JSON.parse(text);

    return typeof value === "object" && value !== null && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
};
