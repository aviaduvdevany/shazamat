import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local"), override: true });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding shows from current hardcoded data...");

  // Clear existing shows
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
        coverImage: "/images/barby-july.png",
        isFeatured: true,
      },
    });

    return [s1, s2, s3, s4, s5];
  });

  console.log(`✓ Seeded ${shows.length} shows`);
  console.log(`✓ Featured show: ${shows[4].venue} ${shows[4].date.toLocaleDateString("he-IL")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
