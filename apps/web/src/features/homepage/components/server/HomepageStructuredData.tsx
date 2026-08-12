// src/features/homepage/components/server/HomepageStructuredData.tsx
// Injects JSON-LD structured data for the homepage.
// Improves SEO rich results: Organisation, WebSite (with sitelinks search box).
// Server Component — renders directly to <head> via next/head pattern.

interface HomepageStructuredDataProps {
  siteUrl: string;
}

export function HomepageStructuredData({
  siteUrl,
}: HomepageStructuredDataProps) {
  const organisationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}/#organization`,
    name: "Da'wahTube",
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/icons/logo.png`,
      width: 512,
      height: 512,
      caption: "Da'wahTube",
    },
    description:
      "Authentic Islamic knowledge upon the Qur'an and Sunnah according to the understanding of the Salaf-us-Saalih.",
    foundingLocation: {
      "@type": "Place",
      addressCountry: "NG",
    },
    knowsAbout: [
      "Islamic lectures",
      "Quranic studies",
      "Hadith sciences",
      "Aqeedah",
      "Fiqh",
      "Salafi methodology",
    ],
    inLanguage: ["en", "ar"],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: "Da'wahTube",
    description: "Authentic Islamic knowledge platform",
    publisher: { "@id": `${siteUrl}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "en",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
