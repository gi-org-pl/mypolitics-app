import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithI18n } from "@/utils/vitest/renderWithI18n";

import { ModuleWrapper } from "./ModuleWrapper";

const LONG_TITLE =
  "Oś gospodarcza z bardzo długą nazwą autorską, która nie mieści się w nagłówku karty";

describe("<ModuleWrapper />", () => {
  describe("given a text title", () => {
    it("renders the title as a heading", () => {
      renderWithI18n(<ModuleWrapper title="Oś gospodarcza" />);

      expect(
        screen.getByRole("heading", { name: "Oś gospodarcza" }),
      ).toBeInTheDocument();
    });

    it("names the card region after the title", () => {
      renderWithI18n(
        <ModuleWrapper title="Oś gospodarcza" ariaLabel="Inna nazwa" />,
      );

      expect(
        screen.getByRole("region", { name: "Oś gospodarcza" }),
      ).toBeInTheDocument();
    });

    it("keeps the full title available when it is truncated", () => {
      renderWithI18n(<ModuleWrapper title={LONG_TITLE} />);

      const heading = screen.getByRole("heading", { name: LONG_TITLE });

      expect(heading).toHaveClass("truncate");
      expect(heading).toHaveTextContent(LONG_TITLE);
    });

    it("collapses line breaks into one line", () => {
      renderWithI18n(
        <ModuleWrapper title={"  Oś\n\ngospodarcza\r\n i społeczna "} />,
      );

      expect(screen.getByRole("heading").textContent).toBe(
        "Oś gospodarcza i społeczna",
      );
      expect(
        screen.getByRole("region", { name: "Oś gospodarcza i społeczna" }),
      ).toBeInTheDocument();
    });

    it("does not make the title interactive", () => {
      const handleStatsClick = vi.fn();
      const handleInfoClick = vi.fn();
      renderWithI18n(
        <ModuleWrapper
          title="Oś gospodarcza"
          onStatsClick={handleStatsClick}
          onInfoClick={handleInfoClick}
        />,
      );

      const heading = screen.getByRole("heading");
      fireEvent.click(heading);

      expect(heading).not.toHaveAttribute("tabindex");
      expect(heading.closest("button, a")).toBeNull();
      expect(handleStatsClick).not.toHaveBeenCalled();
      expect(handleInfoClick).not.toHaveBeenCalled();
    });
  });

  describe("given a component title", () => {
    it("renders the component in place of the title pill", () => {
      renderWithI18n(
        <ModuleWrapper
          title={<button type="button">Lewica liberalna</button>}
        />,
      );

      expect(screen.getByTestId("module-wrapper-title-slot")).toContainElement(
        screen.getByRole("button", { name: "Lewica liberalna" }),
      );
      expect(screen.queryByRole("heading")).toBeNull();
    });

    it("names the card region with ariaLabel", () => {
      renderWithI18n(
        <ModuleWrapper
          title={<span>Lewica liberalna</span>}
          ariaLabel="Diagram Nolana"
        />,
      );

      expect(
        screen.getByRole("region", { name: "Diagram Nolana" }),
      ).toBeInTheDocument();
    });

    it("names each button with ariaLabel", () => {
      renderWithI18n(
        <ModuleWrapper
          title={<span>Lewica liberalna</span>}
          ariaLabel="Diagram Nolana"
          onStatsClick={vi.fn()}
          onInfoClick={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: "Statystyki: Diagram Nolana" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Informacje: Diagram Nolana" }),
      ).toBeInTheDocument();
    });
  });

  describe("given both handlers", () => {
    const renderWithBothHandlers = () => {
      const handleStatsClick = vi.fn();
      const handleInfoClick = vi.fn();
      renderWithI18n(
        <ModuleWrapper
          title="Oś gospodarcza"
          onStatsClick={handleStatsClick}
          onInfoClick={handleInfoClick}
        >
          <p>Wynik</p>
        </ModuleWrapper>,
      );

      return { handleStatsClick, handleInfoClick };
    };

    it("renders the statistics button before the info button", () => {
      renderWithBothHandlers();

      const [statsButton, infoButton, ...rest] = screen.getAllByRole("button");

      expect(statsButton).toHaveAccessibleName("Statystyki: Oś gospodarcza");
      expect(infoButton).toHaveAccessibleName("Informacje: Oś gospodarcza");
      expect(rest).toHaveLength(0);
    });

    it("names each button with the module name", () => {
      renderWithBothHandlers();

      expect(
        screen.getByRole("button", { name: "Statystyki: Oś gospodarcza" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Informacje: Oś gospodarcza" }),
      ).toBeInTheDocument();
    });

    describe("when the statistics button is pressed", () => {
      it("calls onStatsClick once", () => {
        const { handleStatsClick, handleInfoClick } = renderWithBothHandlers();

        fireEvent.click(screen.getByRole("button", { name: /^Statystyki/ }));

        expect(handleStatsClick).toHaveBeenCalledTimes(1);
        expect(handleStatsClick).toHaveBeenCalledWith();
        expect(handleInfoClick).not.toHaveBeenCalled();
      });
    });

    describe("when the info button is pressed", () => {
      it("calls onInfoClick once", () => {
        const { handleStatsClick, handleInfoClick } = renderWithBothHandlers();

        fireEvent.click(screen.getByRole("button", { name: /^Informacje/ }));

        expect(handleInfoClick).toHaveBeenCalledTimes(1);
        expect(handleInfoClick).toHaveBeenCalledWith();
        expect(handleStatsClick).not.toHaveBeenCalled();
      });
    });

    it("reaches both buttons with the keyboard, statistics first", () => {
      renderWithBothHandlers();

      const statsButton = screen.getByRole("button", { name: /^Statystyki/ });
      const infoButton = screen.getByRole("button", { name: /^Informacje/ });
      const body = screen.getByText("Wynik");

      for (const button of [statsButton, infoButton]) {
        expect(button.tagName).toBe("BUTTON");
        expect(button).toBeEnabled();
        expect(button).not.toHaveAttribute("tabindex");

        button.focus();
        expect(button).toHaveFocus();
      }
      expect(
        statsButton.compareDocumentPosition(infoButton) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(
        infoButton.compareDocumentPosition(body) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("given only onStatsClick", () => {
    it("renders the statistics button and no info button", () => {
      renderWithI18n(
        <ModuleWrapper title="Oś gospodarcza" onStatsClick={vi.fn()} />,
      );

      expect(
        screen.getByRole("button", { name: "Statystyki: Oś gospodarcza" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });

  describe("given only onInfoClick", () => {
    it("renders the info button and no statistics button", () => {
      renderWithI18n(
        <ModuleWrapper title="Oś gospodarcza" onInfoClick={vi.fn()} />,
      );

      expect(
        screen.getByRole("button", { name: "Informacje: Oś gospodarcza" }),
      ).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(1);
    });
  });

  describe("given no handlers", () => {
    it("renders no buttons", () => {
      renderWithI18n(<ModuleWrapper title="Oś gospodarcza" />);

      expect(screen.queryByRole("button")).toBeNull();
    });
  });

  describe("given no title", () => {
    it.each([
      ["a missing title", undefined],
      ["a null title", null],
      ["a boolean title", false],
      ["an empty title", ""],
      ["a whitespace title", " \n\t "],
    ])("treats %s as no title", (_case, title) => {
      renderWithI18n(
        <ModuleWrapper title={title}>
          <p>Wynik</p>
        </ModuleWrapper>,
      );

      expect(screen.queryByRole("heading")).toBeNull();
      expect(screen.queryByTestId("module-wrapper-title-slot")).toBeNull();
      expect(screen.queryByRole("region")).toBeNull();
    });

    it("renders no header and no divider when there are no actions either", () => {
      const { container } = renderWithI18n(
        <ModuleWrapper>
          <p>Wynik</p>
        </ModuleWrapper>,
      );

      expect(screen.queryByRole("separator")).toBeNull();
      expect(container.querySelector("section")?.children).toHaveLength(1);
      expect(screen.getByText("Wynik")).toBeInTheDocument();
    });

    it("renders the header with the actions when there are actions", () => {
      renderWithI18n(
        <ModuleWrapper title="  " onStatsClick={vi.fn()} onInfoClick={vi.fn()}>
          <p>Wynik</p>
        </ModuleWrapper>,
      );

      expect(screen.getAllByRole("button")).toHaveLength(2);
      expect(screen.getByRole("separator")).toBeInTheDocument();
      expect(screen.queryByRole("heading")).toBeNull();
    });

    it("names the buttons without a module name", () => {
      renderWithI18n(
        <ModuleWrapper onStatsClick={vi.fn()} onInfoClick={vi.fn()} />,
      );

      expect(
        screen.getByRole("button", { name: "Statystyki" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Informacje" }),
      ).toBeInTheDocument();
    });

    it("names the card and the buttons with ariaLabel when it is passed", () => {
      renderWithI18n(
        <ModuleWrapper ariaLabel="Diagram Nolana" onStatsClick={vi.fn()} />,
      );

      expect(
        screen.getByRole("region", { name: "Diagram Nolana" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Statystyki: Diagram Nolana" }),
      ).toBeInTheDocument();
    });
  });

  describe("given a body", () => {
    it("renders the children under the divider", () => {
      renderWithI18n(
        <ModuleWrapper title="Oś gospodarcza">
          <p>Wynik</p>
        </ModuleWrapper>,
      );

      const divider = screen.getByRole("separator");
      const body = screen.getByText("Wynik");

      expect(
        divider.compareDocumentPosition(body) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });
  });

  describe("given no body", () => {
    it.each([
      ["a missing body", undefined],
      ["a null body", null],
      ["a boolean body", false],
      ["an empty body", ""],
    ])("renders the header without the divider for %s", (_case, body) => {
      const { container } = renderWithI18n(
        <ModuleWrapper title="Oś gospodarcza" onStatsClick={vi.fn()}>
          {body}
        </ModuleWrapper>,
      );

      expect(screen.getByRole("heading")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.queryByRole("separator")).toBeNull();
      expect(container.querySelector("section")?.children).toHaveLength(1);
    });
  });

  describe("given nothing at all", () => {
    it("renders an empty card without throwing", () => {
      const { container } = renderWithI18n(<ModuleWrapper />);

      const card = container.querySelector("section");

      expect(card).toBeInTheDocument();
      expect(card).toBeEmptyDOMElement();
    });
  });
});
