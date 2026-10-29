import { describe, it, expect, vi, afterEach } from 'vitest';
import { groupCommitteeMembers } from '../utils/googleSheets';

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
