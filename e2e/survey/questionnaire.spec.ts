import { expect, type Page, test } from "@playwright/test";

import { openPage } from "../layout/openPage";
import { mockSurveyApi, type SurveyApiMock } from "./mockSurveyApi";
import {
  CATEGORY_IDS,
  PROJECT_ID,
  QUESTIONS,
  QUIZ_NAME,
  SURVEY_ID,
} from "./survey.fixture";
import { singleCategorySurveyFixture } from "./survey-single-category.fixture";

const HOME_PATH = "/";
const QUIZ_PATH = "/quizzes/mypolitics";
const UNKNOWN_QUIZ_PATH = "/quizzes/nie-ma-takiego-quizu";
const RESULTS_ADDRESS = "https://mypolitics.pl/results/";
const FEATURED_QUIZ = "myPolitics";
const CATEGORIES_PROMPT = "Wybierz 1 najważniejszy dla Ciebie temat.";
const NOT_FOUND_HEADING = /To jest błąd 404/;
const LOAD_ERROR_HEADING = "Nie udało się wczytać quizu";
const [FIRST_QUESTION, SECOND_QUESTION, THIRD_QUESTION, FOURTH_QUESTION] =
  QUESTIONS;

const getCategoryGroup = (page: Page) =>
  page.getByRole("group", { name: CATEGORIES_PROMPT });

const getButton = (page: Page, name: string) =>
  page.getByRole("main").getByRole("button", { name, exact: true });

const getAnswers = (page: Page, question: (typeof QUESTIONS)[number]) =>
  page.getByRole("group", { name: question.text });

const getProgressBar = (page: Page) =>
  page.getByRole("progressbar", { name: "Postęp quizu" });

// A question is on screen when its answers and its statement are, and no
// other statement is: one question takes the place of another by sliding, so
// for a moment the bubble of the question before is still there.
const expectQuestion = async (
  page: Page,
  question: (typeof QUESTIONS)[number],
) => {
  await expect(getAnswers(page, question)).toBeVisible();
  await expect(page.getByText(question.text, { exact: true })).toBeVisible();

  for (const other of QUESTIONS.filter(({ text }) => text !== question.text)) {
    await expect(page.getByText(other.text, { exact: true })).toHaveCount(0);
  }
};

// The pill of a question of a visible category: its name and the questions
// left in it. The number is drawn for the eye and spelled out for a screen
// reader.
const expectPill = async (page: Page, category: string, left: number) => {
  const main = page.getByRole("main");

  await expect(main.getByText(category, { exact: true })).toBeVisible();
  await expect(
    main.getByText(`Pozostałe pytania w kategorii: ${left}`),
  ).toBeAttached();
};

const answer = async (
  page: Page,
  question: (typeof QUESTIONS)[number],
  text: string,
) => {
  await expectQuestion(page, question);
  await getAnswers(page, question)
    .getByRole("button", { name: text, exact: true })
    .click();
};

const skip = async (page: Page, question: (typeof QUESTIONS)[number]) => {
  await expectQuestion(page, question);
  await getButton(page, "Pomiń").click();
};

const openQuiz = async (page: Page) => {
  await openPage(page, QUIZ_PATH);
  await expect(getCategoryGroup(page)).toBeVisible();
};

