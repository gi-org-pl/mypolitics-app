export const findOrientation = <T extends { id: string }>(
  orientations: T[],
  id: string,
): T | undefined => orientations.find((orientation) => orientation.id === id);
