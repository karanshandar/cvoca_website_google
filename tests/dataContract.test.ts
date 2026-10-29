/**
 * Loads every public/data/*.json file and checks the fields the pages read,
 * so a broken content edit fails CI instead of breaking a page.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeRows, toAnnualReport, toCommittee, toCommitteeMember, toEvent, toPastPresident, toPresidentMessage } from '../utils/normalize';

/** A check returns one message per problem found at `path`. */
type Check = (value: unknown, path: string) => string[];

const show = (value: unknown) => JSON.stringify(value);

const text: Check = (value, path) => (typeof value === 'string' ? [] : [`${path}: expected text, got ${show(value)}`]);
const num: Check = (value, path) => (typeof value === 'number' ? [] : [`${path}: expected a number, got ${show(value)}`]);
const bool: Check = (value, path) => (typeof value === 'boolean' ? [] : [`${path}: expected true/false, got ${show(value)}`]);
const date: Check = (value, path) =>
  typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? [] : [`${path}: expected a YYYY-MM-DD date, got ${show(value)}`];
const textList: Check = (value, path) =>
  Array.isArray(value) && value.every((item) => typeof item === 'string') ? [] : [`${path}: expected a list of text`];

const oneOf = (...allowed: string[]): Check => (value, path) =>
  typeof value === 'string' && allowed.includes(value) ? [] : [`${path}: expected one of ${allowed.join(', ')}, got ${show(value)}`];

const optional = (check: Check): Check => (value, path) => (value === undefined ? [] : check(value, path));

const list = (check: Check): Check => (value, path) => {
  if (!Array.isArray(value)) return [`${path}: expected a list`];
  return value.flatMap((item, i) => check(item, `${path}[${i}]`));
};

const obj = (fields: Record<string, Check>): Check => (value, path) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return [`${path}: expected an object`];
  const record = new Map<string, unknown>(Object.entries(value));
  return Object.entries(fields).flatMap(([field, check]) => check(record.get(field), `${path}.${field}`));
};

const coreMember = obj({ name: text, nativePlace: text });
const iconCard = obj({ title: text, description: text, iconPath: text });

// One entry per file in public/data. The fields mirror the types in types.ts that each page reads.
const contracts: Record<string, Check> = {
  'annualReports.json': list(obj({ year: text, title: text, link: text, description: optional(text), isNew: optional(bool) })),
  'committees.json': list(obj({
    name: text,
    chairperson: optional(coreMember),
    advisors: optional(list(coreMember)),
    convenors: optional(list(coreMember)),
    jointConvenors: optional(list(coreMember)),
    specialInvitees: optional(list(coreMember)),
    subCommittee: optional(list(coreMember)),
  })),
  'contact.json': obj({
    hero: obj({ title: text, subtitle: text }),
    organization: obj({ name: text, tagline: text }),
    contactInfo: list(obj({ id: text, label: text, value: text, iconType: oneOf('location', 'phone', 'email', 'clock') })),
    map: obj({ title: text, description: text, embedUrl: text }),
  }),
  'digitalOutreach.json': list(obj({
    category: text,
    iconPath: text,
    image: text,
    title: text,
    subtitle: optional(text),
    description: text,
    features: textList,
    stats: optional(list(obj({ label: text, value: text }))),
    ctaText: optional(text),
    ctaLink: optional(text),
    contacts: optional(list(obj({ name: text, contact: text, type: oneOf('whatsapp', 'phone', 'email'), label: optional(text) }))),
    registrationClosed: optional(bool),
  })),
  'events.json': list(obj({
    id: num,
    title: text,
    date,
    time: text,
    location: text,
    committee: text,
    tags: textList,
    cost: text,
    fullPricing: optional(text),
    description: text,
    registrationLink: optional(text),
    readMoreLink: optional(text),
    imageUrl: optional(text),
  })),
  'home.json': obj({
    stats: list(obj({ value: text, label: text, delay: text })),
    features: list(iconCard),
    presidentDefault: obj({ name: text, message: text, date }),
  }),
  'managingCommittee.json': list(obj({ name: text, role: text, photoUrl: text })),
  'membership.json': obj({
    tiers: list(obj({ tier: text, price: text, period: text, variant: oneOf('student', 'professional'), link: text, benefits: textList })),
    generalBenefits: list(iconCard),
  }),
  'pastPresidents.json': list(obj({ name: text, term: text, village: text })),
  'socialMedia.json': obj({ platforms: list(obj({ id: text, name: text, url: text, svgPath: text })) }),
};

