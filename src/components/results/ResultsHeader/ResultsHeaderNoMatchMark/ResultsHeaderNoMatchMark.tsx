import questionMarkIcon from "@/assets/icons/question-mark.svg";

import { IMAGE_CLASS_NAME } from "../ResultsHeader.constants";

export const ResultsHeaderNoMatchMark = () => (
  <div className="relative size-[65px] shrink-0 rounded-full bg-gi-red/5">
    <div
      className={`${IMAGE_CLASS_NAME} flex items-center justify-center bg-white`}
    >
      <img
        src={questionMarkIcon}
        alt=""
        data-testid="results-header-question-mark"
      />
    </div>
  </div>
);
