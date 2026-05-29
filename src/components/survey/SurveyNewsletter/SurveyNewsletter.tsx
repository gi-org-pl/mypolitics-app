import type SurveyNewsletterProps from './SurveyNewsletter.types';
import {Input, Checkbox} from "@gi/athena";
export default function SurveyNewsletter({ email, onEmailChange, consent, onConsentChange }: SurveyNewsletterProps) {
  return (
    // blok główny
    <div className="flex flex-col justify-center ">
    {/* blok z tekstem */}
        <div className="  flex flex-col w-[340px] h-fit bg-[#D3D9DA] text-slate-800 rounded-2xl p-4 gap-[10px]">
            <p className=" font-bold text-[24px] text-[#004554] w-[308px] h-[36px] flex items-center">
                Zobacz więcej niż wyniki.
            </p>

            <p className=" font-normal  text-[#004554] w-[308px] h-[72px] flex items-center">
                Poznaj poglądy innych, porównaj się, zdobądź wiedzę o zmianach w społeczeństwie i Twoim otoczeniu!
            </p>
        </div>
    {/* input*/}
        <Input type="email" className="w-[340px] h-[44px] mt-[16px] mb-[16px]"  value={email} onChange={onEmailChange} placeholder="twoj@mail.com "/>
    {/* blok z checkboxem, tekstem i linkiem do polityki prywatności */}
        <div className=" flex flex-row w-[340px] h-fit gap-2">

            <Checkbox label=""  className="w-[14px] h-[14px] bg-[#FFFFFF] border border-[#D3D9DA] rounded-[2px] cursor-pointer" checked={consent} onCheckedChange={onConsentChange} />

            <div className="text-[14px] leading-[120%] tracking-normal w-[318px] block text-slate-800">
          Wyrażam zgodę na przetwarzanie moich danych osobowych w celu przesyłania mi treści marketingowych przez Fundację Generacja Innowacja. {" "}

            <a href="https://www.generacja-innowacja.org/polityka-prywatnosci" target="_blank" rel="noopener noreferrer" className=" text-[14px] leading-[120%] tracking-normal underline decoration-solid text-[#004554] cursor-pointer hover:opacity-80 transition-opacity"> Polityka prywatności.</a>

            <br /> <br />
          Twoje dane osobowe nie będą w żaden sposób powiązane z wynikami.
            </div>
        </div>
    </div>
  );
}