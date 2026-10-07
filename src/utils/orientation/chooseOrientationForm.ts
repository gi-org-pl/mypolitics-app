import type { DeclaredGender, OrientationForms } from "@/types/orientation";

export const chooseOrientationForm = (
  forms?: OrientationForms,
  gender?: DeclaredGender,
): string | undefined => {
  const masculine = forms?.masculine || undefined;
  const feminine = forms?.feminine || undefined;

  return gender === "female"
    ? (feminine ?? masculine)
    : (masculine ?? feminine);
};
