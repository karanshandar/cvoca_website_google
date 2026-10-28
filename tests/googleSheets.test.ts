import { describe, it, expect, vi, afterEach } from 'vitest';
import { convertValue, groupCommitteeMembers } from '../utils/googleSheets';

describe('convertValue', () => {
  it('turns numeric id and srNo cells into numbers', () => {
    expect(convertValue('id', '7')).toBe(7);
    expect(convertValue('srNo', '12')).toBe(12);
  });

  it('keeps a non-numeric id as text', () => {
    expect(convertValue('id', 'abc')).toBe('abc');
  });

  it('reads isNew as TRUE or 1', () => {
    expect(convertValue('isNew', 'TRUE')).toBe(true);
    expect(convertValue('isNew', 'true')).toBe(true);
    expect(convertValue('isNew', '1')).toBe(true);
    expect(convertValue('isNew', 'no')).toBe(false);
  });

  it('splits comma-separated tags and drops blanks', () => {
    expect(convertValue('tags', 'CPE, Taxation,,  GST ')).toEqual(['CPE', 'Taxation', 'GST']);
  });

  it('turns an empty tags cell into an empty list', () => {
    expect(convertValue('tags', '')).toEqual([]);
  });

  it('converts DD/MM/YYYY dates to zero-padded YYYY-MM-DD', () => {
    expect(convertValue('date', '5/9/2026')).toBe('2026-09-05');
    expect(convertValue('date', '25/12/2026')).toBe('2026-12-25');
  });

  it('leaves YYYY-MM-DD dates unchanged', () => {
    expect(convertValue('date', '2026-09-05')).toBe('2026-09-05');
  });

  it('leaves other fields as text', () => {
    expect(convertValue('title', '42')).toBe('42');
    expect(convertValue('cost', '')).toBe('');
  });
});

describe('groupCommitteeMembers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const row = (committeeName: string, memberName: string, role: string) => ({
    committeeName,
    memberName,
    nativePlace: `${memberName} village`,
    role,
  });

  it('groups rows into committees in the order each first appears', () => {
    const committees = groupCommitteeMembers([
      row('Taxation', 'A', 'convenor'),
      row('Audit', 'B', 'convenor'),
      row('Taxation', 'C', 'advisor'),
    ]);
    expect(committees.map((c) => c.name)).toEqual(['Taxation', 'Audit']);
  });

  it('puts each role in its own list', () => {
    const [committee] = groupCommitteeMembers([
      row('Taxation', 'Chair', 'chairperson'),
      row('Taxation', 'Adv', 'advisor'),
      row('Taxation', 'Con', 'convenor'),
      row('Taxation', 'Joint', 'jointConvenor'),
      row('Taxation', 'Guest', 'specialInvitee'),
      row('Taxation', 'Sub', 'subCommittee'),
    ]);
    expect(committee.chairperson).toEqual({ name: 'Chair', nativePlace: 'Chair village' });
    expect(committee.advisors).toEqual([{ name: 'Adv', nativePlace: 'Adv village' }]);
    expect(committee.convenors).toEqual([{ name: 'Con', nativePlace: 'Con village' }]);
    expect(committee.jointConvenors).toEqual([{ name: 'Joint', nativePlace: 'Joint village' }]);
    expect(committee.specialInvitees).toEqual([{ name: 'Guest', nativePlace: 'Guest village' }]);
    expect(committee.subCommittee).toEqual([{ name: 'Sub', nativePlace: 'Sub village' }]);
  });

  it('leaves chairperson undefined when no row has that role', () => {
    const [committee] = groupCommitteeMembers([row('Audit', 'A', 'convenor')]);
    expect(committee.chairperson).toBeUndefined();
  });

  it('drops a member with a misspelt role and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const [committee] = groupCommitteeMembers([
      row('Audit', 'A', 'Convenor'),
      row('Audit', 'B', 'convenor'),
    ]);
    expect(committee.convenors).toEqual([{ name: 'B', nativePlace: 'B village' }]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Unknown committee role "Convenor"'));
  });
});
