import { expect, type Page, test } from "@playwright/test";

import { openPage } from "../layout/openPage";
import { mockSurveyApi, type SurveyApiMock } from "./mockSurveyApi";
import {
  CATEGORY_IDS,
  QUESTIONS,
  QUIZ_NAME,
  SURVEY_ID,
} from "./survey.fixture";
import {
  AXIS_ORIENTATIONS,
  AXIS_QUESTIONS,
  axisSurveyFixture,
} from "./survey-axis.fixture";
import {
  CHECKPOINT_QUESTIONS,
  checkpointSurveyFixture,
} from "./survey-checkpoint.fixture";
import {
  COMPASS_QUESTIONS,
  compassSurveyFixture,
} from "./survey-compass.fixture";

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
const LINK_NOT_SENT = "Nie udało się wysłać linku na Twój e-mail.";
const NOT_SAVED = "Nie udało się zapisać Twoich odpowiedzi.";
// Longer than the stay of the loader, 6 seconds.
const LEAVE_TIMEOUT_MS = 20_000;
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

// The lines of the loader, oldest first. A new one arrives every 1.2 seconds.
const getLoaderLines = (page: Page) =>
  page.getByRole("main").getByRole("list").getByRole("listitem");

// The loader: the pill, no bar, a first line, and the two result actions,
// which never work here. Back is off too.
const expectLoader = async (page: Page) => {
  const main = page.getByRole("main");

  await expect(main.getByText("Prawie gotowe").first()).toBeVisible();
  await expect(getProgressBar(page)).toHaveCount(0);
  await expect(getLoaderLines(page).first()).toBeVisible();
  await expect(getButton(page, "Pobierz")).toBeDisabled();
  await expect(getButton(page, "Pełne wyniki")).toBeDisabled();
  await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
};

// The loader stays for the time of five lines, 6 seconds, however fast the
// result is. Nothing shortens that for the tests: the wait for the results
// page covers it.
const expectResultsPage = async (page: Page, sessionId: string) => {
  await expect(page).toHaveURL(`${RESULTS_ADDRESS}${sessionId}`, {
    timeout: LEAVE_TIMEOUT_MS,
  });
  await expect(page.getByRole("heading", { name: "Wyniki" })).toBeVisible();
};

// The storage of a tab is kept per site, so it is read from a page of the app
// that does not start a session.
const expectNoStoredSession = async (page: Page) => {
  await openPage(page, HOME_PATH);

  expect(
    await page.evaluate(() =>
      Object.keys(sessionStorage).filter((key) =>
        key.includes("survey-session"),
      ),
    ),
  ).toEqual([]);
};

const getSessionId = (result: unknown): string =>
  (result as { sessionId: string }).sessionId;

