# Editing the website's content

A short guide for the people who keep the CVOCA website up to date. You do not need to be a developer for anything in the first two rows of the table below.

## Where to change what

| What you want to change | Where it lives | Who can change it |
|---|---|---|
| Events, managing committee, sub-committees, annual reports, past presidents, the President's message on Home | **Google Sheet** (one tab each, see below) | Anyone with edit access to the Sheet. Changes show on the site straight away; no deploy needed. |
| Home page stats and feature cards, Digital Outreach initiatives, membership tiers and benefits, contact details, footer social links | **JSON files** in `public/data/` (`home.json`, `digitalOutreach.json`, `membership.json`, `contact.json`, `socialMedia.json`) | Anyone who can edit files in the GitHub repository. The site updates after Render rebuilds (a few minutes after the change is committed to `main`). |
| About page text, the Blog page, the Privacy Policy, the Compliance Calendar card on Home, the menu, page titles and search descriptions | **Written into the page code** (`pages/*.tsx`, `components/Header.tsx`) | A developer. |

## How the Sheet and the JSON files relate

Each Sheet tab has a matching "fallback" JSON file in `public/data/`. The website reads the Sheet first. It uses the JSON file only when the Sheet can't be reached (Google is down, the key is wrong, or the site is running on a developer's computer without the Sheet settings).

- The JSON files are **not** updated from the Sheet automatically. If you want the fallback to be useful, copy important changes (new events, a new committee) into the JSON file too, or ask a developer to.
- A tab that exists but has **no rows** shows an empty section. It does not switch to the fallback.
- The President's message has no fallback file of its own. Without the Sheet, Home shows the default message in `home.json` (`presidentDefault`).

| Sheet tab | Fallback file |
|---|---|
| `events` | `events.json` |
| `managingCommittee` | `managingCommittee.json` |
| `committeeMembers` | `committees.json` (grouped by committee, see below) |
| `annualReports` | `annualReports.json` |
| `pastPresidents` | `pastPresidents.json` |
| `presidentMessage` | `presidentDefault` in `home.json` |

## Sheet rules that apply to every tab

- **Tab names and column headers must match exactly**, including capital letters (`imageUrl`, not `Image URL` or `imageurl`). Row 1 holds the headers; every row below it is one item. Column order doesn't matter.
- Extra columns are ignored, so you can keep notes in a column the site doesn't read.
- **Dates:** first set every `date` column (in `events` and `presidentMessage`) to **Format → Number → Plain text**, so Google Sheets keeps exactly what you type. Then type dates as `DD/MM/YYYY` (for example `05/09/2026` for 5 September) or `YYYY-MM-DD` (`2026-09-05`). The site always reads `a/b/c` as day/month/year. If the column is left as a date format, Sheets may hand the site the date in another order (for example US month/day) and the event silently shows the wrong date. Other formats such as `5 Sep 2026` or `05-09-2026`, and dates that don't exist such as `31/02/2026`, can't be read, so that row is skipped (see the next rule).
- **A row with a missing required value is left off the site.** If a cell in a column marked "Required: yes" below is empty (spaces count as empty), the `date` can't be read, or an event's `id` is not a whole number, the site skips that row and shows the rest of the tab. Event `tags` and `cost` are the exception: they may be empty. Each skipped row logs a warning in the browser's developer console naming the tab and the row (row 1 is the first row below the headers). If something you added doesn't appear, check that row first.
- Rows appear on the site in the order they appear in the Sheet, except where a section sorts them itself (events are sorted by date).
- The Sheet must stay shared as **Anyone with the link → Viewer**, or the site falls back to the JSON files.

## The six Sheet tabs

### `events`

| Column | Required | What to put in it |
|---|---|---|
| `id` | yes | A whole number, different for every event (1, 2, 3 …). |
| `title` | yes | Event name. |
| `date` | yes | Event date (see date rules above). Once the date has passed, the event moves from "Upcoming Events" to "Past Events" by itself. |
| `time` | yes | For example `10:00 AM - 1:00 PM`. The "Add to Calendar" link reads this; if it can't (for example `TBD`), it uses 9–11 AM. |
| `location` | yes | Venue, or `Online`. |
| `committee` | yes | The organising committee. Used for the "Organizer" filter. |
| `tags` | yes | Comma-separated labels, for example `CPE, Taxation`. Can be empty. |
| `cost` | yes | Shown as a badge. Exactly `Free` shows it in green. Can be empty. |
| `description` | yes | Event description. |
| `fullPricing` | no | Longer pricing details shown on the card. |
| `registrationLink` | no | Registration URL. Leave empty to show "Registration Closed". |
| `readMoreLink` | no | Link to a blog post or page with more detail. |
| `imageUrl` | no | Flyer image URL (see [cloudinary-guide.md](cloudinary-guide.md)). |

### `managingCommittee`

| Column | Required | What to put in it |
|---|---|---|
| `name` | yes | Member's name. |
| `role` | yes | Shown under the name, for example `Vice President`. Exactly `President` also puts that person's name and photo next to the President's message on Home. |
| `photoUrl` | yes | Photo URL (square works best). |

### `committeeMembers`

One row per person per committee. The site groups the rows into committees, in the order each committee first appears.

| Column | Required | What to put in it |
|---|---|---|
| `committeeName` | yes | Committee name. Spell it the same way on every row of that committee. |
| `memberName` | yes | Member's name. |
| `nativePlace` | yes | Member's native place. |
| `role` | yes | One of the values below, typed exactly. |

Allowed `role` values (a misspelt role hides that person):

| `role` | Shown as |
|---|---|
| `chairperson` | Chairperson (one per committee; a second row replaces the first) |
| `advisor` | Advisors |
| `convenor` | Convenors |
| `jointConvenor` | Joint Convenors |
| `specialInvitee` | Special Invitees |
| `subCommittee` | Sub Committee |

### `annualReports`

| Column | Required | What to put in it |
|---|---|---|
| `year` | yes | For example `2024-25`. |
| `title` | yes | Report title. |
| `link` | yes | Link to the report (a Google Drive "view" link is fine). |
| `description` | no | Short summary, shown for the featured report. |
| `isNew` | no | `TRUE` (or `1`) makes this the featured report. Without one, the first row is featured. |

### `pastPresidents`

| Column | Required | What to put in it |
|---|---|---|
| `name` | yes | Name. |
| `term` | yes | For example `1973-74`. |
| `village` | yes | Native village. |

Serial numbers are added by the site from the row order, so keep the rows in order (oldest first).

### `presidentMessage`

Only the first row below the headers is used.

| Column | Required | What to put in it |
|---|---|---|
| `date` | yes | Date of the message (see date rules above). |
| `message` | yes | The message text, without quotation marks. |

## JSON files

The JSON files must stay valid JSON: keep the quotation marks, commas and brackets exactly as they are and change only the text between quotes. Each file's structure matches the type of the same name in `types.ts`. On every push to `main` (and on pull requests to it), an automated check (`npm test`, run by GitHub Actions) loads every file in `public/data/` and fails if a field the pages need is missing. The fallback files for the Sheet tabs follow the same row rules as the Sheet (see above), and the check also fails if any of their rows would be skipped. A red ✗ next to your commit on GitHub means the edit needs fixing. The check does not stop Render from deploying, so fix it straight away.

## Images

Images can be uploaded to Cloudinary and the link pasted into the Sheet (see [cloudinary-guide.md](cloudinary-guide.md)), or committed to `public/images/` as `.webp` files by a developer and referenced as `/images/...`.
