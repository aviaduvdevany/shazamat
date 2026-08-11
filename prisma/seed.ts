import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local"), override: true });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding shows and albums from current hardcoded data...");

  // Clear existing data
  await prisma.album.deleteMany();
  await prisma.show.deleteMany();

  const shows = await prisma.$transaction(async (tx) => {
    const s1 = await tx.show.create({
      data: {
        date: new Date("2025-08-07"),
        city: "ירושלים",
        venue: "פסטיבל ישראל",
        ticketLink: null,
        isFeatured: false,
      },
    });

    const s2 = await tx.show.create({
      data: {
        date: new Date("2025-08-26"),
        city: "באר שבע",
        venue: "פסטיבל סמילנסקי",
        ticketLink: null,
        isFeatured: false,
      },
    });

    const s3 = await tx.show.create({
      data: {
        date: new Date("2025-08-28"),
        city: "תל אביב",
        venue: "לילה לבן",
        ticketLink: null,
        isFeatured: false,
      },
    });

    const s4 = await tx.show.create({
      data: {
        date: new Date("2025-09-27"),
        city: "תל אביב",
        venue: "בארבי",
        ticketLink: null,
        isFeatured: false,
      },
    });

    // The featured Barby show — isFeatured=true with existing cover
    const s5 = await tx.show.create({
      data: {
        date: new Date("2026-07-04"),
        city: "תל אביב",
        venue: "בארבי",
        ticketLink: "https://barby.co.il/show/4338",
        doorsTime: "20:30",
        coverImage: "/images/barby-july.webp",
        isFeatured: true,
      },
    });

    return [s1, s2, s3, s4, s5];
  });

  console.log(`✓ Seeded ${shows.length} shows`);
  console.log(`✓ Featured show: ${shows[4].venue} ${shows[4].date.toLocaleDateString("he-IL")}`);

  // Seed albums from hardcoded catalog
  const albums = await prisma.$transaction(async (tx) => {
    const a1 = await tx.album.create({
      data: {
        title: "רכב מפורק",
        year: 2019,
        coverImage: "/albums/meforak.jpeg",
        spotify:
          "https://open.spotify.com/album/5WUS43UuuehWYoLOX9heC9?si=6JMYSeB9Q5CA_BW36XF5rg",
        appleMusic:
          "https://music.apple.com/us/album/%D7%A8%D7%9B%D7%91-%D7%9E%D7%A4%D7%95%D7%A8%D7%A7/1476168266",
      },
    });

    const a2 = await tx.album.create({
      data: {
        title: "בוא נרגע",
        year: 2020,
        coverImage: "/albums/bo-niraga.jpg",
        spotify:
          "https://open.spotify.com/album/6zNSwYpIMKhNniauqjyvff?si=Tq-HPHNiS-Kay5QdnAfGBw",
        appleMusic:
          "https://music.apple.com/us/album/%D7%91%D7%95%D7%90-%D7%A0%D7%A8%D7%92%D7%A2-ep/1516248526",
      },
    });

    const a3 = await tx.album.create({
      data: {
        title: "התעוררנו מאוחר",
        year: 2021,
        coverImage: "/albums/hitorarnu.jpeg",
        spotify:
          "https://open.spotify.com/album/4gg0XdG6VEdRF4pU8A5v0m?si=_ysFtkbbQkuhageNrIY6pw",
        appleMusic:
          "https://music.apple.com/us/album/%D7%94%D7%AA%D7%A2%D7%95%D7%A8%D7%A8%D7%A0%D7%95-%D7%9E%D7%90%D7%95%D7%97%D7%A8/1589796540",
      },
    });

    const a4 = await tx.album.create({
      data: {
        title: "שיחת ליטופים",
        year: 2023,
        coverImage: "/albums/litufim.jpg",
        spotify:
          "https://open.spotify.com/album/5EtQOPAR4r7x4I3giAIc4T?si=hDuPGSr_SR-0BaBzYPUcYQ",
        appleMusic:
          "https://music.apple.com/us/album/%D7%A9%D7%99%D7%97%D7%AA-%D7%9C%D7%99%D7%98%D7%95%D7%A4%D7%99%D7%9D/1696871404",
      },
    });

    const a5 = await tx.album.create({
      data: {
        title: "תופס אוויר",
        year: 2024,
        coverImage: "/albums/tofes.jpg",
        spotify:
          "https://open.spotify.com/album/4aTFfglGrFqWRQGVXqwCAQ?si=FkSGK8DjQJCdf9Gnzu8j_w",
        appleMusic:
          "https://music.apple.com/us/album/%D7%AA%D7%95%D7%A4%D7%A1-%D7%90%D7%95%D7%95%D7%99%D7%A8/1776450989",
      },
    });

    return [a1, a2, a3, a4, a5];
  });

  console.log(`✓ Seeded ${albums.length} albums`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
