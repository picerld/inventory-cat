import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev_secret_change_me");

/**
 * Sign a JWT. Returns a signed JWT string.
 * expiresInSeconds default 7 days.
 */
export async function signToken(payload: Record<string, any>, expiresInSeconds = 60 * 60 * 24 * 7) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;

  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(exp)
    .sign(SECRET);

  return token;
}

/**
 * Verify a JWT. Returns payload or null.
 */
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as JWTPayload;
  } catch (e) {
    return null;
  }
}
