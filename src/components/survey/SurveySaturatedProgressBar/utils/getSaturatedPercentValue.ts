const INTERMEDIATE_VALUE = 0.0003;
const MEDIAN_VALUE = 50;

export const getSaturatedPercentValue = (value: number): number => {
  if (value > MEDIAN_VALUE) return value;
  return (
    value - INTERMEDIATE_VALUE * value * (100 - value) * (value - MEDIAN_VALUE)
  );
};
