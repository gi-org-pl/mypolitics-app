import { FooterLeft } from "./FooterLeft/FooterLeft";
import { FooterLegal } from "./FooterLegal/FooterLegal";
import { FooterSocials } from "./FooterSocials/FooterSocials";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-[#d4e1e4] bg-background py-8">
      <div className="mx-auto box-content flex max-w-300 flex-col items-center gap-6 px-4 md:flex-row md:items-start md:justify-between md:px-8">
        <FooterLeft />
        <div className="flex flex-col items-center gap-6 md:items-end">
          <FooterSocials />
          <FooterLegal />
        </div>
      </div>
    </footer>
  );
};
