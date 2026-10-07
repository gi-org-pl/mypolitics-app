import { Trans, useLingui } from "@lingui/react";

import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { HOME_FEATURES, HOME_PROMOTIONS } from "@/constants/home";

// The static content of the home page in the active language, in the shape
// the banner and the list of features take. The link of a feature opens in a
// new tab: it leads outside the app.
export const useHomeContent = () => {
  const { i18n } = useLingui();

  return {
    promotions: HOME_PROMOTIONS.map((promotion) => ({
      ...promotion,
      name: i18n._(promotion.name),
    })),
    features: HOME_FEATURES.map((feature) => ({
      title: i18n._(feature.title),
      description: (
        <Trans
          id={feature.description.id}
          message={feature.description.message}
          components={{
            0: (
              <a
                href={feature.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-sm ${FOCUS_CLASS_NAME}`}
              />
            ),
          }}
        />
      ),
    })),
  };
};
