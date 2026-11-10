#!/usr/bin/env node
/**
 * Generates the two secrets the admin panel needs.
 *   npm run admin-setup
 * Paste the printed lines into a .env file next to docker-compose.yml.
 * The password itself is never stored anywhere — only its scrypt hash.
 */
import crypto from "crypto";
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, r));

const pw = await ask("Choose an admin password (12+ characters): ");
rl.close();
if (pw.length < 12) {
  console.error("\nToo short — use at least 12 characters.");
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(pw, salt, 64, { N: 16384, r: 8, p: 1 });

console.log("\nAdd these lines to your .env file (keep it private, never commit it):\n");
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt.toString("hex")}:${hash.toString("hex")}`);
console.log(`ADMIN_SESSION_SECRET=${crypto.randomBytes(48).toString("base64url")}`);
