import type {
  OrientationResponse,
  OrientationTypeResponse,
} from "@/services/api/schemas/orientation";
import type { OrientationType, QuizOrientation } from "@/types/orientation";
import { toOrientationColor } from "@/utils/orientation/toOrientationColor";
import { toWebAddress } from "@/utils/url/toWebAddress";

import { toOrientationForms } from "./toOrientationForms";

const ORIENTATION_TYPES: Record<OrientationTypeResponse, OrientationType> = {
  IDEOLOGY: "ideology",
  PARTY: "party",
  IDENTITY: "identity",
  COMPASS: "compass",
};

export const toQuizOrientation = (
  response: OrientationResponse,
  options: { isOfficialQuiz: boolean },
): QuizOrientation => {
  const { generalName, logoUrl, description } = response;

  const plainName = typeof generalName === "string" ? generalName : undefined;
  const plainImage = typeof logoUrl === "string" ? logoUrl : undefined;
  const plainDescription =
    typeof description === "string" ? description : undefined;

  const packedName = typeof generalName === "object" ? generalName : undefined;
  const packedImage = typeof logoUrl === "object" ? logoUrl : undefined;
  const packedDescription =
    typeof description === "object" ? description : undefined;

  const nameForms = toOrientationForms(packedName?.m, packedName?.f);
  const imageUrlForms = toOrientationForms(
    toWebAddress(packedImage?.m),
    toWebAddress(packedImage?.f),
  );

  return {
    id: response.id,
    type: response.type ? ORIENTATION_TYPES[response.type] : "other",
    name: nameForms ? undefined : (plainName ?? packedName?.name),
    nameForms,
    imageUrl: imageUrlForms ? undefined : toWebAddress(plainImage),
    imageUrlForms,
    color: toOrientationColor(response.color),
    description:
      plainDescription ??
      packedDescription?.short ??
      packedDescription?.shortDescription,
    fullDescription:
      packedDescription?.long ?? packedDescription?.longDescription,
    slogan: packedName?.slogan,
    websiteUrl: toWebAddress(packedName?.websiteUrl),
    isOfficial: options.isOfficialQuiz && packedName?.isOfficial === true,
    isHidden: packedName?.isHidden === true,
    explanation: response.explanation,
  };
};
