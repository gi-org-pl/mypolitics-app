import type { AuthIntentKey } from "@/types/auth";

export interface AuthDialogProps {
  intent: AuthIntentKey;
  onClose: () => void;
}
