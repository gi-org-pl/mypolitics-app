import { t } from "@lingui/core/macro";
import giLogo from "@/assets/icons/gilogo.svg";
import myPoliticsLogo from "@/assets/icons/mypoliticslogo.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { PATHS } from "@/constants/paths";

export const FooterLeft = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex items-center justify-center gap-2 md:justify-start">
      <span className="text-sm leading-4 font-light whitespace-nowrap text-gi-primary">
        {t`© ${currentYear}`}
      </span>
      <div className="h-3 w-px shrink-0 bg-gi-primary/25" />
      <img src={myPoliticsLogo} alt={t`myPolitics`} className="h-4 w-auto" />
      <div className="h-3 w-px shrink-0 bg-gi-primary/25" />
      <a
        href={PATHS.generacjaInnowacja}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-4 items-center ${FOCUS_CLASS_NAME}`}
      >
        <img src={giLogo} alt={t`Generacja Innowacja`} className="h-4 w-auto" />
      </a>
    </div>
  );
};