test.describe("Feature: Questionnaire", () => {
  let api: SurveyApiMock;

  // A scenario that reaches the result waits out the stay of the loader.
  test.describe.configure({ timeout: 60_000 });

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

    await test.step('Then they see the loader under "Prawie gotowe", with no progress bar, a first line, and "Pobierz" and "Pełne wyniki" off', async () => {
      await expectLoader(page);
      await expect(getButton(page, "Zacznij od nowa")).toBeDisabled();
    });

    await test.step("And one result is created with the picked topic, the two answers and no demographics", async () => {
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

    await test.step("When the result is calculated and the stay is over", async () => {
      // Nothing to do: the result is calculated at its second read.
    });

    await test.step("Then they land on the results address that ends with the identifier that was sent", async () => {
      await expectResultsPage(page, getSessionId(api.results[0]));
      expect(api.results).toHaveLength(1);
      expect(api.repeatedResults).toHaveLength(0);
      expect(api.linkRequests).toHaveLength(0);
      expect(api.surveyRequests).toHaveLength(1);
    });

    await test.step("And nothing of the session is left in the tab's storage", async () => {
      await expectNoStoredSession(page);
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

    await test.step('Then they see the loader under "Prawie gotowe", with no progress bar, a first line, and "Pobierz" and "Pełne wyniki" off', async () => {
      await expectLoader(page);
    });

    await test.step("And the result is created with the four values, the age as a number, and without the address", async () => {
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
    });

    await test.step("When the result is calculated and the stay is over", async () => {
      // Nothing to do: the result is calculated at its second read.
    });

    await test.step("Then they land on the results address that ends with the identifier that was sent", async () => {
      await expectResultsPage(page, getSessionId(api.results[0]));
      await expect(page).not.toHaveURL(/biuro/);
      expect(api.results).toHaveLength(1);
    });

    await test.step("And nothing of the session is left in the tab's storage", async () => {
      await expectNoStoredSession(page);
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

    await test.step('And they see the loader under "Prawie gotowe", with no progress bar, a first line, and "Pobierz" and "Pełne wyniki" off', async () => {
      await expectLoader(page);
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
    });

    await test.step("When the result is calculated and the stay is over", async () => {
      // Nothing to do: the result is calculated at its second read.
    });

    await test.step("Then they land on the results address that ends with the identifier that was sent", async () => {
      await expectResultsPage(page, getSessionId(api.results[0]));
      expect(api.results).toHaveLength(1);
      expect(api.linkRequests).toHaveLength(0);
    });

    await test.step("And nothing of the session is left in the tab's storage", async () => {
      await expectNoStoredSession(page);
    });
  });

  test("Scenario: The link is requested after the result exists", async ({
    page,
  }) => {
    await test.step("Given a user answered every question, skipped demographics and typed an address with the consent ticked", async () => {
      await answerEveryQuestion(page);
      await getButton(page, "Pomiń").click();
      await expectEmailCard(page);
      await typeAddress(page, ADDRESS);
      await getConsentBox(page).click();
      await expect(getConsentBox(page)).toBeChecked();
      expect(api.calls).toEqual([]);
    });

    await test.step('When they press "Wyślij i zobacz wyniki"', async () => {
      await getButton(page, SEND_LABEL).click();
    });

    await test.step("Then the result is created, without the address", async () => {
      await expect.poll(() => api.results).toHaveLength(1);
      expect(JSON.stringify(api.results[0])).not.toContain("biuro");
      expect(api.results[0]).not.toHaveProperty("demographics");
    });

    await test.step('And after it one request reaches the link endpoint, with the address, the consent, the consent wording, the language "pl" and the identifier of that result, and no answer', async () => {
      await expect.poll(() => api.linkRequests).toHaveLength(1);
      expect(api.calls).toEqual(["result", "link"]);
      expect(api.linkRequests[0]).toEqual({
        email: ADDRESS,
        resultId: getSessionId(api.results[0]),
        marketingConsent: true,
        consentWording: "marketing-v1",
        language: "pl",
      });
    });

    await test.step("And they land on the results address", async () => {
      await expectResultsPage(page, getSessionId(api.results[0]));
      await expect(page).not.toHaveURL(/biuro/);
      expect(api.calls).toEqual(["result", "link"]);
    });
  });

  test("Scenario: The link could not be sent", async ({ page }) => {
    await test.step('Given the link endpoint answers "unavailable"', async () => {
      api.setLinkAvailable(false);
    });

    await test.step("And a user answered every question, skipped demographics and typed an address", async () => {
      await answerEveryQuestion(page);
      await getButton(page, "Pomiń").click();
      await expectEmailCard(page);
      await typeAddress(page, ADDRESS);
    });

    await test.step('When they press "Wyślij i zobacz wyniki"', async () => {
      await getButton(page, SEND_LABEL).click();
    });

    await test.step("Then the result is created and the link is requested once", async () => {
      await expect.poll(() => api.linkRequests).toHaveLength(1);
      expect(api.calls).toEqual(["result", "link"]);
      expect(api.linkRequests[0]).toEqual({
        email: ADDRESS,
        resultId: getSessionId(api.results[0]),
        marketingConsent: false,
        language: "pl",
      });
    });

    await test.step('And they see "Nie udało się wysłać linku na Twój e-mail." and stay on the page', async () => {
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        LINK_NOT_SENT,
        { timeout: LEAVE_TIMEOUT_MS },
      );
      await expect(getButton(page, "Zobacz wyniki")).toBeFocused();
      await expect(getButton(page, "Zacznij od nowa")).toBeDisabled();
      await expect(getButton(page, "Pobierz")).toBeDisabled();
      await expect(page).toHaveURL(QUIZ_PATH);
      expect(api.calls).toEqual(["result", "link"]);
    });

    await test.step('When they press "Zobacz wyniki"', async () => {
      await getButton(page, "Zobacz wyniki").click();
    });

    await test.step("Then they land on the results address", async () => {
      await expectResultsPage(page, getSessionId(api.results[0]));
      expect(api.calls).toEqual(["result", "link"]);
    });
  });

  test("Scenario: A refresh during the wait", async ({ page }) => {
    // The run before the refresh is left to show this many lines, so that a
    // run that starts over is told from one that carried on.
    const linesBeforeRefresh = 4;
    let firstLine = "";

    await test.step("Given a user reached the loader and the result is stored but not calculated", async () => {
      api.setResultCalculated(false);
      await answerEveryQuestion(page);
      await getButton(page, "Pomiń").click();
      await expectEmailCard(page);
      await getButton(page, "Pomiń").click();
      await expectLoader(page);
      await expect.poll(() => api.results).toHaveLength(1);
      await expect
        .poll(() => getLoaderLines(page).count(), { timeout: LEAVE_TIMEOUT_MS })
        .toBeGreaterThanOrEqual(linesBeforeRefresh);
      firstLine = await getLoaderLines(page).first().innerText();
    });

    await test.step("When they reload the page", async () => {
      await page.reload();
    });

    await test.step("Then they see the loader again, from its first line", async () => {
      await expectLoader(page);
      expect(await getLoaderLines(page).count()).toBeLessThan(
        linesBeforeRefresh,
      );
      await expect(getLoaderLines(page).first()).toHaveText(firstLine);
      await expect(page).toHaveURL(QUIZ_PATH);
    });

    await test.step('And the same result is sent again and answered "already exists"', async () => {
      await expect.poll(() => api.repeatedResults).toHaveLength(1);
      expect(api.repeatedResults[0]).toEqual(api.results[0]);
      expect(api.results).toHaveLength(1);
    });

    await test.step("When the result is calculated and the stay is over", async () => {
      api.setResultCalculated(true);
    });

    await test.step("Then they land on the same results address", async () => {
      await expectResultsPage(page, getSessionId(api.results[0]));
      expect(api.results).toHaveLength(1);
    });
  });

  test("Scenario: The answers cannot be saved", async ({ page }) => {
    await test.step("Given the API refuses the result", async () => {
      api.setResultRefused(true);
    });

    await test.step("When a user reaches the loader", async () => {
      await answerEveryQuestion(page);
      await getButton(page, "Pomiń").click();
      await expectEmailCard(page);
      await getButton(page, "Pomiń").click();
    });

    await test.step('Then they see "Nie udało się zapisać Twoich odpowiedzi." with "Spróbuj ponownie", and reset is on', async () => {
      await expect(page.getByRole("main").getByRole("alert")).toContainText(
        NOT_SAVED,
      );
      await expect(getButton(page, "Spróbuj ponownie")).toBeFocused();
      await expect(getButton(page, "Zacznij od nowa")).toBeEnabled();
      await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
      await expect(getLoaderLines(page)).toHaveCount(0);
      // A refused hand-in is not sent again by itself.
      expect(api.calls).toEqual(["result"]);
      expect(api.results).toHaveLength(0);
    });

    await test.step('When the API accepts the result and they press "Spróbuj ponownie"', async () => {
      api.setResultRefused(false);
      await getButton(page, "Spróbuj ponownie").click();
    });

    await test.step("Then they land on the results address", async () => {
      await expect.poll(() => api.results).toHaveLength(1);
      await expectResultsPage(page, getSessionId(api.results[0]));
      expect(api.calls).toEqual(["result", "result"]);
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

// The Checkpoints phase. Each card is reached with a quiz that can fire it:
// a card task adds its scenarios in a `test.describe` of its own below, with
// its own fixture handed to `mockSurveyApi`.

const getCheckpoint = (page: Page) =>
  page.getByRole("main").getByRole("region", { name: "Checkpoint" });

// Answers the questions of a quiz from the first one up to the given count,
// each with the same answer.
const answerQuestions = async (
  page: Page,
  questions: (typeof QUESTIONS)[number][],
  count: number,
  text: string,
) => {
  for (const question of questions.slice(0, count)) {
    await answer(page, question, text);
  }
};

test.describe("Feature: Questionnaire checkpoints - halfway through", () => {
  // The midpoint of nine questions: the boundary after the fifth.
  const midpoint = 5;
  const sixthQuestion = CHECKPOINT_QUESTIONS[midpoint];

  // One category, so the quiz opens on its first question.
  const openCheckpointQuiz = async (page: Page) => {
    await openPage(page, QUIZ_PATH);
    await expectQuestion(page, CHECKPOINT_QUESTIONS[0]);
  };

  test.beforeEach(async ({ page }) => {
    await mockSurveyApi(page, checkpointSurveyFixture);
  });

  test("Scenario: A checkpoint appears and is dismissed", async ({ page }) => {
    await test.step("Given a user opened the nine-question quiz", async () => {
      await openCheckpointQuiz(page);
      await expect(getTopics(page)).toHaveCount(0);
      await expect(getCheckpoint(page)).toHaveCount(0);
    });

    await test.step("When they answer the first five questions", async () => {
      await answerQuestions(
        page,
        CHECKPOINT_QUESTIONS,
        midpoint,
        "Częściowo za",
      );
    });

    await test.step('Then a region named "Checkpoint" is shown in place of the question', async () => {
      await expect(getCheckpoint(page)).toBeVisible();
      await expect(getAnswers(page, sixthQuestion)).toHaveCount(0);
      await expect(
        page.getByText(sixthQuestion.text, { exact: true }),
      ).toHaveCount(0);
      await expect(getButton(page, "Pomiń")).toHaveCount(0);
    });

    await test.step("And back is off and reset is on", async () => {
      await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
      await expect(getButton(page, "Zacznij od nowa")).toBeEnabled();
    });

    await test.step('And the card reads "55%" and says how many minutes the rest will take', async () => {
      await expect(
        getCheckpoint(page).getByText("55%", { exact: true }),
      ).toBeVisible();
      // The minutes depend on how fast the questions were answered.
      await expect(getCheckpoint(page).getByRole("paragraph")).toHaveText(
        /ok\. \d+ min\./,
      );
    });

    await test.step('When they press "Dalej"', async () => {
      await getButton(page, "Dalej").click();
    });

    await test.step("Then they see the sixth question", async () => {
      await expectQuestion(page, sixthQuestion);
      await expect(getCheckpoint(page)).toHaveCount(0);
      await expect(getButton(page, "Poprzednie pytanie")).toBeEnabled();
    });
  });

  test("Scenario: Turning checkpoints off holds for the session and after a reset", async ({
    page,
  }) => {
    await test.step("Given a user opened the nine-question quiz and answered the first five questions", async () => {
      await openCheckpointQuiz(page);
      await answerQuestions(
        page,
        CHECKPOINT_QUESTIONS,
        midpoint,
        "Częściowo za",
      );
      await expect(getCheckpoint(page)).toBeVisible();
    });

    await test.step('When they press "Wyłącz checkpointy"', async () => {
      await getButton(page, "Wyłącz checkpointy").click();
    });

    await test.step("Then they see the sixth question", async () => {
      await expectQuestion(page, sixthQuestion);
      await expect(getCheckpoint(page)).toHaveCount(0);
    });

    await test.step("When they press reset and confirm", async () => {
      await getButton(page, "Zacznij od nowa").click();
      await page
        .getByRole("dialog", { name: "Rozpocząć od nowa?" })
        .getByRole("button", { name: "Resetuj quiz" })
        .click();
      await expectQuestion(page, CHECKPOINT_QUESTIONS[0]);
      await expect(getButton(page, "Poprzednie pytanie")).toBeDisabled();
    });

    await test.step("And they answer the first five questions again", async () => {
      await answerQuestions(
        page,
        CHECKPOINT_QUESTIONS,
        midpoint,
        "Częściowo przeciw",
      );
    });

    await test.step('Then they see the sixth question and no region named "Checkpoint" appears', async () => {
      await expectQuestion(page, sixthQuestion);
      await expect(getCheckpoint(page)).toHaveCount(0);
    });
  });
});

// The axis closeness card depends on the whole chain: the axes as the API
// sends them, the scores counted during the quiz, the engine, the registry of
// cards and the bar of the result screen. The quiz is a fixture of its own,
// with one axis.
test.describe("Feature: Questionnaire - a quiz with axes", () => {
  const [FIRST_ORIENTATION, SECOND_ORIENTATION] = AXIS_ORIENTATIONS;
  const FIRST_NAME = FIRST_ORIENTATION.generalName;
  const SECOND_NAME = SECOND_ORIENTATION.generalName;
  const SIXTH_QUESTION = AXIS_QUESTIONS[5];

  const getCard = (page: Page) =>
    page.getByRole("main").getByRole("region", { name: "Checkpoint" });

  test.beforeEach(async ({ page }) => {
    await mockSurveyApi(page);
    // Routes registered later are asked first: this quiz is sent in place of
    // the one the mock has, and everything else is left to the mock.
    await page.route("**/v1/survey/**", (route) =>
      route.request().method() === "GET"
        ? route.fulfill({
            json: axisSurveyFixture,
            headers: { "access-control-allow-origin": "*" },
          })
        : route.fallback(),
    );
  });

  test("Scenario: A quiz with axes tells the taker where they stand", async ({
    page,
  }) => {
    await test.step("Given a user opened the nine-question quiz with one axis", async () => {
      await openPage(page, QUIZ_PATH);
      await expect(
        page.getByRole("group", { name: AXIS_QUESTIONS[0].text }),
      ).toBeVisible();
      await expect(getTopics(page)).toHaveCount(0);
    });

    await test.step('When they answer the first five questions with "Zdecydowanie za"', async () => {
      for (const question of AXIS_QUESTIONS.slice(0, 5)) {
        await page
          .getByRole("group", { name: question.text })
          .getByRole("button", { name: "Zdecydowanie za", exact: true })
          .click();
      }
    });

    await test.step('Then a region named "Checkpoint" shows the name of the first orientation as its title', async () => {
      await expect(getCard(page)).toBeVisible();
      await expect(
        getCard(page).getByText(FIRST_NAME, { exact: true }).first(),
      ).toBeVisible();
      await expect(getCard(page).getByText(FIRST_NAME).first()).toHaveText(
        FIRST_NAME,
      );
    });

    await test.step("And a bar described in words, with no percentage on it or in its description", async () => {
      const bar = getCard(page).getByRole("img");

      await expect(bar).toHaveCount(1);
      await expect(bar).toHaveAccessibleName(
        `„${FIRST_NAME}” i „${SECOND_NAME}”: wyższy wynik po stronie „${FIRST_NAME}”`,
      );
      await expect(bar).toContainText(FIRST_NAME);
      await expect(bar).toContainText(SECOND_NAME);
      await expect(bar).not.toContainText(/[\d%]/);
      await expect(getCard(page)).not.toContainText(/[\d%]/);
    });

    await test.step("And a statement that names both orientations", async () => {
      const statement = getCard(page).getByRole("paragraph");

      await expect(statement).toContainText(`„${FIRST_NAME}”`);
      await expect(statement).toContainText(`„${SECOND_NAME}”`);
    });

    await test.step('When they press "Dalej"', async () => {
      await getButton(page, "Dalej").click();
    });

    await test.step("Then they see the sixth question", async () => {
      await expect(
        page.getByRole("group", { name: SIXTH_QUESTION.text }),
      ).toBeVisible();
      await expect(
        page.getByText(SIXTH_QUESTION.text, { exact: true }),
      ).toBeVisible();
      await expect(getCard(page)).toHaveCount(0);
    });
  });
});

test.describe("Feature: Questionnaire checkpoints - Nolan chart path", () => {
  // The path card needs ten done questions: the boundary after the tenth.
  const boundary = 10;
  const eleventhQuestion = COMPASS_QUESTIONS[boundary];

  test.beforeEach(async ({ page }) => {
    await mockSurveyApi(page, compassSurveyFixture);
  });

  test("Scenario: The compass path card appears in a quiz with a compass", async ({
    page,
  }) => {
    await test.step("Given a user opened the twenty-question compass quiz", async () => {
      await openPage(page, QUIZ_PATH);
      await expectQuestion(page, COMPASS_QUESTIONS[0]);
      await expect(getCheckpoint(page)).toHaveCount(0);
    });

    await test.step('When they answer the first question "Zdecydowanie za"', async () => {
      await answer(page, COMPASS_QUESTIONS[0], "Zdecydowanie za");
    });

    await test.step('And they answer the next nine questions "Zdecydowanie przeciw"', async () => {
      await answerQuestions(
        page,
        COMPASS_QUESTIONS.slice(1),
        boundary - 1,
        "Zdecydowanie przeciw",
      );
    });

    await test.step('Then a region named "Checkpoint" is shown in place of the question', async () => {
      await expect(getCheckpoint(page)).toBeVisible();
      await expect(getAnswers(page, eleventhQuestion)).toHaveCount(0);
      await expect(
        page.getByText(eleventhQuestion.text, { exact: true }),
      ).toHaveCount(0);
    });

    await test.step("And it holds an image whose description says the route passed through 2 of 4 quadrants", async () => {
      await expect(
        getCheckpoint(page).getByRole("img", {
          name: /trasa przeszła przez 2 z 4 ćwiartek/,
        }),
      ).toBeVisible();
      await expect(getCheckpoint(page).getByRole("img")).toHaveCount(1);
    });

    await test.step('And its text says "2 ćwiartki kompasu"', async () => {
      await expect(getCheckpoint(page).getByRole("paragraph")).toContainText(
        "2 ćwiartki kompasu",
      );
    });

    await test.step('When they press "Dalej"', async () => {
      await getButton(page, "Dalej").click();
    });

    await test.step("Then they see the eleventh question", async () => {
      await expectQuestion(page, eleventhQuestion);
      await expect(getCheckpoint(page)).toHaveCount(0);
    });
  });
});
