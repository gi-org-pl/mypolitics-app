import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import type { DemographicsField, DemographicsFieldOption } from "../SurveyDemographics.types";

export const surveyDemographicsSubtitle: MessageDescriptor = msg`W tym teście otrzymasz dostosowaną pod siebie kartę tożsamości`;
export const surveyDemographicsTitle: MessageDescriptor = msg`Twoja tożsamość`;
export const surveyDemographicsFooter: MessageDescriptor = msg`Powyższe dane w przyszłości pozwolą Ci porównać się z innymi! `;
export const surveyDemographicsLearnMore: MessageDescriptor = msg`To znaczy?`;
export const surveyDemographicsSubmit: MessageDescriptor = msg`Zobacz wyniki`;
export const surveyDemographicsSkip: MessageDescriptor = msg`Pomiń`;
export const surveyDemographicsDataUsage: MessageDescriptor = msg`Zakres wykorzystania danych`;
export const surveyDemographicsDataUsageDescription: MessageDescriptor = msg`Dzięki Twoim odpowiedziom w tej sekcji będziemy mogli przeanalizować Twoje wyniki w przyszłości w celu poprawienia działania quizu, a także przygotowania analiz na data.mypolitics.pl.`;
export const surveyDemographicsDataUsageAnonymity: MessageDescriptor = msg`Twoje dane pozostaną całkowicie anonimowe.`;

const ageOptions: DemographicsFieldOption[] = [
  { value: "0", labelKey: msg`Mniej niż 18` },
  ...Array.from({ length: 100 }, (_, i) => ({
    value: String(i + 18),
    labelKey: msg`${String(i + 18)}`,
  })),
];

export const demographicsData: DemographicsField[] = [
  {
    control: "age",
    labelKey: msg`Wiek`,
    full: false,
    options: ageOptions,
  },
  {
    control: "gender",
    labelKey: msg`Płeć`,
    full: false,
    options: [
      { value: "male", labelKey: msg`Mężczyzna` },
      { value: "female", labelKey: msg`Kobieta` },
      { value: "other", labelKey: msg`Inna płeć` },
    ],
  },
  {
    control: "residenceAreaSize",
    labelKey: msg`Wielkość miejsca zamieszkania`,
    full: true,
    options: [
      { value: "village", labelKey: msg`Wieś` },
      { value: "city_small", labelKey: msg`Miasto do 50 tys. mieszkańców` },
      { value: "city_medium", labelKey: msg`Miasto 50-250 tys. mieszkańców` },
      {
        value: "city_large",
        labelKey: msg`Miasto powyżej 250 tys. mieszkańców`,
      },
    ],
  },
  {
    control: "education",
    labelKey: msg`Wykształcenie`,
    full: true,
    options: [
      { value: "primary", labelKey: msg`Wykształcenie podstawowe` },
      {
        value: "basic_vocational",
        labelKey: msg`Wykształcenie zasadnicze zawodowe`,
      },
      { value: "secondary", labelKey: msg`Wykształcenie średnie` },
      { value: "higher", labelKey: msg`Wykształcenie wyższe` },
    ],
  },
  {
    control: "region",
    labelKey: msg`Województwo`,
    full: true,
    options: [
      { value: "dolnoslaskie", labelKey: msg`Dolnośląskie` },
      { value: "kujawsko-pomorskie", labelKey: msg`Kujawsko-Pomorskie` },
      { value: "lubelskie", labelKey: msg`Lubelskie` },
      { value: "lubuskie", labelKey: msg`Lubuskie` },
      { value: "lodzkie", labelKey: msg`Łódzkie` },
      { value: "malopolskie", labelKey: msg`Małopolskie` },
      { value: "mazowieckie", labelKey: msg`Mazowieckie` },
      { value: "opolskie", labelKey: msg`Opolskie` },
      { value: "podkarpackie", labelKey: msg`Podkarpackie` },
      { value: "podlaskie", labelKey: msg`Podlaskie` },
      { value: "pomorskie", labelKey: msg`Pomorskie` },
      { value: "slaskie", labelKey: msg`Śląskie` },
      { value: "swietokrzyskie", labelKey: msg`Świętokrzyskie` },
      { value: "warminsko-mazurskie", labelKey: msg`Warmińsko-mazurskie` },
      { value: "wielkopolskie", labelKey: msg`Wielkopolskie` },
      { value: "zachodniopomorskie", labelKey: msg`Zachodniopomorskie` },
    ],
  },
];
