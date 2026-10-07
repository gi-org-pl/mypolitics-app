import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn, userEvent, within } from "storybook/test";

import type { AxisOrientation } from "@/types/axis";

import { Archetype } from "./Archetype";
import type { ArchetypeEntry } from "./Archetype.types";

const toDataUrl = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

const placeholderImageUrl = toDataUrl(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#dcdfe3"/><rect x="8.5" y="8.5" width="15" height="15" fill="none" stroke="white"/><path d="M8.5 8.5l15 15M23.5 8.5l-15 15" stroke="white"/></svg>',
);

const createPortraitUrl = (color: string): string =>
  toDataUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="white"/><circle cx="16" cy="12" r="6" fill="${color}"/><path d="M4 32a12 12 0 0 1 24 0z" fill="${color}"/></svg>`,
  );

const createArchetype = (
  id: string,
  name: string,
  color: string,
): AxisOrientation => ({
  id,
  name,
  color,
  imageUrl: createPortraitUrl(color),
});

const SHORT_DESCRIPTION =
  "Twoje poglądy łączą troskę o klimat, postęp społeczny i umiarkowany patriotyzm z wiarą w wolny rynek i pomoc słabszym.";

const FULL_DESCRIPTION = [
  "Zielonych Postępowców wyróżnia największe poparcie dla rozwoju ochrony przyrody we współczesnym świecie.",
  "Akceptują społeczny koszt odważnych rozwiązań klimatycznych, taki jak ograniczenie konsumpcji i wzrostu gospodarczego. Ich kraj jest dla nich dość ważny i szanują jego symbole, zarazem czują się silnie związani ze społecznością międzynarodową.",
  "Są postępowi — chcą powszechnego dostępu do aborcji czy związków dla osób jednopłciowych, natomiast kwestie religijne są dla nich drugorzędne.",
  "Uważają oni, że państwo powinno brać czynny udział w wyrównywaniu szans społecznych i pomocy potrzebującym, jednak wierzą, że dobrze funkcjonujące państwo opiera się na gospodarce wolnorynkowej.",
  "Niechętnie podchodzą do kontroli państwa nad obywatelami, jedynie w sytuacjach kryzysowych są skłonni ograniczyć swoje wolności na rzecz bezpieczeństwa.",
].join("\n\n");

const LONG_NAME =
  "Socjaldemokratyczny liberalizm instytucjonalny o bardzo długiej autorskiej nazwie";

const green = createArchetype("green", "Zielony postępowiec", "#3f8f4f");
const citizen = createArchetype("citizen", "Postępowy obywatel", "#b5123e");
const european = createArchetype("european", "Euroentuzjasta", "#14356e");
const libertarian = createArchetype("libertarian", "Libertarianin", "#f9c200");
const conservative = createArchetype(
  "conservative",
  "Konserwatywny wolnościowiec",
  "#16213f",
);
const national = createArchetype(
  "national",
  "Narodowy konserwatysta",
  "#730041",
);
const patriot = createArchetype("patriot", "Suwerenny patriota", "#0a1128");

const leader: ArchetypeEntry = {
  orientation: green,
  match: 80,
  shortDescription: SHORT_DESCRIPTION,
  fullDescription: FULL_DESCRIPTION,
};

const others: ArchetypeEntry[] = [
  { orientation: citizen, match: 70 },
  { orientation: european, match: 65 },
  { orientation: libertarian, match: 60 },
  { orientation: conservative, match: 45 },
  { orientation: national, match: 40 },
  { orientation: patriot, match: 20 },
];

const archetypes: ArchetypeEntry[] = [leader, ...others];

const placeholders: ArchetypeEntry[] = [
  {
    orientation: {
      id: "a",
      name: "Orientation Name",
      imageUrl: placeholderImageUrl,
    },
    match: 80,
    shortDescription: "Short description",
    fullDescription: "Full description",
  },
  ...["b", "c", "d", "e"].map((id, index) => ({
    orientation: {
      id,
      name: "Orientation Name",
      imageUrl: placeholderImageUrl,
    },
    match: 70 - index * 15,
  })),
];

const friend = createArchetype("friend", "Ania", "#004554");

const comparison = {
  party: friend,
  values: { green: 55, citizen: 86, patriot: 64, unknown: 40 },
};

const meta = {
  title: "Results/Archetype",
  component: Archetype,
  args: {
    title: "Tożsamość",
    archetypes,
    onStatsClick: fn(),
    onInfoClick: fn(),
  },
} satisfies Meta<typeof Archetype>;

export default meta;

type Story = StoryObj<typeof meta>;

const press =
  (name: string): Story["play"] =>
  async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name }));
  };

export const Standard: Story = {
  args: { title: "Title", archetypes: placeholders },
};

export const NoMatch: Story = {
  args: {
    archetypes: archetypes.map((archetype, index) => ({
      ...archetype,
      match: 45 - index * 6,
    })),
  },
};

export const Example: Story = {};

export const FullDescription: Story = {
  play: press("Pełny opis"),
};

export const Ranking: Story = {
  play: press("Ranking"),
};

export const PartialMatch: Story = {
  args: { archetypes: [{ ...leader, match: 72 }, ...others.slice(1)] },
};

export const NoDescription: Story = {
  args: { archetypes: [{ orientation: green, match: 80 }, ...others] },
};

export const OnlyFullDescription: Story = {
  args: {
    archetypes: [{ ...leader, shortDescription: undefined }, ...others],
  },
};

export const SingleArchetype: Story = {
  args: { archetypes: [leader] },
};

export const Empty: Story = {
  args: { archetypes: [] },
};

export const Comparison: Story = {
  args: { comparison },
};

export const ComparisonRanking: Story = {
  args: { comparison },
  play: press("Ranking"),
};

export const LongNames: Story = {
  args: {
    archetypes: archetypes.map((archetype) => ({
      ...archetype,
      orientation: { ...archetype.orientation, name: LONG_NAME },
    })),
  },
  play: press("Ranking"),
};

export const MarkupInDescription: Story = {
  args: {
    archetypes: [
      {
        ...leader,
        shortDescription:
          '<b>Pogrubienie</b>, [odnośnik](https://example.com) i <script>alert("x")</script> są pokazane tak, jak je napisano.\n\nDrugi akapit **bez** interpretacji.',
      },
      ...others,
    ],
  },
};
