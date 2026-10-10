import { useParams } from "react-router";

import { Error404 } from "@/components/shared/Error404/Error404";
import { SurveyQuestionnaire } from "@/components/survey/SurveyQuestionnaire/SurveyQuestionnaire";
import { getProjectId } from "@/utils/survey/getProjectId";
import { useSurvey } from "@/utils/survey/useSurvey";

// The address a quiz is taken at: /quizzes/:quizSlug. The slug says which
// quiz, and nothing else is ever in the address - not the phase, not the
// question, not the session. A slug the app does not know and a quiz the API
// does not have both end on the not-found page of the site.
//
// The spacing around the screen is the page's, and so is its width: one
// centred column at every width, never wider than a comfortable line of text.
export default function QuizPage() {
  const { quizSlug } = useParams();
  const { load, retry } = useSurvey(getProjectId(quizSlug));

  if (load.status === "not-found") {
    return <Error404 />;
  }

  return (
    <div className="mx-auto box-content max-w-120 px-4 pt-4 pb-8 md:pt-8 md:pb-24">
      <SurveyQuestionnaire load={load} onRetry={retry} />
    </div>
  );
}
