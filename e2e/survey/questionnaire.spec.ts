import { expect, type Page, test } from "@playwright/test";

import { openPage } from "../layout/openPage";
import { mockSurveyApi, type SurveyApiMock } from "./mockSurveyApi";
import {
  CATEGORY_IDS,
  QUESTIONS,
  QUIZ_NAME,
  SURVEY_ID,
} from "./survey.fixture";

const HOME_PATH = "/";
const QUIZ_PATH = "/quizzes/mypolitics";
const UNKNOWN_QUIZ_PATH = "/quizzes/nie-ma-takiego-quizu";
const RESULTS_ADDRESS = "https://mypolitics.pl/results/";
const FEATURED_QUIZ = "myPolitics";
const TOPICS_PROMPT = "Wybierz 1 najważniejszy dla Ciebie temat.";
const NOT_FOUND_HEADING = /To jest błąd 404/;
const LOAD_ERROR_HEADING = "Nie udało się wczytać quizu";
const EMAIL_HEADING = "Zapisz swoje wyniki!";
const SEND_LABEL = "Wyślij i zobacz wyniki";
const ADDRESS = "biuro@mypolitics.pl";
const [FIRST_QUESTION, SECOND_QUESTION, THIRD_QUESTION, FOURTH_QUESTION] =
  QUESTIONS;

const getTopics = (page: Page) =>
  page.getByRole("group", { name: TOPICS_PROMPT });

const getButton = (page: Page, name: string) =>
  page.getByRole("main").getByRole("button", { name, exact: true });

const getAnswers = (page: Page, question: (typeof QUESTIONS)[number]) =>
  page.getByRole("group", { name: question.text });

const getProgressBar = (page: Page) =>
  page.getByRole("progressbar", { name: "Postęp quizu" });

