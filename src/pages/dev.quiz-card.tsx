import type { ReactElement } from "react";
import myPoliticsLogo from "@/assets/images/myPolitics_logo.svg";
import lata90Background from "@/assets/images/QuizCard_backgrounds/lata-90.png";
import { QuizCard } from "@/components/quiz/QuizCard/QuizCard";

export default function DevQuizCardPage(): ReactElement {
  return (
    <div className="min-h-screen bg-gi-ash px-4 py-10">
      <div className="mx-auto flex max-w-[388px] flex-col gap-[16px]">
        <div>
          <h1 className="text-lg font-semibold text-gi-primary">QuizCard UI</h1>
          <p className="mt-1 text-sm text-gi-gray">Przykładowe QuizCards.</p>
        </div>

        <QuizCard
          title="Polskie Lata 90."
          description={
            <>
              <b>Najbardziej zaawansowany test poglądów politycznych.</b> Poznaj
              najbliższą ideologię, partię i porównaj ze znajomymi!
            </>
          }
          tags={["+1.5M osób", "15 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          backgroundUrl={lata90Background}
          title="Polskie Lata 90."
          isMainAction
          cta="Kiedyś to było... no właśnie, jak?"
          description="Test polityczny lat 90., z tamtejszymi partiami i problemami."
          tags={["53.77K osób", "8 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          logoUrl={myPoliticsLogo}
          logoHeight={24}
          isMainAction
          isButtonLoading
          description="Opis"
          tags={["+40K osób", "9 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          logoUrl={myPoliticsLogo}
          logoHeight={24}
          isButtonLoading
          description="Opis"
          tags={["+40K osób", "9 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          logoUrl={myPoliticsLogo}
          logoHeight={24}
          isButtonDisabled
          isButtonLoading
          description="Opis"
          tags={["+40K osób", "9 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          backgroundUrl={lata90Background}
          isMainAction
          isAlwaysExpanded
          logoUrl={myPoliticsLogo}
          logoHeight={24}
          description={
            <>
              <b>Najbardziej zaawansowany test poglądów politycznych.</b> Poznaj
              najbliższą ideologię, partię i porównaj ze znajomymi!
            </>
          }
          tags={["+1.5M osób", "15 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          title="Polskie Lata 90."
          isShowStartText
          cta="Nowy Quiz Tożsamościowy!"
          isMainAction
          isAlwaysExpanded
          description={
            <>
              <b>Najbardziej zaawansowany test poglądów politycznych.</b> Poznaj
              najbliższą ideologię, partię i porównaj ze znajomymi!
            </>
          }
          tags={["+1.5M osób", "15 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          title="Generacja Innowacja"
          cta="Poznaj Generację Innowację"
          isMainAction
          description={
            <>
              <b>Najbardziej zaawansowany test poglądów politycznych.</b> Poznaj
              najbliższą ideologię, partię i porównaj ze znajomymi!
            </>
          }
          tags={["+1.5M osób", "15 min"]}
          onButtonClick={() => {}}
        />

        <QuizCard
          logoUrl={myPoliticsLogo}
          logoHeight={24}
          isMainAction
          isAlwaysExpanded
          description="Test polityczny lat 90., z tamtejszymi partiami i problemami."
          tags={["+40K osób", "9 min"]}
          onButtonClick={() => {}}
        />
      </div>
    </div>
  );
}
