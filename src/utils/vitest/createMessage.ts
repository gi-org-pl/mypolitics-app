import type { MessageDescriptor } from "@lingui/core";

// A message for a test: the `msg` macro would put the text of the test into
// the catalogs of the app.
export const createMessage = (message: string): MessageDescriptor => ({
  id: message,
  message,
});
