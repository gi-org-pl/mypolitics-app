import type { OwnResultModule } from "@/types/results";

// The API sends no result modules yet. Until it does, the app keeps the list
// of each quiz it knows, by the identifier of the survey: the identity quiz
// first, the presidential quiz second. Each list says what the result page of
// the old site showed for its quiz: which cards, in which order, with which
// explanations, and what happens below a partial match - the identity quiz
// named the closest identity all the same, with a notice, and said that there
// is no closest party; the presidential quiz said that nobody is close. The
// header of each also names the comparison after what it compares with - the
// identities of one quiz, the candidates of the other - as the old site did.
//
// A record is written as the API would send it - its identifier a UUID, its
// values a list of pairs of a key and a value - except that a text is a value
// that holds each language. The comment beside an identifier says which
// record it is. A list from the API wins over the one here.
export const OWN_RESULT_MODULES: Record<string, OwnResultModule[]> = {
  "60beb898-a4e4-4160-88c4-07a9931ab499": [
    {
      id: "e7a3dbe2-b263-444a-b686-f7c801c17879", // the header of the identity quiz
      type: "header",
      position: 0,
      orientationIds: [
        "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
        "99681a0e-6851-4967-8fcc-cf77ac4717a5",
        "14fc7ded-e9c0-447c-aa18-380d7241be00",
        "5f733105-050f-4d65-8d1c-5f387212ea0b",
        "296019ab-8963-4590-896e-51426517d11b",
        "90e1762d-9e22-4f32-8130-e7828595ea1f",
        "6f1cb5a4-232a-41b5-a848-f2329406d12d",
        "59d45ff8-6e4c-47b8-895e-1846a2d0fe94",
        "322b9b00-b131-4d8b-9eb5-c38ba552dc93",
        "4cf08882-e9f9-4f5d-a27c-eac3f24e3a77",
        "8625fa1f-e39e-4183-8a37-5d78fa6c3c85",
        "4a1c3bef-42fc-49d2-b8c7-279a446aa9e3",
        "a6ef4109-7141-4b0b-9924-b87a700d90b5",
        "2e46f89d-913e-4d82-85a6-70a8c25902f5",
        "010a5a3d-0729-4315-b231-c9dd081d0d55",
      ],
      axisIds: [],
      values: [
        {
          key: "lowMatch",
          value: "named",
        },
        {
          key: "label.lowMatch",
          value: {
            pl: "Twoje poglądy nie są wystarczająco podobne do żadnej tożsamości (mniej niż 50% pewności).",
            en: "Your views are not similar enough to any identity (less than 50% confidence).",
          },
        },
        {
          key: "label.compare",
          value: {
            pl: "Z tożsamością",
            en: "With an identity",
          },
        },
      ],
    },
    {
      id: "34247794-ee0f-451b-9e48-b8685067c8de", // its axes
      type: "multi_axis",
      position: 1,
      column: "start",
      axisIds: [
        "6c2611c8-2989-48a9-ab9f-dbf45dbb3496",
        "c4b9c12a-96e5-4b8a-88ea-0a0b262b13d0",
        "fe9a1d36-e127-4aee-bd88-a5638415ecc2",
        "10e3dd16-08a4-45de-90af-2a1dcda7177b",
        "5bee0f10-a7d2-43ee-a731-384c2e68067a",
        "5b50de95-3b38-414f-aa17-f2e1dc88bac8",
        "34986b5c-5f60-407e-86e1-537b70a133da",
        "21103775-2988-41a6-97e8-d6e955d915d6",
        "8994da07-5c80-475f-9aca-cff8b519a1a2",
        "25233c46-e0d3-4288-ac4f-bae8b9dcda8f",
        "99ac7fae-050b-4847-91f9-fb2e7d83ff72",
        "400ac069-425a-42dd-838f-083adef98f2b",
        "841d9884-aedd-48ad-ac5b-bc59109efcc9",
        "32460d47-dca9-4029-baa7-ad3c45740680",
        "94e03d6a-562a-4f7f-ba67-01a1ac41effa",
        "c1ffca92-311c-4f09-b41e-81f5961198e4",
      ],
      orientationIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Ideologie",
            en: "Ideologies",
          },
        },
        {
          key: "description",
          value: {
            pl: "Oś określa bliskość do ideologii. Dodatkowe osie opisują Twoje poglądy na węższych płaszczyznach niż osie główne (widoczne domyślnie). Ich zadaniem jest opisać Twoje poglądy w bardziej precyzyjny sposób.",
            en: "An axis shows how close you are to an ideology. The additional axes describe your views on narrower planes than the main axes (the ones shown by default). Their job is to describe your views more precisely.",
          },
        },
        {
          key: "groupBy",
          value: "category",
        },
      ],
    },
    {
      id: "b9f37f04-1b35-4423-ba31-90d523a09664", // its identity card
      type: "archetype",
      position: 2,
      column: "end",
      orientationIds: [
        "f108a0b0-1ac7-4111-88cb-a4bbfe7f059b",
        "99681a0e-6851-4967-8fcc-cf77ac4717a5",
        "14fc7ded-e9c0-447c-aa18-380d7241be00",
        "5f733105-050f-4d65-8d1c-5f387212ea0b",
        "296019ab-8963-4590-896e-51426517d11b",
        "90e1762d-9e22-4f32-8130-e7828595ea1f",
        "6f1cb5a4-232a-41b5-a848-f2329406d12d",
        "59d45ff8-6e4c-47b8-895e-1846a2d0fe94",
        "322b9b00-b131-4d8b-9eb5-c38ba552dc93",
        "4cf08882-e9f9-4f5d-a27c-eac3f24e3a77",
        "8625fa1f-e39e-4183-8a37-5d78fa6c3c85",
        "4a1c3bef-42fc-49d2-b8c7-279a446aa9e3",
        "a6ef4109-7141-4b0b-9924-b87a700d90b5",
        "2e46f89d-913e-4d82-85a6-70a8c25902f5",
        "010a5a3d-0729-4315-b231-c9dd081d0d55",
      ],
      axisIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Tożsamość",
            en: "Identity",
          },
        },
        {
          key: "lowMatch",
          value: "named",
        },
      ],
    },
    {
      id: "9ada868c-90a5-42e1-a12a-b1f4ecd3150b", // its compass
      type: "nolan_chart",
      position: 3,
      column: "end",
      axisIds: [
        "8bd5f826-1aed-409b-8a6e-da4a76189c03",
        "092ea01d-2d31-4ee2-ae30-deffa1c7c096",
      ],
      orientationIds: [],
      values: [
        {
          key: "description",
          value: {
            pl: "Kompas dwuosiowy to forma prezentacji Twoich poglądów na wykresie dwuosiowym. Oś pozioma to poglądy gospodarcze (lewica-prawica), a pionowa to poglądy obyczajowe (lewica na dole, prawica na górze).",
            en: "The compass shows your views on two axes. The horizontal one is economic views (left to right), the vertical one is social views (left at the bottom, right at the top).",
          },
        },
        {
          key: "label.centre",
          value: {
            pl: "Centrowy",
            en: "Centrist",
          },
        },
        {
          key: "label.horizontalStartModerate",
          value: {
            pl: "Lewicowy gospodarczo",
            en: "Economically left-wing",
          },
        },
        {
          key: "label.horizontalStartExtreme",
          value: {
            pl: "Lewicowy gospodarczo",
            en: "Economically left-wing",
          },
        },
        {
          key: "label.horizontalEndModerate",
          value: {
            pl: "Prawicowy gospodarczo",
            en: "Economically right-wing",
          },
        },
        {
          key: "label.horizontalEndExtreme",
          value: {
            pl: "Prawicowy gospodarczo",
            en: "Economically right-wing",
          },
        },
        {
          key: "label.verticalStartModerate",
          value: {
            pl: "Lewicowy światopoglądowo",
            en: "Socially left-wing",
          },
        },
        {
          key: "label.verticalStartExtreme",
          value: {
            pl: "Lewicowy światopoglądowo",
            en: "Socially left-wing",
          },
        },
        {
          key: "label.verticalEndModerate",
          value: {
            pl: "Prawicowy światopoglądowo",
            en: "Socially right-wing",
          },
        },
        {
          key: "label.verticalEndExtreme",
          value: {
            pl: "Prawicowy światopoglądowo",
            en: "Socially right-wing",
          },
        },
        {
          key: "label.bottomLeftModerate",
          value: {
            pl: "Lewicowy",
            en: "Left-wing",
          },
        },
        {
          key: "label.bottomLeftExtreme",
          value: {
            pl: "Lewicowy",
            en: "Left-wing",
          },
        },
        {
          key: "label.topRightModerate",
          value: {
            pl: "Prawicowy",
            en: "Right-wing",
          },
        },
        {
          key: "label.topRightExtreme",
          value: {
            pl: "Prawicowy",
            en: "Right-wing",
          },
        },
        {
          key: "label.topLeftModerate",
          value: {
            pl: "Mieszany",
            en: "Mixed",
          },
        },
        {
          key: "label.topLeftExtreme",
          value: {
            pl: "Mieszany",
            en: "Mixed",
          },
        },
        {
          key: "label.bottomRightModerate",
          value: {
            pl: "Mieszany",
            en: "Mixed",
          },
        },
        {
          key: "label.bottomRightExtreme",
          value: {
            pl: "Mieszany",
            en: "Mixed",
          },
        },
      ],
    },
    {
      id: "2c5ba77b-959e-421a-8079-edf2d948a01c", // its parties
      type: "horizontal_bar",
      position: 4,
      column: "end",
      orientationIds: [
        "a3356612-5554-4510-a867-71b03bc63980",
        "c00d6c51-7ab2-450d-b779-8a01ab269965",
        "fa5274b9-3b9f-4d54-a07f-fe96bb65b2a9",
        "cd7c4031-81a4-4a93-aa04-a66651f10b8a",
        "6a2f8e53-1573-4257-b0eb-1806e3fe137a",
        "2d2b6c42-a704-4276-b88a-53b8f712456d",
        "2cd6fdd2-4144-4eb9-873e-ef6316b8f9c2",
        "044d38fe-a589-4240-9f66-1ae728f757a4",
        "6a890e5e-7137-4e8c-a7ba-a140b639d71e",
        "09d0f391-236c-4de2-860a-d86b023214b3",
        "9d67d502-a832-489e-aa5d-af8ef69b72aa",
      ],
      axisIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Partie",
            en: "Parties",
          },
        },
        {
          key: "description",
          value: {
            pl: "Te partie zazwyczaj wybierają osoby o poglądach podobnych do Twoich. W quizie tożsamościowym nie dopasowujemy partii do Twoich wyników według odpowiedzi. Zamiast tego najpierw określamy najbliższą tożsamość, a później to, jak ta tożsamość prawdopodobnie zagłosowałaby w wyborach.",
            en: "These parties are usually chosen by people with views similar to yours. The identity quiz does not match parties to your answers. It first finds your closest identity, and then how that identity would probably vote.",
          },
        },
        {
          key: "selection",
          value: "linked_to_leader",
        },
        {
          key: "label.empty",
          value: {
            pl: "Brak najbliższej partii",
            en: "No closest party",
          },
        },
      ],
    },
  ],
  "270f6c12-6551-4661-bfcf-52635a703928": [
    {
      id: "1046adae-2298-4fa2-a20c-023b67fc1e23", // the header of the presidential quiz
      type: "header",
      position: 0,
      orientationIds: [
        "50208528-a7de-4d9a-ba99-529ad8b85776",
        "565946a2-6622-4fb6-8eee-196408544e9a",
        "2f6058b0-ec60-435f-aa9a-31bfac23f586",
        "041b4896-272f-48fe-9def-c174756819d4",
        "761060bd-3e76-4ec5-80f4-30114cad8d0a",
        "a20ecba3-a899-41c8-87f5-1ca60996d763",
        "8eba6169-c6de-41d7-bcf2-1c9be62bafea",
        "a837818f-df74-4156-a370-44e01d98a3cf",
        "beedd58a-3d5d-4e4c-acc2-2c564d196fa0",
        "848ae1af-a051-41f8-949b-b8c587726216",
        "d7e8404f-25f1-460e-a37c-f58aa3aab2a8",
        "538434a9-dfed-4680-be7d-01eadfcb27fe",
        "176a1292-3630-4d2d-ae5f-f703de6dff51",
      ],
      axisIds: [],
      values: [
        {
          key: "label.link",
          value: {
            pl: "Program",
            en: "Programme",
          },
        },
        {
          key: "label.compare",
          value: {
            pl: "Z kandydatem",
            en: "With a candidate",
          },
        },
      ],
    },
    {
      id: "26585cf4-cfb5-4755-b6f6-f997764b60c5", // its candidates
      type: "horizontal_bar",
      position: 1,
      column: "start",
      orientationIds: [
        "50208528-a7de-4d9a-ba99-529ad8b85776",
        "565946a2-6622-4fb6-8eee-196408544e9a",
        "2f6058b0-ec60-435f-aa9a-31bfac23f586",
        "041b4896-272f-48fe-9def-c174756819d4",
        "761060bd-3e76-4ec5-80f4-30114cad8d0a",
        "a20ecba3-a899-41c8-87f5-1ca60996d763",
        "8eba6169-c6de-41d7-bcf2-1c9be62bafea",
        "a837818f-df74-4156-a370-44e01d98a3cf",
        "beedd58a-3d5d-4e4c-acc2-2c564d196fa0",
        "848ae1af-a051-41f8-949b-b8c587726216",
        "d7e8404f-25f1-460e-a37c-f58aa3aab2a8",
        "538434a9-dfed-4680-be7d-01eadfcb27fe",
        "176a1292-3630-4d2d-ae5f-f703de6dff51",
      ],
      axisIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Kandydaci",
            en: "Candidates",
          },
        },
        {
          key: "visibleRows",
          value: 13,
        },
      ],
    },
    {
      id: "a9fabbef-3b68-4121-ac03-174016fd849a", // its presidential identity
      type: "archetype",
      position: 2,
      column: "end",
      orientationIds: [
        "1f412f57-341b-42c5-a2cd-bfcc9a1bb420",
        "6f24ac8d-6ef8-427f-8fda-67c073eb6f39",
        "d928f20a-6003-40af-a329-e15e8c69483e",
        "0422c15e-5de5-424a-b024-ba5525403581",
        "8eaec33a-c2ac-4422-8933-a46cdc7eef2d",
        "f1c4f09c-e7bc-45e0-b9d6-b7bc5309eec5",
        "37b2a278-a43e-46ca-ba5b-52ef26b6da8d",
        "ba7240c9-3c0b-44cd-a941-45a93d1a6665",
        "c28e9896-ff92-4881-a650-0e7f828ec381",
        "a309edcc-327c-40ae-8ce7-a7528619a3c1",
      ],
      axisIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Prezydent",
            en: "President",
          },
        },
      ],
    },
    {
      id: "31a5619f-c941-4802-ac9b-4a477f5a2a90", // its candidates by category
      type: "horizontal_bar",
      position: 3,
      column: "end",
      orientationIds: [
        "50208528-a7de-4d9a-ba99-529ad8b85776",
        "565946a2-6622-4fb6-8eee-196408544e9a",
        "2f6058b0-ec60-435f-aa9a-31bfac23f586",
        "041b4896-272f-48fe-9def-c174756819d4",
        "761060bd-3e76-4ec5-80f4-30114cad8d0a",
        "a20ecba3-a899-41c8-87f5-1ca60996d763",
        "8eba6169-c6de-41d7-bcf2-1c9be62bafea",
        "a837818f-df74-4156-a370-44e01d98a3cf",
        "beedd58a-3d5d-4e4c-acc2-2c564d196fa0",
        "848ae1af-a051-41f8-949b-b8c587726216",
        "d7e8404f-25f1-460e-a37c-f58aa3aab2a8",
        "538434a9-dfed-4680-be7d-01eadfcb27fe",
        "176a1292-3630-4d2d-ae5f-f703de6dff51",
      ],
      axisIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Kategorie",
            en: "Categories",
          },
        },
        {
          key: "groupBy",
          value: "category",
        },
      ],
    },
  ],
  "604cdf356ab38a000755286e": [
    {
      id: "3b1c6f52-8d0e-4c1a-9a53-2f7e41d0a6b1", // the header
      type: "header",
      position: 0,
      orientationIds: [
        "604eb0664cb55b0006a2ce39", // Monarchizm
        "604eb1d44cb55b0006a2d183", // Transhumanizm
        "604eb3264cb55b0006a2d4eb", // Komunizm
        "604eb4af4cb55b0006a2d913", // Totalitaryzm
        "6055d3614cb55b0006f120e4", // Socjalizm
        "6055d3c14cb55b0006f12727", // Kapitalizm
        "6055d44a4cb55b0006f12bb8", // Regulacjonizm
        "6055d4a34cb55b0006f1304b", // Leseferyzm
        "6055d5314cb55b0006f135b9", // Wolność
        "6055d56a4cb55b0006f1390b", // Etatyzm społeczny
        "6055d5ec4cb55b0006f13f4c", // Pacyfizm
        "6055d6144cb55b0006f140d3", // Militaryzm
        "6055d6624cb55b0006f1466c", // Ekologizm
        "6055d6854cb55b0006f14816", // Industrializm
        "6055d6e84cb55b0006f15089", // Progresywizm
        "6055d7094cb55b0006f15330", // Tradycjonalizm
        "6055d7394cb55b0006f154f1", // Kosmopolityzm
        "6055d75e4cb55b0006f15634", // Nacjonalizm
        "601c6a849f049a1090129d31", // Pro-choice
        "601c6aae9f049a1090129d32", // Pro-gun
        "601c6aca9f049a1090129d33", // Laicyzm
        "6056a149bd78700007bb50f4", // Protekcjonizm
        "6056bc27bd78700007bb99d0", // Decentralizacja
        "6056bce1bd78700007bb9b55", // Centralizacja
        "6056bf5abd78700007bb9dd1", // Kara
        "6056c0b4bd78700007bba000", // Resocjalizacja
        "605739d0bd78700007bee0ac", // Postęp techniczny
        "60573a57bd78700007bee61f", // Prymitywizm
        "60573cdabd78700007bf05c9", // Autorytaryzm
        "60573d0abd78700007bf08a9", // Demokracja
        "60573e5ebd78700007bf200d", // Rząd Światowy
        "60574eb6bd78700007c014a6", // Autarkia
        "605774afbd78700007c24988", // Indywidualizm
        "6057756dbd78700007c255c1", // Kolektywizm
        "60578483bd78700007c3163d", // Teokracja
        "605799febd78700007c49a81", // Pro-life
        "608b3dfe74307d00068cdd64", // Religijność (name still says "do zmiany")
        "608b3e0f74307d00068cddff", // Sekularyzm
        "609304ae74307d0006e76fbe", // Eurofederalizm
        "60930f8374307d0006e86331", // Europa Tysiąca Liechtensteinów
        "609332c974307d0006e9f95c", // Izolacjonizm
        "6094303774307d0006f647ae", // Cenzura
        "6095e9b474307d00060a0f32", // Państwo Opiekuńcze
        "6095ed0474307d00060a125a", // Państwo Minimalne
        "60996e8c74307d0006333a91", // Eurosceptycyzm
        "609a863274307d0006411d2d", // Kara Śmierci
        "609c649074307d000657ac7b", // Demokracja bezpośrenia
        "60a57f3374307d0006c70468", // Supremacja Rasowa
        "60a57fb574307d0006c71370", // Egalitaryzm Rasowy
        "60b8d5ee77a5d700068e65da", // Egalitaryzm płciowy
        "60db9d1c1f404f0006ce5b36", // Wolność Słowa
        "619057032999470006e11185", // Interwencjonizm
        "61907c9e9fc83b00069ca631", // Euroreformizm
        "61907ee39fc83b00069ca7e2", // Reprezentacja natywna
        "6190e4289fc83b00069dc219", // Dyktatura wojskowa
        "6190e6d99fc83b00069ddd4d", // Technokracja
        "619102ef9fc83b00069fa5c0", // Infoanarchizm
        "61910d9a9fc83b0006a032de", // Gospodarka planowa
        "61982f27ff32d00007b5915c", // Anarchia
        "61982f49ff32d00007b59341", // Etatyzm
        "6198ef95ff32d00007b8b8d9", // Panarchizm
        "619e8443ff32d00007e62353", // Dyktatura proletariatu
        "61afb31ea18edb0007ec24c3", // Demilitaryzacja
        "61c113433860ef00069c5e21", // Korporacjonizm
        "61c119633860ef00069c9626", // Syndykalizm
        "61c48783b5431c0006f588c6", // Dzień Sznura
        "61dc993299423e000714b546", // Laborystyczna teoria wartości
        "61dda112cfba880007e11a5a", // Anti-gun
        "61e4c1419c89c100078501ee", // Georgizm
        "61f181cc19f2a100081ddfc9", // Imperializm
        "61f2a15619f2a10008264069", // Anarchizm
        "61f57edc6d41680008bb1b86", // Ateizm państwowy
        "61f6a0b9e8548b00082653f9", // Korporatokracja
        "61f6a37de8548b0008267488", // Socjalizm cytrynowy
        "61f9b7ad33a01c00079d06e8", // Separatyzm
        "61f9d0bf33a01c00079da311", // Agraryzm
        "620a35fcae020a000aaa6ff1", // Obowiązkowe szczepienia
        "6216cf5fae020a000a018505", // Oligarchia
        "621a67260813c600088893fb", // Rewolucjonizm
        "621a68270813c60008889817", // Reformizm
        "622541c1d1e5680008de968e", // Antysemityzm
        "624c08865d7fb20009f8e6bf", // Darwinizm społeczny
        "6266c3e45d7fb200097f062c", // Antyautorytaryzm
        "6266c4705d7fb200097f140f", // Antydemokracja
        "62c9ac0164851f000893ff01", // Merytokracja
        "6301714164851f0008a82acd", // Pobór
      ],
      axisIds: [],
      values: [
        { key: "lowMatch", value: "named" },
        {
          key: "label.lowMatch",
          value: {
            pl: "Twoje poglądy nie są wystarczająco podobne do żadnej ideologii (mniej niż 50% pewności).",
            en: "Your views are not similar enough to any ideology (less than 50% confidence).",
          },
        },
        {
          key: "label.compare",
          value: { pl: "Z ideologią", en: "With an ideology" },
        },
      ],
    },
    {
      id: "c84d2a97-5e13-47fb-b0a8-6d9f1e3c7a24", // its axes
      type: "multi_axis",
      position: 1,
      column: "start",
      axisIds: [
        "661864cf4d6609000888958c", // Socjalizm / Kapitalizm
        "661864cf4d6609000888958d", // Regulacjonizm / Leseferyzm
        "661864cf4d6609000888958e", // Wolność / Etatyzm społeczny
        "661864cf4d6609000888958f", // Anarchia / Etatyzm
        "661864cf4d66090008889590", // Kosmopolityzm / Nacjonalizm
        "661864cf4d66090008889591", // Egalitaryzm rasowy / Supremacja rasowa
        "661864cf4d66090008889592", // Interwencjonizm / Izolacjonizm
        "661864cf4d66090008889593", // Decentralizacja / Centralizacja
        "661864cf4d66090008889594", // Pacyfizm / Militaryzm
        "661864cf4d66090008889595", // Demokracja / Autorytaryzm
        "661864cf4d66090008889596", // Demokracja / Antydemokracja
        "661864cf4d66090008889597", // Autorytaryzm / Antyautorytaryzm
        "661864cf4d66090008889598", // Rewolucjonizm / Reformizm
        "661864cf4d66090008889599", // Progresywizm / Tradycjonalizm
        "661864cf4d6609000888959a", // Sekularyzm / Religijność
        "661864cf4d6609000888959b", // Kolektywizm / Indywidualizm
        "661864cf4d6609000888959c", // Resocjalizacja / Kara
        "661864cf4d6609000888959d", // Ekologizm / Industrializm
        "661864cf4d6609000888959e", // Prymitywizm / Postęp techniczny
      ],
      orientationIds: [],
      values: [
        { key: "title", value: { pl: "Ideologie", en: "Ideologies" } },
        {
          key: "description",
          value: {
            pl: "Każda oś pokazuje, do której z dwóch przeciwstawnych ideologii jest Ci bliżej.",
            en: "Each axis shows which of two opposing ideologies you are closer to.",
          },
        },
      ],
    },
    {
      id: "7e90b3d1-2a46-4f8c-8c15-a3d5e7b9f012", // its closest ideology
      type: "archetype",
      position: 2,
      column: "end",
      orientationIds: [
        "604eb0664cb55b0006a2ce39", // Monarchizm
        "604eb1d44cb55b0006a2d183", // Transhumanizm
        "604eb3264cb55b0006a2d4eb", // Komunizm
        "604eb4af4cb55b0006a2d913", // Totalitaryzm
        "6055d3614cb55b0006f120e4", // Socjalizm
        "6055d3c14cb55b0006f12727", // Kapitalizm
        "6055d44a4cb55b0006f12bb8", // Regulacjonizm
        "6055d4a34cb55b0006f1304b", // Leseferyzm
        "6055d5314cb55b0006f135b9", // Wolność
        "6055d56a4cb55b0006f1390b", // Etatyzm społeczny
        "6055d5ec4cb55b0006f13f4c", // Pacyfizm
        "6055d6144cb55b0006f140d3", // Militaryzm
        "6055d6624cb55b0006f1466c", // Ekologizm
        "6055d6854cb55b0006f14816", // Industrializm
        "6055d6e84cb55b0006f15089", // Progresywizm
        "6055d7094cb55b0006f15330", // Tradycjonalizm
        "6055d7394cb55b0006f154f1", // Kosmopolityzm
        "6055d75e4cb55b0006f15634", // Nacjonalizm
        "601c6a849f049a1090129d31", // Pro-choice
        "601c6aae9f049a1090129d32", // Pro-gun
        "601c6aca9f049a1090129d33", // Laicyzm
        "6056a149bd78700007bb50f4", // Protekcjonizm
        "6056bc27bd78700007bb99d0", // Decentralizacja
        "6056bce1bd78700007bb9b55", // Centralizacja
        "6056bf5abd78700007bb9dd1", // Kara
        "6056c0b4bd78700007bba000", // Resocjalizacja
        "605739d0bd78700007bee0ac", // Postęp techniczny
        "60573a57bd78700007bee61f", // Prymitywizm
        "60573cdabd78700007bf05c9", // Autorytaryzm
        "60573d0abd78700007bf08a9", // Demokracja
        "60573e5ebd78700007bf200d", // Rząd Światowy
        "60574eb6bd78700007c014a6", // Autarkia
        "605774afbd78700007c24988", // Indywidualizm
        "6057756dbd78700007c255c1", // Kolektywizm
        "60578483bd78700007c3163d", // Teokracja
        "605799febd78700007c49a81", // Pro-life
        "608b3dfe74307d00068cdd64", // Religijność (name still says "do zmiany")
        "608b3e0f74307d00068cddff", // Sekularyzm
        "609304ae74307d0006e76fbe", // Eurofederalizm
        "60930f8374307d0006e86331", // Europa Tysiąca Liechtensteinów
        "609332c974307d0006e9f95c", // Izolacjonizm
        "6094303774307d0006f647ae", // Cenzura
        "6095e9b474307d00060a0f32", // Państwo Opiekuńcze
        "6095ed0474307d00060a125a", // Państwo Minimalne
        "60996e8c74307d0006333a91", // Eurosceptycyzm
        "609a863274307d0006411d2d", // Kara Śmierci
        "609c649074307d000657ac7b", // Demokracja bezpośrenia
        "60a57f3374307d0006c70468", // Supremacja Rasowa
        "60a57fb574307d0006c71370", // Egalitaryzm Rasowy
        "60b8d5ee77a5d700068e65da", // Egalitaryzm płciowy
        "60db9d1c1f404f0006ce5b36", // Wolność Słowa
        "619057032999470006e11185", // Interwencjonizm
        "61907c9e9fc83b00069ca631", // Euroreformizm
        "61907ee39fc83b00069ca7e2", // Reprezentacja natywna
        "6190e4289fc83b00069dc219", // Dyktatura wojskowa
        "6190e6d99fc83b00069ddd4d", // Technokracja
        "619102ef9fc83b00069fa5c0", // Infoanarchizm
        "61910d9a9fc83b0006a032de", // Gospodarka planowa
        "61982f27ff32d00007b5915c", // Anarchia
        "61982f49ff32d00007b59341", // Etatyzm
        "6198ef95ff32d00007b8b8d9", // Panarchizm
        "619e8443ff32d00007e62353", // Dyktatura proletariatu
        "61afb31ea18edb0007ec24c3", // Demilitaryzacja
        "61c113433860ef00069c5e21", // Korporacjonizm
        "61c119633860ef00069c9626", // Syndykalizm
        "61c48783b5431c0006f588c6", // Dzień Sznura
        "61dc993299423e000714b546", // Laborystyczna teoria wartości
        "61dda112cfba880007e11a5a", // Anti-gun
        "61e4c1419c89c100078501ee", // Georgizm
        "61f181cc19f2a100081ddfc9", // Imperializm
        "61f2a15619f2a10008264069", // Anarchizm
        "61f57edc6d41680008bb1b86", // Ateizm państwowy
        "61f6a0b9e8548b00082653f9", // Korporatokracja
        "61f6a37de8548b0008267488", // Socjalizm cytrynowy
        "61f9b7ad33a01c00079d06e8", // Separatyzm
        "61f9d0bf33a01c00079da311", // Agraryzm
        "620a35fcae020a000aaa6ff1", // Obowiązkowe szczepienia
        "6216cf5fae020a000a018505", // Oligarchia
        "621a67260813c600088893fb", // Rewolucjonizm
        "621a68270813c60008889817", // Reformizm
        "622541c1d1e5680008de968e", // Antysemityzm
        "624c08865d7fb20009f8e6bf", // Darwinizm społeczny
        "6266c3e45d7fb200097f062c", // Antyautorytaryzm
        "6266c4705d7fb200097f140f", // Antydemokracja
        "62c9ac0164851f000893ff01", // Merytokracja
        "6301714164851f0008a82acd", // Pobór
      ],
      axisIds: [],
      values: [
        { key: "title", value: { pl: "Ideologia", en: "Ideology" } },
        { key: "lowMatch", value: "named" },
      ],
    },
  ],
};
