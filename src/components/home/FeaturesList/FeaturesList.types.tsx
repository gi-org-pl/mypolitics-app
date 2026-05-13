import type { ReactNode } from "react";

/**
 * title and description must already be translated by the caller.
 * Use <Trans> / t`` macros at the call site, not inside FeaturesList.
 */
export interface Feature {
  title: string;
  description: string | ReactNode;
}

export interface FeaturesListProps {
  features: Feature[];
}