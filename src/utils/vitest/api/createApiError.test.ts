import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";

import { createApiError } from "./createApiError";

describe("createApiError()", () => {
  describe("when the request is made", () => {
    it("rejects with an Axios error of the given code and no reply", async () => {
      const error: unknown = await createApiError(AxiosError.ERR_NETWORK)({
        headers: new AxiosHeaders(),
      }).catch((reason: unknown) => reason);

      expect(error).toBeInstanceOf(AxiosError);
      expect(error).toMatchObject({ code: "ERR_NETWORK" });
      expect(error).not.toHaveProperty("response.status");
    });
  });
});
