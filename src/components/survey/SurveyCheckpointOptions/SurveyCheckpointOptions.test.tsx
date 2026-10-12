import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { createOrientation } from "@/utils/vitest/createOrientation";

import { SurveyCheckpointOptions } from "./SurveyCheckpointOptions";

const LABEL = "Do czego jest Tobie bliżej? Zgadnij teraz!";

const interventionism = createOrientation(
  "interventionism",
  "Interwencjonizm",
  { imageUrl: "https://example.com/interventionism.svg", color: "#e74c3c" },
);
const freeMarket = createOrientation("free-market", "Wolny rynek", {
  imageUrl: "https://example.com/free-market.svg",
  color: "#2ecc71",
});
const socialDemocracy = createOrientation(
  "social-democracy",
  "Socjaldemokracja",
  { color: "#9b59b6" },
);

const getGroup = () => screen.getByRole("group", { name: LABEL });

const getRowNames = () =>
  within(getGroup())
    .getAllByRole("button")
    .map((row) => row.textContent);

describe("<SurveyCheckpointOptions />", () => {
  describe("given two options", () => {
    it("renders a group named by the label", () => {
      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={vi.fn()}
        />,
      );

      expect(getGroup()).toBeVisible();
      expect(screen.getAllByRole("group")).toHaveLength(1);
      // The label names the group and is not written out again.
      expect(screen.queryByText(LABEL)).not.toBeInTheDocument();
    });

    it("renders one button per option, in the order given", () => {
      const { unmount } = render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={vi.fn()}
        />,
      );

      expect(getRowNames()).toEqual(["Interwencjonizm", "Wolny rynek"]);

      unmount();
      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[freeMarket, interventionism]}
          onSelect={vi.fn()}
        />,
      );

      expect(getRowNames()).toEqual(["Wolny rynek", "Interwencjonizm"]);
    });

    it("fills the width it is given and stacks the rows", () => {
      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={vi.fn()}
        />,
      );

      expect(getGroup()).toHaveClass(
        "flex",
        "w-full",
        "min-w-0",
        "flex-col",
        "gap-2",
      );
    });

    it("is reached row by row with the Tab key, in the order given", async () => {
      const user = userEvent.setup();

      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={vi.fn()}
        />,
      );

      await user.tab();
      expect(
        screen.getByRole("button", { name: "Interwencjonizm" }),
      ).toHaveFocus();

      await user.tab();
      expect(screen.getByRole("button", { name: "Wolny rynek" })).toHaveFocus();
    });
  });

  describe("given three options", () => {
    it("renders three buttons in the order given", () => {
      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[socialDemocracy, interventionism, freeMarket]}
          onSelect={vi.fn()}
        />,
      );

      expect(getRowNames()).toEqual([
        "Socjaldemokracja",
        "Interwencjonizm",
        "Wolny rynek",
      ]);
    });
  });

  describe("given no options", () => {
    it("renders nothing", () => {
      const { container } = render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[]}
          onSelect={vi.fn()}
        />,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("when a row is activated", () => {
    it("calls onSelect once with the orientation of that row", () => {
      const onSelect = vi.fn();

      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={onSelect}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Wolny rynek" }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(freeMarket);
    });

    it("answers to Enter and to Space", async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const { unmount } = render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={onSelect}
        />,
      );

      await user.tab();
      await user.keyboard("{Enter}");

      expect(onSelect).toHaveBeenLastCalledWith(interventionism);

      unmount();
      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={onSelect}
        />,
      );

      await user.tab();
      await user.tab();
      await user.keyboard(" ");

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenLastCalledWith(freeMarket);
    });
  });

  describe("when a row is activated after one already was", () => {
    it("calls nothing", () => {
      const onSelect = vi.fn();

      render(
        <SurveyCheckpointOptions
          label={LABEL}
          options={[interventionism, freeMarket]}
          onSelect={onSelect}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: "Wolny rynek" }));
      fireEvent.click(screen.getByRole("button", { name: "Wolny rynek" }));
      fireEvent.click(screen.getByRole("button", { name: "Interwencjonizm" }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(freeMarket);
    });
  });

  it("marks no row as chosen, correct or wrong", () => {
    const { container } = render(
      <SurveyCheckpointOptions
        label={LABEL}
        options={[interventionism, freeMarket]}
        onSelect={vi.fn()}
      />,
    );
    const before = container.innerHTML;

    fireEvent.click(screen.getByRole("button", { name: "Wolny rynek" }));

    expect(container.innerHTML).toBe(before);

    for (const row of screen.getAllByRole("button")) {
      expect(row).not.toHaveAttribute("aria-pressed");
      expect(row).not.toHaveAttribute("aria-checked");
      expect(row).not.toBeDisabled();
    }
  });
});
