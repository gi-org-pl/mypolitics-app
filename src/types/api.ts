export interface ApiRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number; // a shorter limit than API_TIMEOUT_MS; a longer one is cut to it
}

export type ApiFailure =
  | { kind: "http"; status: number }
  | { kind: "network" }
  | { kind: "timeout" }
  | { kind: "aborted" };
