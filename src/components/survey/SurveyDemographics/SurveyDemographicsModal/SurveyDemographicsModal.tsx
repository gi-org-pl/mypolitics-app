import { Modal } from "@gi-org-pl/athena";
import { Trans } from "@lingui/react/macro";

import type { SurveyDemographicsModalProps } from "./SurveyDemographicsModal.types";

export const SurveyDemographicsModal = ({
  isOpen,
  onClose,
}: SurveyDemographicsModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    className="mx-4 rounded-4xl p-[23px] shadow-none"
    title={
      <span className="block pb-1 text-lg leading-7 font-bold">
        <Trans>Zakres wykorzystania danych</Trans>
      </span>
    }
  >
    <div className="-mt-1 flex flex-col gap-2 text-sm leading-5 text-gi-gray">
      <p>
        <Trans>
          Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli przeanalizować
          Twoje wyniki w przyszłości w celu poprawienia działania quizu, a także
          przygotowania analiz na data.mypolitics.pl.
        </Trans>
      </p>
      <p className="font-bold">
        <Trans>Twoje dane pozostaną całkowicie anonimowe.</Trans>
      </p>
    </div>
  </Modal>
);
