import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "~/server/auth/jwt";
import { db } from "~/server/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false });
  }

  // 1) Verify JWT signature & expiry
  const payload = await verifyToken(token);

  if (!payload?.sub && !payload?.id && !payload?.userId) {
    // we allow id under multiple keys (sub/id/userId) depending on payload shape
    return NextResponse.json({ valid: false });
  }

  // extract userId (try common keys)
  const userId = payload.sub ?? payload.id ?? payload.userId;

  // 2) Check DB token match + expiry
  const user = await db.user.findUnique({
    where: { id: String(userId) },
  });

  if (!user) return NextResponse.json({ valid: false });

  if (!user.token || user.token !== token) return NextResponse.json({ valid: false });

  if (!user.tokenExpiresAt || user.tokenExpiresAt <= new Date()) return NextResponse.json({ valid: false });

  return NextResponse.json({
    valid: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
    },
  });
}
