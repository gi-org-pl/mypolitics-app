import { t } from "@lingui/core/macro";
import giLogo from "@/assets/icons/gi-short-on-light.svg";
import myPoliticsLogo from "@/assets/icons/mypolitics-primary-colour-on-light.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { PATHS } from "@/constants/paths";

// Both logos stand at the smallest height their brand books allow on screen:
// 24 px for the myPolitics primary logo and 20 px for the GI short logo.
export const FooterLeft = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex items-center justify-center gap-2 md:justify-start">
      <span className="text-sm leading-4 font-light whitespace-nowrap text-gi-primary">
        {t`© ${currentYear}`}
      </span>
      <div className="h-3 w-px shrink-0 bg-gi-primary/25" />
      <img src={myPoliticsLogo} alt={t`myPolitics`} className="h-6 w-auto" />
      <div className="h-3 w-px shrink-0 bg-gi-primary/25" />
      <a
        href={PATHS.generacjaInnowacja}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-5 items-center ${FOCUS_CLASS_NAME}`}
      >
        <img src={giLogo} alt={t`Generacja Innowacja`} className="h-5 w-auto" />
      </a>
    </div>
  );
};
