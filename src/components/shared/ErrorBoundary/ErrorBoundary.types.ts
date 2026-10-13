import type { ReactNode } from "react";

export interface ErrorBoundaryProps {
  onError?: () => void; // what is inside failed to draw
  children: ReactNode;
}

export interface ErrorBoundaryState {
  hasFailed: boolean;
}
