export type Attendance = "accepts" | "declines";

export interface RsvpRecord {
  id: number | string;
  timestamp: string;
  name: string;
  contact: string;
  attendance: string;
  guests: string;
  side: string;
  dietary: string;
  message: string;
}

export interface RsvpCounts {
  total: number;
  accepts: number;
  declines: number;
  guestTotal: number;
}
