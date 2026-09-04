// Create (or update) an admin account.
//
//   bun scripts/create-admin.mjs "Akbar Khan" akbar.khan@nexoryn.ai "Akbar@1231"
//
// If the name matches one of the three partners exactly, the account is linked
// to that ledger identity (partnerName) — that link is what makes the Finance
// page's "your position" card and the debt-approval requests resolve for them.
// The admin can later rename themselves in Account settings; partnerName is
// set once here and never changes, so the link survives the rename.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const PARTNERS = ["Waseem Farooq", "Akbar Khan", "Abdul Ahad"];

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: bun scripts/create-admin.mjs "<Full Name>" <email> <password>');
  process.exit(1);
}

const prisma = new PrismaClient();

const partnerName = PARTNERS.find((p) => p.toLowerCase() === name.trim().toLowerCase()) ?? null;

const passwordHash = await bcrypt.hash(password, 12);
const admin = await prisma.adminUser.upsert({
  where: { email: email.toLowerCase() },
  // Only fill partnerName in if it isn't already set — re-running this script
  // to reset someone's password must never silently re-point their ledger
  // identity at a different partner.
  update: { name, passwordHash, ...(partnerName ? { partnerName } : {}) },
  create: { name, email: email.toLowerCase(), passwordHash, partnerName },
});

console.log(
  `OK  ${admin.name} <${admin.email}>` +
    (admin.partnerName ? `  [ledger identity: ${admin.partnerName}]` : "  [not a partner account]"),
);
if (!partnerName) {
  console.warn(`    Note: "${name}" is not one of ${PARTNERS.join(", ")} — no Finance position will resolve.`);
}
await prisma.$disconnect();
