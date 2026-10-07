import type { OrientationForms } from "@/types/orientation";

export const toOrientationForms = (
  masculine?: string,
  feminine?: string,
): OrientationForms | undefined =>
  masculine || feminine ? { masculine, feminine } : undefined;
