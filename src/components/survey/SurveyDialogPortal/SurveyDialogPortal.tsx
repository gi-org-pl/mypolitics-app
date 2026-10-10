import { createPortal } from "react-dom";

import type { SurveyDialogPortalProps } from "./SurveyDialogPortal.types";

// Athena's Modal renders its fixed overlay where it is used, so an ancestor
// with a transform, a filter or a perspective shrinks the overlay to its own
// box and cuts the dialog off. Rendering the Modal into the body keeps it
// positioned against the viewport. To be removed once Athena's Modal renders
// into the body itself.
export const SurveyDialogPortal = ({ children }: SurveyDialogPortalProps) =>
  typeof document === "undefined"
    ? null
    : createPortal(children, document.body);
