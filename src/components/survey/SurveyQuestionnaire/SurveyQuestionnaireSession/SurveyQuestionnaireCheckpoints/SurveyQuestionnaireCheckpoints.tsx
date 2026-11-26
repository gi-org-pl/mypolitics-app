import type { ComponentType } from "react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary/ErrorBoundary";
import type { CheckpointCardProps } from "@/types/checkpoint";
import type { SurveyPhaseContentProps } from "@/types/survey";
import { CHECKPOINT_CARDS } from "../../SurveyQuestionnaire.constants";
import { useCheckpointCard } from "./utils/useCheckpointCard";

// The Checkpoints phase: the card that is up, in place of the question, its
// answers and the skip button. It draws the component registered for the type
// of the card and hands it the card and the three things a card can ask for.
// The continue button closes the card, the opt-out button turns checkpoints
// off for the session, and either way the next question follows. The bar, the
// pill, back and reset of the phase are the screen's.
//
// A card that fails to draw is closed as a whole, and with no card to put up
// the phase draws nothing while the session is moved on.
export const SurveyQuestionnaireCheckpoints = ({
  session,
}: SurveyPhaseContentProps) => {
  const { card, reveal, close, optOut } = useCheckpointCard(session);

  if (!card) return null;

  // The card that is handed out is always one whose type is registered.
  const Card = CHECKPOINT_CARDS[
    card.type
  ] as ComponentType<CheckpointCardProps>;

  return (
    <ErrorBoundary onError={close}>
      <Card
        card={card}
        onReveal={reveal}
        onContinue={close}
        onOptOut={optOut}
      />
    </ErrorBoundary>
  );
};
