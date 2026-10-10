// @vitest-environment node
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";

import { type AxiosAdapter, AxiosError } from "axios";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { API_TIMEOUT_MS, DEFAULT_API_URL } from "@/constants/api";
import { toApiFailure } from "@/services/api/utils/error/toApiFailure";
import { ApiFailureKind } from "@/types/api";
import { createApiError } from "@/utils/vitest/createApiError";
import { createApiReply } from "@/utils/vitest/createApiReply";

import { apiClient } from "./apiClient";

const loadApiClient = async (apiUrl?: string): Promise<typeof apiClient> => {
  vi.resetModules();
  vi.stubEnv("VITE_API_URL", apiUrl);

  return (await import("./apiClient")).apiClient;
};

const listen = (server: Server): Promise<string> =>
  new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;

      resolve(`http://127.0.0.1:${port}`);
    });
  });

const close = (server: Server): Promise<void> =>
  new Promise((resolve) => {
    server.closeAllConnections();
    server.close(() => resolve());
  });

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("given no VITE_API_URL", () => {
    it("uses the default address", async () => {
      expect((await loadApiClient(undefined)).defaults.baseURL).toBe(
        DEFAULT_API_URL,
      );
    });

    it("uses the default address when the setting is empty or blank", async () => {
      expect((await loadApiClient("")).defaults.baseURL).toBe(DEFAULT_API_URL);
      expect((await loadApiClient("  ")).defaults.baseURL).toBe(
        DEFAULT_API_URL,
      );
    });
  });

  describe("given VITE_API_URL", () => {
    it("uses it", async () => {
      expect(
        (await loadApiClient("https://api.example.test/api")).defaults.baseURL,
      ).toBe("https://api.example.test/api");
    });

    it("uses it without the space around it", async () => {
      expect(
        (await loadApiClient("  https://api.example.test/api  ")).defaults
          .baseURL,
      ).toBe("https://api.example.test/api");
    });

    it("sends a request to it", async () => {
      const client = await loadApiClient("https://api.example.test/api");
      const adapter = vi.fn<AxiosAdapter>(createApiReply(200));

      await client.get("/v1/survey/a", { adapter });

      expect(adapter.mock.calls[0][0]).toMatchObject({
        baseURL: "https://api.example.test/api",
        url: "/v1/survey/a",
      });
    });
  });

  describe("given a time limit", () => {
    it("gives up after API_TIMEOUT_MS", async () => {
      const adapter = vi.fn<AxiosAdapter>(createApiReply(200));

      await apiClient.get("/v1/survey/a", { adapter });

      expect(API_TIMEOUT_MS).toBe(30_000);
      expect(apiClient.defaults.timeout).toBe(API_TIMEOUT_MS);
      expect(adapter.mock.calls[0][0].timeout).toBe(API_TIMEOUT_MS);
    });

    it("gives up sooner when a request asks for a shorter limit", async () => {
      const adapter = vi.fn<AxiosAdapter>(createApiReply(200));

      await apiClient.get("/v1/survey/a", { adapter, timeout: 5000 });

      expect(adapter.mock.calls[0][0].timeout).toBe(5000);
    });
  });

  describe("given a request that fails", () => {
    it("rejects with the failure of the API and nothing of the request", async () => {
      await expect(
        apiClient.post(
          "/v1/result",
          { sessionId: "3f0c2a52" },
          { adapter: createApiReply(422, { message: "Invalid" }) },
        ),
      ).rejects.toStrictEqual({ kind: ApiFailureKind.Http, status: 422 });
      await expect(
        apiClient.get("/v1/survey/a", {
          adapter: createApiError(AxiosError.ERR_NETWORK),
        }),
      ).rejects.toStrictEqual({ kind: ApiFailureKind.Network });
      await expect(
        apiClient.get("/v1/survey/a", {
          adapter: createApiError(AxiosError.ETIMEDOUT),
        }),
      ).rejects.toStrictEqual({ kind: ApiFailureKind.Timeout });
    });

    it("sends nothing when the signal was aborted before the request, and rejects with what reads as aborted", async () => {
      const adapter = vi.fn<AxiosAdapter>(createApiReply(200));

      const error: unknown = await apiClient
        .get("/v1/survey/a", { adapter, signal: AbortSignal.abort() })
        .catch((reason: unknown) => reason);

      expect(adapter).not.toHaveBeenCalled();
      expect(toApiFailure(error)).toStrictEqual({
        kind: ApiFailureKind.Aborted,
      });
    });
  });

  describe("given a request that succeeds", () => {
    it("resolves with the reply", async () => {
      await expect(
        apiClient.get("/v1/survey/a", {
          adapter: createApiReply(200, { title: "Quiz" }),
        }),
      ).resolves.toMatchObject({ status: 200, data: { title: "Quiz" } });
    });
  });

  describe("against a server", () => {
    let server: Server;
    let baseURL: string;

    beforeAll(async () => {
      server = createServer((request, response) => {
        if (request.url === "/silent") return;

        const isFound = request.url === "/found";

        response.writeHead(isFound ? 200 : 404, {
          "Content-Type": "application/json",
        });
        response.end(JSON.stringify({ isFound }));
      });
      baseURL = await listen(server);
    });

    afterAll(async () => {
      await close(server);
    });

    it("resolves with a reply whose status is 2xx", async () => {
      await expect(apiClient.get("/found", { baseURL })).resolves.toMatchObject(
        { status: 200, data: { isFound: true } },
      );
    });

    it("rejects a reply with a status outside 2xx as http with that status", async () => {
      await expect(
        apiClient.get("/missing", { baseURL }),
      ).rejects.toStrictEqual({ kind: ApiFailureKind.Http, status: 404 });
    });

    it("rejects a request with no reply in time as timeout", async () => {
      await expect(
        apiClient.get("/silent", { baseURL, timeout: 50 }),
      ).rejects.toStrictEqual({ kind: ApiFailureKind.Timeout });
    });

    it("rejects a request with no connection as network", async () => {
      const closedServer = createServer();
      const closedUrl = await listen(closedServer);

      await close(closedServer);

      await expect(
        apiClient.get("/found", { baseURL: closedUrl }),
      ).rejects.toStrictEqual({ kind: ApiFailureKind.Network });
    });

    it("rejects a request cancelled on its way as aborted", async () => {
      const controller = new AbortController();
      const request = apiClient.get("/silent", {
        baseURL,
        signal: controller.signal,
      });

      controller.abort();

      await expect(request).rejects.toStrictEqual({
        kind: ApiFailureKind.Aborted,
      });
    });
  });
});
