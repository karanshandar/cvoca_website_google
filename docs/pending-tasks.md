# CVOCA Website — Pending Tasks

Everything still to do on the live site that can't be done from the code alone, collected here so it can all be done in one go.

**Who does what:**
- **Account owner:** whoever holds the CVOCA **Google account** (the one that owns the Google Sheet and the Google Cloud project) and the **Render** account that hosts cvoca.org. They do the **Google** and **Render** sections. No coding needed.
- **Developer:** does the **Developer** section and runs the command-line checks in **Testing**.

**Why it matters:**
- The website reads its events, committee and president data straight from a Google Sheet, using a Google "API key". That key is visible to anyone who opens the website, which is normal for this setup. But it **must be locked down**, so that nobody can misuse it or run up costs on the CVOCA Google account.
- The website's security settings are written down in the code (`render.yaml`) but **are not switched on** for the live site.
- Mistyped addresses still show the home page with a "200 OK" instead of a proper "page not found".

**What you need:**
- A login to the Google account that owns the CVOCA spreadsheet and Google Cloud project
- A login to the Render account (https://dashboard.render.com)

**Time needed:** about 55 minutes for the account owner. Do the Render section on a call or screen-share with the developer.

Tick each box as you go. When you finish, send the completed checklist at the end to the developer.

## Suggested order

| # | Who | Step |
|---|---|---|
| 1 | Account owner | **Google** G1–G8 |
| 2 | Account owner | **Testing** T1 |
| 3 | Developer | **Developer** X1–X2, then deploy |
| 4 | Developer | **Testing** T3 |
| 5 | Account owner | **Render** R1–R2 |
| 6 | Both | **Testing** T2 |
| 7 | Account owner, with developer | **Render** R3 |
| 8 | Both | **Testing** T4 |
| 9 | Developer, about one week later | **Developer** X3 |
| 10 | Developer, any time | **Developer** X4 (done in code, 2026-10-29) |
| 11 | Developer, with the account owner's answer | **Developer** X5 |
| 12 | Developer, any time | **Developer** X6 |

---

## Google (account owner, ~30 min)

### Google Cloud: lock down the Sheets API key

#### G1. Find the key
1. Go to https://console.cloud.google.com and sign in with the CVOCA Google account.
2. At the top of the page, use the **project picker** to select the project used for the website.
3. Open the menu (☰) → **APIs & Services** → **Credentials**.
4. Under **API Keys**, you'll see one or more keys. The website's key is the one whose value matches the `VITE_GOOGLE_SHEETS_API_KEY` setting in Render. To compare, open Render → the **cvoca-website** service → **Environment**. The two values should be the same.
5. Click the key's name to open its settings.

- [ ] Found the website's API key

#### G2. Allow the key to work only on the CVOCA website
1. In the key's settings, under **Application restrictions**, choose **Websites**.
2. Under **Website restrictions**, click **Add** and enter, exactly:
   ```
   https://cvoca.org/*
   ```
3. If the developer also needs it while building the site on their own computer, add this as well:
   ```
   http://localhost:3000/*
   ```
   (It's better to give the developer a separate key for this. See G6.)
4. Don't click Save yet. Continue to G3 on the same page.

- [ ] Website restriction set to `https://cvoca.org/*`

#### G3. Allow the key to use only Google Sheets
1. On the same page, under **API restrictions**, choose **Restrict key**.
2. In the dropdown, tick **Google Sheets API** only. Untick everything else.
3. Click **Save**. The change can take up to 5 minutes to take effect.

- [ ] Key restricted to Google Sheets API only
- [ ] Saved

#### G4. Check no costly services are switched on
1. Menu (☰) → **APIs & Services** → **Enabled APIs & services**.
2. Look at the list. The website only needs the **Google Sheets API**.
3. If you see services the association doesn't use, especially **Generative Language API (Gemini)**, **Maps**, or anything you don't recognise, click it and choose **Disable API**.
   - If you're unsure whether something is used elsewhere, leave it and note its name in the checklist at the end.

- [ ] Checked the enabled services list (note anything unexpected below)

#### G5. Add a spending alert (safety net)
1. Menu (☰) → **Billing** → **Budgets & alerts** → **Create budget**.
2. Set the amount to a small figure, for example **₹500 per month**.
3. Keep the default email alerts at 50%, 90% and 100%.
4. Save.

If the project has no billing account, Google can't charge for it. Note "no billing" in the checklist and skip this step.

- [ ] Budget alert created (or: project has no billing)

#### G6. Replace the key (recommended)
The current key has been public since the site launched, possibly before it was restricted. Replacing it means any copies already floating around stop working.

1. Back in **APIs & Services** → **Credentials**, open the website's key.
2. Click **Regenerate key** (in some versions it's called **Rotate key**). Copy the **new** key value.
3. Check that the new key has the same restrictions as G2 and G3.
4. In Render: open the **cvoca-website** service → **Environment** → edit `VITE_GOOGLE_SHEETS_API_KEY` → paste the new key → **Save Changes**.
5. Redeploy so the website picks up the new key: **Manual Deploy** → **Deploy latest commit**. The key is built into the website, so it only changes after a deploy.
6. Once the site works with the new key (Testing T1), delete the old key in Google Cloud, if Google kept it.
7. Optional: create a **second key** for the developer's computer, restricted to `http://localhost:3000/*` and the Google Sheets API. Send it to the developer privately, not by email in plain text if you can avoid it.

- [ ] New key created and pasted into Render
- [ ] Site redeployed
- [ ] Old key deleted

### Google Sheet: check what's public and who can edit

For the website to read the spreadsheet, it has to be viewable by anyone with the link. That means **every tab in that spreadsheet is effectively public**, not just the ones shown on the website.

#### G7. Make sure nothing private is in it
1. Open the CVOCA website spreadsheet.
   - Its ID is the `VITE_GOOGLE_SHEET_ID` value in Render. It's the long code in the sheet's address: `docs.google.com/spreadsheets/d/`**`<this part>`**`/edit`.
2. Look through **every tab**, including hidden tabs (right-click any tab → **Show hidden sheets** if available).
3. Remove or move anything that shouldn't be public: personal phone numbers, emails, addresses, notes, draft data.

The tabs the website uses are: `events`, `managingCommittee`, `committeeMembers`, `annualReports`, `pastPresidents`, `presidentMessage`. Don't rename these. The website looks them up by exact name.

- [ ] Checked every tab; nothing private remains

#### G8. Limit who can edit
Anyone who can edit the sheet can change what the website shows, including where the "Register" buttons point.

1. Click **Share** (top right).
2. Under **General access**, it should say **Anyone with the link → Viewer**. **Not Editor.**
3. In the list of people, keep **Editor** access only for the few named people who update the website. Remove anyone who no longer needs it.

- [ ] General access is **Viewer** only
- [ ] Editors limited to a small named group

---

## Render (account owner, ~25 min)

The code repository contains a file (`render.yaml`) listing these settings, but the live site isn't using it. You can check this yourself: https://securityheaders.com/?q=cvoca.org currently shows most items missing. These steps enter the settings in the Render dashboard directly.

### R1. Add the security headers
1. Go to https://dashboard.render.com → open the **cvoca-website** service.
2. Open **Settings** and scroll to **Headers** (some versions show it as a separate **Headers** tab).
3. For each row below, click **Add Header** and copy the three values **exactly**:

| Path | Name | Value |
|---|---|---|
| `/*` | `X-Frame-Options` | `SAMEORIGIN` |
| `/*` | `X-Content-Type-Options` | `nosniff` |
| `/*` | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `/*` | `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()` |
| `/*` | `Strict-Transport-Security` | `max-age=31536000` |
| `/*` | `Content-Security-Policy-Report-Only` | *(the long value below)* |
| `/assets/*` | `Cache-Control` | `public, max-age=31536000, immutable` |

The long value for `Content-Security-Policy-Report-Only` must be pasted as **one line**:
```
default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://sheets.googleapis.com; frame-src https://www.google.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests
```

4. Save. Render applies headers without a rebuild, usually within a minute.

**Why "Report-Only" first:** this header is the strictest one. In "Report-Only" mode it only *reports* problems, in the browser's developer console, and never breaks the site. After about a week with no problems, the developer will switch it on fully (Developer X3).

**Not included on purpose:**
- `X-XSS-Protection` is outdated, so leave it out.
- `preload` is not added to `Strict-Transport-Security`. That would permanently commit every cvoca.org sub-address to HTTPS. Only add it once every subdomain, including email-related ones, is confirmed to use HTTPS.

- [ ] All 7 headers added and saved

### R2. Check the build command
1. In **Settings** → **Build & Deploy**, find **Build Command**.
2. It should be:
   ```
   npm ci && npm run build
   ```
   If it says `npm install && npm run build`, change it to the line above and save. `npm ci` installs exactly the tested versions of the site's building blocks.
3. Check that **Publish Directory** is `dist`.

- [ ] Build command is `npm ci && npm run build`

### R3. Remove the catch-all rewrite (with the developer)
Each page of the site now has its own file, so a shared link (WhatsApp, LinkedIn, etc.) shows that page's own title and description. Because of that, the old catch-all rule that sends every address to the home page is no longer needed. Removing it lets mistyped addresses return a proper "page not found", which search engines need.

**Only do this after** the code with X1–X2 is deployed and Testing T3 has passed.

1. In Render, open the **cvoca-website** service → **Redirects/Rewrites**.
2. Find the rule with **Source** `/*`, **Destination** `/index.html` and **Action** `Rewrite`.
3. Write it down (for undo), then delete it and **Save**.
4. Run Testing T4 straight away.

**Undo:** if any real page shows "Not Found", add the rule back exactly as before (`/*` → `/index.html`, Rewrite) and tell the developer.

- [ ] Catch-all rewrite removed

---

## Developer

### X1. Add a "page not found" file to the build
The build must ship a `dist/404.html` page before R3. Render staff on the community forum say a static site serves `/404.html` for paths that match no file and no rule. Without it, unknown addresses would show Render's plain "Not Found" page.

Done in code (2026-10-28): the build writes `dist/404.html`, a noindex copy of the site that shows the "Page not found" page. Still needs a deploy.

- [x] `dist/404.html` built
- [ ] Deployed

### X2. Remove the catch-all rewrite from `render.yaml`
Delete the `routes:` `/* → /index.html` rewrite in `render.yaml`, so linking the Blueprint later doesn't bring it back.

Done in code (2026-10-28). `render.yaml` isn't live until the Blueprint is linked, so this changes nothing on the site by itself.

- [x] `render.yaml` catch-all removed

### X3. Switch the CSP to enforced (about one week after R1)
If the browser console shows no "Content Security Policy" reports on any page, rename the header in Render from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`, keeping the same value.

- [ ] CSP switched from Report-Only to enforced

### X4. Interaction tests for show/hide controls (any time, no account needed)
The unit tests run without a browser environment, so they only check how components first render. Toggling is not tested automatically: the About accordion, the "View Archive" toggle, the Events "Expand" text and the Outreach "Read More" all use `hooks/useDisclosure.ts`, and they were checked by hand in the browser (Batch D2). To cover them, add `jsdom` and `@testing-library/react` as dev dependencies and write tests that click and press Enter/Space, then check that `aria-expanded` flips and the accordion body's `inert` follows.

Done in code (2026-10-29): `tests/interactions.test.tsx` runs in jsdom and covers all four controls with click, Enter and Space. Nothing to deploy.

- [x] Interaction tests added

### X5. Decide what a Sheet tab with only unreadable rows shows (needs the account owner's answer)
Since Batch E, the site skips any Sheet row with a missing required value or an unreadable date (see `docs/editing-content.md`). If **every** row in a tab is skipped, for example because a column header was misspelt or renamed, that section (Events, the committee lists, the reports, the past presidents) shows as empty. It does not switch to the JSON fallback, which only takes over when the Sheet can't be reached.

Ask the account owner which they prefer:
- **Keep as is:** an empty section makes the mistake obvious, and the editor fixes the Sheet.
- **Show the fallback:** visitors see the (possibly older) JSON content until the Sheet is fixed. In code: in `utils/fetchWithFallback.ts`, treat "the Sheet had rows but none survived the checks" as a failure, and add a test for it.

- [ ] Decision recorded: keep as is / show the fallback
- [ ] Code changed if needed

### X6. Accept numbers as event tags in the JSON (any time, minor)
In `utils/normalize.ts`, `textList` keeps only text items, so a tag written as a number in `events.json` (`2024` rather than `"2024"`) is silently dropped. Other fields accept a number and treat it as text. Nothing triggers this today: Sheet cells are always text, and the data-contract test requires text tags in the JSON. To make it consistent, run each list item through `text()` and add a test case to `tests/normalize.test.ts`.

- [ ] Numeric tags kept as text

### Planned later: Google Sheet read at build time
The developer plans to move the Google Sheet reading **out of the browser** and into the website build. Visitors' browsers would then never see the key. When that happens:

- The key will be used by Render's build servers instead of browsers, so the **Websites** restriction from G2 will block it. The developer will ask for a **new, separate key** with **API restriction: Google Sheets API** and **no website restriction**. That key is kept secret in Render and never appears on the site.
- A **"CVOCA → Publish website"** menu will be added to the Google Sheet, so editors can publish changes with one click. Setting it up needs about 10 minutes with the Google account. The developer will send separate instructions.
- The `connect-src https://sheets.googleapis.com` part of the CSP can then be removed.

---

## Testing

### T1. After the Google changes (G1–G6)
1. Wait 5 minutes after saving the restrictions.
2. Open https://cvoca.org/events and https://cvoca.org/about in a **private/incognito** window.
3. **Events, the Managing Committee and the Past Presidents should all appear.**
   - If they show old data, or a "Couldn't load this content" message, see **Troubleshooting** below.

- [ ] Events page shows current events
- [ ] About page shows the committee and past presidents

### T2. After the Render headers (R1–R2)
1. Open https://securityheaders.com/?q=cvoca.org and click **Scan**. Most items should now be green. A grade of **A** is expected; the full A+ comes after the CSP is switched from Report-Only to enforced (X3).
2. Open https://cvoca.org, browse Home, About, Events and Contact (check the map loads), and make sure everything looks normal.

- [ ] securityheaders.com shows the headers
- [ ] Site browsed and looks normal

### T3. After the next deploy (developer)
Run these with the latest code deployed:
```
curl -sI https://cvoca.org/about
curl -s https://cvoca.org/about | grep canonical
```
- The first should show `200` and **no** `Location:` line. That means Render serves `about/index.html` directly, with no redirect, and Cloudflare doesn't add a trailing slash.
- The second should show `https://cvoca.org/about`.
- Paste `https://cvoca.org/events` into a WhatsApp or LinkedIn message (without sending it). The preview should say **Events | CVOCA**, not the home page title.

- [ ] Per-page files served without redirect; link preview shows the page's own title

### T4. After removing the catch-all rewrite (R3)
1. In a private/incognito window, open each page directly: https://cvoca.org/, `/about`, `/membership`, `/events`, `/blog`, `/digital-outreach`, `/contact`, `/privacy-policy`. Each should load normally, including after pressing refresh.
2. Open https://cvoca.org/this-page-does-not-exist. It should show the site's "page not found" page.
3. Developer: `curl -sI https://cvoca.org/this-page-does-not-exist` should now show `404`, not `200`.

- [ ] All 8 pages load directly
- [ ] Unknown address shows "page not found" (developer: status 404)

---

## Troubleshooting

| What you see | Likely cause | Fix |
|---|---|---|
| Events/committee show old data or "Couldn't load this content" after the Google changes | Key restriction doesn't match the site address | In the key settings, check the website restriction is exactly `https://cvoca.org/*`, with no typo and no `www`. Wait 5 minutes, then reload in a private window. |
| Same, after replacing the key in G6 | The site was not redeployed, or the new key wasn't saved in Render | Check the `VITE_GOOGLE_SHEETS_API_KEY` value in Render, then **Manual Deploy → Deploy latest commit**. |
| The Contact page map is blank after R1 | The CSP header was entered as enforced instead of Report-Only, or with a typo | Make sure the header **name** ends in `-Report-Only`, and the value is pasted as one line. |
| A real page (e.g. /about) shows "Not Found" after R3 | That page's file is missing from the deploy | Add the `/*` → `/index.html` rewrite back (R3 undo) and tell the developer. |
| Site shows "Something went wrong" right after a deploy | Old browser tab with outdated files | Reload the page. If it persists, tell the developer. |

If something breaks and you're unsure, you can safely undo any step:
- Remove the restriction in Google Cloud.
- Delete the header in Render.
- Paste the old key back in Render and redeploy.
- Add the `/*` → `/index.html` rewrite back (R3).

---

## Completed checklist — send this back to the developer

```
Date completed:
Done by:

Google
[ ] G2 Website restriction: https://cvoca.org/*   (also localhost? yes / no)
[ ] G3 API restriction: Google Sheets API only
[ ] G4 Enabled services checked. Anything unexpected?:
[ ] G5 Budget alert set (amount: ____)  or  [ ] project has no billing
[ ] G6 Key replaced, Render updated, redeployed, old key deleted
[ ] G6 Separate developer key created and sent?  yes / no
[ ] G7 All tabs checked; nothing private left
[ ] G8 General access = Viewer; editors limited to:

Render
[ ] R1 Seven headers added
[ ] R2 Build command = npm ci && npm run build
[ ] R3 Catch-all rewrite removed (with developer)

Developer
[ ] X1 dist/404.html deployed (built in code: done)
[x] X2 render.yaml catch-all removed
[ ] X3 CSP enforced (one week after R1)
[x] X4 Interaction tests for show/hide controls
[ ] X5 Sheet tab with only unreadable rows: keep empty / show fallback (owner's choice: ____)
[ ] X6 Numeric event tags accepted

Testing
[ ] T1 Events and About pages show Sheet data
[ ] T2 securityheaders.com grade: ____ ; site browsed, map loads
[ ] T3 /about served without redirect; link preview shows page title
[ ] T4 All 8 pages load directly; unknown address shows "page not found" (404)

Notes / problems:
```
