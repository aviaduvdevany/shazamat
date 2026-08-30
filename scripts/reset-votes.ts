import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });
dotenv.config({ path: resolve(process.cwd(), ".env") });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const { count } = await prisma.playerVote.deleteMany({});
  console.log(`✅ Deleted ${count} vote(s). Ready for a new round!`);
}

main()
  .catch((e) => {
    console.error("❌ Error resetting votes:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
