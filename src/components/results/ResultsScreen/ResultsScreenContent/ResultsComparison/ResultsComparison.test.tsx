import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getResult } from "@/services/api/client/getResult";
import { type ResultLoadResult, ResultLoadStatus } from "@/types/survey";
import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ResultsComparison } from "./ResultsComparison";
import {
  FRIEND_ID,
  moduleFriendResult,
  moduleTaker,
  TAKER_ID,
} from "./ResultsComparison.fixtures";
import type { ResultsComparisonProps } from "./ResultsComparison.types";

vi.mock("@/services/api/client/getResult");

const getResultMock = vi.mocked(getResult);

const FRIEND_FIELD = "Identyfikator wyników znajomego";
const READY: ResultLoadResult = {
  status: ResultLoadStatus.Ready,
  result: moduleFriendResult,
};

const renderComparison = (props: Partial<ResultsComparisonProps> = {}) =>
  renderWithI18n(<ResultsComparison {...moduleTaker} {...props} />);

const getTab = (name: string) => screen.getByRole("tab", { name });
const getField = () => screen.getByRole("textbox", { name: FRIEND_FIELD });
const queryBar = () => screen.queryByRole("region", { name: "Zgodność" });
const queryQuestions = () => screen.queryByRole("list", { name: "Pytania" });
const getQuestionRows = () =>
  within(queryQuestions() as HTMLElement).getAllByRole("button");

const enterId = (text: string) =>
  fireEvent.change(getField(), { target: { value: text } });

const pick = (name: string) => {
  fireEvent.click(getTab("Z orientacją"));
  fireEvent.click(screen.getByRole("button", { name }));
};

const compareWithFriend = async () => {
  enterId(FRIEND_ID);
  await waitFor(() => expect(queryBar()).toBeInTheDocument());
};

// A read that ends when the test says so.
const deferRead = () => {
  let resolve: (load: ResultLoadResult) => void = () => undefined;

  getResultMock.mockReturnValueOnce(
    new Promise((done) => {
      resolve = done;
    }),
  );

  return (load: ResultLoadResult) => act(async () => resolve(load));
};

