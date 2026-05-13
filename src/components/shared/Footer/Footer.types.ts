import type { MessageDescriptor } from '@lingui/core';

export type SocialPlatform =
  | 'facebook'
  | 'x'
  | 'instagram'
  | 'linkedin'
  | 'telegram'
  | 'github'
  | 'youtube';

export interface LinkItem {
  label: MessageDescriptor;
  href: string;
}

export interface SocialLink {
  platform: SocialPlatform;
  href: string;
  ariaLabel: MessageDescriptor;
}
