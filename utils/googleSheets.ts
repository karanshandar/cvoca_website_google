/**
 * Google Sheets API Integration
 * Fetches data from Google Sheets and converts to JSON format
 */

import type { AnnualReport, Committee, CommitteeMember, CoreMember, CvoEvent, PastPresident, PresidentMessage } from '../types';
import {
  normalizeRows,
  toAnnualReport,
  toCommitteeMember,
  toCommitteeMemberRow,
  toEvent,
  toPastPresident,
  toPresidentMessage,
  type CommitteeMemberRow,
} from './normalize';

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

const IS_CONFIGURED = Boolean(API_KEY && SHEET_ID);

if (!IS_CONFIGURED && import.meta.env.DEV) {
  console.warn('Google Sheets is not configured (VITE_GOOGLE_SHEETS_API_KEY / VITE_GOOGLE_SHEET_ID); using the local JSON data.');
}

/** Thrown instead of requesting `/spreadsheets/undefined/...` when the env vars are missing. */
export class SheetsNotConfiguredError extends Error {
  constructor() {
    super('Google Sheets is not configured');
    this.name = 'SheetsNotConfiguredError';
  }
}

/** A hanging Sheets request gives up after this long, so the JSON fallback shows instead. */
const REQUEST_TIMEOUT_MS = 5000;

/**
 * Base URL for Google Sheets API v4
 */
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Fetches data from a specific Google Sheet tab
 * @param tabName - The name of the sheet tab (e.g., 'Events', 'Managing Committee')
 * @returns One object per row, keyed by the header row, holding the raw cell text
 */
export async function fetchSheetData(tabName: string): Promise<Record<string, string>[]> {
  if (!IS_CONFIGURED) {
    throw new SheetsNotConfiguredError();
  }

  try {
    const url = `${SHEETS_API_BASE}/${SHEET_ID}/values/${encodeURIComponent(tabName)}?key=${API_KEY}`;

    if (import.meta.env.DEV) console.log(`Fetching data from Google Sheets tab: ${tabName}`);

    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Google Sheets API Error:', errorData);
      throw new Error(`Failed to fetch data from Google Sheets: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check if we got valid data
    if (!data.values || data.values.length === 0) {
      console.warn(`No data found in sheet tab: ${tabName}`);
      return [];
    }

    // Convert sheet data to JSON format
    const headers = data.values[0]; // First row contains headers
    const rows = data.values.slice(1); // Remaining rows are data

    // Map each row to an object using headers as keys. Sheets leaves out trailing
    // empty cells, so a missing cell reads as ''. The normalisers turn the text into typed values.
    const jsonData = rows.map((row: string[]) => {
      const obj: Record<string, string> = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || ''; // Use empty string if cell is empty
      });
      return obj;
    });

    if (import.meta.env.DEV) console.log(`Successfully fetched ${jsonData.length} records from ${tabName}`);
    return jsonData;

  } catch (error) {
    console.error(`Error fetching Google Sheets data for tab "${tabName}":`, error);
    throw error;
  }
}

/**
 * Fetches events data from Google Sheets
 */
export async function fetchEvents(): Promise<CvoEvent[]> {
  return normalizeRows('Sheet tab "events"', await fetchSheetData('events'), toEvent);
}

/**
 * Fetches managing committee data from Google Sheets
 */
export async function fetchManagingCommittee(): Promise<CommitteeMember[]> {
  return normalizeRows('Sheet tab "managingCommittee"', await fetchSheetData('managingCommittee'), toCommitteeMember);
}

/**
 * Fetches annual reports data from Google Sheets
 */
export async function fetchAnnualReports(): Promise<AnnualReport[]> {
  return normalizeRows('Sheet tab "annualReports"', await fetchSheetData('annualReports'), toAnnualReport);
}

/**
 * Fetches past presidents data from Google Sheets
 */
export async function fetchPastPresidents(): Promise<PastPresident[]> {
  // Serial numbers are assigned on the About page, so Sheets and the JSON fallback match
  return normalizeRows('Sheet tab "pastPresidents"', await fetchSheetData('pastPresidents'), toPastPresident);
}

/**
 * Fetches committee members and transforms to nested structure
 */
export async function fetchCommittees(): Promise<Committee[]> {
  const members = normalizeRows('Sheet tab "committeeMembers"', await fetchSheetData('committeeMembers'), toCommitteeMemberRow);
  return groupCommitteeMembers(members);
}

/** A committee whose member lists always exist, so rows can be pushed straight in */
type CommitteeDraft = Committee & Required<Omit<Committee, 'chairperson'>>;

const emptyCommittee = (name: string): CommitteeDraft => ({
  name,
  chairperson: undefined,
  advisors: [],
  convenors: [],
  jointConvenors: [],
  specialInvitees: [],
  subCommittee: [],
});

/**
 * Groups flat committeeMembers rows (one per person) into committees,
 * in the order each committee first appears
 */
export function groupCommitteeMembers(members: CommitteeMemberRow[]): Committee[] {
  const committeesMap = new Map<string, CommitteeDraft>();

  members.forEach((member) => {
    const committeeName = member.committeeName;

    let committee = committeesMap.get(committeeName);
    if (!committee) {
      committee = emptyCommittee(committeeName);
      committeesMap.set(committeeName, committee);
    }

    const coreMember: CoreMember = { name: member.memberName, nativePlace: member.nativePlace };

    switch (member.role) {
      case 'chairperson':
        committee.chairperson = coreMember;
        break;
      case 'advisor':
        committee.advisors.push(coreMember);
        break;
      case 'convenor':
        committee.convenors.push(coreMember);
        break;
      case 'jointConvenor':
        committee.jointConvenors.push(coreMember);
        break;
      case 'specialInvitee':
        committee.specialInvitees.push(coreMember);
        break;
      case 'subCommittee':
        committee.subCommittee.push(coreMember);
        break;
      default:
        console.warn(`Unknown committee role "${member.role}" for ${member.memberName} in ${committeeName}; member not shown`);
    }
  });

  return Array.from(committeesMap.values());
}

/**
 * Fetches president's message from Google Sheets (only the first row is used)
 */
export async function fetchPresidentMessage(): Promise<PresidentMessage | null> {
  const [first] = normalizeRows('Sheet tab "presidentMessage"', (await fetchSheetData('presidentMessage')).slice(0, 1), toPresidentMessage);
  return first ?? null;
}
