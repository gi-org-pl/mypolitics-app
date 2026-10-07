import megaphoneIcon from "@/assets/icons/megaphone.svg";

interface ResultsHeaderSloganProps {
  text: string;
}

export const ResultsHeaderSlogan = ({ text }: ResultsHeaderSloganProps) => (
  <p
    data-testid="results-header-slogan"
    className="flex max-w-full min-w-0 items-center gap-2 rounded-lg border border-gi-dark-ash px-2 py-[7px] text-base font-bold text-gi-primary"
  >
    <img src={megaphoneIcon} alt="" className="shrink-0" />
    <span className="min-w-0 truncate leading-[18px]">{text}</span>
  </p>
);
