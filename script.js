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

// ---------- RSVP → Turso (via Vercel /api/rsvp) ----------
const RSVP_API_URL = "/api/rsvp";

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

    // Send to Turso via Vercel API (primary store).
    try {
      const res = await fetch(RSVP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("API " + res.status);
    } catch (err) {
      rsvpSubmit.disabled = false;
      rsvpSubmit.textContent = "Send RSVP ✦";
      return showRsvpError("Couldn't save your RSVP — please try again or text the families directly.");
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

    // If the guest list is visible, refresh it so the new RSVP appears.
    if (!document.getElementById("guestlist-wrap").hidden) {
      loadGuestList();
    }
  });

  rsvpAgain.addEventListener("click", () => {
    rsvpSuccess.hidden = true;
    rsvpForm.reset();
  });
}

// ---------- On-site tabular guest list (reads from Turso via GET /api/rsvp) ----------
let guestCache = [];

const guestToken = document.getElementById("guestlist-token");
const guestLoad = document.getElementById("guestlist-load");
const guestRefresh = document.getElementById("guestlist-refresh");
const guestSearch = document.getElementById("guestlist-search");
const guestBody = document.getElementById("guestlist-body");
const guestWrap = document.getElementById("guestlist-wrap");
const guestEmpty = document.getElementById("guestlist-empty");
const guestError = document.getElementById("guestlist-error");
const guestCounts = document.getElementById("guestlist-counts");

function showGuestError(message) {
  guestError.textContent = message;
  guestError.hidden = false;
}

function hideGuestError() {
  guestError.textContent = "";
  guestError.hidden = true;
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function attendanceBadge(value) {
  return value === "accepts"
    ? '<span class="pill pill-yes">Accepts</span>'
    : '<span class="pill pill-no">Declines</span>';
}

function cellText(value) {
  const s = (value ?? "").toString().trim();
  return s ? s : "—";
}

function renderGuestRows() {
  const q = (guestSearch.value || "").toLowerCase().trim();
  const rows = guestCache.filter((r) => {
    if (!q) return true;
    return [r.name, r.contact, r.message, r.side, r.attendance, r.dietary]
      .map((v) => (v || "").toString().toLowerCase())
      .some((v) => v.includes(q));
  });

  guestBody.innerHTML = rows.map((r, i) => `
    <tr>
      <td>${i + 1}</td>
      <td class="nowrap">${formatDate(r.timestamp)}</td>
      <td><strong>${escapeHtml(cellText(r.name))}</strong></td>
      <td>${escapeHtml(cellText(r.contact))}</td>
      <td>${attendanceBadge(r.attendance)}</td>
      <td class="center">${escapeHtml(cellText(r.guests))}</td>
      <td>${escapeHtml(cellText(r.side))}</td>
      <td>${escapeHtml(cellText(r.dietary))}</td>
      <td class="msg">${escapeHtml(cellText(r.message))}</td>
    </tr>
  `).join("");

  guestWrap.hidden = rows.length === 0;
  guestEmpty.hidden = rows.length !== 0 || guestCache.length === 0 ? guestCache.length !== 0 : false;
  if (guestCache.length === 0) {
    guestEmpty.hidden = false;
    guestEmpty.textContent = "No responses yet — be the first to RSVP above.";
  } else if (rows.length === 0) {
    guestWrap.hidden = true;
    guestEmpty.hidden = false;
    guestEmpty.textContent = "No matches for your search.";
  } else {
    guestEmpty.hidden = true;
  }
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

async function loadGuestList() {
  hideGuestError();
  guestLoad.disabled = true;
  guestLoad.textContent = "Loading…";

  try {
    const token = (guestToken.value || "").trim();
    const url = token ? `${RSVP_API_URL}?token=${encodeURIComponent(token)}` : RSVP_API_URL;
    const res = await fetch(url);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.error || ("HTTP " + res.status));
    }

    guestCache = data.rsvps || [];
    document.getElementById("count-total").textContent = data.counts?.total ?? guestCache.length;
    document.getElementById("count-accepts").textContent = data.counts?.accepts ?? 0;
    document.getElementById("count-declines").textContent = data.counts?.declines ?? 0;
    document.getElementById("count-guests").textContent = data.counts?.guestTotal ?? 0;

    guestCounts.hidden = false;
    guestRefresh.hidden = false;
    guestSearch.hidden = false;
    renderGuestRows();
  } catch (err) {
    showGuestError("Couldn't load the guest list: " + (err.message || err) + ". Check your database env vars / passcode and try again.");
  } finally {
    guestLoad.disabled = false;
    guestLoad.textContent = "View list";
  }
}

if (guestLoad) {
  guestLoad.addEventListener("click", loadGuestList);
  guestRefresh.addEventListener("click", loadGuestList);
  guestSearch.addEventListener("input", renderGuestRows);
}
