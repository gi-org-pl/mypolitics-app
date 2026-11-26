// The images quizzes in use send for their orientations, cut from
// GET https://api.mypolitics.pl/api/v1/survey/60beb898-a4e4-4160-88c4-07a9931ab499
// as it answered on 2026-10-13. There are two kinds, and they are not alike:
//
//   - the icon of an ideology: an SVG that is the glyph alone, white, 12-21 px
//     wide and 13-19 px high, with no margin around it,
//   - the portrait of an identity (257 x 256 px) and the logo of a party
//     (512 x 513 px): a PNG that fills its square.

// The addresses, for what is decided by the address alone.
export const GLYPH_ADDRESS =
  "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/progresywizm.svg";
export const PORTRAIT_ADDRESS =
  "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/identities/spoleczny-patriota-m.png";
export const LOGO_ADDRESS =
  "https://orlow.fra1.cdn.digitaloceanspaces.com/frontend/public/icons/v2/zieloni.png";

const toAddress = (file: string): string =>
  `data:image/svg+xml,${encodeURIComponent(file)}`;

// Four of the icons as files, written into addresses so that a story draws
// them without asking the network: each with the width, the height and the
// path it is served with, and only the clip around the whole picture left
// out. A wide one, two tall ones and the widest of the quiz.
export const GLYPHS = {
  // progresywizm.svg, 18 x 17
  progressivism: toAddress(
    '<svg width="18" height="17" viewBox="0 0 18 17" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.9999 5.50952C11.4468 5.50952 10.9999 5.06265 10.9999 4.50952C10.9999 3.9564 11.4468 3.50952 11.9999 3.50952H16.9999C17.553 3.50952 17.9999 3.9564 17.9999 4.50952V9.50952C17.9999 10.0626 17.553 10.5095 16.9999 10.5095C16.4468 10.5095 15.9999 10.0626 15.9999 9.50952V6.92515L10.7062 12.2158C10.3155 12.6064 9.68115 12.6064 9.29053 12.2158L5.9999 8.92515L1.70615 13.2158C1.31553 13.6064 0.681152 13.6064 0.290527 13.2158C-0.100098 12.8251 -0.100098 12.1908 0.290527 11.8001L5.29053 6.80015C5.68115 6.40952 6.31553 6.40952 6.70615 6.80015L9.9999 10.0939L14.5843 5.50952H11.9999Z" fill="white"/></svg>',
  ),
  // tradycjonalizm.svg, 14 x 19
  traditionalism: toAddress(
    '<svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.55957 0.509521C0.937305 0.509521 0.43457 1.01226 0.43457 1.63452C0.43457 2.25679 0.937305 2.75952 1.55957 2.75952V3.14624C1.55957 4.63687 2.15371 6.06772 3.2084 7.12241L5.59199 9.50952L3.2084 11.8966C2.15371 12.9513 1.55957 14.3822 1.55957 15.8728V16.2595C0.937305 16.2595 0.43457 16.7623 0.43457 17.3845C0.43457 18.0068 0.937305 18.5095 1.55957 18.5095H2.68457H11.6846H12.8096C13.4318 18.5095 13.9346 18.0068 13.9346 17.3845C13.9346 16.7623 13.4318 16.2595 12.8096 16.2595V15.8728C12.8096 14.3822 12.2154 12.9513 11.1607 11.8966L8.77715 9.50952L11.1643 7.12241C12.2189 6.06772 12.8131 4.63687 12.8131 3.14624V2.75952C13.4354 2.75952 13.9381 2.25679 13.9381 1.63452C13.9381 1.01226 13.4354 0.509521 12.8131 0.509521H11.6846H2.68457H1.55957ZM3.80957 3.14624V2.75952H10.5596V3.14624C10.5596 3.81421 10.3627 4.46108 9.99707 5.00952H4.37207C4.00996 4.46108 3.80957 3.81421 3.80957 3.14624ZM4.37207 14.0095C4.49512 13.8232 4.63926 13.6474 4.79746 13.4857L7.18457 11.1021L9.57168 13.4892C9.7334 13.6509 9.87402 13.8267 9.99707 14.013L4.37207 14.0095Z" fill="white"/></svg>',
  ),
  // rownosc.svg, 16 x 19
  equality: toAddress(
    '<svg width="16" height="19" viewBox="0 0 16 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.91406 5.00952C1.2918 5.00952 0.789062 5.51226 0.789062 6.13452C0.789062 6.75679 1.2918 7.25952 1.91406 7.25952H14.2891C14.9113 7.25952 15.4141 6.75679 15.4141 6.13452C15.4141 5.51226 14.9113 5.00952 14.2891 5.00952H1.91406ZM1.91406 11.7595C1.2918 11.7595 0.789062 12.2623 0.789062 12.8845C0.789062 13.5068 1.2918 14.0095 1.91406 14.0095H14.2891C14.9113 14.0095 15.4141 13.5068 15.4141 12.8845C15.4141 12.2623 14.9113 11.7595 14.2891 11.7595H1.91406Z" fill="white"/></svg>',
  ),
  // The widest icon of the quiz, wolny-rynek.svg, stands at 21 x 19: this is
  // a bar of that size, the largest a glyph of the quiz gets.
  widest: toAddress(
    '<svg width="21" height="19" viewBox="0 0 21 19" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 3.5h21v12H0v-12Zm10.5 2.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" fill="white" fill-rule="evenodd"/></svg>',
  ),
} as const;
