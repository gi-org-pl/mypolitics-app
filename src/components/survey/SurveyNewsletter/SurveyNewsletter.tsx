import { Checkbox, Input } from "@gi/athena";
import { Trans } from "@lingui/react";
import { PATHS } from "@/constants/paths";
import type SurveyNewsletterProps from "./SurveyNewsletter.types";

export default function SurveyNewsletter({
  email,
  onEmailChange,
  consent,
  onConsentChange,
}: SurveyNewsletterProps) {
  return (
    <div className="flex flex-col justify-center ">
      <div className="  flex flex-col w-[340px] h-fit bg-(--color-gi-dark-ash) text-slate-800 rounded-2xl p-4 gap-[10px]">
        <p className=" font-bold text-[24px] text-(--color-gi-primary) w-[308px] h-[36px] flex items-center">
          <Trans id="Newsletter.Title" message="Zobacz więcej niż wyniki." />
        </p>
        <p className=" font-normal  text-(--color-gi-primary) w-[308px] h-[72px] flex items-center">
          <Trans
            id="Newsletter.Description"
            message="Poznaj poglądy innych, porównaj się, zdobądź wiedzę o zmianach w społeczeństwie i Twoim otoczeniu!"
          />
        </p>
      </div>
      <Input
        type="email"
        className="w-[340px] h-[44px] mt-[16px] mb-[16px]"
        value={email}
        onChange={onEmailChange}
        placeholder="twoj@mail.com "
      />
      <div className=" flex flex-row w-[340px] h-fit gap-2">
        <Checkbox
          label=""
          className="w-[14px] h-[14px] bg-[#FFFFFF] border border-[--color-gi-dark-ash] rounded-[2px] cursor-pointer"
          checked={consent}
          onCheckedChange={onConsentChange}
        />
        <div className="text-[14px] leading-[120%] tracking-normal w-[318px] block text-slate-800">
          <Trans
            id="Newsletter.Consent"
            message="Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja."
          />
          <a
            href={PATHS.privacy}
            target="_blank"
            rel="noopener noreferrer"
            className=" text-[14px] leading-[120%] tracking-normal underline decoration-solid text-(--color-gi-primary) cursor-pointer hover:opacity-80 transition-opacity"
          >
            <Trans
              id="Newsletter.PrivacyPolicy"
              message="Polityka prywatności."
            />
          </a>
          <br /> <br />
          <Trans
            id="Newsletter.DataUsage"
            message="Twoje dane osobowe nie będą w żaden sposób powiązane z wynikami."
          />
        </div>
      </div>
    </div>
  );
}
