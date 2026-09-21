"use client";

import { useEffect, useState } from "react";
import { WEDDING_TIMESTAMP } from "@/lib/wedding";

function getParts(target: number) {
  const distance = target - Date.now();
  if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, past: true };
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor(distance / (1000 * 60 * 60)) % 24,
    minutes: Math.floor(distance / (1000 * 60)) % 60,
    seconds: Math.floor(distance / 1000) % 60,
    past: false,
  };
}

export default function Countdown() {
  const [t, setT] = useState(() => getParts(WEDDING_TIMESTAMP));

  useEffect(() => {
    const id = setInterval(() => setT(getParts(WEDDING_TIMESTAMP)), 1000);
    return () => clearInterval(id);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="countdown" role="timer" aria-live="off" aria-label="Countdown to the wedding">
      <div>
        <strong>{t.days}</strong>
        <span>Days</span>
      </div>
      <div>
        <strong>{pad(t.hours)}</strong>
        <span>Hours</span>
      </div>
      <div>
        <strong>{pad(t.minutes)}</strong>
        <span>Minutes</span>
      </div>
      <div>
        <strong>{pad(t.seconds)}</strong>
        <span>Seconds</span>
      </div>
    </div>
  );
}
