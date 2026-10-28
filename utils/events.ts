import { CvoEvent } from '../types';
import { parseLocalDate } from './dates';

/**
 * Events dated today or later, soonest first, at most `limit` of them.
 * An event stays upcoming for the whole of its day.
 */
export function getUpcomingEvents(events: CvoEvent[], limit: number, now: Date = new Date()): CvoEvent[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0); // Normalize today to start of day

  return events
    .filter(event => parseLocalDate(event.date) >= today)
    .sort((a, b) => parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime())
    .slice(0, limit);
}

export const getGoogleCalendarUrl = (event: CvoEvent): string => {
  // Safely parse YYYY-MM-DD to avoid timezone issues
  const [y, m, d] = event.date.split('-').map(Number);

  // Defaults
  let startHour = 9, startMin = 0;
  let endHour = 11, endMin = 0;

  // Parse Time String (e.g., "9:00 AM - 5:00 PM")
  const timeParts = event.time.split('-');
  const parseTime = (str: string) => {
    const match = str.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let h = parseInt(match[1]);
      const min = parseInt(match[2]);
      const ampm = match[3].toUpperCase();
      if (ampm === 'PM' && h < 12) h += 12;
      if (ampm === 'AM' && h === 12) h = 0;
      return { h, min };
    }
    return null;
  };

  const startObj = parseTime(timeParts[0]);
  if (startObj) {
    startHour = startObj.h;
    startMin = startObj.min;
  }

  if (timeParts.length > 1) {
    const endObj = parseTime(timeParts[1]);
    if (endObj) {
      endHour = endObj.h;
      endMin = endObj.min;
    } else {
      endHour = startHour + 2;
      endMin = startMin;
    }
  } else {
    endHour = startHour + 2;
    endMin = startMin;
  }

  // Format for Google Calendar (YYYYMMDDTHHMMSS)
  const formatTime = (h: number, min: number) =>
    `${String(h).padStart(2, '0')}${String(min).padStart(2, '0')}00`;

  // Construct Date Strings
  const dateStr = `${y}${String(m).padStart(2, '0')}${String(d).padStart(2, '0')}`;

  const startDateTime = `${dateStr}T${formatTime(startHour, startMin)}`;
  const endDateTime = `${dateStr}T${formatTime(endHour, endMin)}`;

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&ctz=Asia/Kolkata`;
};
