import type { FeatureCardProps } from "./FeatureCard.types";

// The card fills its cell, so the cards of one row are equally high whatever
// the length of their texts.
export const FeatureCard = ({ feature }: FeatureCardProps) => (
  <article className="flex h-full flex-col gap-2 rounded-3xl border border-gi-primary/10 bg-white p-6 md:rounded-4xl">
    <h3 className="text-2xl leading-[1.4] font-bold wrap-break-word text-gi-primary">
      {feature.title}
    </h3>

    <p className="text-base leading-[1.4] wrap-break-word text-gi-primary [&_a]:underline">
      {feature.description}
    </p>
  </article>
);
