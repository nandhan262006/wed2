import { createClient } from "@libsql/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  attendance TEXT NOT NULL,
  guests TEXT DEFAULT '1',
  side TEXT DEFAULT 'both',
  dietary TEXT DEFAULT '',
  message TEXT DEFAULT ''
)`;

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) {
    throw new Error("Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN env vars");
  }
  return createClient({ url, authToken });
}

function checkToken(req: NextRequest): NextResponse | null {
  const requiredToken = process.env.RSVP_ADMIN_TOKEN;
  if (!requiredToken) return null; // open list when no passcode configured
  const provided = (req.nextUrl.searchParams.get("token") || "").trim();
  if (provided !== requiredToken) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized — valid guest-list passcode required." },
      { status: 401 }
    );
  }
  return null;
}

export async function GET(req: NextRequest) {
  const denied = checkToken(req);
  if (denied) return denied;

  try {
    const client = getClient();
    await client.execute(CREATE_TABLE_SQL);
    const result = await client.execute(
      "SELECT id, timestamp, name, contact, attendance, guests, side, dietary, message FROM rsvps ORDER BY id DESC LIMIT 1000"
    );
    const rsvps = result.rows.map((r) => ({
      id: r["id"],
      timestamp: r["timestamp"],
      name: r["name"],
      contact: r["contact"],
      attendance: r["attendance"],
      guests: r["guests"],
      side: r["side"],
      dietary: r["dietary"],
      message: r["message"],
    }));

    let accepts = 0;
    let declines = 0;
    let guestTotal = 0;
    for (const r of rsvps) {
      if (r.attendance === "accepts") accepts += 1;
      else if (r.attendance === "declines") declines += 1;
      const g = parseInt(String(r.guests || "1"), 10);
      guestTotal += Number.isFinite(g) && g > 0 ? g : 1;
    }

    return NextResponse.json({
      ok: true,
      counts: { total: rsvps.length, accepts, declines, guestTotal },
      rsvps,
    });
  } catch (err) {
    console.error("RSVP list failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ ok: false, error: "Could not load RSVPs" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {
      body = {};
    }

    const name = String(body["name"] || "").trim().slice(0, 200);
    const contact = String(body["contact"] || "").trim().slice(0, 200);
    const attendance = String(body["attendance"] || "").trim().slice(0, 20);
    const guests = String(body["guests"] ?? "1").slice(0, 10);
    const side = String(body["side"] || "both").slice(0, 20);
    const dietary = String(body["dietary"] || "").trim().slice(0, 500);
    const message = String(body["message"] || "").trim().slice(0, 2000);
    const timestamp = String(
      body["timestamp"] || new Date().toISOString()
    ).slice(0, 40);

    if (!name) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });
    if (!contact)
      return NextResponse.json({ ok: false, error: "Contact is required" }, { status: 400 });
    if (!["accepts", "declines"].includes(attendance)) {
      return NextResponse.json(
        { ok: false, error: "Attendance must be accepts or declines" },
        { status: 400 }
      );
    }

    const client = getClient();
    await client.execute(CREATE_TABLE_SQL);
    await client.execute({
      sql: `INSERT INTO rsvps (timestamp, name, contact, attendance, guests, side, dietary, message)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [timestamp, name, contact, attendance, guests, side, dietary, message],
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("RSVP insert failed:", err instanceof Error ? err.message : err);
    const missingEnv =
      err instanceof Error && err.message.includes("Missing TURSO_");
    return NextResponse.json(
      { ok: false, error: missingEnv ? "Server database is not configured" : "Could not save RSVP" },
      { status: 500 }
    );
  }
}
