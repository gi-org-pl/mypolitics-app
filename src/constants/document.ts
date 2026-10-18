// The name and the address of the app, for the head of the document. A link
// preview is fetched by a crawler that does not run the app's scripts, so
// what it reads is in the built entry page, and the image is named by an
// absolute address: crawlers do not resolve relative ones.
export const SITE_NAME = "myPolitics";

export const SITE_URL = "https://mypolitics.pl";

// The primary logo on white with the clear space of the brand book, until the
// brand template for link previews replaces it.
export const SHARE_IMAGE = {
  url: `${SITE_URL}/og-image.png`,
  type: "image/png",
  width: 1200,
  height: 630,
} as const;
