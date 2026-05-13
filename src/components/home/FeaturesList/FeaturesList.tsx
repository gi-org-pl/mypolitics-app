import type { Feature, FeaturesListProps } from "./FeaturesList.types";
import React from "react";

const FeatureCard = ({ feature }: { feature: Feature }) => {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-xl font-bold text-teal-600">{feature.title}</h3>
      <p className="mt-2 text-sm text-slate-700">{feature.description}</p>
    </article>
  );
};

export const FeaturesList: React.FC<FeaturesListProps> = ({ features }) => {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {features.map((feature, index) => (
        <li key={`${feature.title}-${index}`}>
          <FeatureCard feature={feature} />
        </li>
      ))}
    </ul>
  );
};