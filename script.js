const weddingDate = new Date("2026-11-20T18:58:00-06:00").getTime();

function updateCountdown() {
  const now = Date.now();
  const distance = weddingDate - now;

  if (distance <= 0) {
    document.getElementById("days").textContent = "0";
    document.getElementById("hours").textContent = "0";
    document.getElementById("minutes").textContent = "0";
    document.getElementById("seconds").textContent = "0";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
  document.getElementById("seconds").textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ---------- RSVP → Google Sheets ----------
// 1. Create a Google Sheet, then Extensions → Apps Script, paste the Code.gs below.
// 2. Deploy → New deployment → Web app (Execute as: Me, Access: Anyone).
// 3. Paste the Web App URL here:
const GOOGLE_SHEET_URL = ""; // e.g. "https://script.google.com/macros/s/AKfyc.../exec"

const rsvpForm = document.getElementById("rsvp-form");
const rsvpError = document.getElementById("rsvp-error");
const rsvpSuccess = document.getElementById("rsvp-success");
const rsvpSuccessTitle = document.getElementById("rsvp-success-title");
const rsvpSuccessText = document.getElementById("rsvp-success-text");
const rsvpSubmit = document.getElementById("rsvp-submit");
const rsvpAgain = document.getElementById("rsvp-again");

function showRsvpError(message) {
  rsvpError.textContent = message;
  rsvpError.hidden = false;
}

function hideRsvpError() {
  rsvpError.textContent = "";
  rsvpError.hidden = true;
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideRsvpError();

    const data = new FormData(rsvpForm);
    const name = (data.get("name") || "").toString().trim();
    const contact = (data.get("contact") || "").toString().trim();
    const attendance = (data.get("attendance") || "").toString();
    const guests = (data.get("guests") || "1").toString();
    const side = (data.get("side") || "both").toString();
    const dietary = (data.get("dietary") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();

    if (!name) return showRsvpError("Please tell us your full name.");
    if (!contact) return showRsvpError("Please add a phone number or email so we can reach you.");
    if (!attendance) return showRsvpError("Please choose whether you joyfully accept or regretfully decline.");

    rsvpSubmit.disabled = true;
    rsvpSubmit.textContent = "Sending…";

    const payload = {
      timestamp: new Date().toISOString(),
      name, contact, attendance, guests, side, dietary, message,
    };

    // Always keep a local backup.
    try {
      const key = "sahana-krishna-rsvps";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(payload);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (_) {
      /* storage unavailable — still continue */
    }

    // Send to Google Sheets (Apps Script web app). Uses no-cors + text/plain
    // to avoid preflight failures on static hosting.
    if (GOOGLE_SHEET_URL) {
      try {
        await fetch(GOOGLE_SHEET_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        rsvpSubmit.disabled = false;
        rsvpSubmit.textContent = "Send RSVP ✦";
        return showRsvpError("Couldn't reach Google Sheets. Your response was saved locally — please try again or text the families directly.");
      }
    }

    const firstName = name.split(" ")[0];
    if (attendance === "accepts") {
      rsvpSuccessTitle.textContent = `Thank you, ${firstName}!`;
      rsvpSuccessText.textContent =
        `We're thrilled you'll join us${guests !== "1" ? ` with ${guests} guests` : ""}. ` +
        `A confirmation for November 20, 2026 at Infinity Rio Ranch is all set — see you in Texas!`;
    } else {
      rsvpSuccessTitle.textContent = `Thank you, ${firstName}`;
      rsvpSuccessText.textContent =
        "You will be dearly missed. Thank you for letting us know, and for all your love and blessings.";
    }
    rsvpSuccess.hidden = false;
    rsvpSubmit.disabled = false;
    rsvpSubmit.textContent = "Send RSVP ✦";
  });

  rsvpAgain.addEventListener("click", () => {
    rsvpSuccess.hidden = true;
    rsvpForm.reset();
  });
}
