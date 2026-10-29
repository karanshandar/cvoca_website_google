/**
 * Row checks for the data that comes from Google Sheets or its JSON fallback.
 * Both sources go through the same functions, so they can't drift apart.
 * Each `toX` returns the row as a domain type, or null when a required field
 * is missing or unreadable; `normalizeRows` drops those rows with a warning.
 */

import type { AnnualReport, CommitteeMember, Committee, CoreMember, CvoEvent, PastPresident, PresidentMessage } from '../types';
import { toIsoDate } from './dates';

/** One flat `committeeMembers` Sheet row (one person in one committee). */
export interface CommitteeMemberRow {
  committeeName: string;
  memberName: string;
  nativePlace: string;
  role: string;
}

type Row = Record<string, unknown>;

const isRow = (value: unknown): value is Row => typeof value === 'object' && value !== null && !Array.isArray(value);

/** Text from a cell or JSON value; blank text and anything that isn't text or a number reads as missing. */
const text = (value: unknown): string | undefined => {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string' && value.trim() !== '') return value;
  return undefined;
};

/** A whole number, or text holding one (Sheets cells are text). */
const wholeNumber = (value: unknown): number | undefined => {
  const num = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof num === 'number' && Number.isInteger(num) ? num : undefined;
};

const date = (value: unknown): string | undefined => {
  const raw = text(value);
  return (raw && toIsoDate(raw.trim())) ?? undefined;
};

/** A list of text, or comma-separated text from a Sheet cell. Missing reads as an empty list. */
const textList = (value: unknown): string[] => {
  const items = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return items.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter((item) => item !== '');
};

/** `true`, `TRUE`/`true` or `1` is yes; any other given value is no; missing stays undefined. */
const flag = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') return value;
  const raw = text(value);
  return raw === undefined ? undefined : raw.toLowerCase() === 'true' || raw === '1';
};

export function toEvent(row: unknown): CvoEvent | null {
  if (!isRow(row)) return null;
  const id = wholeNumber(row.id);
  const title = text(row.title);
  const eventDate = date(row.date);
  const time = text(row.time);
  const location = text(row.location);
  const committee = text(row.committee);
  const description = text(row.description);
  if (id === undefined || !title || !eventDate || !time || !location || !committee || !description) return null;
  return {
    id,
    title,
    date: eventDate,
    time,
    location,
    committee,
    tags: textList(row.tags),
    cost: text(row.cost) ?? '',
    fullPricing: text(row.fullPricing),
    description,
    registrationLink: text(row.registrationLink),
    readMoreLink: text(row.readMoreLink),
    imageUrl: text(row.imageUrl),
  };
}

export function toCommitteeMember(row: unknown): CommitteeMember | null {
  if (!isRow(row)) return null;
  const name = text(row.name);
  const role = text(row.role);
  const photoUrl = text(row.photoUrl);
  return name && role && photoUrl ? { name, role, photoUrl } : null;
}

export function toCoreMember(row: unknown): CoreMember | null {
  if (!isRow(row)) return null;
  const name = text(row.name);
  const nativePlace = text(row.nativePlace);
  return name && nativePlace ? { name, nativePlace } : null;
}

/** A nested committee from `committees.json`. Invalid members are dropped with a warning naming the committee. */
export function toCommittee(row: unknown): Committee | null {
  if (!isRow(row)) return null;
  const name = text(row.name);
  if (!name) return null;

  const member = (value: unknown, field: string): CoreMember | undefined => {
    const coreMember = toCoreMember(value);
    if (!coreMember) console.warn(`Committee "${name}": skipped a ${field} entry without a name and native place`, value);
    return coreMember ?? undefined;
  };
  const members = (field: string): CoreMember[] => {
    const value = row[field];
    if (value === undefined) return [];
    const list = Array.isArray(value) ? value : [value];
    return list.map((item) => member(item, field)).filter((item): item is CoreMember => item !== undefined);
  };

  return {
    name,
    chairperson: row.chairperson === undefined ? undefined : member(row.chairperson, 'chairperson'),
    advisors: members('advisors'),
    convenors: members('convenors'),
    jointConvenors: members('jointConvenors'),
    specialInvitees: members('specialInvitees'),
    subCommittee: members('subCommittee'),
  };
}

export function toCommitteeMemberRow(row: unknown): CommitteeMemberRow | null {
  if (!isRow(row)) return null;
  const committeeName = text(row.committeeName);
  const memberName = text(row.memberName);
  const nativePlace = text(row.nativePlace);
  const role = text(row.role);
  return committeeName && memberName && nativePlace && role ? { committeeName, memberName, nativePlace, role } : null;
}

export function toAnnualReport(row: unknown): AnnualReport | null {
  if (!isRow(row)) return null;
  const year = text(row.year);
  const title = text(row.title);
  const link = text(row.link);
  if (!year || !title || !link) return null;
  return { year, title, description: text(row.description), link, isNew: flag(row.isNew) };
}

export function toPastPresident(row: unknown): PastPresident | null {
  if (!isRow(row)) return null;
  const name = text(row.name);
  const term = text(row.term);
  const village = text(row.village);
  if (!name || !term || !village) return null;
  return { srNo: wholeNumber(row.srNo), name, term, village };
}

export function toPresidentMessage(row: unknown): PresidentMessage | null {
  if (!isRow(row)) return null;
  const messageDate = date(row.date);
  const message = text(row.message);
  return messageDate && message ? { date: messageDate, message } : null;
}

/**
 * Runs every row through `toItem`, keeping the valid ones in order. Each dropped
 * row gets one warning naming the dataset and its row number (1 = first data row).
 * Throws when `rows` is not a list, so the page shows its load error.
 */
export function normalizeRows<T>(dataset: string, rows: unknown, toItem: (row: unknown) => T | null): T[] {
  if (!Array.isArray(rows)) {
    throw new Error(`${dataset}: expected a list of rows`);
  }
  return rows.flatMap((row, index) => {
    const item = toItem(row);
    if (item === null) {
      console.warn(`${dataset}: skipped row ${index + 1} (a required field is missing or unreadable)`, row);
      return [];
    }
    return [item];
  });
}
