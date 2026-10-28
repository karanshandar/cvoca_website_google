/**
 * Google Sheets API Integration
 * Fetches data from Google Sheets and converts to JSON format
 */

import type { Committee, CoreMember } from '../types';

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
 * @returns Array of objects with data from the sheet
 */
export async function fetchSheetData<T = Record<string, unknown>>(tabName: string): Promise<T[]> {
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

    // Map each row to an object using headers as keys
    const jsonData = rows.map((row: string[]) => {
      const obj: Record<string, unknown> = {};
      headers.forEach((header: string, index: number) => {
        const value = row[index] || ''; // Use empty string if cell is empty

        // Convert string values to appropriate types
        obj[header] = convertValue(header, value);
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
 * Convert string values to appropriate types based on field name
 */
export function convertValue(fieldName: string, value: string): string | number | boolean | string[] {
  // Empty values
  if (value === '' || value === null || value === undefined) {
    return fieldName === 'tags' ? [] : value;
  }

  // Number fields
  if (fieldName === 'id' || fieldName === 'srNo') {
    const num = parseInt(value);
    return isNaN(num) ? value : num;
  }

  // Boolean fields
  if (fieldName === 'isNew') {
    return value.toLowerCase() === 'true' || value === '1';
  }

  // Array fields (comma-separated)
  if (fieldName === 'tags') {
    return value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
  }

  // Date fields - Convert DD/MM/YYYY to YYYY-MM-DD
  if (fieldName === 'date' && value.includes('/')) {
    const parts = value.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }

  // Default: return as string
  return value;
}

/**
 * Fetches events data from Google Sheets
 */
export async function fetchEvents() {
  return fetchSheetData('events');
}

/**
 * Fetches managing committee data from Google Sheets
 */
export async function fetchManagingCommittee() {
  return fetchSheetData('managingCommittee');
}

/**
 * Fetches annual reports data from Google Sheets
 */
export async function fetchAnnualReports() {
  return fetchSheetData('annualReports');
}

/**
 * Fetches past presidents data from Google Sheets
 */
export async function fetchPastPresidents() {
  // Serial numbers are assigned on the About page, so Sheets and the JSON fallback match
  return fetchSheetData('pastPresidents');
}

/**
 * Fetches committee members and transforms to nested structure
 */
export async function fetchCommittees() {
  const members = await fetchSheetData('committeeMembers');
  return groupCommitteeMembers(members);
}

/** Sheet cells arrive as text; a missing column reads as an empty string. */
const cellText = (value: unknown): string => (value == null ? '' : String(value));

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
export function groupCommitteeMembers(members: Record<string, unknown>[]): Committee[] {
  const committeesMap = new Map<string, CommitteeDraft>();

  members.forEach((member) => {
    const committeeName = cellText(member.committeeName);

    let committee = committeesMap.get(committeeName);
    if (!committee) {
      committee = emptyCommittee(committeeName);
      committeesMap.set(committeeName, committee);
    }

    const coreMember: CoreMember = { name: cellText(member.memberName), nativePlace: cellText(member.nativePlace) };

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
 * Fetches president's message from Google Sheets
 */
export async function fetchPresidentMessage() {
  const data = await fetchSheetData('presidentMessage');
  return data.length > 0 ? data[0] : null;
}
