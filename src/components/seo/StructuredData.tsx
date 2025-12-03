import React from "react";
import { albums } from "@/data/music";
import { upcomingShows } from "@/data/shows";
import { socialPlatforms } from "@/data/social";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shazamat.com";

export default function StructuredData() {
  // MusicGroup schema for the band
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
    foundingLocation: {
      "@type": "Place",
      name: "Israel",
    },
    album: albums.map((album) => {
      const albumData: any = {
        "@type": "MusicAlbum",
        name: album.title,
        "@id": `${siteUrl}/#album-${album.id}`,
        datePublished: album.year,
      };
      if (album.coverImage) {
        albumData.image = `${siteUrl}${album.coverImage}`;
      }
      if (album.spotify) {
        albumData.potentialAction = {
          "@type": "ListenAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: album.spotify,
          },
        };
      }
      return albumData;
    }),
  };

  // Individual MusicAlbum schemas
  const albumSchemas = albums.map((album) => ({
    "@context": "https://schema.org",
    "@type": "MusicAlbum",
    "@id": `${siteUrl}/#album-${album.id}`,
    name: album.title,
    ...(album.coverImage && {
      image: `${siteUrl}${album.coverImage}`,
    }),
    datePublished: album.year,
    byArtist: {
      "@type": "MusicGroup",
      name: "שאזאמאט",
      alternateName: "Shazamat",
    },
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
      additionalProperty: {
        "@type": "PropertyValue",
        name: "Apple Music",
        value: album.appleMusic,
      },
    }),
  }));

  // Event schemas for upcoming shows
  const eventSchemas = upcomingShows
    .filter((show) => {
      const showDate = new Date(show.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return showDate >= today;
    })
    .map((show) => {
      const showDate = new Date(show.date);
      return {
        "@context": "https://schema.org",
        "@type": "MusicEvent",
        name: `הופעה של שאזאמאט - ${show.city}`,
        startDate: showDate.toISOString(),
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
        performer: {
          "@type": "MusicGroup",
          name: "שאזאמאט",
          alternateName: "Shazamat",
        },
        ...(show.ticketLink &&
          show.ticketLink !== "#" && {
            offers: {
              "@type": "Offer",
              url: show.ticketLink,
              availability: "https://schema.org/InStock",
            },
          }),
      };
    });

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "שאזאמאט",
    alternateName: "Shazamat",
    url: siteUrl,
    logo: `${siteUrl}/images/hero-image.webp`,
    sameAs: socialPlatforms.map((platform) => platform.url),
    contactPoint: {
      "@type": "ContactPoint",
      email: "mulu.records@gmail.com",
      contactType: "customer service",
    },
  };

  // BreadcrumbList schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "בית",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "הופעות",
        item: `${siteUrl}#shows`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "מוזיקה",
        item: `${siteUrl}#music`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: "צור קשר",
        item: `${siteUrl}#contact`,
      },
    ],
  };

  // Combine all schemas
  const schemas = [
    musicGroupSchema,
    organizationSchema,
    breadcrumbSchema,
    ...albumSchemas,
    ...eventSchemas,
  ];

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