const dataDir = join(__dirname, '..', 'public', 'data');
const files = readdirSync(dataDir).filter((file) => file.endsWith('.json'));
const load = (file: string): unknown => JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));

describe('the contract checks', () => {
  it('report a missing required field', () => {
    expect(obj({ title: text })({}, 'x')).toEqual(['x.title: expected text, got undefined']);
  });

  it('accept a missing optional field but reject a wrong one', () => {
    expect(obj({ link: optional(text) })({}, 'x')).toEqual([]);
    expect(obj({ link: optional(text) })({ link: 5 }, 'x')).toHaveLength(1);
  });

  it('reject a date that is not YYYY-MM-DD', () => {
    expect(date('05/09/2026', 'x')).toHaveLength(1);
  });

  it('reject a value outside the allowed list', () => {
    expect(oneOf('phone')('Phone', 'x')).toHaveLength(1);
  });
});

describe('public/data', () => {
  it('has a contract for every JSON file', () => {
    expect(files.filter((file) => !(file in contracts))).toEqual([]);
  });

  it.each(Object.keys(contracts))('%s exists and matches what the pages read', (file) => {
    expect(files).toContain(file);
    expect(contracts[file](load(file), file)).toEqual([]);
  });

  it('gives every event a different id', () => {
    const events = load('events.json');
    const ids = Array.isArray(events) ? events.map((event) => new Map<string, unknown>(Object.entries(event)).get('id')) : [];
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// The files that are also Sheet tabs go through the same normalisers as the Sheet rows.
// Every row must survive them unchanged, apart from fields no page reads.
const normalised: Record<string, { toItem: (row: unknown) => unknown; unread?: string[] }> = {
  'events.json': { toItem: toEvent },
  'managingCommittee.json': { toItem: toCommitteeMember, unread: ['email'] },
  'committees.json': { toItem: toCommittee },
  'annualReports.json': { toItem: toAnnualReport },
  'pastPresidents.json': { toItem: toPastPresident },
};

/** A committee's missing member lists come back as []; fill them in so the comparison is like for like. */
const withListDefaults = (file: string, row: unknown) =>
  file === 'committees.json' && typeof row === 'object' && row !== null
    ? { advisors: [], convenors: [], jointConvenors: [], specialInvitees: [], subCommittee: [], ...row }
    : row;

const withoutUnread = (row: unknown, unread: string[] = []) =>
  typeof row === 'object' && row !== null ? Object.fromEntries(Object.entries(row).filter(([key]) => !unread.includes(key))) : row;

describe('public/data through the row checks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(Object.keys(normalised))('%s keeps every row, unchanged', (file) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { toItem, unread } = normalised[file];
    const rows = load(file);
    expect(Array.isArray(rows)).toBe(true);
    const source = (rows as unknown[]).map((row) => withoutUnread(withListDefaults(file, row), unread));
    expect(normalizeRows(file, rows, toItem)).toEqual(source);
    expect(warn).not.toHaveBeenCalled();
  });

  it("home.json's default President's message passes the presidentMessage check", () => {
    const home = load('home.json');
    const presidentDefault = typeof home === 'object' && home !== null ? new Map<string, unknown>(Object.entries(home)).get('presidentDefault') : undefined;
    expect(toPresidentMessage(presidentDefault)).not.toBeNull();
  });
});
