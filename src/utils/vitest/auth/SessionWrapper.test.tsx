import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useAuthSession } from "@/utils/auth/useAuthSession";

import { createSessionValue } from "./createSessionValue";
import { SessionWrapper } from "./SessionWrapper";

const SessionStatus = () => <p>{useAuthSession().session.status}</p>;

describe("SessionWrapper()", () => {
  describe("given a session value", () => {
    it("gives it to what is rendered inside", () => {
      render(<SessionStatus />, {
        wrapper: SessionWrapper(createSessionValue()),
      });

      expect(screen.getByText("signed-out")).toBeInTheDocument();
    });
  });
});
