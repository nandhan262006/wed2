"use client";

import Image from "next/image";
import { useState } from "react";
import Countdown from "@/components/Countdown";
import GuestList from "@/components/GuestList";
import RsvpForm from "@/components/RsvpForm";
import { WEDDING } from "@/lib/wedding";

export default function HomePage() {
  const [rsvpRefresh, setRsvpRefresh] = useState(0);

  return (
    <main className="invitation">
      <section className="hero">
        <Image
          src="/wedding-frame.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="hero-bg"
        />
        <div className="ornament top" aria-hidden="true">
          ❧
        </div>

        <div className="content">
          <p className="eyebrow">Together with their families</p>
          <p className="intro">With the blessings of their loved ones</p>

          <h1>
            <span>{WEDDING.bride}</span>
            <small>&amp;</small>
            <span>{WEDDING.groom}</span>
          </h1>

          <p className="invite-text">
            joyfully invite you to celebrate the beginning of their beautiful journey together.
          </p>

          <div className="date-card" aria-label={`Wedding date: ${WEDDING.dateDisplay}`}>
            <div className="date-line" aria-hidden="true" />
            <div>
              <span className="month">NOVEMBER</span>
              <strong>20</strong>
              <span className="year">2026</span>
            </div>
            <div className="date-line" aria-hidden="true" />
          </div>

          <p className="muhurtham">{WEDDING.muhurtham}</p>

          <div className="hero-actions">
            <a className="scroll-button" href="#details" aria-label="View wedding details">
              <span>View Invitation</span>
              <b aria-hidden="true">↓</b>
            </a>
            <a className="rsvp-button" href="#rsvp">
              RSVP Now
            </a>
          </div>
        </div>
      </section>

      <section id="details" className="details" aria-labelledby="details-heading">
        <p className="section-kicker">The Celebration</p>
        <h2 id="details-heading">With love, we invite you</h2>
        <div className="divider" aria-hidden="true">
          ✦
        </div>

        <div className="parents-grid">
          <article>
            <span className="label">Bride</span>
            <h3>{WEDDING.bride}</h3>
            <p>Daughter of</p>
            <p className="parents">
              {WEDDING.brideParents[0]}
              <br />
              &amp; {WEDDING.brideParents[1]}
            </p>
          </article>

          <article>
            <span className="label">Groom</span>
            <h3>{WEDDING.groom}</h3>
            <p>Son of</p>
            <p className="parents">
              {WEDDING.groomParents[0]}
              <br />
              &amp; {WEDDING.groomParents[1]}
            </p>
          </article>
        </div>

        <div className="event-card">
          <div className="event-icon" aria-hidden="true">
            ✿
          </div>
          <p className="label">Wedding Ceremony</p>
          <h3>{WEDDING.dateDisplay}</h3>
          <p className="time">{WEDDING.timeDisplay}</p>
          <div className="event-rule" aria-hidden="true" />
          <p className="venue">{WEDDING.venue}</p>
          <p className="address">
            {WEDDING.addressLines[0]}
            <br />
            {WEDDING.addressLines[1]}
            <br />
            {WEDDING.addressLines[2]}
          </p>
          <a className="map-button" href={WEDDING.mapsUrl} target="_blank" rel="noopener">
            Open in Google Maps
          </a>
        </div>
      </section>

      <section className="countdown-section" aria-labelledby="countdown-heading">
        <p className="section-kicker">Counting the moments</p>
        <h2 id="countdown-heading">Until we say “I do”</h2>
        <Countdown />
      </section>

      <section className="rsvp-section" id="rsvp" aria-labelledby="rsvp-heading">
        <p className="section-kicker">Répondez s&apos;il vous plaît</p>
        <h2 id="rsvp-heading">Will you join us?</h2>
        <div className="divider" aria-hidden="true">
          ✦
        </div>
        <p className="rsvp-sub">
          Kindly respond by <strong>{WEDDING.rsvpDeadline}</strong>.<br />
          We can&apos;t wait to celebrate with you in Liberty Hill, Texas.
        </p>

        <RsvpForm onSubmitted={() => setRsvpRefresh((k) => k + 1)} />
      </section>

      <section className="guestlist-section" id="guestlist" aria-labelledby="guestlist-heading">
        <p className="section-kicker">Guest list</p>
        <h2 id="guestlist-heading">Who&apos;s joining us</h2>
        <div className="divider" aria-hidden="true">
          ✦
        </div>
        <p className="guestlist-sub">
          Live responses stored in our database, shown here in a table. If you set a guest-list
          passcode on the server, enter it to unlock.
        </p>

        <GuestList refreshKey={rsvpRefresh} />
      </section>

      <section className="closing" aria-label="Closing message">
        <Image
          src="/wedding-frame.jpg"
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="closing-bg"
          aria-hidden="true"
        />
        <div className="closing-ornament" aria-hidden="true">
          ❧ ❧
        </div>
        <p className="closing-script">Two hearts, one beautiful journey</p>
        <p>We look forward to celebrating this special day with you.</p>
        <h3>
          {WEDDING.brideShort} &amp; {WEDDING.groomShort}
        </h3>
      </section>

      <footer>
        <span>20 · 11 · 2026</span>
        <span>With love from both families</span>
      </footer>
    </main>
  );
}
