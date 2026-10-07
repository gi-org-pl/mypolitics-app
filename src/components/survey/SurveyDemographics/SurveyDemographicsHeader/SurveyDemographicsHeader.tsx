import { Trans } from "@lingui/react/macro";

import avatarsImage from "@/assets/images/survey/demographics-avatars.png";

export const SurveyDemographicsHeader = () => (
  <div className="flex flex-col gap-2.5 rounded-2xl bg-gi-dark-ash p-4 text-gi-primary">
    <div className="flex items-center justify-between gap-2.5">
      <h2 className="w-min min-w-0 text-2xl leading-[29px] font-bold wrap-break-word">
        <Trans>Twoja tożsamość</Trans>
      </h2>
      <img
        src={avatarsImage}
        alt=""
        width={104}
        height={64}
        className="h-16 w-26 shrink-0"
      />
    </div>
    <hr className="-mb-px border-gi-dark-gray/10" />
    <p className="font-(family-name:--font-family-poppins) text-base leading-[19px] wrap-break-word">
      <Trans>
        W tym teście otrzymasz dostosowaną pod siebie kartę tożsamości
      </Trans>
    </p>
  </div>
);
