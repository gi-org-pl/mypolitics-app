import { msg } from "@lingui/core/macro";

import eurowyborczyLogo from "@/assets/icons/quiz-logo-eurowyborczy-2024.svg";
import myPoliticsLogo from "@/assets/icons/quiz-logo-mypolitics.svg";
import radarLogo from "@/assets/icons/quiz-logo-warszawski-radar-wyborczy.svg";
import wyborczyLogo from "@/assets/icons/quiz-logo-wyborczy-2023.svg";
import pytaniaBackground from "@/assets/images/home/quiz-card-600-pytan.png";
import filozoficznyBackground from "@/assets/images/home/quiz-card-filozoficzny.png";
import krajeBackground from "@/assets/images/home/quiz-card-kraje-starozytne.png";
import lata90Background from "@/assets/images/home/quiz-card-lata-90.png";
import myPoliticsBackground from "@/assets/images/home/quiz-card-mypolitics.png";
import orientacjaBackground from "@/assets/images/home/quiz-card-orientacja-seksualna.png";
import muzykaBackground from "@/assets/images/home/quiz-card-preferencje-muzyczne.png";
import adPersonamLogo from "@/assets/images/partners/ad-personam.png";
import androidLogo from "@/assets/images/partners/android-com-pl.png";
import antywebLogo from "@/assets/images/partners/antyweb.png";
import cyberDefenceLogo from "@/assets/images/partners/cyberdefence24.png";
import demagogLogo from "@/assets/images/partners/demagog.png";
import doRzeczyLogo from "@/assets/images/partners/do-rzeczy.png";
import namZalezyLogo from "@/assets/images/partners/nam-zalezy.png";
import nowyLadLogo from "@/assets/images/partners/nowy-lad.png";
import obserwatorLogo from "@/assets/images/partners/obserwator-gospodarczy.png";
import onetLogo from "@/assets/images/partners/onet.png";
import orbLogo from "@/assets/images/partners/orb.png";
import otwartaKonserwaLogo from "@/assets/images/partners/otwarta-konserwa.png";
import futureFoundationLogo from "@/assets/images/partners/our-future-foundation.png";
import politologiaLogo from "@/assets/images/partners/politologia-org.png";
import politykaLogo from "@/assets/images/partners/polityka.png";
import politykaInsightLogo from "@/assets/images/partners/polityka-insight.png";
import polskieRadioLogo from "@/assets/images/partners/polskie-radio.png";
import przekanalLogo from "@/assets/images/partners/przekanal.png";
import radioWarszawaLogo from "@/assets/images/partners/radio-warszawa.png";
import radioWnetLogo from "@/assets/images/partners/radio-wnet.png";
import szopDemaskujeLogo from "@/assets/images/partners/szop-demaskuje.png";
import tvRepublikaLogo from "@/assets/images/partners/tv-republika.png";
import tysolLogo from "@/assets/images/partners/tysol.png";
import naukowyBelkotLogo from "@/assets/images/partners/uwaga-naukowy-belkot.png";
import wojnaIdeiLogo from "@/assets/images/partners/wojna-idei.png";
import wpWiadomosciLogo from "@/assets/images/partners/wp-wiadomosci.png";
import wprostLogo from "@/assets/images/partners/wprost.png";
import zgrzytLogo from "@/assets/images/partners/zgrzyt.png";
import promotionDesktop from "@/assets/images/promotions/banner-desktop.png";
import promotionMobile from "@/assets/images/promotions/banner-mobile.png";
import promotionTablet from "@/assets/images/promotions/banner-tablet.png";
import type { PartnerSection } from "@/components/home/PartnersList/PartnersList.types";
import { PATHS } from "@/constants/paths";
import type { HomeFeature, HomePromotion, HomeQuiz } from "@/types/home";

// The content of the home page is static until the API that serves it exists.

export const HOME_PROMOTIONS: HomePromotion[] = [
  {
    name: msg`Dołącz na Discord Fundacji Generacja Innowacja`,
    url: "https://discord.gg/5TqZZ57KhQ",
    date: {
      start: new Date("2024-01-01T00:00:00.000Z"),
      end: new Date("2099-12-31T23:59:59.999Z"),
    },
    imageUrl: {
      mobile: promotionMobile,
      tablet: promotionTablet,
      desktop: promotionDesktop,
    },
  },
];

export const HOME_FEATURES: HomeFeature[] = [
  {
    title: msg`+4 000 000 osób`,
    description: msg`Milionom Polek i Polaków pomogliśmy poszerzyć świadomość polityczną poprzez quizy światopoglądowe.`,
  },
  {
    title: msg`Nikt nas nie finansuje`,
    description: msg`Platformę tworzą wolontariusze ze wsparciem ekspertów. Nie przyjęliśmy ani złotówki ze środków publicznych ani zagranicznych.`,
  },
  {
    title: msg`Algorytm jest jawny`,
    description: msg`Jesteśmy w pełni transparentni, nie ukrywamy jak dopasowujemy użytkowników. <0>Sprawdź jak działa algorytm.</0>`,
    linkUrl: PATHS.whitepaperPDF,
  },
];

