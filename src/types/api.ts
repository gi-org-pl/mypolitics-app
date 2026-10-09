export interface ApiRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number; // a shorter limit than API_TIMEOUT_MS; a longer one is cut to it
}

// An enum, written as a constant with a type of the same name: the `enum`
// keyword is ruled out by `erasableSyntaxOnly` in tsconfig. Used the same
// way - `ApiFailureKind.Http` as a value, `ApiFailureKind` as a type.
export const ApiFailureKind = {
  Http: "http", // a reply with a status outside 2xx
  Network: "network", // no connection
  Timeout: "timeout", // no reply in time
  Aborted: "aborted", // the request was cancelled
} as const;

export type ApiFailureKind =
  (typeof ApiFailureKind)[keyof typeof ApiFailureKind];

export type ApiFailure =
  | { kind: typeof ApiFailureKind.Http; status: number }
  | { kind: typeof ApiFailureKind.Network }
  | { kind: typeof ApiFailureKind.Timeout }
  | { kind: typeof ApiFailureKind.Aborted };
