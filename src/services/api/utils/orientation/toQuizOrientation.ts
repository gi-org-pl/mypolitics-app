import type { OrientationResponse } from "@/services/api/schemas/orientation";
import type { OrientationType, QuizOrientation } from "@/types/orientation";
import { toOrientationColor } from "@/utils/orientation/toOrientationColor";
import { toTrimmedText } from "@/utils/text/toTrimmedText";
import { toWebAddress } from "@/utils/url/toWebAddress";

import { parsePackedText } from "./parsePackedText";
import { toOrientationForms } from "./toOrientationForms";

const ORIENTATION_TYPES = new Map<string, OrientationType>([
  ["IDEOLOGY", "ideology"],
  ["PARTY", "party"],
  ["IDENTITY", "identity"],
  ["COMPASS", "compass"],
]);

export const toQuizOrientation = (
  response: OrientationResponse,
  options: { isOfficialQuiz: boolean },
): QuizOrientation => {
  const name = parsePackedText(response.generalName);
  const image = parsePackedText(response.logoUrl);
  const description = parsePackedText(response.description);

  const plainName = name.kind === "plain" ? name.text : undefined;
  const plainImage = image.kind === "plain" ? image.text : undefined;
  const plainDescription =
    description.kind === "plain" ? description.text : undefined;

  const packedName = name.kind === "packed" ? name.value : undefined;
  const packedImage = image.kind === "packed" ? image.value : undefined;
  const packedDescription =
    description.kind === "packed" ? description.value : undefined;

  const nameForms = toOrientationForms(
    toTrimmedText(packedName?.m),
    toTrimmedText(packedName?.f),
  );
  const imageUrlForms = toOrientationForms(
    toWebAddress(toTrimmedText(packedImage?.m)),
    toWebAddress(toTrimmedText(packedImage?.f)),
  );

  return {
    id: response.id,
    type: ORIENTATION_TYPES.get(response.type ?? "") ?? "other",
    name: nameForms
      ? undefined
      : (plainName ?? toTrimmedText(packedName?.name)),
    nameForms,
    imageUrl: imageUrlForms ? undefined : toWebAddress(plainImage),
    imageUrlForms,
    color: toOrientationColor(response.color),
    description:
      plainDescription ??
      toTrimmedText(packedDescription?.short) ??
      toTrimmedText(packedDescription?.shortDescription),
    fullDescription:
      toTrimmedText(packedDescription?.long) ??
      toTrimmedText(packedDescription?.longDescription),
    slogan: toTrimmedText(packedName?.slogan),
    websiteUrl: toWebAddress(toTrimmedText(packedName?.websiteUrl)),
    isOfficial: options.isOfficialQuiz && packedName?.isOfficial === true,
    isHidden: packedName?.isHidden === true,
    explanation: toTrimmedText(response.explanation),
  };
};
