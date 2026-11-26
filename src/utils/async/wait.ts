// Waits for the time given and answers true, or stops early with false when
// the signal is aborted - at once when it already is.
export const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<boolean>((resolve) => {
    if (signal?.aborted) {
      resolve(false);
      return;
    }

    const timer = setTimeout(() => resolve(true), ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });
