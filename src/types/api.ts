export interface ApiRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number; // default API_TIMEOUT_MS
}

export type ApiFailure =
  | { kind: "http"; status: number }
  | { kind: "network" }
  | { kind: "timeout" }
  | { kind: "aborted" };