describe("<ResultsComparison />", () => {
  beforeEach(() => {
    getResultMock.mockReset();
    getResultMock.mockResolvedValue(READY);
  });

  describe("choosing the other side", () => {
    describe("when the tab is opened and no comparison runs", () => {
      it("shows the mode selector: two modes, the friend first and chosen", () => {
        renderComparison();

        expect(
          screen.getAllByRole("tab").map((tab) => tab.textContent),
        ).toEqual(["Ze znajomym", "Z orientacją"]);
        expect(getTab("Ze znajomym")).toHaveAttribute("aria-selected", "true");
        expect(queryBar()).not.toBeInTheDocument();
        expect(getResultMock).not.toHaveBeenCalled();
      });
    });

    describe("given the friend mode", () => {
      it("shows the identifier of the taker with a copy control, and a field for the friend's", () => {
        renderComparison();

        expect(screen.getByText(TAKER_ID)).toBeVisible();
        expect(
          screen.getByRole("button", { name: "Skopiuj identyfikator" }),
        ).toBeEnabled();
        expect(getField()).toHaveValue("");
      });
    });

    describe("when an identifier of a friend is entered and it is one in form", () => {
      it("asks for the result of the friend, once, and says it is on the way", async () => {
        const finish = deferRead();

        renderComparison();
        enterId(FRIEND_ID);

        expect(getResultMock).toHaveBeenCalledExactlyOnceWith(FRIEND_ID, {
          signal: expect.any(AbortSignal),
        });
        expect(screen.getByText("Wczytujemy wynik…")).toBeVisible();
        expect(getField()).toHaveAttribute("readonly");

        await finish(READY);

        expect(getResultMock).toHaveBeenCalledTimes(1);
      });

      it("trims the space around it", () => {
        deferRead();
        renderComparison();

        enterId(`  ${FRIEND_ID}  `);

        expect(getResultMock).toHaveBeenCalledWith(
          FRIEND_ID,
          expect.anything(),
        );
      });
    });

    describe("when the result of the friend is calculated and of the same survey", () => {
      it("starts the comparison", async () => {
        renderComparison();

        await compareWithFriend();

        expect(queryBar()).toBeVisible();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
      });
    });

    describe("when it is the identifier of the taker", () => {
      it("refuses it with a line saying so, and asks for nothing", () => {
        renderComparison();

        enterId(TAKER_ID);

        expect(screen.getByText("To jest Twój identyfikator.")).toBeVisible();
        expect(getResultMock).not.toHaveBeenCalled();
        expect(queryBar()).not.toBeInTheDocument();
      });
    });

    describe("when the result belongs to another survey", () => {
      it("refuses it with a line saying so", async () => {
        getResultMock.mockResolvedValue({
          status: ResultLoadStatus.Ready,
          result: { ...moduleFriendResult, surveyId: "another" },
        });
        renderComparison();

        enterId(FRIEND_ID);

        expect(
          await screen.findByText("Ten wynik pochodzi z innego quizu."),
        ).toBeVisible();
        expect(queryBar()).not.toBeInTheDocument();
      });
    });

    describe("when the result does not exist, is not calculated, or cannot be read", () => {
      it.each([
        ["does not exist", { status: ResultLoadStatus.NotFound }],
        ["cannot be read", { status: ResultLoadStatus.Failed }],
        [
          "is not calculated",
          {
            status: ResultLoadStatus.Ready,
            result: { ...moduleFriendResult, isCalculated: false },
          },
        ],
      ] as [
        string,
        ResultLoadResult,
      ][])("refuses it with a line saying so: it %s", async (_, load) => {
        getResultMock.mockResolvedValue(load);
        renderComparison();

        enterId(FRIEND_ID);

        expect(
          await screen.findByText("Nie znaleźliśmy takiego wyniku."),
        ).toBeVisible();
        expect(queryBar()).not.toBeInTheDocument();
        expect(getField()).toHaveValue(FRIEND_ID);
      });

      it("lets another identifier be entered", async () => {
        getResultMock.mockResolvedValueOnce({
          status: ResultLoadStatus.NotFound,
        });
        renderComparison();

        enterId("0b9f3c1e-5a7d-4e2b-9c41-7f6a2d8e1b35");
        await screen.findByText("Nie znaleźliśmy takiego wyniku.");

        await compareWithFriend();

        expect(getResultMock).toHaveBeenCalledTimes(2);
      });
    });

    describe("when another mode is chosen after a refusal, and then the friend mode again", () => {
      it("shows an empty field with the hint: the refused identifier is not kept as if it were fine", () => {
        renderComparison();

        enterId(TAKER_ID);
        fireEvent.click(getTab("Z orientacją"));
        fireEvent.click(getTab("Ze znajomym"));

        expect(getField()).toHaveValue("");
        expect(getField()).toBeValid();
        expect(
          screen.queryByText("To jest Twój identyfikator."),
        ).not.toBeInTheDocument();
        expect(screen.getByText(/^Wymień się identyfikatorami/)).toBeVisible();
      });

      it("asks for the result again when the same identifier is entered again", async () => {
        getResultMock.mockResolvedValueOnce({
          status: ResultLoadStatus.Failed,
        });
        renderComparison();

        enterId(FRIEND_ID);
        await screen.findByText("Nie znaleźliśmy takiego wyniku.");
        fireEvent.click(getTab("Z orientacją"));
        fireEvent.click(getTab("Ze znajomym"));
        await compareWithFriend();

        expect(getResultMock).toHaveBeenCalledTimes(2);
      });
    });

    describe("when the text is not an identifier in form", () => {
      it("makes no request, and the field says it is not an identifier", () => {
        renderComparison();

        enterId("5218cde2-beac");

        expect(
          screen.getByText("To nie jest identyfikator wyników."),
        ).toBeVisible();
        expect(getField()).toBeInvalid();
        expect(getResultMock).not.toHaveBeenCalled();
      });
    });

    describe("given the orientation mode", () => {
      // The header of the quiz is pointed at the two identities, so they are what
      // a result is compared with: no ideology and no trait is offered.
      it("shows a search field and the offered orientations as a list, in the order of the quiz", () => {
        renderComparison();

        fireEvent.click(getTab("Z orientacją"));

        expect(
          screen.getByRole("searchbox", { name: "Szukaj po nazwie" }),
        ).toBeVisible();
        expect(
          screen.getAllByRole("listitem").map((item) => item.textContent),
        ).toEqual(["Socjalista", "Liberał"]);
      });

      it("offers no hidden orientation, none that no answer lists, and none the header is not pointed at", () => {
        renderComparison();

        fireEvent.click(getTab("Z orientacją"));

        for (const name of [
          "Anarchista",
          "Ukryta",
          "Lewica",
          "Zieloni",
          "Wolny rynek",
          "Odwaga",
        ]) {
          expect(
            screen.queryByRole("button", { name }),
          ).not.toBeInTheDocument();
        }
      });

      it("narrows the list by name, ignoring case", () => {
        renderComparison();

        fireEvent.click(getTab("Z orientacją"));
        fireEvent.change(screen.getByRole("searchbox"), {
          target: { value: "LIB" },
        });

        expect(
          screen.getAllByRole("listitem").map((item) => item.textContent),
        ).toEqual(["Liberał"]);
      });
    });

    describe("when an orientation is picked", () => {
      it("starts the comparison, and asks for nothing", () => {
        renderComparison();

        pick("Liberał");

        expect(queryBar()).toBeVisible();
        expect(getResultMock).not.toHaveBeenCalled();
      });
    });

    describe("given a quiz that offers no orientation", () => {
      it("does not offer the orientation mode", () => {
        renderComparison({
          survey: { ...moduleTaker.survey, orientations: [] },
        });

        expect(screen.queryByRole("tab")).not.toBeInTheDocument();
        expect(getField()).toBeVisible();
      });
    });
  });

  describe("while a comparison runs", () => {
    describe("given a comparison with a friend", () => {
      it("shows the agreement bar on top: the friend by the word for one, the score in words, and the control that ends it", async () => {
        renderComparison();

        await compareWithFriend();

        const bar = within(queryBar() as HTMLElement);

        expect(bar.getByText("Znajomy")).toBeVisible();
        // The two chose the same answer of one question of the four both
        // answered.
        expect(
          bar.getByRole("img", { name: "Znajomy: 25%" }),
        ).toBeInTheDocument();
        expect(
          bar.getByRole("button", { name: "Cofnij porównanie" }),
        ).toBeEnabled();
      });

      it("shows two views under the bar, the results first: the switch, and the results view", async () => {
        renderComparison();

        await compareWithFriend();

        expect(
          screen.getAllByRole("tab").map((tab) => tab.textContent),
        ).toEqual(["Wyniki", "Pytania"]);
        expect(getTab("Wyniki")).toHaveAttribute("aria-selected", "true");
        expect(screen.getAllByRole("region")[0]).toBe(queryBar());
        expect(screen.getAllByRole("region")).toHaveLength(
          moduleTaker.resolved.modules.length + 1,
        );
        expect(queryQuestions()).not.toBeInTheDocument();
      });

      it("shows the questions of the quiz with the answers of both, when that view is chosen", async () => {
        renderComparison();

        await compareWithFriend();
        fireEvent.click(getTab("Pytania"));

        expect(getTab("Pytania")).toHaveAttribute("aria-selected", "true");
        expect(
          within(queryQuestions() as HTMLElement).getAllByRole("listitem"),
        ).toHaveLength(moduleTaker.survey.questions.length);
        expect(screen.getAllByRole("region")).toEqual([queryBar()]);

        fireEvent.click(getQuestionRows()[0]);

        expect(screen.getByRole("group", { name: "Znajomy" })).toBeVisible();
        expect(screen.getByRole("group", { name: "Ty" })).toBeVisible();
      });

      it("shows the results again when that view is chosen back", async () => {
        renderComparison();

        await compareWithFriend();
        fireEvent.click(getTab("Pytania"));
        fireEvent.click(getTab("Wyniki"));

        expect(queryQuestions()).not.toBeInTheDocument();
        expect(screen.getAllByRole("region")).toHaveLength(
          moduleTaker.resolved.modules.length + 1,
        );
      });

      it("draws every module of the taker with the friend laid over it", async () => {
        renderComparison();

        await compareWithFriend();

        expect(
          screen.getByRole("img", {
            name: "Ekologia: 100%, porównanie z Znajomy: 100%",
          }),
        ).toBeInTheDocument();
        expect(
          screen.getAllByRole("img", { name: /porównanie z Znajomy/ }).length,
        ).toBeGreaterThan(4);
      });
    });

    describe("given a comparison with an orientation", () => {
      it("shows the agreement bar with the name of the orientation and the score", () => {
        renderComparison();

        pick("Liberał");

        const bar = within(queryBar() as HTMLElement);

        // Four questions have an answer that lists the liberal, and the taker
        // chose that answer in one of them, q4.
        expect(
          bar.getByRole("img", { name: "Liberał: 25%" }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("ranked-row-name")).toHaveTextContent(
          "Zgodność — Liberał",
        );
      });

      it("shows the questions only, with no choice of view, and no module", () => {
        renderComparison();

        pick("Liberał");

        expect(screen.getAllByRole("region")).toEqual([queryBar()]);
        expect(screen.queryByRole("tab")).not.toBeInTheDocument();
        expect(
          within(queryQuestions() as HTMLElement).getAllByRole("listitem"),
        ).toHaveLength(moduleTaker.survey.questions.length);
      });

      it("shows the answers the orientation stands for beside the answer of the taker, when a question is opened", () => {
        renderComparison();

        pick("Liberał");
        fireEvent.click(getQuestionRows()[0]);

        expect(screen.getByRole("group", { name: "Liberał" })).toBeVisible();
        expect(screen.getByRole("group", { name: "Ty" })).toBeVisible();
      });
    });

    describe("given a comparison with no score", () => {
      it("draws the bar without a value", () => {
        renderComparison({
          result: { ...moduleTaker.result, answers: [] },
        });

        pick("Liberał");

        expect(
          within(queryBar() as HTMLElement).getByRole("img", {
            name: "Brak wyniku",
          }),
        ).toBeInTheDocument();
      });
    });

    describe("when the comparison is ended", () => {
      it("shows the mode selector again, with the mode last used", () => {
        renderComparison();

        pick("Liberał");
        fireEvent.click(
          screen.getByRole("button", { name: "Cofnij porównanie" }),
        );

        expect(queryBar()).not.toBeInTheDocument();
        expect(getTab("Z orientacją")).toHaveAttribute("aria-selected", "true");
        expect(screen.getByRole("searchbox")).toBeVisible();
      });

      it("keeps nothing of a friend: the field is empty", async () => {
        renderComparison();

        await compareWithFriend();
        fireEvent.click(
          screen.getByRole("button", { name: "Cofnij porównanie" }),
        );

        expect(getTab("Ze znajomym")).toHaveAttribute("aria-selected", "true");
        expect(getField()).toHaveValue("");
      });

      it("lets another comparison be started, which is the only one that runs", async () => {
        renderComparison();

        pick("Liberał");
        fireEvent.click(
          screen.getByRole("button", { name: "Cofnij porównanie" }),
        );
        fireEvent.click(getTab("Ze znajomym"));
        await compareWithFriend();

        expect(
          screen.getAllByRole("region", { name: "Zgodność" }),
        ).toHaveLength(1);
        expect(
          within(queryBar() as HTMLElement).getByTestId("ranked-row-name"),
        ).toHaveTextContent("Zgodność — Znajomy");
      });
    });
  });

  describe("when the content of the tab is replaced", () => {
    it("moves the focus to the new content, so it is not lost with the control that had it", async () => {
      const { container } = renderComparison();

      getField().focus();
      await compareWithFriend();

      expect(container.firstElementChild).toHaveFocus();

      fireEvent.click(
        screen.getByRole("button", { name: "Cofnij porównanie" }),
      );

      expect(container.firstElementChild).toHaveFocus();
    });

    it("leaves the focus alone when the tab is first drawn", () => {
      const { container } = renderComparison();

      expect(container.firstElementChild).not.toHaveFocus();
    });
  });

  describe("nothing about the friend", () => {
    it("is stored or put in the address", async () => {
      const address = window.location.href;

      renderComparison();
      await compareWithFriend();

      expect(window.localStorage).toHaveLength(0);
      expect(window.sessionStorage).toHaveLength(0);
      expect(window.location.href).toBe(address);
      expect(document.body).not.toHaveTextContent(FRIEND_ID);
    });
  });
});
