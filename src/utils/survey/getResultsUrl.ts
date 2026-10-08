import { RESULTS_URL } from "@/constants/survey";

export const getResultsUrl = (sessionId: string): string =>
  `${RESULTS_URL}/${encodeURIComponent(sessionId)}`;
