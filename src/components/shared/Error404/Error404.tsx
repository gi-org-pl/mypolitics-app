import { Button } from "@gi/athena";
import { t } from "@lingui/core/macro";

import { Trans } from "@lingui/react/macro";
import { Link } from "react-router";
import bear404 from "@/assets/icons/bear-404.svg";
import { PATHS } from "@/constants/paths";

export const Error404: React.FC = () => {
  return (
    <main className="flex max-md:flex-col items-start justify-center md:items-center min-h-160 md:min-h-100 h-full m-2.5 md:mx-auto gap-6 max-w-4xl">
      <img
        src={bear404}
        alt={t`Ilustracja misia — błąd 404`}
        className="w-16 h-16 md:w-40 md:h-40"
      />

      <div className="flex flex-col md:justify-center items-start h-auto gap-2.5">
        <h1 className="max-md:text-xl text-3xl font-bold text-gi-primary">
          <Trans>
            To jest błąd 404{" "}
            <span className="text-cyan-500">na miarę naszych możliwości</span>!
          </Trans>
        </h1>

        <p className="max-md:text-base text-xl text-gi-primary">
          <Trans>
            My tym błędem otwieramy oczy niedowiarkom! Mówimy: to jest nasz
            błąd, przez nas zrobiony, i to nie jest nasze ostatnie słowo!
          </Trans>
        </p>

        <Link to={PATHS.home}>
          <Button variant="primary">
            <Trans>Strona główna</Trans>
          </Button>
        </Link>
      </div>
    </main>
  );
};
