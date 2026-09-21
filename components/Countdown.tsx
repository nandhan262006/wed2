"use client";

import { useEffect, useState } from "react";
import { WEDDING_TIMESTAMP } from "@/lib/wedding";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function getParts(target: number): Parts {
  const distance = target - Date.now();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor(distance / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(distance / (1000 * 60)) % 60,
    seconds: Math.floor(distance / 1000) % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown() {
  // Start with placeholders (like the original static site) so SSR HTML always
  // matches the first client render — no hydration mismatch from clock skew.
  const [t, setT] = useState<Parts | null>(null);

  useEffect(() => {
    const update = () => setT(getParts(WEDDING_TIMESTAMP));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="countdown" role="timer" aria-live="off" aria-label="Countdown to the wedding">
      <div>
        <strong>{t ? t.days : "--"}</strong>
        <span>Days</span>
      </div>
      <div>
        <strong>{t ? pad(t.hours) : "--"}</strong>
        <span>Hours</span>
      </div>
      <div>
        <strong>{t ? pad(t.minutes) : "--"}</strong>
        <span>Minutes</span>
      </div>
      <div>
        <strong>{t ? pad(t.seconds) : "--"}</strong>
        <span>Seconds</span>
      </div>
    </div>
  );
}
