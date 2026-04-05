import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex");

  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password, passwordHash) {
  const [algorithm, salt, storedHash] = String(passwordHash).split("$");

  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const candidateHash = scryptSync(password, salt, KEY_LENGTH);
  const expectedHash = Buffer.from(storedHash, "hex");

  if (candidateHash.length !== expectedHash.length) {
    return false;
  }

  return timingSafeEqual(candidateHash, expectedHash);
}
