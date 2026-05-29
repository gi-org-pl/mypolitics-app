export type DemographicsFieldOption = {
  value: string;
  labelKey: string;
};

export type DemographicsField = {
  control: string;
  labelKey: string;
  full: boolean;
  options: DemographicsFieldOption[];
};

// Age options: "0" = under 18, then numeric 18–117
const ageOptions: DemographicsFieldOption[] = [
  { value: "0", labelKey: "Mniej niż 18" },
  ...Array.from({ length: 100 }, (_, i) => ({
    value: String(i + 18),
    labelKey: String(i + 18),
  })),
];

export const demographicsData: DemographicsField[] = [
  {
    control: "age",
    labelKey: "Wiek",
    full: false,
    options: ageOptions,
  },
  {
    control: "gender",
    labelKey: "Płeć",
    full: false,
    options: [
      { value: "male", labelKey: "Mężczyzna" },
      { value: "female", labelKey: "Kobieta" },
      { value: "other", labelKey: "Inna płeć" },
    ],
  },
  {
    control: "residenceAreaSize",
    labelKey: "Wielkość miejsca zamieszkania",
    full: true,
    options: [
      { value: "village", labelKey: "Wieś" },
      { value: "city_below_50k", labelKey: "Miasto poniżej 50 tysięcy mieszkańców" },
      { value: "city_below_200k", labelKey: "Miasto poniżej 200 tysięcy mieszkańców" },
      { value: "city_below_500k", labelKey: "Miasto poniżej 500 tysięcy mieszkańców" },
      { value: "city_over_500k", labelKey: "Miasto powyżej 500 tysięcy mieszkańców" },
    ],
  },
  {
    control: "education",
    labelKey: "Wykształcenie",
    full: true,
    options: [
      { value: "primary", labelKey: "Wykształcenie podstawowe" },
      { value: "basic_vocational", labelKey: "Wykształcenie zasadnicze zawodowe" },
      { value: "secondary", labelKey: "Wykształcenie średnie" },
      { value: "higher", labelKey: "Wykształcenie wyższe" },
    ],
  },
  {
    control: "region",
    labelKey: "Województwo",
    full: true,
    options: [
      { value: "dolnoslaskie", labelKey: "Dolnośląskie" },
      { value: "kujawsko-pomorskie", labelKey: "Kujawsko-Pomorskie" },
      { value: "lubelskie", labelKey: "Lubelskie" },
      { value: "lubuskie", labelKey: "Lubuskie" },
      { value: "lodzkie", labelKey: "Łódzkie" },
      { value: "malopolskie", labelKey: "Małopolskie" },
      { value: "mazowieckie", labelKey: "Mazowieckie" },
      { value: "opolskie", labelKey: "Opolskie" },
      { value: "podkarpackie", labelKey: "Podkarpackie" },
      { value: "podlaskie", labelKey: "Podlaskie" },
      { value: "pomorskie", labelKey: "Pomorskie" },
      { value: "slaskie", labelKey: "Śląskie" },
      { value: "swietokrzyskie", labelKey: "Świętokrzyskie" },
      { value: "warminsko-mazurskie", labelKey: "Warmińsko-Mazurskie" },
      { value: "wielkopolskie", labelKey: "Wielkopolskie" },
      { value: "zachodniopomorskie", labelKey: "Zachodniopomorskie" },
    ],
  },
];