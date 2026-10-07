import { useState } from "react";

// Remembers which logo address failed to load. The failure belongs to that
// address: a new address starts as not failed without an effect to reset it.
export const useLogoFailure = (url: string) => {
  const [failedUrl, setFailedUrl] = useState<string>();

  return {
    hasFailed: failedUrl === url,
    markFailed: () => setFailedUrl(url),
  };
};
