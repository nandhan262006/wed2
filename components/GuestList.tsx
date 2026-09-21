"use client";

import { useEffect, useMemo, useState } from "react";
import type { RsvpCounts, RsvpRecord } from "./types";

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function cellText(value: unknown) {
  const s = String(value ?? "").trim();
  return s ? s : "—";
}

export default function GuestList({ refreshKey }: { refreshKey: number }) {
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<RsvpRecord[]>([]);
  const [counts, setCounts] = useState<RsvpCounts>({ total: 0, accepts: 0, declines: 0, guestTotal: 0 });
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    setLoading(true);
    try {
      const t = token.trim();
      const url = t ? `/api/rsvp?token=${encodeURIComponent(t)}` : "/api/rsvp";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setRows(Array.isArray(data.rsvps) ? data.rsvps : []);
      setCounts(
        data.counts ?? {
          total: (data.rsvps || []).length,
          accepts: 0,
          declines: 0,
          guestTotal: 0,
        }
      );
      setLoaded(true);
    } catch (err) {
      setError(
        `Couldn't load the guest list: ${err instanceof Error ? err.message : String(err)}. Check your database env vars / passcode and try again.`
      );
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.name, r.contact, r.message, r.side, r.attendance, r.dietary]
        .map((v) => String(v || "").toLowerCase())
        .some((v) => v.includes(q))
    );
  }, [rows, search]);

  // Auto-refresh after a new RSVP if the list is already visible.
  // Parent bumps refreshKey; we re-fetch only when loaded.
  useEffect(() => {
    if (loaded && refreshKey > 0) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, loaded]);

  return (
    <div className="guestlist-card">
      <div className="guestlist-toolbar">
        <div className="guestlist-auth">
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Passcode (if set)"
            autoComplete="off"
            aria-label="Guest list passcode"
          />
          <button type="button" className="small-button" onClick={load} disabled={loading}>
            {loading ? "Loading…" : "View list"}
          </button>
          {loaded && (
            <button type="button" className="link-button" onClick={load} disabled={loading}>
              Refresh ↻
            </button>
          )}
        </div>
        {loaded && (
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, contact, message…"
            aria-label="Search guest list"
          />
        )}
      </div>

      {loaded && (
        <div className="guestlist-counts" aria-live="polite">
          <div>
            <strong>{counts.total}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{counts.accepts}</strong>
            <span>Accepts</span>
          </div>
          <div>
            <strong>{counts.declines}</strong>
            <span>Declines</span>
          </div>
          <div>
            <strong>{counts.guestTotal}</strong>
            <span>Guests</span>
          </div>
        </div>
      )}

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {!loaded ? (
        <p className="guestlist-empty">No responses yet — be the first to RSVP above.</p>
      ) : rows.length === 0 ? (
        <p className="guestlist-empty">No responses yet — be the first to RSVP above.</p>
      ) : filtered.length === 0 ? (
        <p className="guestlist-empty">No matches for your search.</p>
      ) : (
        <div className="guestlist-table-wrap">
          <table className="guestlist-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Name</th>
                <th>Contact</th>
                <th>Attending</th>
                <th>Guests</th>
                <th>Side</th>
                <th>Dietary</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={String(r.id ?? `${r.timestamp}-${i}`)}>
                  <td>{i + 1}</td>
                  <td className="nowrap">{formatDate(r.timestamp)}</td>
                  <td>
                    <strong>{cellText(r.name)}</strong>
                  </td>
                  <td>{cellText(r.contact)}</td>
                  <td>
                    {r.attendance === "accepts" ? (
                      <span className="pill pill-yes">Accepts</span>
                    ) : (
                      <span className="pill pill-no">Declines</span>
                    )}
                  </td>
                  <td className="center">{cellText(r.guests)}</td>
                  <td>{cellText(r.side)}</td>
                  <td>{cellText(r.dietary)}</td>
                  <td className="msg">{cellText(r.message)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
