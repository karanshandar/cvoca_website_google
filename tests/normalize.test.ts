import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  normalizeRows,
  toEvent,
  toCommitteeMember,
  toCoreMember,
  toCommittee,
  toCommitteeMemberRow,
  toAnnualReport,
  toPastPresident,
  toPresidentMessage,
} from '../utils/normalize';

afterEach(() => {
  vi.restoreAllMocks();
});

const silenceWarnings = () => vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('toEvent', () => {
  const event = {
    id: 3,
    title: 'Tax Conference',
    date: '2026-09-05',
    time: '9:00 AM - 5:00 PM',
    location: 'Mumbai',
    committee: 'CVOCA',
    tags: ['Tax'],
    cost: 'Free',
    description: 'A day of talks.',
    fullPricing: 'Members free',
    registrationLink: 'https://example.org/register',
    readMoreLink: 'https://example.org/more',
    imageUrl: 'https://example.org/flyer.webp',
  };

  it('returns a valid event unchanged', () => {
    expect(toEvent(event)).toEqual(event);
  });

  it('defaults tags and cost, and leaves blank optional fields out', () => {
    const { id, title, date, time, location, committee, description } = event;
    const row = { id, title, date, time, location, committee, description, fullPricing: '', imageUrl: '' };
    expect(toEvent(row)).toEqual({ id, title, date, time, location, committee, description, tags: [], cost: '' });
  });

  it.each(['id', 'title', 'date', 'time', 'location', 'committee', 'description'])('drops a row without %s', (field) => {
    expect(toEvent({ ...event, [field]: undefined })).toBeNull();
  });

  it('treats a whitespace-only required cell as missing', () => {
    expect(toEvent({ ...event, title: '   ' })).toBeNull();
  });

  it('drops a row whose date cannot be read', () => {
    expect(toEvent({ ...event, date: '5 Sep 2026' })).toBeNull();
    expect(toEvent({ ...event, date: '31/02/2026' })).toBeNull();
  });

  it('converts a DD/MM/YYYY Sheets date', () => {
    expect(toEvent({ ...event, date: '5/9/2026' })?.date).toBe('2026-09-05');
  });

  it('turns a numeric text id into a number and drops a non-numeric one', () => {
    expect(toEvent({ ...event, id: '7' })?.id).toBe(7);
    expect(toEvent({ ...event, id: 'abc' })).toBeNull();
    expect(toEvent({ ...event, id: '7.5' })).toBeNull();
  });

  it('splits comma-separated tags and drops blanks', () => {
    expect(toEvent({ ...event, tags: 'CPE, Taxation,,  GST ' })?.tags).toEqual(['CPE', 'Taxation', 'GST']);
    expect(toEvent({ ...event, tags: '' })?.tags).toEqual([]);
  });

  it('keeps numeric tags as text and drops blank or non-text items', () => {
    expect(toEvent({ ...event, tags: ['GST', 2024, ' ', null, { tag: 'x' }] })?.tags).toEqual(['GST', '2024']);
  });

  it('returns null for something that is not a row', () => {
    expect(toEvent(null)).toBeNull();
    expect(toEvent('event')).toBeNull();
    expect(toEvent([event])).toBeNull();
  });
});

describe('toCommitteeMember', () => {
  const member = { name: 'CA A', role: 'President', photoUrl: '/images/a.webp' };

  it('returns a valid member and drops fields the site does not read', () => {
    expect(toCommitteeMember({ ...member, email: 'a@example.org' })).toEqual(member);
  });

  it.each(['name', 'role', 'photoUrl'])('drops a row without %s', (field) => {
    expect(toCommitteeMember({ ...member, [field]: '' })).toBeNull();
  });
});

describe('toCoreMember', () => {
  it('returns a valid member', () => {
    expect(toCoreMember({ name: 'CA A', nativePlace: 'Bidada' })).toEqual({ name: 'CA A', nativePlace: 'Bidada' });
  });

  it.each(['name', 'nativePlace'])('drops a member without %s', (field) => {
    expect(toCoreMember({ name: 'CA A', nativePlace: 'Bidada', [field]: undefined })).toBeNull();
  });
});

