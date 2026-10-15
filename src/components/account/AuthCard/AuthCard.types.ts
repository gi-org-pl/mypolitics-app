import type { ReactNode } from "react";

export type AuthCardLayout = "card" | "sheet-on-phone";

export interface AuthCardProps {
  heading: string;
  description: ReactNode;
  headingLevel?: 1 | 2; // 1 on the sign-in page, where it is the page's heading
  headingId?: string; // a dialog is named by the heading
  descriptionId?: string; // and described by the line
  onClose?: () => void; // when given, a round close button stands in the header box
  isCloseDisabled?: boolean;
  layout?: AuthCardLayout; // the dialog is a bottom sheet on a phone
  children: ReactNode;
}
