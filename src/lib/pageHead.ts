const SITE = "Mi Fotomulta Clara";

/** Head tags for a route. Each content route sets its own title and description. */
export function pageHead(title: string, description: string) {
  const fullTitle = `${title} | ${SITE}`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
