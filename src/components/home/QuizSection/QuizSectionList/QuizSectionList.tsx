import { Trans } from "@lingui/react/macro";

import { HomeQuizCard } from "../../HomeQuizCard/HomeQuizCard";
import type { QuizSectionListProps } from "./QuizSectionList.types";

// The panel of the active tab: one column on a narrow screen, two from the
// wide breakpoint and three once a card has room for its title and buttons.
export const QuizSectionList = ({
  panel,
  quizzes,
  onQuizStart,
}: QuizSectionListProps) => (
  <div role="tabpanel" id={panel.id} aria-labelledby={panel.labelledBy}>
    {quizzes.length > 0 ? (
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 lg:grid-cols-3">
        {quizzes.map((quiz) => (
          <li key={quiz.id} className="min-w-0">
            <HomeQuizCard quiz={quiz} onStart={() => onQuizStart(quiz.id)} />
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-base leading-[1.4] text-gi-primary">
        <Trans>Nie ma jeszcze quizów tego rodzaju.</Trans>
      </p>
    )}
  </div>
);
