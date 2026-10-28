import { describe, it, expect } from 'vitest';
import { getGoogleCalendarUrl, getUpcomingEvents } from '../utils/events';
import type { CvoEvent } from '../types';

const event = (overrides: Partial<CvoEvent>): CvoEvent => ({
  id: 1,
  title: 'Budget Seminar',
  date: '2026-09-05',
  time: '10:00 AM - 1:30 PM',
  location: 'Dadar, Mumbai',
  committee: 'Taxation',
  tags: [],
  cost: 'Free',
  description: 'Union Budget & GST update',
  ...overrides,
});

describe('getUpcomingEvents', () => {
  // 3 PM on the day of the 2026-09-05 event
  const now = new Date(2026, 8, 5, 15, 0, 0);

  it("keeps today's event even after it has started", () => {
    const result = getUpcomingEvents([event({ id: 1, date: '2026-09-05' })], 10, now);
    expect(result.map((e) => e.id)).toEqual([1]);
  });

  it('drops events before today', () => {
    const result = getUpcomingEvents([event({ id: 1, date: '2026-09-04' })], 10, now);
    expect(result).toEqual([]);
  });

  it('sorts upcoming events soonest first', () => {
    const result = getUpcomingEvents(
      [
        event({ id: 3, date: '2026-12-01' }),
        event({ id: 1, date: '2026-09-05' }),
        event({ id: 2, date: '2026-10-10' }),
      ],
      10,
      now,
    );
    expect(result.map((e) => e.id)).toEqual([1, 2, 3]);
  });

  it('returns at most `limit` events', () => {
    const result = getUpcomingEvents(
      [event({ id: 1, date: '2026-09-06' }), event({ id: 2, date: '2026-09-07' }), event({ id: 3, date: '2026-09-08' })],
      2,
      now,
    );
    expect(result.map((e) => e.id)).toEqual([1, 2]);
  });

  it('does not reorder the array it was given', () => {
    const events = [event({ id: 2, date: '2026-10-10' }), event({ id: 1, date: '2026-09-06' })];
    getUpcomingEvents(events, 10, now);
    expect(events.map((e) => e.id)).toEqual([2, 1]);
  });
});

describe('getGoogleCalendarUrl', () => {
  const datesOf = (url: string) => new URL(url).searchParams.get('dates');

  it('uses the start and end times from the time range', () => {
    expect(datesOf(getGoogleCalendarUrl(event({ time: '10:00 AM - 1:30 PM' })))).toBe('20260905T100000/20260905T133000');
  });

  it('makes a single start time last two hours', () => {
    expect(datesOf(getGoogleCalendarUrl(event({ time: '6:00 PM' })))).toBe('20260905T180000/20260905T200000');
  });

  it('falls back to 9–11 AM when the time cannot be read', () => {
    expect(datesOf(getGoogleCalendarUrl(event({ time: 'TBD' })))).toBe('20260905T090000/20260905T110000');
  });

  it('treats 12 PM as noon and 12 AM as midnight', () => {
    expect(datesOf(getGoogleCalendarUrl(event({ time: '12:00 PM - 12:30 PM' })))).toBe('20260905T120000/20260905T123000');
    expect(datesOf(getGoogleCalendarUrl(event({ time: '12:00 AM' })))).toBe('20260905T000000/20260905T020000');
  });

  it('encodes the title, details and location, in India time', () => {
    const params = new URL(getGoogleCalendarUrl(event({}))).searchParams;
    expect(params.get('action')).toBe('TEMPLATE');
    expect(params.get('text')).toBe('Budget Seminar');
    expect(params.get('details')).toBe('Union Budget & GST update');
    expect(params.get('location')).toBe('Dadar, Mumbai');
    expect(params.get('ctz')).toBe('Asia/Kolkata');
  });
});
