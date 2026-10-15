import type { AuthSession } from "@/types/auth";

export type HeaderStoryProps = {
  initialPath: string;
  session?: AuthSession; // unknown by default: the account place is empty
};
