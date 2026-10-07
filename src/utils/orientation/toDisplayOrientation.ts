import type {
  DeclaredGender,
  Orientation,
  QuizOrientation,
} from "@/types/orientation";

import { chooseOrientationForm } from "./chooseOrientationForm";

export const toDisplayOrientation = (
  { nameForms, imageUrlForms, ...orientation }: QuizOrientation,
  gender?: DeclaredGender,
): Orientation => ({
  ...orientation,
  name: chooseOrientationForm(nameForms, gender) ?? orientation.name,
  imageUrl:
    chooseOrientationForm(imageUrlForms, gender) ?? orientation.imageUrl,
});