// Picks an option of a field. The list closes and hands the focus back to its
// field; a list opened before that would lose the focus and close again, so
// the pick is over only then.
const chooseOption = async (page: Page, field: string, option: string) => {
  await getButton(page, field).click();
  await page.getByRole("menuitem", { name: option, exact: true }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(getButton(page, field)).toBeFocused();
  await expect(getButton(page, field)).toHaveAccessibleDescription(option);
};

const expectDemographics = async (page: Page) => {
  await expect(
    page.getByRole("heading", { name: "Twoja tożsamość" }),
  ).toBeVisible();
};

const expectResultsPage = async (page: Page, sessionId: string) => {
  await expect(page).toHaveURL(`${RESULTS_ADDRESS}${sessionId}`);
  await expect(page.getByRole("heading", { name: "Wyniki" })).toBeVisible();
};

const getSessionId = (result: unknown): string =>
  (result as { sessionId: string }).sessionId;

test.describe("Feature: Questionnaire", () => {
  let api: SurveyApiMock;

  test.beforeEach(async ({ page }) => {
    api = await mockSurveyApi(page);
  });

  test("Scenario: A taker starts a quiz from the home page and reaches the result", async ({
    page,
  }) => {
    await test.step("Given a user is on the home page", async () => {
      await openPage(page, HOME_PATH);
    });

    await test.step("When they start the featured quiz", async () => {
      await page
        .getByRole("article")
        .filter({
          has: page.getByRole("heading", {
            level: 2,
            name: FEATURED_QUIZ,
            exact: true,
          }),
        })
        .getByRole("button", { name: "Rozpocznij quiz" })
        .click();
    });

    await test.step('Then they are on the address of that quiz and see the categories to pick, with "Idziemy dalej" off', async () => {
      await expect(page).toHaveURL(QUIZ_PATH);
      await expect(getCategoryGroup(page).getByRole("button")).toHaveText([
        "Gospodarka",
        "Ekologia",
      ]);
      await expect(getButton(page, "Idziemy dalej")).toBeDisabled();
      await expect(getButton(page, "Pomiń")).toBeEnabled();
      await expect(getProgressBar(page)).toHaveAttribute("aria-valuenow", "0");
      await expect(
        page.getByRole("main").getByText(QUIZ_NAME, { exact: true }),
      ).toBeVisible();
      expect(api.projectRequests).toHaveLength(1);
      expect(api.projectRequests[0]).toContain(`/v1/project/${PROJECT_ID}`);
      expect(api.surveyRequests).toHaveLength(1);
      expect(api.surveyRequests[0]).toContain(`/v1/survey/${SURVEY_ID}`);
      expect(api.surveyRequests[0]).toContain("lang=pl");
    });

    await test.step("When they pick a category and continue", async () => {
      await getCategoryGroup(page)
        .getByRole("button", { name: "Ekologia" })
        .click();
      await expect(
        getCategoryGroup(page).getByRole("button", { name: "Gospodarka" }),
      ).toBeDisabled();
      await getButton(page, "Idziemy dalej").click();
    });

    await test.step("Then they see the first question, its category and the questions left in the pill", async () => {
      await expectQuestion(page, FIRST_QUESTION);
      await expectPill(page, "Gospodarka", 2);
      await expect(
        getAnswers(page, FIRST_QUESTION).getByRole("button"),
      ).toHaveText([
        "Zdecydowanie za",
        "Częściowo za",
        "Częściowo przeciw",
        "Zdecydowanie przeciw",
      ]);
      await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
    });

    await test.step("When they answer two questions and skip the others", async () => {
      await answer(page, FIRST_QUESTION, "Częściowo za");
      await expectPill(page, "Ekologia", 1);
      await answer(page, SECOND_QUESTION, "Z atomu");
      await expectPill(page, "Gospodarka", 1);
      await skip(page, THIRD_QUESTION);
      await skip(page, FOURTH_QUESTION);
    });

    await test.step('Then they see the demographics card under "Prawie koniec!", with no progress bar', async () => {
      await expectDemographics(page);
      await expect(
        page.getByRole("main").getByText("Prawie koniec!").first(),
      ).toBeVisible();
      await expect(getProgressBar(page)).toHaveCount(0);
      await expect(getButton(page, "Zobacz wyniki")).toBeDisabled();
      expect(api.results).toHaveLength(0);
    });

    await test.step("When they skip demographics", async () => {
      await getButton(page, "Pomiń").click();
    });

    await test.step("Then one result is created with the picked category, the two answers and no demographics", async () => {
      await expect.poll(() => api.results).toHaveLength(1);
      expect(api.results[0]).toEqual({
        surveyId: SURVEY_ID,
        sessionId: expect.stringMatching(/^[0-9a-f-]{36}$/),
        prioritizedCategories: [CATEGORY_IDS.ecology],
        answers: [
          { questionId: "q1", answerId: "q1-a2" },
          { questionId: "q2", answerId: "q2-a2" },
        ],
      });
    });

    await test.step("And they land on the results address that ends with the identifier that was sent", async () => {
      await expectResultsPage(page, getSessionId(api.results[0]));
      expect(api.results).toHaveLength(1);
      expect(api.surveyRequests).toHaveLength(1);
    });
  });

  test("Scenario: A taker gives demographics", async ({ page }) => {
    await test.step("Given a user opened the quiz, skipped the categories and answered every question", async () => {
      await openQuiz(page);
      await getButton(page, "Pomiń").click();
      await answer(page, FIRST_QUESTION, "Zdecydowanie za");
      await answer(page, SECOND_QUESTION, "Ze źródeł odnawialnych");
      await answer(page, THIRD_QUESTION, "Zdecydowanie przeciw");
      await answer(page, FOURTH_QUESTION, "Częściowo przeciw");
      await expectDemographics(page);
    });

    await test.step('Then "Zobacz wyniki" is off', async () => {
      await expect(getButton(page, "Zobacz wyniki")).toBeDisabled();
    });

    await test.step("When they pick all four fields", async () => {
      await chooseOption(page, "Wiek", "34");
      await chooseOption(page, "Płeć", "Wolę nie podawać");
      await expect(getButton(page, "Zobacz wyniki")).toBeDisabled();
      await chooseOption(
        page,
        "Wielkość miejsca zamieszkania",
        "Miasto od 50 do 200 tys. mieszkańców",
      );
      await chooseOption(page, "Wykształcenie", "Wyższe");
      await expect(getButton(page, "Zobacz wyniki")).toBeEnabled();
    });

    await test.step('And they press "Zobacz wyniki"', async () => {
      await getButton(page, "Zobacz wyniki").click();
    });

    await test.step("Then the result is created with the four values, the age as a number", async () => {
      await expect.poll(() => api.results).toHaveLength(1);
      expect(api.results[0]).toEqual({
        surveyId: SURVEY_ID,
        sessionId: expect.stringMatching(/^[0-9a-f-]{36}$/),
        prioritizedCategories: [],
        demographics: {
          gender: "prefer_not_to_share",
          age: 34,
          residenceAreaSize: "city_below_200k",
          education: "higher",
        },
        answers: [
          { questionId: "q1", answerId: "q1-a1" },
          { questionId: "q2", answerId: "q2-a3" },
          { questionId: "q3", answerId: "q3-a4" },
          { questionId: "q4", answerId: "q4-a3" },
        ],
      });
      await expectResultsPage(page, getSessionId(api.results[0]));
    });
  });

  test("Scenario: A refresh keeps the place", async ({ page }) => {
    await test.step("Given a user answered two questions", async () => {
      await openQuiz(page);
      await getButton(page, "Pomiń").click();
      await answer(page, FIRST_QUESTION, "Częściowo za");
      await answer(page, SECOND_QUESTION, "Z węgla");
      await expectQuestion(page, THIRD_QUESTION);
      await expectPill(page, "Gospodarka", 1);
    });

    await test.step("When they reload the page", async () => {
      await page.reload();
    });

    await test.step("Then they see the third question again, with the same number in the pill", async () => {
      await expectQuestion(page, THIRD_QUESTION);
      await expectPill(page, "Gospodarka", 1);
      await expect(getCategoryGroup(page)).toHaveCount(0);
      await expect(getButton(page, "Poprzednie pytanie")).toBeEnabled();
      await expect(page).toHaveURL(QUIZ_PATH);
    });
  });

  test("Scenario: A taker steps back and starts over", async ({ page }) => {
    await test.step("Given a user answered one question", async () => {
      await openQuiz(page);
      await getButton(page, "Pomiń").click();
      await answer(page, FIRST_QUESTION, "Częściowo za");
      await expectQuestion(page, SECOND_QUESTION);
    });

    await test.step("When they press back", async () => {
      await getButton(page, "Poprzednie pytanie").click();
    });

    await test.step("Then they see the first question again and back is off", async () => {
      await expectQuestion(page, FIRST_QUESTION);
      await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
      await expect(getButton(page, "Zacznij od nowa")).toBeDisabled();
    });

    await test.step("When they answer it, press reset and confirm", async () => {
      await answer(page, FIRST_QUESTION, "Zdecydowanie przeciw");
      await expectQuestion(page, SECOND_QUESTION);
      await getButton(page, "Zacznij od nowa").click();
      await page
        .getByRole("dialog", { name: "Rozpocząć od nowa?" })
        .getByRole("button", { name: "Resetuj quiz" })
        .click();
    });

    await test.step("Then they see the categories to pick again, none picked", async () => {
      await expect(getCategoryGroup(page)).toBeVisible();

      for (const category of await getCategoryGroup(page)
        .getByRole("button")
        .all()) {
        await expect(category).toHaveAttribute("aria-pressed", "false");
      }

      await expect(getButton(page, "Idziemy dalej")).toBeDisabled();
      expect(api.results).toHaveLength(0);
    });
  });

  test("Scenario: A quiz that cannot be read", async ({ page }) => {
    await test.step("Given the API does not answer", async () => {
      api.setReachable(false);
    });

    await test.step("When a user opens the quiz", async () => {
      await openPage(page, QUIZ_PATH);
    });

    await test.step('Then they see "Nie udało się wczytać quizu"', async () => {
      await expect(
        page.getByRole("heading", { name: LOAD_ERROR_HEADING }),
      ).toBeVisible();
      await expect(
        page.getByText("Sprawdź połączenie z internetem i spróbuj ponownie."),
      ).toBeVisible();
      await expect(getCategoryGroup(page)).toHaveCount(0);
    });

    await test.step('When the API answers again and they press "Spróbuj ponownie"', async () => {
      api.setReachable(true);
      await getButton(page, "Spróbuj ponownie").click();
    });

    await test.step("Then they see the quiz", async () => {
      await expect(getCategoryGroup(page)).toBeVisible();
      await expect(
        page.getByRole("heading", { name: LOAD_ERROR_HEADING }),
      ).toHaveCount(0);
    });
  });

  test("Scenario: A quiz with one visible category has no category select", async ({
    page,
  }) => {
    await test.step("Given the quiz has one visible category", async () => {
      // Routes registered later are asked first: this quiz is sent in place
      // of the one the mock has, and everything else is left to the mock.
      await page.route("**/v1/survey/**", (route) =>
        route.request().method() === "GET"
          ? route.fulfill({
              json: singleCategorySurveyFixture,
              headers: { "access-control-allow-origin": "*" },
            })
          : route.fallback(),
      );
    });

    await test.step("When a user opens the quiz", async () => {
      await openPage(page, QUIZ_PATH);
    });

    await test.step("Then they are on the first question, with nothing to pick, to step back to or to reset", async () => {
      await expectQuestion(page, FIRST_QUESTION);
      await expect(page.getByRole("group", { name: /^Wybierz / })).toHaveCount(
        0,
      );
      await expectPill(page, "Gospodarka", 2);
      await expect(getProgressBar(page)).toHaveAttribute("aria-valuenow", "0");
      await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
      await expect(getButton(page, "Zacznij od nowa")).toBeDisabled();
    });

    await test.step("When they answer the first question and press back", async () => {
      await answer(page, FIRST_QUESTION, "Częściowo za");
      await expectQuestion(page, SECOND_QUESTION);
      await getButton(page, "Poprzednie pytanie").click();
    });

    await test.step("Then they are on the first question again, and back is off", async () => {
      await expectQuestion(page, FIRST_QUESTION);
      await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
      await expect(page.getByRole("group", { name: /^Wybierz / })).toHaveCount(
        0,
      );
    });
  });

  test("Scenario: A quiz the app does not have", async ({ page }) => {
    await test.step("When a user opens the address of an unknown quiz", async () => {
      await openPage(page, UNKNOWN_QUIZ_PATH);
    });

    await test.step("Then they see the not-found page inside the shell", async () => {
      await expect(
        page.getByRole("heading", { level: 1, name: NOT_FOUND_HEADING }),
      ).toBeVisible();
      await expect(page.getByRole("banner")).toBeVisible();
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expect(page).toHaveURL(UNKNOWN_QUIZ_PATH);
      expect(api.projectRequests).toHaveLength(0);
      expect(api.surveyRequests).toHaveLength(0);
    });
  });
});
