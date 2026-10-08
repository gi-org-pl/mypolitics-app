import type { Orientation } from "@/types/orientation";

export const createOrientation = (
  id: string,
  name?: string,
  overrides: Partial<Orientation> = {},
): Orientation => ({
  id,
  type: "ideology",
  name,
  ...overrides,
});
