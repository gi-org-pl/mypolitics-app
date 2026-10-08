import type { MessageDescriptor } from "@lingui/core";

export type QuizCategory = "electoral" | "social";

// A quiz as the home page lists it. Its texts are message descriptors: the
// component that shows them translates them. The description may mark its
// lead with the tag <0>…</0>, which is rendered bold.
export interface HomeQuiz {
  id: string;
  name: MessageDescriptor;
  categories: QuizCategory[];
  logoUrl?: string;
  backgroundUrl?: string;
  badge?: MessageDescriptor;
  description?: MessageDescriptor;
  tags: MessageDescriptor[];
}

// A promotion of the home page, before its name is translated.
export interface HomePromotion {
  name: MessageDescriptor;
  url: string;
  date: {
    start: Date;
    end: Date;
  };
  imageUrl: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// A feature of the platform. The description may wrap the words that lead to
// `linkUrl` in the tag <0>…</0>.
export interface HomeFeature {
  title: MessageDescriptor;
  description: MessageDescriptor;
  linkUrl?: string;
}
