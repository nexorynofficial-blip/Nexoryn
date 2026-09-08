import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** A real bcrypt hash (of a value nothing will ever submit) at the same cost
 *  as a live password. Precomputed once so the decoy comparison costs what a
 *  genuine one costs, without hashing a fresh throwaway every failed login. */
const DUMMY_HASH = bcrypt.hashSync("nexoryn-nonexistent-account-placeholder", SALT_ROUNDS);

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Burns the same time a real password check would, for logins against an
 * address that has no account. Always resolves false.
 *
 * Without this, "no such user" returns as fast as the database lookup while a
 * wrong password costs a full bcrypt comparison — a difference large enough to
 * measure over the network, and therefore a way to work out which addresses
 * are real accounts before ever guessing a password.
 */
export async function dummyPasswordCompare(plain: string): Promise<false> {
  await bcrypt.compare(plain, DUMMY_HASH);
  return false;
}
