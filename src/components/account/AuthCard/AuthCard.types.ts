import type { ReactNode } from "react";

export interface AuthCardProps {
  heading: string;
  description: ReactNode;
  headingLevel?: 1 | 2; // 1 on the sign-in page, where it is the page's heading
  headingId?: string; // a dialog is named by the heading
  descriptionId?: string; // and described by the line
  onClose?: () => void; // when given, a round close button stands in the header box
  isCloseDisabled?: boolean;
  className?: string; // the dialog adjusts the corners and the width
  children: ReactNode;
}
