import { Button } from "@gi-org-pl/athena";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Link } from "react-router";
import bear404 from "@/assets/icons/bear-404.svg";
import { FOCUS_CLASS_NAME } from "@/constants/focus";
import { PATHS } from "@/constants/paths";

export const Error404 = () => {
  return (
    <div className="flex w-full flex-col items-start gap-6 px-4 py-8 text-gi-primary md:flex-row md:items-center md:justify-center md:gap-8">
      <img
        src={bear404}
        alt={t`Ilustracja misia — błąd 404`}
        className="size-16 shrink-0 md:size-48"
      />

      <div className="flex min-w-0 flex-col items-start gap-2.5">
        <h1 className="font-(family-name:--font-family-poppins) text-xl leading-normal font-bold md:text-[32px]">
          <Trans>
            To jest błąd 404{" "}
            <span className="text-cyan-500">na miarę naszych możliwości</span>!
          </Trans>
        </h1>

        <p className="w-0 min-w-full font-(family-name:--font-family-poppins) text-base leading-normal md:text-2xl">
          <Trans>
            My tym błędem otwieramy oczy niedowiarkom! Mówimy: to jest nasz
            błąd, przez nas zrobiony, i to nie jest nasze ostatnie słowo!
          </Trans>
        </p>

        <Button
          asChild
          variant="primary"
          className={`text-base font-bold ${FOCUS_CLASS_NAME}`}
        >
          <Link to={PATHS.home}>
            <Trans>Strona główna</Trans>
          </Link>
        </Button>
      </div>
    </div>
  );
};
