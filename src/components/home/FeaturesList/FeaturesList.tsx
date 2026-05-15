import type { Feature, FeaturesListProps } from "./FeaturesList.types";
import React from "react";

const FeatureCard = ({ feature }: { feature: Feature }) => {
    return (
        <article className="flex flex-col gap-2 p-6 rounded-3xl border border-gi-primary/10 bg-white shadow-sm md:rounded-[2rem]">
            <h3 className="text-xl font-bold text-gi-primary">{feature.title}</h3>
            <p className="text-sm text-gi-primary m-0 leading-[1.33] [&_a]:underline">{feature.description}</p>
        </article>
    );
};

export const FeaturesList: React.FC<FeaturesListProps> = ({ features }) => {
    return (
        <ul className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {features.map((feature, index) => (
                <li key={`${feature.title}-${index}`}>
                    <FeatureCard feature={feature} />
                </li>
            ))}
        </ul>
    );
};