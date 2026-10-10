import { fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SURVEY_SESSION_CONFIG } from "@/constants/survey";
import { apiClient } from "@/services/api/client/apiClient";
import {
  type Survey,
  type SurveyEmail,
  SurveyResultState,
  type SurveySession,
} from "@/types/survey";
import { getSessionStorageKey } from "@/utils/survey/session/getSessionStorageKey";
import { createStartedSession } from "@/utils/vitest/survey/createStartedSession";
import { createSurvey } from "@/utils/vitest/survey/createSurvey";
import { renderPhaseContent } from "@/utils/vitest/survey/renderPhaseContent";

import { SurveyQuestionnaireEmailCapture } from "./SurveyQuestionnaireEmailCapture";

const CONSENT =
  "Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja.";
const SKIP = "Pomiń";
const SUBMIT = "Wyślij i zobacz wyniki";

const renderPhase = (
  email: SurveyEmail | null = null,
  overrides: Partial<SurveySession> = {},
) => {
  // The stores live as long as the module does: a quiz of its own.
  const survey: Survey = createSurvey({ id: crypto.randomUUID() });

  return {
    ...renderPhaseContent(SurveyQuestionnaireEmailCapture, survey, {
      ...createStartedSession(survey, survey.questions.length),
      phase: "email-capture",
      email,
      ...overrides,
    }),
    survey,
  };
};

const getField = () => screen.getByRole("textbox", { name: "Adres e-mail" });

const getBox = () => screen.getByRole("checkbox", { name: CONSENT });

const getButton = (name: string) => screen.getByRole("button", { name });

const type = (text: string) =>
  fireEvent.change(getField(), { target: { value: text } });

