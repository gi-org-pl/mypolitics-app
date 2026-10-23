import type { ResultModule, ResultModuleType } from "@/types/results";

const HEADER_TYPE: ResultModuleType = "header";

// The order the records are drawn in: by position, lowest first, with equal
// positions left as they stand. The header is outside that order - the first
// one leads whatever its position, and a result has no other.
export const orderResultModules = (modules: ResultModule[]): ResultModule[] => {
  const byPosition = [...modules].sort(
    (first, second) => first.position - second.position,
  );
  const header = byPosition.find(({ type }) => type === HEADER_TYPE);
  const others = byPosition.filter(({ type }) => type !== HEADER_TYPE);

  return header ? [header, ...others] : others;
};
