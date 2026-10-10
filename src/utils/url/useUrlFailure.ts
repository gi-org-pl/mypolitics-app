import { useState } from "react";

// Remembers which address failed to load - of an image, usually. The failure
// belongs to that address: a new address starts as not failed without an
// effect to reset it, and no address at all has never failed.
export const useUrlFailure = (url?: string) => {
  const [failedUrl, setFailedUrl] = useState<string>();

  return {
    hasFailed: url !== undefined && failedUrl === url,
    markFailed: () => setFailedUrl(url),
  };
};
