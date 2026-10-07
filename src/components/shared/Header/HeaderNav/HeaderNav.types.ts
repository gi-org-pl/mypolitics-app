import type { MessageDescriptor } from "@lingui/core";
import type { Ref } from "react";

export type HeaderNavEntry = {
  key: string;
  label: MessageDescriptor;
  path: string;
  icon: string;
  iconClassName: string;
  external?: boolean;
};

export type HeaderNavVariant = "bar" | "menu";

export type HeaderNavLook = {
  className: string;
  entries: HeaderNavEntry[];
};

export type HeaderNavProps = {
  variant: HeaderNavVariant;
  onNavigate: () => void;
  id?: string;
  ref?: Ref<HTMLElement>;
};
