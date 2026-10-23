export interface PollOptions {
  intervalMs: number; // the pause between the answer to one read and the next read
  limitMs: number; // how long the reads go on before the wait gives up
  signal: AbortSignal; // aborted = the wait was left
}

// Reads at once, and again a moment after each read has answered, so two
// reads never overlap, until a read is final. The wait ends with that read.
// It ends with nothing when the time is up or the wait was left: the read on
// its way is cancelled then, and no timer is left running.
export const pollUntil = <Value>(
  read: (signal: AbortSignal) => Promise<Value>,
  isFinal: (value: Value) => boolean,
  { intervalMs, limitMs, signal }: PollOptions,
): Promise<Value | undefined> =>
  new Promise((resolve) => {
    const reads = new AbortController();
    let readTimer: ReturnType<typeof setTimeout> | undefined;

    const end = (value?: Value) => {
      clearTimeout(readTimer);
      clearTimeout(limitTimer);
      signal.removeEventListener("abort", giveUp);
      reads.abort();
      resolve(value);
    };

    const giveUp = () => end();

    const readOnce = async () => {
      const value = await read(reads.signal);

      if (reads.signal.aborted) return;

      if (isFinal(value)) {
        end(value);
      } else {
        readTimer = setTimeout(readOnce, intervalMs);
      }
    };

    const limitTimer = setTimeout(giveUp, limitMs);

    signal.addEventListener("abort", giveUp);

    if (signal.aborted) {
      giveUp();
    } else {
      readOnce();
    }
  });
