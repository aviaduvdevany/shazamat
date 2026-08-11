import React from "react";
import { socialPlatforms } from "@/data/social";
import { getPublicShows } from "@/lib/shows/queries";
import { getPublicAlbums } from "@/lib/albums/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shazamat.com";

export default async function StructuredData() {
  const [shows, albums] = await Promise.all([
    getPublicShows(),
    getPublicAlbums(),
  ]);
  const futureShows = shows.filter((s) => !s.isPast);

  const musicGroupSchema = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    name: "שאזאמאט",
    alternateName: "Shazamat",
    description: "שאזאמאט - להקת היפ-הופ ישראלית. מוזיקה, הופעות, אלבומים.",
    url: siteUrl,
    image: `${siteUrl}/images/hero-image.webp`,
    logo: `${siteUrl}/images/hero-image.webp`,
    genre: "Hip Hop",
    sameAs: socialPlatforms.map((platform) => platform.url),
    email: "mulu.records@gmail.com",
    foundingLocation: { "@type": "Place", name: "Israel" },
    album: albums.map((album) => {
      const albumData: Record<string, unknown> = {
        "@type": "MusicAlbum",
        name: album.title,
        "@id": `${siteUrl}/#album-${album.id}`,
        datePublished: album.year,
      };
      if (album.coverImage) {
        albumData.image = album.coverImage.startsWith("/")
          ? `${siteUrl}${album.coverImage}`
          : album.coverImage;
      }
      if (album.spotify) {
        albumData.potentialAction = {
          "@type": "ListenAction",
          target: { "@type": "EntryPoint", urlTemplate: album.spotify },
        };
      }
      return albumData;
    }),
  };

  const albumSchemas = albums.map((album) => ({
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    "@id": `${siteUrl}/#album-${album.id}`,
    name: album.title,
    ...(album.coverImage && {
      image: album.coverImage.startsWith("/")
        ? `${siteUrl}${album.coverImage}`
        : album.coverImage,
    }),
    datePublished: album.year,
    byArtist: { "@type": "MusicGroup", name: "שאזאמאט", alternateName: "Shazamat" },
    ...(album.spotify && {
      offers: {
        "@type": "Offer",
        url: album.spotify,
        availability: "https://schema.org/InStock",
        price: "0",
        priceCurrency: "USD",
      },
    }),
    ...(album.appleMusic && {
      additionalProperty: { "@type": "PropertyValue", name: "Apple Music", value: album.appleMusic },
    }),
  }));

  const eventSchemas = futureShows.map((show) => ({
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: `הופעה של שאזאמאט - ${show.city}`,
    startDate: new Date(show.date).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: show.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: show.city,
        addressCountry: "IL",
      },
    },
    performer: { "@type": "MusicGroup", name: "שאזאמאט", alternateName: "Shazamat" },
    ...(show.ticketLink && show.ticketLink !== "#" && {
      offers: { "@type": "Offer", url: show.ticketLink, availability: "https://schema.org/InStock" },
    }),
  }));

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "שאזאמאט",
    alternateName: "Shazamat",
    url: siteUrl,
    logo: `${siteUrl}/images/hero-image.webp`,
    sameAs: socialPlatforms.map((platform) => platform.url),
    contactPoint: { "@type": "ContactPoint", email: "mulu.records@gmail.com", contactType: "customer service" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "בית", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "הופעות", item: `${siteUrl}#shows` },
      { "@type": "ListItem", position: 3, name: "מוזיקה", item: `${siteUrl}#music` },
      { "@type": "ListItem", position: 4, name: "צור קשר", item: `${siteUrl}#contact` },
    ],
  };

  const schemas = [musicGroupSchema, organizationSchema, breadcrumbSchema, ...albumSchemas, ...eventSchemas];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
