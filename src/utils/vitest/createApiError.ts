import { type AxiosAdapter, AxiosError } from "axios";

// An adapter for a test: the request gets no reply and fails with this code
// of Axios, such as AxiosError.ERR_NETWORK or AxiosError.ETIMEDOUT.
export const createApiError =
  (code: string): AxiosAdapter =>
  async (config) => {
    throw new AxiosError(code, code, config, {});
  };
