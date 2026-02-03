import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      name: "Admin",
      username: "admin",
      password: bcrypt.hashSync("password", 10),
    },
  });

  await prisma.user.create({
    data: {
      name: "Rafi",
      username: "rafi",
      password: bcrypt.hashSync("password", 10),
    },
  });

  console.log("Seed completed");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