describe('toCommittee', () => {
  const a = { name: 'CA A', nativePlace: 'Bidada' };

  it('keeps the chairperson and member lists, defaulting missing lists to empty', () => {
    expect(toCommittee({ name: 'Audit', chairperson: a, convenors: [a] })).toEqual({
      name: 'Audit',
      chairperson: a,
      advisors: [],
      convenors: [a],
      jointConvenors: [],
      specialInvitees: [],
      subCommittee: [],
    });
  });

  it('leaves out a missing chairperson', () => {
    expect(toCommittee({ name: 'Audit' })?.chairperson).toBeUndefined();
  });

  it('drops a committee without a name', () => {
    expect(toCommittee({ convenors: [a] })).toBeNull();
  });

  it('drops an invalid member with a warning naming the committee', () => {
    const warn = silenceWarnings();
    const committee = toCommittee({ name: 'Audit', chairperson: { name: 'X' }, advisors: [{ nativePlace: 'Y' }, a] });
    expect(committee?.chairperson).toBeUndefined();
    expect(committee?.advisors).toEqual([a]);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"Audit"'), expect.anything());
  });
});

describe('toCommitteeMemberRow', () => {
  const row = { committeeName: 'Audit', memberName: 'CA A', nativePlace: 'Bidada', role: 'convenor' };

  it('returns a valid row', () => {
    expect(toCommitteeMemberRow(row)).toEqual(row);
  });

  it.each(['committeeName', 'memberName', 'nativePlace', 'role'])('drops a row without %s', (field) => {
    expect(toCommitteeMemberRow({ ...row, [field]: '' })).toBeNull();
  });
});

describe('toAnnualReport', () => {
  const report = { year: '2024-25', title: 'Annual Report 2024-25', link: 'https://example.org/r.pdf' };

  it('returns a valid report, leaving absent optional fields out', () => {
    expect(toAnnualReport(report)).toEqual(report);
  });

  it('keeps a description and reads isNew from TRUE, true or 1', () => {
    expect(toAnnualReport({ ...report, description: 'Summary', isNew: true })).toEqual({ ...report, description: 'Summary', isNew: true });
    expect(toAnnualReport({ ...report, isNew: 'TRUE' })?.isNew).toBe(true);
    expect(toAnnualReport({ ...report, isNew: 'true' })?.isNew).toBe(true);
    expect(toAnnualReport({ ...report, isNew: '1' })?.isNew).toBe(true);
    expect(toAnnualReport({ ...report, isNew: 'no' })?.isNew).toBe(false);
    expect(toAnnualReport({ ...report, isNew: '' })).toEqual(report);
  });

  it('accepts a number typed into a text column', () => {
    expect(toAnnualReport({ ...report, year: 2024 })?.year).toBe('2024');
  });

  it.each(['year', 'title', 'link'])('drops a row without %s', (field) => {
    expect(toAnnualReport({ ...report, [field]: undefined })).toBeNull();
  });
});

describe('toPastPresident', () => {
  const president = { name: 'CA A', term: '1973-82', village: 'Rayan' };

  it('returns a valid president', () => {
    expect(toPastPresident(president)).toEqual(president);
  });

  it('turns a text srNo into a number and leaves a bad one out', () => {
    expect(toPastPresident({ ...president, srNo: '12' })).toEqual({ ...president, srNo: 12 });
    expect(toPastPresident({ ...president, srNo: 'twelve' })).toEqual(president);
  });

  it.each(['name', 'term', 'village'])('drops a row without %s', (field) => {
    expect(toPastPresident({ ...president, [field]: '' })).toBeNull();
  });
});

describe('toPresidentMessage', () => {
  it('returns a valid message and converts a Sheets date', () => {
    expect(toPresidentMessage({ date: '5/9/2026', message: 'Welcome' })).toEqual({ date: '2026-09-05', message: 'Welcome' });
  });

  it('drops a message without text or with an unreadable date', () => {
    expect(toPresidentMessage({ date: '2026-09-05', message: ' ' })).toBeNull();
    expect(toPresidentMessage({ date: 'September', message: 'Welcome' })).toBeNull();
  });
});

describe('normalizeRows', () => {
  const ok = { name: 'CA A', term: '1973-82', village: 'Rayan' };

  it('keeps valid rows in order and warns once per dropped row', () => {
    const warn = silenceWarnings();
    const bad = { name: 'CA B' };
    const rows = normalizeRows('pastPresidents.json', [ok, bad, { ...ok, name: 'CA C' }], toPastPresident);
    expect(rows.map((row) => row.name)).toEqual(['CA A', 'CA C']);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('pastPresidents.json: skipped row 2'), bad);
  });

  it('throws when the data is not a list', () => {
    expect(() => normalizeRows('events.json', { events: [] }, toEvent)).toThrow('events.json');
  });
});
