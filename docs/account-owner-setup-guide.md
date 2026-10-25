# CVOCA Website — Account Owner Setup Guide

**Who this is for:** whoever holds the CVOCA **Google account** (the one that owns the Google Sheet and the Google Cloud project) and the **Render** account that hosts cvoca.org.

**Why it matters:** The website reads its events, committee and president data straight from a Google Sheet, using a Google "API key". That key is visible to anyone who opens the website, which is normal for this setup. But it **must be locked down**, so that nobody can misuse it or run up costs on the CVOCA Google account. Separately, the website's security settings in Render are written down in the code but **are not switched on** for the live site.

**Time needed:** about 45 minutes in total. You don't need any coding.

**What you need:**
- A login to the Google account that owns the CVOCA spreadsheet and Google Cloud project
- A login to the Render account (https://dashboard.render.com) for **Part C**

Tick each box as you go. When you finish, send the completed checklist at the end to the developer.

---

## Part A — Lock down the Google Sheets API key (Google Cloud, ~20 min)

### A1. Find the key
1. Go to https://console.cloud.google.com and sign in with the CVOCA Google account.
2. At the top of the page, use the **project picker** to select the project used for the website.
3. Open the menu (☰) → **APIs & Services** → **Credentials**.
4. Under **API Keys**, you'll see one or more keys. The website's key is the one whose value matches the `VITE_GOOGLE_SHEETS_API_KEY` setting in Render. To compare, open Render → the **cvoca-website** service → **Environment**. The two values should be the same.
5. Click the key's name to open its settings.

- [ ] Found the website's API key

### A2. Allow the key to work only on the CVOCA website
1. In the key's settings, under **Application restrictions**, choose **Websites**.
2. Under **Website restrictions**, click **Add** and enter, exactly:
   ```
   https://cvoca.org/*
   ```
3. If the developer also needs it while building the site on their own computer, add this as well:
   ```
   http://localhost:3000/*
   ```
   (It's better to give the developer a separate key for this. See A6.)
4. Don't click Save yet. Continue to A3 on the same page.

- [ ] Website restriction set to `https://cvoca.org/*`

### A3. Allow the key to use only Google Sheets
1. On the same page, under **API restrictions**, choose **Restrict key**.
2. In the dropdown, tick **Google Sheets API** only. Untick everything else.
3. Click **Save**. The change can take up to 5 minutes to take effect.

- [ ] Key restricted to Google Sheets API only
- [ ] Saved

### A4. Check no costly services are switched on
1. Menu (☰) → **APIs & Services** → **Enabled APIs & services**.
2. Look at the list. The website only needs the **Google Sheets API**.
3. If you see services the association doesn't use, especially **Generative Language API (Gemini)**, **Maps**, or anything you don't recognise, click it and choose **Disable API**.
   - If you're unsure whether something is used elsewhere, leave it and note its name in the checklist at the end.

- [ ] Checked the enabled services list (note anything unexpected below)

### A5. Add a spending alert (safety net)
1. Menu (☰) → **Billing** → **Budgets & alerts** → **Create budget**.
2. Set the amount to a small figure, for example **₹500 per month**.
3. Keep the default email alerts at 50%, 90% and 100%.
4. Save.

If the project has no billing account, Google can't charge for it. Note "no billing" in the checklist and skip this step.

- [ ] Budget alert created (or: project has no billing)

### A6. Replace the key (recommended)
The current key has been public since the site launched, possibly before it was restricted. Replacing it means any copies already floating around stop working.

1. Back in **APIs & Services** → **Credentials**, open the website's key.
2. Click **Regenerate key** (in some versions it's called **Rotate key**). Copy the **new** key value.
3. Check that the new key has the same restrictions as A2 and A3.
4. In Render: open the **cvoca-website** service → **Environment** → edit `VITE_GOOGLE_SHEETS_API_KEY` → paste the new key → **Save Changes**.
5. Redeploy so the website picks up the new key: **Manual Deploy** → **Deploy latest commit**. The key is built into the website, so it only changes after a deploy.
6. Once the site works with the new key (A7), delete the old key in Google Cloud, if Google kept it.
7. Optional: create a **second key** for the developer's computer, restricted to `http://localhost:3000/*` and the Google Sheets API. Send it to the developer privately, not by email in plain text if you can avoid it.

- [ ] New key created and pasted into Render
- [ ] Site redeployed
- [ ] Old key deleted

### A7. Check the website still works
1. Wait 5 minutes after saving the restrictions.
2. Open https://cvoca.org/events and https://cvoca.org/about in a **private/incognito** window.
3. **Events, the Managing Committee and the Past Presidents should all appear.**
   - If they show old data, or a "Couldn't load this content" message, see **Troubleshooting** at the end.

- [ ] Events page shows current events
- [ ] About page shows the committee and past presidents

---

## Part B — Check the Google Sheet itself (~10 min)

For the website to read the spreadsheet, it has to be viewable by anyone with the link. That means **every tab in that spreadsheet is effectively public**, not just the ones shown on the website.

### B1. Make sure nothing private is in it
1. Open the CVOCA website spreadsheet.
   - Its ID is the `VITE_GOOGLE_SHEET_ID` value in Render. It's the long code in the sheet's address: `docs.google.com/spreadsheets/d/`**`<this part>`**`/edit`.
2. Look through **every tab**, including hidden tabs (right-click any tab → **Show hidden sheets** if available).
3. Remove or move anything that shouldn't be public: personal phone numbers, emails, addresses, notes, draft data.

The tabs the website uses are: `events`, `managingCommittee`, `committeeMembers`, `annualReports`, `pastPresidents`, `presidentMessage`. Don't rename these. The website looks them up by exact name.

- [ ] Checked every tab; nothing private remains

### B2. Limit who can edit
Anyone who can edit the sheet can change what the website shows, including where the "Register" buttons point.

1. Click **Share** (top right).
2. Under **General access**, it should say **Anyone with the link → Viewer**. **Not Editor.**
3. In the list of people, keep **Editor** access only for the few named people who update the website. Remove anyone who no longer needs it.

- [ ] General access is **Viewer** only
- [ ] Editors limited to a small named group

---

## Part C — Switch on the website's security settings (Render, ~15 min)

The code repository contains a file (`render.yaml`) listing security settings, but the live site isn't using it. You can check this yourself: https://securityheaders.com/?q=cvoca.org currently shows most items missing. These steps enter the settings in the Render dashboard directly.

### C1. Add the security headers
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
default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://sheets.googleapis.com; frame-src https://www.google.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; upgrade-insecure-requests
```

4. Save. Render applies headers without a rebuild, usually within a minute.

**Why "Report-Only" first:** this header is the strictest one. In "Report-Only" mode it only *reports* problems, in the browser's developer console, and never breaks the site. After about a week with no problems, the developer will switch it on fully (see C3).

**Not included on purpose:**
- `X-XSS-Protection` is outdated, so leave it out.
- `preload` is not added to `Strict-Transport-Security`. That would permanently commit every cvoca.org sub-address to HTTPS. Only add it once every subdomain, including email-related ones, is confirmed to use HTTPS.

- [ ] All 7 headers added and saved

### C2. Check the build command
1. In **Settings** → **Build & Deploy**, find **Build Command**.
2. It should be:
   ```
   npm ci && npm run build
   ```
   If it says `npm install && npm run build`, change it to the line above and save. `npm ci` installs exactly the tested versions of the site's building blocks.
3. Check that **Publish Directory** is `dist`.

- [ ] Build command is `npm ci && npm run build`

### C3. Check it worked
1. Open https://securityheaders.com/?q=cvoca.org and click **Scan**. Most items should now be green. A grade of **A** is expected; the full A+ comes after the CSP is switched from Report-Only to enforced.
2. Open https://cvoca.org, browse Home, About, Events and Contact (check the map loads), and make sure everything looks normal.
3. **About one week later** (developer task): if the browser console shows no "Content Security Policy" reports, rename the header in Render from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`, keeping the same value.

- [ ] securityheaders.com shows the headers
- [ ] Site browsed and looks normal
- [ ] (Developer, one week later) CSP switched from Report-Only to enforced

---

## Troubleshooting

| What you see | Likely cause | Fix |
|---|---|---|
| Events/committee show old data or "Couldn't load this content" after Part A | Key restriction doesn't match the site address | In the key settings, check the website restriction is exactly `https://cvoca.org/*`, with no typo and no `www`. Wait 5 minutes, then reload in a private window. |
| Same, after replacing the key in A6 | The site was not redeployed, or the new key wasn't saved in Render | Check the `VITE_GOOGLE_SHEETS_API_KEY` value in Render, then **Manual Deploy → Deploy latest commit**. |
| The Contact page map is blank after Part C | The CSP header was entered as enforced instead of Report-Only, or with a typo | Make sure the header **name** ends in `-Report-Only`, and the value is pasted as one line. |
| Site shows "Something went wrong" right after a deploy | Old browser tab with outdated files | Reload the page. If it persists, tell the developer. |

If something breaks and you're unsure, you can safely undo any step:
- Remove the restriction in Google Cloud.
- Delete the header in Render.
- Paste the old key back in Render and redeploy.

---

## What changes later

The developer plans to move the Google Sheet reading **out of the browser** and into the website build. Visitors' browsers would then never see the key. When that happens:

- The key will be used by Render's build servers instead of browsers, so the **Websites** restriction from A2 will block it. The developer will ask for a **new, separate key** with **API restriction: Google Sheets API** and **no website restriction**. That key is kept secret in Render and never appears on the site.
- A **"CVOCA → Publish website"** menu will be added to the Google Sheet, so editors can publish changes with one click. Setting it up needs about 10 minutes with the Google account. The developer will send separate instructions.
- The `connect-src https://sheets.googleapis.com` part of the CSP can then be removed.

---

## Completed checklist — send this back to the developer

```
Date completed:
Done by:

A. Google Cloud
[ ] A2 Website restriction: https://cvoca.org/*   (also localhost? yes / no)
[ ] A3 API restriction: Google Sheets API only
[ ] A4 Enabled services checked. Anything unexpected?:
[ ] A5 Budget alert set (amount: ____)  or  [ ] project has no billing
[ ] A6 Key replaced, Render updated, redeployed, old key deleted
[ ] A6 Separate developer key created and sent?  yes / no
[ ] A7 Events and About pages checked

B. Google Sheet
[ ] B1 All tabs checked; nothing private left
[ ] B2 General access = Viewer; editors limited to:

C. Render
[ ] C1 Seven headers added
[ ] C2 Build command = npm ci && npm run build
[ ] C3 securityheaders.com grade:

Notes / problems:
```
