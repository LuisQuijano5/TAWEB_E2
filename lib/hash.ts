import crypto from "crypto"

export function calculateHash(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex")
}