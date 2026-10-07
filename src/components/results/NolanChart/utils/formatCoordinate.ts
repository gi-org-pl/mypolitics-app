export const formatCoordinate = (coordinate: number): string => {
  const text = (Math.round(coordinate * 100) / 100 || 0).toFixed(2);

  return text.endsWith("0") ? text.slice(0, -1) : text;
};