describe("<SurveyQuestionnaireEmailCapture />", () => {
  beforeEach(() => {
    // The phase is part of a session only where sending is set up.
    vi.spyOn(
      SURVEY_SESSION_CONFIG,
      "isEmailSendingSetUp",
      "get",
    ).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  describe("given a session with no e-mail", () => {
    it("shows an empty field and an unticked box", () => {
      const { getSession } = renderPhase();

      expect(getField()).toHaveValue("");
      expect(getBox()).not.toBeChecked();
      expect(getButton(SKIP)).toBeEnabled();
      expect(getSession().email).toBeNull();
      expect(getSession().phase).toBe("email-capture");
    });
  });

  describe("given a session that holds an e-mail", () => {
    it("shows its address and its consent", () => {
      renderPhase({ address: "biuro@mypolitics.pl", hasConsent: true });

      expect(getField()).toHaveValue("biuro@mypolitics.pl");
      expect(getBox()).toBeChecked();
      expect(getButton(SUBMIT)).toBeEnabled();
    });

    it("shows text that is not a valid address as it was typed", () => {
      renderPhase({ address: "biuro@mypolitics", hasConsent: false });

      expect(getField()).toHaveValue("biuro@mypolitics");
      expect(getBox()).not.toBeChecked();
      expect(getButton(SKIP)).toBeEnabled();
    });
  });

  describe("when the field or the box changes", () => {
    it("sets the e-mail of the session to what was typed and ticked", () => {
      const { getSession } = renderPhase();

      type("Jan Kowalski <jan");

      expect(getSession().email).toEqual({
        address: "Jan Kowalski <jan",
        hasConsent: false,
      });

      fireEvent.click(getBox());

      expect(getSession().email).toEqual({
        address: "Jan Kowalski <jan",
        hasConsent: true,
      });

      type("jan@poczta.pl");

      expect(getSession().email).toEqual({
        address: "jan@poczta.pl",
        hasConsent: true,
      });
      expect(getSession().phase).toBe("email-capture");
      expect(getField()).toHaveValue("jan@poczta.pl");
      expect(getBox()).toBeChecked();
    });

    it("keeps the consent of a box ticked before anything was typed", () => {
      const { getSession } = renderPhase();

      fireEvent.click(getBox());

      expect(getSession().email).toEqual({ address: "", hasConsent: true });

      fireEvent.click(getBox());

      expect(getSession().email).toEqual({ address: "", hasConsent: false });
    });

    it("follows the validity of the text with the button", () => {
      renderPhase();

      type("biuro@mypolitics");

      expect(getButton(SKIP)).toBeEnabled();

      type("biuro@mypolitics.pl");

      expect(getButton(SUBMIT)).toBeEnabled();

      type("");

      expect(getButton(SKIP)).toBeEnabled();
    });

    it("never writes the address or the consent to storage", () => {
      const { survey } = renderPhase();

      type("biuro@mypolitics.pl");
      fireEvent.click(getBox());

      const stored = sessionStorage.getItem(getSessionStorageKey(survey.id));

      expect(stored).not.toBeNull();
      expect(stored).not.toContain("biuro");
      expect(stored).not.toContain("mypolitics.pl");
      expect(stored).not.toContain("hasConsent");
      expect(JSON.stringify({ ...localStorage })).not.toContain("biuro");
      expect(document.cookie).not.toContain("biuro");
      expect(window.location.href).not.toContain("biuro");
    });
  });

  describe("when a valid address is submitted", () => {
    it("sets the trimmed address and leaves the phase as given", () => {
      const { getSession } = renderPhase({
        address: "  Biuro@myPolitics.pl ",
        hasConsent: true,
      });

      fireEvent.click(getButton(SUBMIT));

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        email: { address: "Biuro@myPolitics.pl", hasConsent: true },
        resultState: SurveyResultState.NotSent,
      });
    });

    it("hands the address over without consent when the box is not ticked", () => {
      const { getSession } = renderPhase();

      type("biuro@mypolitics.pl");
      fireEvent.click(getButton(SUBMIT));

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        email: { address: "biuro@mypolitics.pl", hasConsent: false },
      });
    });

    it("leaves as given when Enter is pressed in the field", () => {
      const { getSession } = renderPhase({
        address: "biuro@mypolitics.pl",
        hasConsent: false,
      });

      fireEvent.keyDown(getField(), { key: "Enter" });

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        email: { address: "biuro@mypolitics.pl", hasConsent: false },
      });
    });

    it("leaves once when submitted twice", () => {
      const { getSession } = renderPhase({
        address: "biuro@mypolitics.pl",
        hasConsent: true,
      });
      const button = getButton(SUBMIT);

      fireEvent.click(button);

      const session = getSession();

      fireEvent.click(button);
      fireEvent.keyDown(getField(), { key: "Enter" });

      expect(getSession()).toEqual(session);
      expect(getSession().phase).toBe("results-calculation");
      expect(getSession().email).toEqual({
        address: "biuro@mypolitics.pl",
        hasConsent: true,
      });
    });
  });

  describe('when "Pomiń" is pressed', () => {
    it("leaves the phase as skipped, and the session holds no e-mail", () => {
      const { getSession } = renderPhase();

      fireEvent.click(getButton(SKIP));

      expect(getSession()).toMatchObject({
        phase: "results-calculation",
        email: null,
        resultState: SurveyResultState.NotSent,
      });
    });

    it("drops text that is not a valid address and a ticked box", () => {
      const { getSession } = renderPhase({
        address: "biuro@mypolitics",
        hasConsent: true,
      });

      fireEvent.click(getButton(SKIP));

      expect(getSession().phase).toBe("results-calculation");
      expect(getSession().email).toBeNull();
    });

    it("leaves once when pressed twice", () => {
      const { getSession } = renderPhase();
      const button = getButton(SKIP);

      fireEvent.click(button);

      const session = getSession();

      fireEvent.click(button);

      expect(getSession()).toBe(session);
    });
  });

  describe("when Enter is pressed with text that is not a valid address", () => {
    it("stays in the phase and keeps what was typed", () => {
      const { getSession } = renderPhase({
        address: "biuro@mypolitics",
        hasConsent: true,
      });

      fireEvent.keyDown(getField(), { key: "Enter" });

      expect(getSession().phase).toBe("email-capture");
      expect(getSession().email).toEqual({
        address: "biuro@mypolitics",
        hasConsent: true,
      });
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("when the taker goes back and comes forward again", () => {
    it("shows the same text and the same tick", () => {
      const { getSession, unmount, survey } = renderPhase();

      type("biuro@mypolitics.pl");
      fireEvent.click(getBox());
      unmount();

      const leftSession = getSession();

      // Back leads to demographics and keeps what the session holds; coming
      // forward again draws the card from that very session.
      const { getSession: getSessionAgain } = renderPhaseContent(
        SurveyQuestionnaireEmailCapture,
        survey,
        { ...leftSession, phase: "email-capture" },
      );

      expect(getField()).toHaveValue("biuro@mypolitics.pl");
      expect(getBox()).toBeChecked();
      expect(getButton(SUBMIT)).toBeEnabled();
      expect(getSessionAgain().email).toEqual({
        address: "biuro@mypolitics.pl",
        hasConsent: true,
      });
    });
  });

  it("links the privacy page of the app", () => {
    renderPhase();

    const link = screen.getByRole("link", { name: "Polityka prywatności." });

    expect(link).toHaveAttribute("href", "/privacy");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("makes no request", () => {
    const adapter = vi.fn();
    const defaultAdapter = apiClient.defaults.adapter;
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    apiClient.defaults.adapter = adapter;

    const { lock, onLeave } = renderPhase();

    type("biuro@mypolitics.pl");
    fireEvent.click(getBox());
    fireEvent.click(getButton(SUBMIT));

    apiClient.defaults.adapter = defaultAdapter;

    expect(adapter).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(onLeave).not.toHaveBeenCalled();
    expect(lock).not.toHaveBeenCalled();
  });
});
