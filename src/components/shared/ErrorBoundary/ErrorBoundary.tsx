import { Component } from "react";

import type {
  ErrorBoundaryProps,
  ErrorBoundaryState,
} from "./ErrorBoundary.types";

// Contains a part of a screen that fails to draw: nothing of the failure is
// shown - not what is left of the part, and no message - so the rest of the
// screen stays. The failure is reported once to whoever asked for it: a
// checkpoint card that fails is closed that way.
//
// It is a class because React has no other way to catch an error of
// rendering. It does this one job.
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasFailed: true };
  }

  componentDidCatch(): void {
    this.props.onError?.();
  }

  render() {
    return this.state.hasFailed ? null : this.props.children;
  }
}
