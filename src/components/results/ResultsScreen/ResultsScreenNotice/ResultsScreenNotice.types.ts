import type { MessageDescriptor } from "@lingui/core";

import type { ResultsNoticeStatus } from "../ResultsScreen.types";

export interface ResultsScreenNoticeProps {
  status: ResultsNoticeStatus;
  onRetry: () => void;
}

export interface ResultsNotice {
  role: "status" | "alert"; // how assistive technology is told
  title: MessageDescriptor;
  line?: MessageDescriptor; // what to do about it
  isHeading: boolean; // the title is the heading of the page
  canRetry: boolean;
}
