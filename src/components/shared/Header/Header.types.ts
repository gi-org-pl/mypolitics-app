import type { MessageDescriptor } from "@lingui/core";

export type HeaderNavItem = {
  key: string;
  label: MessageDescriptor;
  path: string;
  external?: boolean;
};

export type HeaderStoryProps = {
  initialPath: string;
};
