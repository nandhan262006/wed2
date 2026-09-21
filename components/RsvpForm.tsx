"use client";

import { useState } from "react";
import { WEDDING } from "@/lib/wedding";

type Status = "idle" | "sending" | "success";

export default function RsvpForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [attendance, setAttendance] = useState<"" | "accepts" | "declines">("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [successTitle, setSuccessTitle] = useState("Thank you!");
  const [successText, setSuccessText] = useState("Your RSVP has been received.");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const contact = String(data.get("contact") || "").trim();
    const guests = String(data.get("guests") || "1");
    const side = String(data.get("side") || "both");
    const dietary = String(data.get("dietary") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name) return setError("Please tell us your full name.");
    if (!contact) return setError("Please add a phone number or email so we can reach you.");
    if (!attendance) return setError("Please choose whether you joyfully accept or regretfully decline.");

    setStatus("sending");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          name,
          contact,
          attendance,
          guests,
          side,
          dietary,
          message,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) throw new Error(body.error || `HTTP ${res.status}`);

      const firstName = name.split(" ")[0];
      if (attendance === "accepts") {
        setSuccessTitle(`Thank you, ${firstName}!`);
        setSuccessText(
          `We're thrilled you'll join us${guests !== "1" ? ` with ${guests} guests` : ""}. ` +
            `A confirmation for ${WEDDING.dateDisplay} at ${WEDDING.venue} is all set — see you in Texas!`
        );
      } else {
        setSuccessTitle(`Thank you, ${firstName}`);
        setSuccessText(
          "You will be dearly missed. Thank you for letting us know, and for all your love and blessings."
        );
      }
      setStatus("success");
      onSubmitted?.();
    } catch {
      setError("Couldn't save your RSVP — please try again or text the families directly.");
      setStatus("idle");
    }
  }

  function reset() {
    setStatus("idle");
    setError("");
    setAttendance("");
  }

  return (
    <form id="rsvp-form" className="rsvp-card" onSubmit={handleSubmit} noValidate>
      <div className="form-row two">
        <div className="field">
          <label htmlFor="rsvp-name">Full name *</label>
          <input
            type="text"
            id="rsvp-name"
            name="name"
            placeholder="Your full name"
            autoComplete="name"
            required
            disabled={status === "sending"}
          />
        </div>
        <div className="field">
          <label htmlFor="rsvp-contact">Phone or email *</label>
          <input
            type="text"
            id="rsvp-contact"
            name="contact"
            placeholder="Where can we reach you?"
            autoComplete="email"
            required
            disabled={status === "sending"}
          />
        </div>
      </div>

      <div className="field">
        <span className="field-label" id="attendance-label">
          Will you be attending? *
        </span>
        <div className="attend-options" role="radiogroup" aria-labelledby="attendance-label">
          <label className="attend-card">
            <input
              type="radio"
              name="attendance"
              value="accepts"
              checked={attendance === "accepts"}
              onChange={() => setAttendance("accepts")}
              required
            />
            <span className="attend-emoji" aria-hidden="true">
              💛
            </span>
            <span className="attend-title">Joyfully Accepts</span>
            <span className="attend-desc">Can&apos;t wait to celebrate</span>
          </label>
          <label className="attend-card">
            <input
              type="radio"
              name="attendance"
              value="declines"
              checked={attendance === "declines"}
              onChange={() => setAttendance("declines")}
              required
            />
            <span className="attend-emoji" aria-hidden="true">
              🤍
            </span>
            <span className="attend-title">Regretfully Declines</span>
            <span className="attend-desc">Will miss you in spirit</span>
          </label>
        </div>
      </div>

      <div className="form-row two">
        <div className="field">
          <label htmlFor="rsvp-guests">Guests (including you)</label>
          <select id="rsvp-guests" name="guests" defaultValue="1" disabled={status === "sending"}>
            <option value="1">1 guest</option>
            <option value="2">2 guests</option>
            <option value="3">3 guests</option>
            <option value="4">4 guests</option>
            <option value="5+">5+ guests</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="rsvp-side">You are a guest of</label>
          <select id="rsvp-side" name="side" defaultValue="both" disabled={status === "sending"}>
            <option value="both">Bride &amp; Groom</option>
            <option value="bride">Bride — Sahana</option>
            <option value="groom">Groom — Krishna Teja</option>
          </select>
        </div>
      </div>

      <div className="field">
        <label htmlFor="rsvp-dietary">Dietary needs / allergies</label>
        <input
          type="text"
          id="rsvp-dietary"
          name="dietary"
          placeholder="Vegetarian, vegan, allergies… (optional)"
          disabled={status === "sending"}
        />
      </div>

      <div className="field">
        <label htmlFor="rsvp-message">Blessings &amp; message</label>
        <textarea
          id="rsvp-message"
          name="message"
          rows={4}
          placeholder="Share your wishes, song request, or anything we should know…"
          disabled={status === "sending"}
        />
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="submit-button" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send RSVP ✦"}
      </button>
      <p className="form-note">Having trouble? Text the families directly and we&apos;ll add you to the list.</p>

      {status === "success" && (
        <div className="form-success" role="status">
          <div className="success-mark" aria-hidden="true">
            ✓
          </div>
          <h3>{successTitle}</h3>
          <p>{successText}</p>
          <button type="button" className="link-button" onClick={reset}>
            Send another response
          </button>
        </div>
      )}
    </form>
  );
}
