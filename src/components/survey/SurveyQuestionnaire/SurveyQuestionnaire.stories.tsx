import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, spyOn } from "storybook/test";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { SurveyLoadStatus } from "@/types/survey";
import { getSurveySessionStore } from "@/utils/survey/session/getSurveySessionStore";

import { SurveyQuestionnaire } from "./SurveyQuestionnaire";
import {
  categorySelect,
  categorySelectAtLimit,
  demographics,
  demographicsComplete,
  emailCapture,
  type QuestionnaireFixture,
  questions,
  questionsCustomAnswers,
  questionsFirst,
  questionsHiddenCategory,
  questionsLongStatement,
} from "./SurveyQuestionnaire.fixtures";

// A story of a session: the quiz as read, and its session put in the store
// before the screen renders. No story makes a request.
const toStory = ({ survey, session }: QuestionnaireFixture): Story => ({
  args: { load: { status: SurveyLoadStatus.Ready, survey } },
  beforeEach: () => {
    getSurveySessionStore(survey).setState(session, true);
  },
});

const meta = {
  title: "Survey/SurveyQuestionnaire",
  component: SurveyQuestionnaire,
  parameters: {
    viewport: {
      options: INITIAL_VIEWPORTS,
    },
  },
  args: {
    load: { status: SurveyLoadStatus.Loading },
    onRetry: fn(),
  },
} satisfies Meta<typeof SurveyQuestionnaire>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Loading: Story = {};

export const FailedToLoad: Story = {
  args: { load: { status: SurveyLoadStatus.Failed } },
};

export const CategorySelect: Story = toStory(categorySelect);

export const CategorySelectAtLimit: Story = toStory(categorySelectAtLimit);

export const Questions: Story = toStory(questions);

export const QuestionsCustomAnswers: Story = toStory(questionsCustomAnswers);

export const QuestionsHiddenCategory: Story = toStory(questionsHiddenCategory);

export const QuestionsFirst: Story = toStory(questionsFirst);

export const QuestionsLongStatement: Story = toStory(questionsLongStatement);

export const Demographics: Story = toStory(demographics);

export const DemographicsComplete: Story = toStory(demographicsComplete);

// The phase exists only in a build that has the address of the endpoint, so
// the story reads the switch as on, and as it was again when the story is
// left. The card makes no request.
export const EmailCapture: Story = {
  ...toStory(emailCapture),
  beforeEach: () => {
    const emailSwitch = spyOn(
      SURVEY_SESSION_CONFIG,
      "isEmailSendingSetUp",
      "get",
    ).mockReturnValue(true);

    getSurveySessionStore(emailCapture.survey).setState(
      emailCapture.session,
      true,
    );

    return () => emailSwitch.mockRestore();
  },
};