// Names of organisations and media are proper names: they are not translated.
export const HOME_PARTNER_SECTIONS: PartnerSection[] = [
  {
    partners: [
      {
        title: "Stowarzyszenie Demagog",
        logoUrl: demagogLogo,
        www: "https://demagog.org.pl/analizy_i_raporty/kliknij-zanim-zaglosujesz-kampania-wybory-bez-oszustw-i-quiz-mypolitics/",
      },
      {
        title: "Ad Personam",
        logoUrl: adPersonamLogo,
        www: "https://ad.personam.pl/",
      },
      {
        title: "Polityka Insight",
        logoUrl: politykaInsightLogo,
        www: "https://www.politykainsight.pl/nowa",
      },
      {
        title: "Our Future Foundation",
        logoUrl: futureFoundationLogo,
        www: "https://off.org.pl/",
      },
      {
        title: "Onet",
        logoUrl: onetLogo,
        www: "https://www.onet.pl/informacje/demagog/kampania-wybory-bez-oszustw-i-quiz-mypolitics-w-sluzbie-faktom/5sgekcm,30bc1058",
      },
      {
        title: "Wprost",
        logoUrl: wprostLogo,
        www: "https://www.wprost.pl/kraj/11998051/nie-wiesz-na-kogo-glosowac-skorzystaj-z-latarnika-wyborczego.html",
      },
      {
        title: "Polityka",
        logoUrl: politykaLogo,
        www: "https://www.polityka.pl/tygodnikpolityka/kraj/2229640,1,wyborcze-quizy-kto-je-robi-ile-sa-warte-ciebie-tez-zdziwil-wynik.read",
      },
      {
        title: "Antyweb",
        logoUrl: antywebLogo,
        www: "https://antyweb.pl/latarnik-wyborczy-2025-juz-dostepny",
      },
      {
        title: "Android.com.pl",
        logoUrl: androidLogo,
        www: "https://android.com.pl/tech/920796-quiz-prezydencki-2025/",
      },
      { title: "WP Wiadomości", logoUrl: wpWiadomosciLogo },
      {
        title: "Radio Wnet",
        logoUrl: radioWnetLogo,
        www: "https://wnet.fm/2025/05/09/quiz-prezydencki2025-czym-jest/",
      },
      { title: "Radio Warszawa", logoUrl: radioWarszawaLogo },
      {
        title: "CyberDefence24",
        logoUrl: cyberDefenceLogo,
        www: "https://cyberdefence24.pl/cyberbezpieczenstwo/problemy-z-quizem-preferencji-wyborczych-mypolitics-wskazuje-przyczyne",
      },
      {
        title: "Do Rzeczy",
        logoUrl: doRzeczyLogo,
        www: "https://dorzeczy.pl/kraj/726312/oni-nie-czekaja-mlodzi-stworzyli-najpopularniejsze-narzedzie-wyborcze.html",
      },
      {
        title: "TV Republika",
        logoUrl: tvRepublikaLogo,
        www: "https://tvrepublika.pl/Polska/Test-preferencji-przed-II-tura-Wyborow-Prezydenckich-2025/189507",
      },
      {
        title: "Zgrzyt",
        logoUrl: zgrzytLogo,
        www: "https://youtu.be/qfGTeHu4uss",
      },
      {
        title: "Szop Demaskuje",
        logoUrl: szopDemaskujeLogo,
        www: "https://youtu.be/CtCKA5PbAVE",
      },
      {
        title: "Polskie Radio",
        logoUrl: polskieRadioLogo,
        www: "https://www.polskieradio.pl/398",
      },
      {
        title: "Uwaga! Naukowy Bełkot",
        logoUrl: naukowyBelkotLogo,
        www: "https://www.youtube.com/@naukowy.belkot/videos",
      },
      {
        title: "politologia.org",
        logoUrl: politologiaLogo,
        www: "https://www.politologia.org/2025/05/29/quiz-polityczny-mypolitics-fenomen-kampanii-prezydenckiej-2025",
      },
      {
        title: "Wojna Idei",
        logoUrl: wojnaIdeiLogo,
        www: "https://www.wojnaidei.pl/",
      },
      {
        title: "ORB",
        logoUrl: orbLogo,
        www: "https://www.youtube.com/@ORB_NEWS",
      },
      {
        title: "Przekanał",
        logoUrl: przekanalLogo,
        www: "https://www.youtube.com/@przekanal",
      },
      {
        title: "Nowy Ład",
        logoUrl: nowyLadLogo,
        www: "https://nlad.pl/ponad-300-000-polakow-wzielo-udzial-w-quizie-prezydencki2025-najwiekszym-narzedziu-analitycznym-na-wybory-prezydenckie-2025/",
      },
      {
        title: "Otwarta Konserwa",
        logoUrl: otwartaKonserwaLogo,
        www: "https://www.youtube.com/@OtwartaKonserwa",
      },
      {
        title: "TySol.pl",
        logoUrl: tysolLogo,
        www: "https://www.tysol.pl/a140872-nasz-patronat-swiadomy-wybor-w-czasach-chaosu-informacyjnego-rozmowa-z-zespolem-mypolitics",
      },
      {
        title: "Obserwator Gospodarczy",
        logoUrl: obserwatorLogo,
        www: "https://obserwatorgospodarczy.pl/2025/05/31/przyjecie-euro-przez-polske-mlodzi-sa-stanowczo-na-nie/",
      },
      {
        title: "Nam Zależy",
        logoUrl: namZalezyLogo,
        www: "https://namzalezy.pl/",
      },
    ],
  },
];

