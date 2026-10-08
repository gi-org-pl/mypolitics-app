import { Component } from "react";

import type {
  SurveyQuestionnaireBoundaryProps,
  SurveyQuestionnaireBoundaryState,
} from "./SurveyQuestionnaireBoundary.types";

// The error boundary of the Checkpoints phase: it catches a checkpoint card
// that fails to draw. Nothing of the failure is shown - not what is left of
// the card, and no message - and the failure is reported once, so that the
// card is closed and the next question appears.
//
// It is a class because React has no other way to catch an error of
// rendering. It does this one job.
//
// Its name is kept short on purpose: with the name of the phase in it, the
// paths of its files are too long for Git on Windows to check out in a
// working tree that is itself nested a few folders deep.
export class SurveyQuestionnaireBoundary extends Component<
  SurveyQuestionnaireBoundaryProps,
  SurveyQuestionnaireBoundaryState
> {
  state: SurveyQuestionnaireBoundaryState = { hasFailed: false };

  static getDerivedStateFromError(): SurveyQuestionnaireBoundaryState {
    return { hasFailed: true };
  }

  componentDidCatch(): void {
    this.props.onError();
  }

  render() {
    return this.state.hasFailed ? null : this.props.children;
  }
}
