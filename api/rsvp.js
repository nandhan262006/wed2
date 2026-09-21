import { createClient } from "@libsql/client";

const db = () => {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url || !authToken) throw new Error("Missing TURSO_DATABASE_URL / TURSO_AUTH_TOKEN env vars");
  return createClient({ url, authToken });
};

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

async function ensureTable(client) {
  await client.execute(CREATE_TABLE_SQL);
}

export default async function handler(req, res) {
  // ---------- List RSVPs (for the on-site tabular guest list) ----------
  if (req.method === "GET") {
    try {
      // Optional passcode protection: if RSVP_ADMIN_TOKEN is set on Vercel,
      // the site must call /api/rsvp?token=<that value>.
      // If it is NOT set, the list is readable without a token (easy start).
      const requiredToken = process.env.RSVP_ADMIN_TOKEN;
      if (requiredToken) {
        const provided = String(req.query?.token || "").trim();
        if (provided !== requiredToken) {
          return res.status(401).json({ ok: false, error: "Unauthorized — valid guest-list passcode required." });
        }
      }

      const client = db();
      await ensureTable(client);
      const result = await client.execute(
        "SELECT id, timestamp, name, contact, attendance, guests, side, dietary, message FROM rsvps ORDER BY id DESC LIMIT 1000"
      );
      const rsvps = result.rows.map((r) => ({
        id: r.id,
        timestamp: r.timestamp,
        name: r.name,
        contact: r.contact,
        attendance: r.attendance,
        guests: r.guests,
        side: r.side,
        dietary: r.dietary,
        message: r.message,
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

      return res.status(200).json({
        ok: true,
        counts: { total: rsvps.length, accepts, declines, guestTotal },
        rsvps,
      });
    } catch (err) {
      console.error("RSVP list failed:", err?.message || err);
      return res.status(500).json({ ok: false, error: "Could not load RSVPs" });
    }
  }

  // ---------- Submit RSVP (primary Turso store) ----------
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const name = String(body.name || "").trim().slice(0, 200);
      const contact = String(body.contact || "").trim().slice(0, 200);
      const attendance = String(body.attendance || "").trim().slice(0, 20);
      const guests = String(body.guests ?? "1").slice(0, 10);
      const side = String(body.side || "both").slice(0, 20);
      const dietary = String(body.dietary || "").trim().slice(0, 500);
      const message = String(body.message || "").trim().slice(0, 2000);
      const timestamp = String(body.timestamp || new Date().toISOString()).slice(0, 40);

      if (!name) return res.status(400).json({ ok: false, error: "Name is required" });
      if (!contact) return res.status(400).json({ ok: false, error: "Contact is required" });
      if (!["accepts", "declines"].includes(attendance)) {
        return res.status(400).json({ ok: false, error: "Attendance must be accepts or declines" });
      }

      const client = db();
      await ensureTable(client);
      await client.execute({
        sql: `INSERT INTO rsvps (timestamp, name, contact, attendance, guests, side, dietary, message)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [timestamp, name, contact, attendance, guests, side, dietary, message],
      });

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("RSVP insert failed:", err?.message || err);
      return res.status(500).json({ ok: false, error: "Could not save RSVP" });
    }
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
