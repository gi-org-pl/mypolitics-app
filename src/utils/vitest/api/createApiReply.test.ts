import {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { describe, expect, it } from "vitest";

import { createApiReply } from "./createApiReply";

const createConfig = (
  validateStatus?: InternalAxiosRequestConfig["validateStatus"],
): InternalAxiosRequestConfig => ({
  headers: new AxiosHeaders(),
  validateStatus,
});

const acceptSuccess = (status: number): boolean =>
  status >= 200 && status < 300;

describe("createApiReply()", () => {
  describe("given a status the request accepts", () => {
    it("resolves with the status and the body", async () => {
      const config = createConfig(acceptSuccess);

      await expect(
        createApiReply(200, { id: "a" })(config),
      ).resolves.toMatchObject({ status: 200, data: { id: "a" }, config });
    });
  });

  describe("given a status the request does not accept", () => {
    it("rejects with an Axios error that holds the reply", async () => {
      const error: unknown = await createApiReply(404, {
        message: "Not Found",
      })(createConfig(acceptSuccess)).catch((reason: unknown) => reason);

      expect(error).toBeInstanceOf(AxiosError);
      expect(error).toMatchObject({
        response: { status: 404, data: { message: "Not Found" } },
      });
    });
  });

  describe("given a request that accepts every status", () => {
    it("resolves", async () => {
      await expect(createApiReply(500)(createConfig())).resolves.toMatchObject({
        status: 500,
      });
      await expect(
        createApiReply(500)(createConfig(null)),
      ).resolves.toMatchObject({ status: 500 });
    });
  });
});