const expectQuestion = async (
  page: Page,
  question: (typeof QUESTIONS)[number],
) => {
  await expect(getAnswers(page, question)).toBeVisible();
  await expect(page.getByText(question.text, { exact: true })).toBeVisible();
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
  await expect(getTopics(page)).toBeVisible();
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

// The e-mail card: the build the tests run against has the address of the
// endpoint, so the card follows demographics.
const expectEmailCard = async (page: Page) => {
  await expect(
    page.getByRole("heading", { name: EMAIL_HEADING }),
  ).toBeVisible();
};

const getEmailField = (page: Page) =>
  page.getByRole("main").getByRole("textbox", { name: "Adres e-mail" });

// Puts a text in the e-mail field, or empties it. The press on the field comes
// first, as a taker's would: it lands only once the screen takes input again
// after the content changed, and a key pressed before that would be ignored.
const typeAddress = async (page: Page, address: string) => {
  await getEmailField(page).click();
  await getEmailField(page).fill(address);
};

const getConsentBox = (page: Page) =>
  page.getByRole("main").getByRole("checkbox", { name: /^Wyrażam zgodę/ });

const answerEveryQuestion = async (page: Page) => {
  await openQuiz(page);
  await getButton(page, "Pomiń").click();
  await answer(page, FIRST_QUESTION, "Zdecydowanie za");
  await answer(page, SECOND_QUESTION, "Ze źródeł odnawialnych");
  await answer(page, THIRD_QUESTION, "Zdecydowanie przeciw");
  await answer(page, FOURTH_QUESTION, "Częściowo przeciw");
  await expectDemographics(page);
};

const chooseAllFields = async (page: Page, age: string) => {
  await chooseOption(page, "Wiek", age);
  await chooseOption(page, "Płeć", "Wolę nie podawać");
  await expect(getButton(page, "Zobacz wyniki")).toBeDisabled();
  await chooseOption(
    page,
    "Wielkość miejsca zamieszkania",
    "Miasto od 50 do 200 tys. mieszkańców",
  );
  await chooseOption(page, "Wykształcenie", "Wyższe");
  await expect(getButton(page, "Zobacz wyniki")).toBeEnabled();
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

    await test.step('Then they are on the address of that quiz and see the topics to pick, with "Idziemy dalej" off', async () => {
      await expect(page).toHaveURL(QUIZ_PATH);
      await expect(getTopics(page).getByRole("button")).toHaveText([
        "Gospodarka",
        "Ekologia",
      ]);
      await expect(getButton(page, "Idziemy dalej")).toBeDisabled();
      await expect(getButton(page, "Pomiń")).toBeEnabled();
      await expect(getProgressBar(page)).toHaveAttribute("aria-valuenow", "0");
      await expect(
        page.getByRole("main").getByText(QUIZ_NAME, { exact: true }),
      ).toBeVisible();
      expect(api.surveyRequests).toHaveLength(1);
      expect(api.surveyRequests[0]).toContain(`/v1/survey/${SURVEY_ID}`);
      expect(api.surveyRequests[0]).toContain("lang=pl");
    });

    await test.step("When they pick a topic and continue", async () => {
      await getTopics(page).getByRole("button", { name: "Ekologia" }).click();
      await expect(
        getTopics(page).getByRole("button", { name: "Gospodarka" }),
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

    await test.step('Then they see the e-mail card under "Prawie koniec!", with a full progress bar and the button "Pomiń"', async () => {
      await expectEmailCard(page);
      await expect(
        page.getByRole("main").getByText("Prawie koniec!").first(),
      ).toBeVisible();
      await expect(getProgressBar(page)).toHaveAttribute(
        "aria-valuenow",
        "100",
      );
      await expect(getEmailField(page)).toHaveValue("");
      await expect(getEmailField(page)).not.toBeFocused();
      await expect(getConsentBox(page)).not.toBeChecked();
      await expect(getButton(page, "Pomiń")).toBeEnabled();
      await expect(getButton(page, SEND_LABEL)).toHaveCount(0);
      expect(api.results).toHaveLength(0);
    });

    await test.step("When they type a valid address", async () => {
      await typeAddress(page, ADDRESS);
    });

    await test.step('Then the button reads "Wyślij i zobacz wyniki"', async () => {
      await expect(getButton(page, SEND_LABEL)).toBeEnabled();
      await expect(getButton(page, "Pomiń")).toHaveCount(0);
    });

    await test.step("When they clear the field", async () => {
      await typeAddress(page, "");
    });

    await test.step('Then the button reads "Pomiń" again', async () => {
      await expect(getButton(page, "Pomiń")).toBeEnabled();
      await expect(getButton(page, SEND_LABEL)).toHaveCount(0);
    });

    await test.step('When they press "Pomiń"', async () => {
      await getButton(page, "Pomiń").click();
    });

    await test.step("Then one result is created with the picked topic, the two answers and no demographics", async () => {
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
    await test.step("Given a user opened the quiz, skipped the topics and answered every question", async () => {
      await answerEveryQuestion(page);
    });

    await test.step('Then "Zobacz wyniki" is off', async () => {
      await expect(getButton(page, "Zobacz wyniki")).toBeDisabled();
    });

    await test.step("When they pick all four fields, with an age of 18 or more", async () => {
      await chooseAllFields(page, "34");
    });

    await test.step('And they press "Zobacz wyniki"', async () => {
      await getButton(page, "Zobacz wyniki").click();
    });

    await test.step("Then they see the e-mail card", async () => {
      await expectEmailCard(page);
      await expect(getButton(page, "Pomiń")).toBeEnabled();
      expect(api.results).toHaveLength(0);
    });

    await test.step('When they type a valid address and press "Wyślij i zobacz wyniki"', async () => {
      await typeAddress(page, ADDRESS);
      await expect(getButton(page, SEND_LABEL)).toBeEnabled();
      // The card only collects: nothing was asked of the endpoint while it
      // was on screen.
      expect(api.linkRequests).toHaveLength(0);
      await getButton(page, SEND_LABEL).click();
    });

    await test.step("Then the result is created with the four values, the age as a number, and without the address", async () => {
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
      expect(JSON.stringify(api.results[0])).not.toContain("biuro");
      await expectResultsPage(page, getSessionId(api.results[0]));
      await expect(page).not.toHaveURL(/biuro/);
    });
  });

  test("Scenario: A taker under 18 is not asked for an address", async ({
    page,
  }) => {
    await test.step("Given a user opened the quiz, skipped the topics and answered every question", async () => {
      await answerEveryQuestion(page);
    });

    await test.step("When they pick all four fields, with an age under 18", async () => {
      await chooseAllFields(page, "17");
    });

    await test.step('And they press "Zobacz wyniki"', async () => {
      await getButton(page, "Zobacz wyniki").click();
    });

    await test.step("Then they do not see the e-mail card", async () => {
      await expect.poll(() => api.results).toHaveLength(1);
      await expect(
        page.getByRole("heading", { name: EMAIL_HEADING }),
      ).toHaveCount(0);
    });

    await test.step("And the result is created with the four values", async () => {
      expect(api.results[0]).toMatchObject({
        surveyId: SURVEY_ID,
        demographics: {
          gender: "prefer_not_to_share",
          age: 17,
          residenceAreaSize: "city_below_200k",
          education: "higher",
        },
      });
      await expectResultsPage(page, getSessionId(api.results[0]));
      expect(api.results).toHaveLength(1);
      expect(api.linkRequests).toHaveLength(0);
    });
  });

  test("Scenario: Going back keeps what was typed", async ({ page }) => {
    await test.step("Given a user is on the e-mail card with an address typed and the consent ticked", async () => {
      await answerEveryQuestion(page);
      await getButton(page, "Pomiń").click();
      await expectEmailCard(page);
      await typeAddress(page, ADDRESS);
      await getConsentBox(page).click();
      await expect(getConsentBox(page)).toBeChecked();
      await expect(getButton(page, SEND_LABEL)).toBeEnabled();
    });

    await test.step("When they press back", async () => {
      await getButton(page, "Wróć").click();
    });

    await test.step("Then they see the demographics card", async () => {
      await expectDemographics(page);
      await expect(
        page.getByRole("heading", { name: EMAIL_HEADING }),
      ).toHaveCount(0);
      await expect(getProgressBar(page)).toHaveCount(0);
    });

    await test.step("When they go forward again", async () => {
      await getButton(page, "Pomiń").click();
    });

    await test.step("Then the field holds the same address and the box is ticked", async () => {
      await expectEmailCard(page);
      await expect(getEmailField(page)).toHaveValue(ADDRESS);
      await expect(getConsentBox(page)).toBeChecked();
      await expect(getButton(page, SEND_LABEL)).toBeEnabled();
      await expect(page).toHaveURL(QUIZ_PATH);
      expect(api.results).toHaveLength(0);
      expect(api.linkRequests).toHaveLength(0);
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
      await expect(getTopics(page)).toHaveCount(0);
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

    await test.step("Then they see the topics to pick again, none picked", async () => {
      await expect(getTopics(page)).toBeVisible();

      for (const topic of await getTopics(page).getByRole("button").all()) {
        await expect(topic).toHaveAttribute("aria-pressed", "false");
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
      await expect(getTopics(page)).toHaveCount(0);
    });

    await test.step('When the API answers again and they press "Spróbuj ponownie"', async () => {
      api.setReachable(true);
      await getButton(page, "Spróbuj ponownie").click();
    });

    await test.step("Then they see the quiz", async () => {
      await expect(getTopics(page)).toBeVisible();
      await expect(
        page.getByRole("heading", { name: LOAD_ERROR_HEADING }),
      ).toHaveCount(0);
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
      expect(api.surveyRequests).toHaveLength(0);
    });
  });
});
