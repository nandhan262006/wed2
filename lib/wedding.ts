export const WEDDING = {
  bride: "Nalluri Sahana",
  brideShort: "Sahana",
  groom: "Katragadda Krishna Teja",
  groomShort: "Krishna Teja",
  // 6:58 PM Central (Austin in November = CST, UTC-6)
  dateISO: "2026-11-20T18:58:00-06:00",
  dateDisplay: "November 20, 2026",
  timeDisplay: "6:58 PM",
  muhurtham: "Muhurtham · 6:58 PM",
  venue: "Infinity Rio Ranch",
  addressLines: ["326 Rio Pk Dr", "Liberty Hill, TX 78642", "Austin, Texas"],
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Infinity+Rio+Ranch%2C+326+Rio+Pk+Dr%2C+Liberty+Hill%2C+TX+78642",
  rsvpDeadline: "November 20, 2026",
  brideParents: ["Nalluri Ajay Chowdary", "Nalluri Lalitha"],
  groomParents: ["Katragadda Singa Rao (Late)", "Katragadda Padmavathi"],
} as const;

export const WEDDING_TIMESTAMP = new Date(WEDDING.dateISO).getTime();
