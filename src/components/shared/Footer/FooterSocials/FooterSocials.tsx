import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { LINK_ICON_MASK_CLASS_NAME } from "@/constants/icon";
import { getIconMaskStyle } from "@/utils/style/getIconMaskStyle";
import { SOCIAL_LINKS } from "./FooterSocials.constants";

export const FooterSocials = () => {
  const { i18n } = useLingui();

  return (
    <div className="order-2 flex max-w-53.5 flex-wrap justify-center gap-2 md:order-1 md:max-w-none md:flex-nowrap md:gap-3">
      {SOCIAL_LINKS.map((social) => (
        <Button
          key={social.platform}
          asChild
          isIconButton
          type="ghost"
          variant="primary"
          size="regular"
          className={FOCUS_CLASS_NAME}
        >
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={i18n._(social.ariaLabel)}
          >
            <span
              className={`${LINK_ICON_MASK_CLASS_NAME} h-4 w-4.5 mask-auto`}
              style={getIconMaskStyle(social.icon)}
            />
          </a>
        </Button>
      ))}
    </div>
  );
};
