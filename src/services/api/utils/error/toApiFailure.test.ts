import { AxiosError, AxiosHeaders, CanceledError } from "axios";
import { describe, expect, it } from "vitest";

import { ApiFailureKind } from "@/types/api";

import { toApiFailure } from "./toApiFailure";

const config = { headers: new AxiosHeaders() };

const createReplyError = (status: number): AxiosError =>
  new AxiosError(
    "Request failed",
    AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    {
      data: { message: "Refused" },
      status,
      statusText: "",
      headers: {},
      config,
    },
  );

describe("toApiFailure()", () => {
  describe("given a reply with a status", () => {
    it.each([
      400, 404, 409, 422, 500, 503,
    ])("reads a reply with a status as http with that status: %i", (status) => {
      expect(toApiFailure(createReplyError(status))).toEqual({
        kind: ApiFailureKind.Http,
        status,
      });
    });

    it("carries nothing of the reply but its status", () => {
      expect(Object.keys(toApiFailure(createReplyError(400))).sort()).toEqual([
        "kind",
        "status",
      ]);
    });
  });

  describe("given a request with no reply", () => {
    it("reads a request with no reply as network", () => {
      expect(
        toApiFailure(
          new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, {}),
        ),
      ).toEqual({ kind: ApiFailureKind.Network });
    });

    it("reads a refused connection as network", () => {
      expect(
        toApiFailure(
          new AxiosError("connect ECONNREFUSED", "ECONNREFUSED", config, {}),
        ),
      ).toEqual({ kind: ApiFailureKind.Network });
    });
  });

  describe("given a request that ran out of time", () => {
    it("reads a request that ran out of time as timeout", () => {
      expect(
        toApiFailure(
          new AxiosError(
            "timeout of 30000ms exceeded",
            AxiosError.ETIMEDOUT,
            config,
            {},
          ),
        ),
      ).toEqual({ kind: ApiFailureKind.Timeout });
    });
  });

  describe("given a cancelled request", () => {
    it("reads a cancelled request as aborted", () => {
      expect(toApiFailure(new CanceledError("canceled"))).toEqual({
        kind: ApiFailureKind.Aborted,
      });
    });

    it("reads a request the browser gave up on as aborted", () => {
      expect(
        toApiFailure(
          new AxiosError(
            "Request aborted",
            AxiosError.ECONNABORTED,
            config,
            {},
          ),
        ),
      ).toEqual({ kind: ApiFailureKind.Aborted });
    });
  });

  describe("given anything else", () => {
    it.each([
      [new Error("Unexpected")],
      [new TypeError("Unexpected")],
      ["Network Error"],
      [404],
      [undefined],
      [null],
      [{}],
      [{ kind: "unknown" }],
      [{ kind: ApiFailureKind.Http }],
      [{ response: { status: 404 } }],
    ])("reads anything else as network: %j", (error) => {
      expect(toApiFailure(error)).toEqual({ kind: ApiFailureKind.Network });
    });
  });

  describe("given a failure that was read before", () => {
    it.each([
      [{ kind: ApiFailureKind.Http, status: 404 }],
      [{ kind: ApiFailureKind.Network }],
      [{ kind: ApiFailureKind.Timeout }],
      [{ kind: ApiFailureKind.Aborted }],
    ])("returns it as it is: %j", (failure) => {
      expect(toApiFailure(failure)).toBe(failure);
    });
  });
});