export const FEATURED_QUIZ: HomeQuiz = {
  id: "mypolitics",
  name: msg`myPolitics`,
  categories: [],
  logoUrl: myPoliticsLogo,
  backgroundUrl: myPoliticsBackground,
  description: msg`<0>Najbardziej zaawansowany test poglądów politycznych.</0> Poznaj swoją tożsamość, najbliższą ideologię, partię i porównaj ze znajomymi!`,
  tags: [msg`+1.5M osób`, msg`15 min`],
};

export const HOME_QUIZZES: HomeQuiz[] = [
  {
    id: "wyborczy-2023",
    name: msg`Wyborczy 2023`,
    categories: ["electoral"],
    logoUrl: wyborczyLogo,
    description: msg`<0>Poznaj najbliższych sobie warszawskich polityków!</0> Dowiesz się także, który z nich jest Tobie najbliższy w określonych tematach.`,
    tags: [msg`+40K osób`, msg`9 min`],
  },
  {
    id: "eurowyborczy-2024",
    name: msg`Eurowyborczy 2024`,
    categories: ["electoral"],
    logoUrl: eurowyborczyLogo,
    description: msg`<0>Poznaj najbliższych sobie warszawskich polityków!</0> Dowiesz się także, który z nich jest Tobie najbliższy w określonych tematach.`,
    tags: [msg`+40K osób`, msg`9 min`],
  },
  {
    id: "warszawski-radar-wyborczy",
    name: msg`Warszawski Radar Wyborczy`,
    categories: ["electoral"],
    logoUrl: radarLogo,
    description: msg`<0>Poznaj najbliższych sobie warszawskich polityków!</0> Dowiesz się także, który z nich jest Tobie najbliższy w określonych tematach.`,
    tags: [msg`+40K osób`, msg`9 min`],
  },
  {
    id: "polskie-lata-90",
    name: msg`Polskie Lata 90.`,
    categories: ["social"],
    backgroundUrl: lata90Background,
    badge: msg`Kiedyś to było... no właśnie, jak?`,
    description: msg`<0>Wróć do czasów transformacji!</0> Sprawdź, do której partii lat 90. byłoby Ci najbliżej.`,
    tags: [msg`+25K osób`, msg`8 min`],
  },
  {
    id: "600-pytan",
    name: msg`600+ pytań`,
    categories: ["social"],
    backgroundUrl: pytaniaBackground,
    badge: msg`Najdłuższy quiz na myPolitics!`,
    description: msg`<0>Quiz dla wytrwałych.</0> Ponad 600 pytań, które prześwietlą Twoje poglądy w każdym szczególe.`,
    tags: [msg`+10K osób`, msg`90 min`],
  },
  {
    id: "preferencje-muzyczne",
    name: msg`Preferencje muzyczne`,
    categories: ["social"],
    backgroundUrl: muzykaBackground,
    badge: msg`Zamiast o politykę, pokłóćmy się o muzykę!`,
    description: msg`<0>Powiedz, czego słuchasz.</0> Dowiedz się, jakim typem słuchacza jesteś i z kim dzielisz gust.`,
    tags: [msg`+15K osób`, msg`6 min`],
  },
  {
    id: "filozoficzny",
    name: msg`Filozoficzny`,
    categories: ["social"],
    backgroundUrl: filozoficznyBackground,
    badge: msg`Jaka filozofia Cię reprezentuje?`,
    description: msg`<0>Stoik, hedonista czy pragmatyk?</0> Odkryj nurt filozoficzny, który najlepiej opisuje Twoje podejście do życia.`,
    tags: [msg`+30K osób`, msg`10 min`],
  },
  {
    id: "kraje-starozytne",
    name: msg`Kraje starożytne`,
    categories: ["social"],
    backgroundUrl: krajeBackground,
    badge: msg`Jakie miałbyś poglądy tysiące lat temu?`,
    description: msg`<0>Ateny, Sparta czy Kartagina?</0> Zobacz, w którym starożytnym państwie Twoje poglądy miałyby najwięcej zwolenników.`,
    tags: [msg`+20K osób`, msg`7 min`],
  },
  {
    id: "orientacja-seksualna",
    name: msg`Orientacja seksualna`,
    categories: ["social"],
    backgroundUrl: orientacjaBackground,
    badge: msg`Poznaj co wpływa na Twoją orientację`,
    description: msg`<0>Quiz edukacyjny o tożsamości.</0> Poznaj czynniki, które według badań kształtują orientację.`,
    tags: [msg`+12K osób`, msg`5 min`],
  },
];
