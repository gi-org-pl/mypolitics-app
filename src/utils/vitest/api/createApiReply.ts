import { type AxiosAdapter, AxiosError, type AxiosResponse } from "axios";

// An adapter for a test: the API answers with this status and body. Like the
// adapters of Axios, it rejects a status the request does not accept.
export const createApiReply =
  (status: number, data?: unknown): AxiosAdapter =>
  async (config) => {
    const response: AxiosResponse = {
      data,
      status,
      statusText: "",
      headers: {},
      config,
    };

    if (config.validateStatus?.(status) ?? true) return response;

    throw new AxiosError(
      `Request failed with status code ${status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      {},
      response,
    );
  };
