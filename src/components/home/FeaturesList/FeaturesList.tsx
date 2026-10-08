import { withKeys } from "@/utils/array/withKeys";

import { FeatureCard } from "./FeatureCard/FeatureCard";
import type { FeaturesListProps } from "./FeaturesList.types";

export const FeaturesList = ({ features }: FeaturesListProps) => (
  <ul className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
    {withKeys(features, (feature) => feature.title).map(({ item, key }) => (
      <li key={key}>
        <FeatureCard feature={item} />
      </li>
    ))}
  </ul>
);
