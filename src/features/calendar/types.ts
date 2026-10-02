export type MailEvent = {
  id?: string;
  title: string;
  month: string;
  day: string;
  cadence: string;
  date?: string;
  time: string;
  endTime?: string;
  location: string;
  note: string;
  calendar?: string;
  organizer?: string;
  meetingUrl?: string;
  days: { label: string; date: string; active?: boolean }[];
};

export type CalendarResponse = "going" | "maybe" | "declined";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  note: string;
  calendarId: string;
  cadence: string;
  organizer?: string;
  meetingUrl?: string;
  sourceEmailId?: string;
  response: CalendarResponse;
  reminder: string;
};

export type CalendarDefinition = {
  id: string;
  name: string;
  color: string;
  visible: boolean;
};

export type CalendarEventDraft = Omit<CalendarEvent, "id"> & { id?: string };
