import { Button } from "@gi-org-pl/athena";
import { useLingui } from "@lingui/react";
import { SOCIAL_LINKS } from "../Footer.constants";

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
        >
          <a
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={i18n._(social.ariaLabel)}
          >
            <img src={social.icon} alt="" />
          </a>
        </Button>
      ))}
    </div>
  );
};
