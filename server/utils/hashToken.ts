import crypto from "crypto";

/**
 * Hash a token using SHA-256
 * Used for password reset tokens before storing in database
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Constant-time comparison to prevent timing attacks
 */
export function compareTokens(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(a),
    Buffer.from(b)
  );
}
