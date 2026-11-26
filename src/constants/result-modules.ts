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
  "6050b1e94cb55b0006bdebdf": [
    {
      id: "a1b2c3d4-2137-4001-8001-000000000001", // 2137values axes
      type: "multi_axis",
      position: 0,
      column: "start",
      axisIds: [
        "64c82ed5b7755d00084285aa",
        "64c82ed5b7755d00084285ab",
        "64c82ed5b7755d00084285ac",
        "64c82ed5b7755d00084285ad",
        "64c82ed5b7755d00084285ae",
        "64c82ed5b7755d00084285af",
        "64c82ed5b7755d00084285b0",
        "64c82ed5b7755d00084285b1",
        "64c82ed5b7755d00084285b2",
        "64c82ed5b7755d00084285b3",
        "64c82ed5b7755d00084285b4",
        "64c82ed5b7755d00084285b5",
        "64c82ed5b7755d00084285b6",
        "64c82ed5b7755d00084285b7",
        "64c82ed5b7755d00084285b8",
        "64c82ed5b7755d00084285b9",
        "64c82ed5b7755d00084285ba",
        "64c82ed5b7755d00084285bb",
        "64c82ed5b7755d00084285bc",
        "64c82ed5b7755d00084285bd",
        "64c82ed5b7755d00084285be",
      ],
      orientationIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Osie poglądów",
            en: "Axes",
          },
        },
        {
          key: "description",
          value: {
            pl: "Każda z 21 osi pokazuje Twoje stanowisko pomiędzy dwiema przeciwstawnymi wartościami politycznymi, gospodarczymi i społecznymi.",
            en: "Each of the 21 axes shows your stance between two opposing political, economic, and social values.",
          },
        },
      ],
    },
    {
      id: "a1b2c3d4-2137-4002-8002-000000000002", // 2137values dominant ideologies
      type: "horizontal_bar",
      position: 1,
      column: "end",
      orientationIds: [
        "611f7b4cdbf2490006202fd8",
        "611f7b5bdbf249000620314b",
        "611f7b67dbf24900062031a6",
        "611f7b88dbf2490006203216",
        "611f7b9bdbf2490006203249",
        "611f7bacdbf249000620324b",
        "611f7bdcdbf2490006203394",
        "611f7be8dbf2490006203395",
        "611f7c13dbf249000620351c",
        "611f7c2fdbf249000620354a",
        "611f7c3fdbf24900062035a5",
        "611f7c4cdbf24900062036c0",
        "611f7c5ddbf24900062037c9",
        "611f7c6cdbf24900062037ca",
        "611f7cb3dbf2490006203892",
        "611f7cd2dbf2490006203915",
        "611f7ce4dbf2490006203971",
        "611f7cf9dbf2490006203a30",
        "611f7d0bdbf2490006203ad1",
        "611f7d14dbf2490006203ad2",
        "611f7d28dbf2490006203afb",
        "611f7d50dbf2490006203c5b",
        "611f7d7adbf2490006203e8d",
        "611f7d84dbf2490006203e8e",
        "611f7d8ddbf2490006203f1b",
        "611f7d98dbf2490006203f1c",
        "611f7da4dbf2490006203f31",
        "611f7db0dbf2490006204112",
        "611f7dcbdbf2490006204178",
        "611f7dd4dbf2490006204241",
        "611f7de2dbf2490006204260",
        "611f7defdbf24900062042e3",
        "611f7dfedbf249000620433e",
        "611f7e0ddbf2490006204394",
        "611f7e1ddbf24900062043c7",
        "611f7e27dbf2490006204422",
        "611f7e3fdbf249000620453b",
        "611f7e53dbf24900062045aa",
        "611f7e7cdbf24900062047f5",
        "611f7eabdbf249000620488f",
        "611f7effdbf2490006204b24",
        "611f7f0adbf2490006204b75",
      ],
      axisIds: [],
      values: [
        {
          key: "title",
          value: {
            pl: "Dominujące wartości",
            en: "Dominant values",
          },
        },
        {
          key: "description",
          value: {
            pl: "Ranking wartości i ideologii najbliższych Twoim odpowiedziom w quizie 2137values.",
            en: "Ranking of values and ideologies closest to your answers in the 2137values quiz.",
          },
        },
        {
          key: "visibleRows",
          value: 10,
        },
      ],
    },
  ],
};
