/**
 * Google Sheets API Integration
 * Fetches data from Google Sheets and converts to JSON format
 */

const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID;

if (!API_KEY || !SHEET_ID) {
  console.error('Missing Google Sheets configuration. Please check your .env.local file.');
}

/**
 * Base URL for Google Sheets API v4
 */
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Fetches data from a specific Google Sheet tab
 * @param tabName - The name of the sheet tab (e.g., 'Events', 'Managing Committee')
 * @returns Array of objects with data from the sheet
 */
export async function fetchSheetData<T = any>(tabName: string): Promise<T[]> {
  try {
    const url = `${SHEETS_API_BASE}/${SHEET_ID}/values/${encodeURIComponent(tabName)}?key=${API_KEY}`;

    console.log(`Fetching data from Google Sheets tab: ${tabName}`);

    const response = await fetch(url);

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
    const jsonData = rows.map((row: any[]) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        const value = row[index] || ''; // Use empty string if cell is empty

        // Convert string values to appropriate types
        obj[header] = convertValue(header, value);
      });
      return obj;
    });

    console.log(`Successfully fetched ${jsonData.length} records from ${tabName}`);
    return jsonData;

  } catch (error) {
    console.error(`Error fetching Google Sheets data for tab "${tabName}":`, error);
    throw error;
  }
}

/**
 * Convert string values to appropriate types based on field name
 */
function convertValue(fieldName: string, value: string): any {
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
  const data = await fetchSheetData('pastPresidents');
  // Add serial numbers
  return data.map((president: any, index: number) => ({
    ...president,
    srNo: index + 1
  }));
}

/**
 * Fetches committee members and transforms to nested structure
 */
export async function fetchCommittees() {
  const members = await fetchSheetData('committeeMembers');

  // Group members by committee name
  const committeesMap = new Map();

  members.forEach((member: any) => {
    const committeeName = member.committeeName;

    if (!committeesMap.has(committeeName)) {
      committeesMap.set(committeeName, {
        name: committeeName,
        chairperson: undefined,
        advisors: [],
        convenors: [],
        jointConvenors: [],
        specialInvitees: [],
        subCommittee: []
      });
    }

    const committee = committeesMap.get(committeeName);
    const coreMember = { name: member.memberName, nativePlace: member.nativePlace };

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
