// Create (or update) an admin account.
//
//   bun scripts/create-admin.mjs "Akbar Khan" akbar.khan@nexoryn.ai "Akbar@1231"
//
// The name matters: the Finance page matches a logged-in admin to one of the
// three partners by name, so it has to match a PARTNERS entry exactly for
// "your position" to resolve for them.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: bun scripts/create-admin.mjs "<Full Name>" <email> <password>');
  process.exit(1);
}

const prisma = new PrismaClient();

const passwordHash = await bcrypt.hash(password, 12);
const admin = await prisma.adminUser.upsert({
  where: { email: email.toLowerCase() },
  update: { name, passwordHash },
  create: { name, email: email.toLowerCase(), passwordHash },
});

console.log(`OK  ${admin.name} <${admin.email}>`);
await prisma.$disconnect();
