import type { AuthAccount } from "@/types/auth";

export interface HeaderAccountPhoneProps {
  account: AuthAccount;
  onNavigate?: () => void; // closes the phone menu
}
