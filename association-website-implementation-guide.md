# Association Website Implementation Guide

**Complete Setup & Operations Documentation**
Version 3.0 — Reorganized for Semi-Technical Users

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Before You Start](#2-before-you-start)
   - [Current Status](#21-current-status)
   - [Implementation Roadmap](#25-implementation-roadmap)
3. [Google Sheets API Integration](#3-google-sheets-api-integration-next-steps)
   - [Create Google Sheets](#31-create-google-sheets-step-1)
   - [Set Up Google Sheets API](#32-set-up-google-sheets-api-step-2)
   - [Set Up Cloudinary](#33-set-up-cloudinary-step-3)
   - [Update Website Code](#34-update-website-code-step-4)
   - [Deploy Updated Website](#35-deploy-updated-website-step-5)
   - [Migrate Data](#36-migrate-data-from-static-to-dynamic-step-6)
   - [Integration Issues](#37-common-integration-issues)
4. [Access Control & Team Roles](#4-access-control--team-roles)
   - [Render Deployment](#45-how-render-deployment-works)
5. [Daily Operations](#5-daily-operations)
6. [Image Optimization Guide](#6-image-optimization-guide)
7. [Data Backup & Recovery](#7-data-backup--recovery)
8. [Risk Mitigation & Contingencies](#8-risk-mitigation--contingencies)
9. [Troubleshooting](#9-troubleshooting)
10. [Emergency Procedures](#10-emergency-procedures)
11. [Appendices](#11-appendices)
    - [Appendix A](#appendix-a-access-control-template): Access Control Template
    - [Appendix B](#appendix-b-account-credentials-storage): Credentials Storage
    - [Appendix C](#appendix-c-monthly-maintenance-checklist): Maintenance Checklist
    - [Appendix D](#appendix-d-glossary-non-technical): Glossary
    - [Appendix E](#appendix-e-helpful-links): Helpful Links
    - [Appendix G](#appendix-g-render-deployment-reference): Render Reference
    - [Appendix H](#appendix-h-comparison-static-vs-dynamic-website): Static vs Dynamic
    - [Appendix F](#appendix-f-quick-decision-tree): Decision Tree

---

## 1. Overview & Architecture

### 1.1 What We're Building

Your website is already live on Render with a custom domain. Now we're adding **dynamic content management** so non-technical team members can update events, team information, and compliance calendars by editing a simple Google Sheets spreadsheet. No more deploying when content changes!

**In simple terms:**
- Google Sheets = Your content storage (like a database you can edit)
- Website code = Reads from Google Sheets and displays it beautifully (already deployed on Render)
- Cloudinary = Image storage with drag-and-drop upload
- Render = Your hosting (already set up)

### 1.2 How It Works (Simplified)

```
You edit Google Sheets → Website automatically fetches changes → Visitors see updates (within 2-5 minutes)
```

No deploying needed for content updates. No servers to manage. Non-technical users can update everything.

### 1.3 The Services You'll Use

| Service | What It Does | Status | Notes |
|---------|-------------|--------|-------|
| **Google Sheets** | Stores all text content (events, team members) | **Setting up** | Unlimited free storage |
| **Cloudinary** | Hosts images with drag-and-drop | **Setting up** | Free: 2 GB storage, 25 credits/month |
| **Render** | Publishes your website to the internet | **Already live** | Custom domain already configured |
| **GitHub** | Stores website code | **Already in use** | Developer manages this |

### 1.4 Why This Approach?

✅ **Easy for non-technical users** — Uses familiar tools (Google Sheets)
✅ **Zero cost** — All services have unlimited free tiers
✅ **No servers to maintain** — Google and Cloudinary handle the infrastructure
✅ **Instant updates** — Changes appear within minutes, no redeploying
✅ **Scalable** — Works the same whether you have 50 or 5,000 events
✅ **Reliable** — Google and Cloudinary are enterprise-grade services

---

## 2. Before You Start

### 2.1 Current Status

**Already Complete ✅**
- Website built and deployed on Render with custom domain
- GitHub repository with website code
- Using static data currently

**What We're Adding**
- Google Sheets API integration
- Dynamic content management (events, team members, compliance calendar)
- Cloudinary for image hosting

### 2.2 What You'll Need

**Accounts (all free):**
1. Google account (for Google Sheets and Google Cloud) — **Create new**
2. Cloudinary account (for image hosting) — **Create new**
3. Render dashboard access — **Already have**
4. GitHub repository access — **Already have**

**Technical knowledge required:**
- Basic spreadsheet skills (Google Sheets)
- Ability to copy/paste URLs
- Comfortable with web browsers
- **That's it.** Non-technical users can update content without coding.

### 2.3 Time Estimate

| Task | Time | Who |
|------|------|-----|
| Create Google account + set up Sheet | 10 min | Non-developer |
| Create Google Cloud project + API key | 15 min | Developer |
| Set up Cloudinary | 10 min | Non-developer |
| Update website code with API key | 15 min | Developer |
| Deploy updated website | 5 min | Developer |
| **Total Setup** | **~55 min** | Mostly developer |
| **Training** | 20 min | Developer trains content team |

### 2.4 Security Note (Important)

This setup uses **public data only**. Everything you put in the spreadsheet and upload to Cloudinary is visible on the website. This is not suitable for:
- Private member information (emails, phone numbers)
- Sensitive internal documents
- Personal financial data
- Confidential decisions

**This IS suitable for:**
- Public events (dates, descriptions, photos)
- Team bios and photos
- Public announcements
- Compliance calendars and deadlines
- Any information you want visitors to see

---

## 2.5 Implementation Roadmap

**Here's exactly what happens next, in order:**

### Phase 1: Setup (Developer + Non-developer, 55 minutes)

1. **Create Google Sheets** (10 min, anyone can do)
   - Create Google account
   - Make three tabs: events, teams, compliance
   - Share with your team

2. **Set up Google Cloud API** (15 min, developer only)
   - Create Google Cloud project
   - Enable Google Sheets API
   - Create and restrict API key
   - Save the key

3. **Set up Cloudinary** (10 min, anyone can do)
   - Create Cloudinary account
   - Create folders: events, team
   - Start uploading images

4. **Update website code** (15 min, developer only)
   - Add Google Sheets Sheet ID to code
   - Add Google Sheets API key to code
   - Replace static data with API fetch calls
   - Push to GitHub

5. **Render deploys automatically** (1-2 min, automatic)
   - You see the changes go live
   - No manual deployment needed

### Phase 2: Migration (Your team, 30 minutes)

1. **Copy your existing data to Google Sheets**
   - All current events
   - All team members
   - Compliance items

2. **Upload images to Cloudinary**
   - Move all event/team photos
   - Get image URLs
   - Update Google Sheet with URLs

3. **Test everything**
   - Edit something in Google Sheet
   - Wait 2-5 minutes
   - Verify change appears on website

### Phase 3: Training (Your team, 20 minutes)

1. **Learn how to update Google Sheets**
   - Add new events
   - Add team members
   - Update compliance calendar

2. **Learn basic troubleshooting**
   - What to do if images don't load
   - How to fix typos
   - When to contact developer

**Total time:** ~105 minutes (mostly developer work)

---

## 3. Google Sheets API Integration (Next Steps)

**Your website is already live on Render. Now we're adding dynamic content management.**

**Follow these steps in order.**

### 3.1 Create Google Sheets (Step 1)

#### What to do:

1. Go to [Google Sheets](https://sheets.google.com)
2. Click **Create** → **New spreadsheet**
3. Name it `Association Website Content`
4. You now have a blank spreadsheet

#### Create three tabs (sheets):

Right-click the sheet tab at the bottom and select **Insert sheet**. Create these three:

**Tab 1: "events"**
```
Columns (exactly as shown):
title | date | description | image
```

Add sample row:
```
Annual Meeting 2025 | 2025-03-15 | Our yearly gathering | (leave blank for now)
```

**Tab 2: "teams"**
```
Columns (exactly as shown):
name | role | department | image
```

Add sample row:
```
John Doe | President | Executive | (leave blank for now)
```

**Tab 3: "compliance"**
```
Columns (exactly as shown):
item | date | status | notes
```

Add sample row:
```
Annual Audit | 2025-04-30 | Pending | Scheduled with external auditor
```

#### Configure the sheet:

1. **Freeze the header row** (so it doesn't scroll):
   - Click row 1
   - Go to **View** → **Freeze** → **1 row**

2. **Protect the header row** (prevent accidental changes):
   - Right-click row 1 → **Protect range**
   - Set permission for specific editors only

3. **Share the sheet**:
   - Click **Share** (top right)
   - Click **Change to anyone with the link**
   - Select **Viewer** (they can only view, not edit)
   - Copy the shareable link (you'll need this later)

#### Copy your Sheet ID:

Look at the URL: `https://docs.google.com/spreadsheets/d/[THIS_PART_HERE]/edit`

Copy the ID part (it's a long string of letters and numbers). Save it somewhere safe.

---

### 3.2 Set Up Google Sheets API (Step 2)

**What this does:** Creates a "key" that lets your website read from Google Sheets without exposing your password.

#### Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click **Create Project** (or select existing)
3. Name it `Association Website`
4. Wait for creation (2-3 seconds)

5. In the left menu, click **APIs & Services** → **Library**
6. Search for `Google Sheets API`
7. Click on it
8. Click **Enable**
9. Wait for it to activate

10. Go to **APIs & Services** → **Credentials** (left menu)
11. Click **Create Credentials** → **API Key**
12. A key appears (save it somewhere safe)

#### Restrict Your API Key (Security - Important!)

**Why:** Your API key is visible to anyone, so we lock it down to prevent abuse.

1. In **Credentials** page, find your API key
2. Click **Edit** (pencil icon)
3. Under **Application restrictions**:
   - Select **HTTP referrers (websites)**
   - Add these lines (one per line):
     ```
     yoursite.netlify.app/*
     www.yourdomain.com/*
     yourdomain.com/*
     ```
   - Replace with your actual domain

4. Under **API restrictions**:
   - Select **Restrict key**
   - Find **Google Sheets API** in the list
   - Select it

5. Set **Daily quota** to `10000` (more than enough)

6. Click **Save**

**Note:** If you don't have a domain yet, use `*.netlify.app/*` temporarily.

---

### 3.3 Set Up Cloudinary (Step 3)

**What this does:** Creates an image hosting account where you upload photos.

#### Steps:

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Click **Sign Up** (no credit card required)
3. Verify your email
4. You're in! Save your **Cloud Name** (shown on dashboard)

#### Create folder structure:

1. Go to **Media Library** (left sidebar)
2. Click **Create Folder**
3. Name it `association-website`
4. Enter that folder
5. Create two subfolders: `events` and `team`

Your folder structure now looks like:
```
association-website/
├── events/
└── team/
```

#### Upload sample images:

1. Open `association-website` → `events` folder
2. Drag and drop some images (or click **Upload**)
3. Repeat for `team` folder

You'll use this later.

---

### 3.4 Update Website Code (Step 4)

**What this does:** Connects your website to Google Sheets API so it can fetch dynamic content.

#### What the developer does:

Your developer will:
1. Take the **Sheet ID** you saved earlier
2. Take the **API Key** from Google Cloud Console
3. Update the website code in the `js/app.js` file (or equivalent) with:
   ```javascript
   const SHEET_ID = 'your-sheet-id-here';
   const API_KEY = 'your-api-key-here';
   ```

4. Update the fetch logic to replace static data with API calls:
   ```javascript
   // Before: Static data
   const events = [{ title: "Event 1", ... }, ...];

   // After: Dynamic from Google Sheets
   const fetchEvents = () => {
     const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/events?key=${API_KEY}`;
     return fetch(url).then(r => r.json());
   };
   ```

5. Commit the changes to GitHub
6. Render will automatically redeploy your website (no manual action needed)

**Result:** Your website now fetches live data from Google Sheets instead of using hardcoded data.

---

### 3.5 Deploy Updated Website (Step 5)

**Your website redeploys automatically.**

#### How it works:

1. Developer pushes code changes to GitHub
2. Render detects the change automatically
3. Website redeploys (usually takes 1-2 minutes)
4. New version is live on your custom domain

**You don't need to do anything.** Render handles this automatically.

**To verify the update worked:**
1. Go to your website
2. Check that data now comes from Google Sheets (not the old static data)
3. Edit something in your Google Sheet
4. Refresh the website after 2-5 minutes
5. You should see the change!

---

### 3.6 Migrate Data from Static to Dynamic (Step 6)

**What this does:** Moves your hardcoded website data into Google Sheets.

#### Before Integration:
Your website has data hardcoded in the code:
```javascript
const events = [
  { title: "Event 1", date: "2025-01-15", ... },
  { title: "Event 2", date: "2025-02-20", ... }
];
```

#### After Integration:
Data lives in Google Sheets, website fetches it automatically.

#### Migration Steps:

1. **Extract current data from website code**
   - Developer copies all existing events, team members, compliance items
   - This becomes the initial data for your Google Sheet

2. **Add data to Google Sheet**
   - You (or your team) enter the extracted data into the Google Sheet
   - Use the three tabs: `events`, `teams`, `compliance`
   - See Section 5 for format

3. **Add Cloudinary images**
   - Upload current images to Cloudinary
   - Update image URLs in Google Sheet
   - Remove image references from website code

4. **Test everything**
   - Website should display the same data (now from Google Sheets)
   - Edit something in Google Sheet
   - Verify change appears on website within 5 minutes

5. **Remove hardcoded data from code**
   - Developer deletes the static data from website code
   - Commit and push to GitHub
   - Render redeploys automatically

**Result:** Your website now uses Google Sheets as the single source of truth. No more code changes for content updates.

---

### 3.7 Common Integration Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Website still shows old data | Code hasn't been redeployed | Wait for Render to finish deploying (1-2 min) |
| Data shows "undefined" or blank | Google Sheet tab name doesn't match API call | Verify tab names are exactly: `events`, `teams`, `compliance` |
| API returns 403 Forbidden | API key not restricted to domain | Add your custom domain to API restrictions |
| API returns 404 | Sheet ID is wrong | Copy Sheet ID from URL again, verify it's correct |
| Website shows "Loading..." forever | API key not enabled | Check Google Sheets API is enabled in Cloud Console |

**If you see any of these, contact your developer with:**
- Screenshot of the error
- What you were doing when it happened
- Browser console error message (press F12 → Console)

---

## 4. Access Control & Team Roles

### 4.1 Who Should Have What Access?

| Person/Role | Google Sheets | Cloudinary | GitHub | Render |
|-------------|---------------|-----------|--------|--------|
| **Content Editor** (updates events/team) | **Editor** ✅ | **Contributor** ✅ | ❌ | ❌ |
| **Compliance Manager** | **Editor** ✅ | ❌ | ❌ | ❌ |
| **Developer** | **Viewer** only | **Owner** | **Owner** | **Owner** |
| **Executive** (oversight) | **Viewer** only | ❌ | ❌ | ❌ |

### 4.2 Why These Permissions?

- **Editors can edit** — They need to update content
- **Viewers can only read** — They see what's published but can't accidentally delete
- **Developers have full access** — They maintain the code and infrastructure

### 4.3 How to Grant Access

#### Google Sheets:

1. Open the sheet
2. Click **Share** (top right)
3. Enter their email address
4. Select **Editor** or **Viewer**
5. Click **Share**

#### Cloudinary:

1. Go to your account
2. Click **Settings** → **Team**
3. Click **Invite** (or **Add Members**)
4. Enter their email
5. Select role: **Contributor** (can upload images)

#### GitHub (for developers only):

1. Go to repository
2. Click **Settings** → **Collaborators**
3. Add their GitHub username
4. Select **Write** or **Maintain** access

#### Render (for developers only):

1. Go to [Render Dashboard](https://render.com/dashboard)
2. Select your static site
3. Go to **Settings** → **Team**
4. Add team member
5. Give appropriate access level

### 4.4 Security Best Practices

✅ **DO:**
- Give people the **minimum access** they need
- Share credentials securely (never in email)
- Use unique passwords for each service
- Document who has access (see Appendix A)
- Review access quarterly

❌ **DON'T:**
- Share passwords
- Give everyone admin access
- Use the same password everywhere
- Leave old access active when someone leaves

---

## 4.5 How Render Deployment Works

**Your website on Render deploys automatically whenever code changes.**

### The Deployment Flow:

1. **Developer makes code changes** (adds Google Sheets API integration)
2. **Developer commits and pushes to GitHub**
3. **Render detects the change** (automatically watches your GitHub repo)
4. **Render rebuilds and redeploys** (usually takes 1-2 minutes)
5. **New version is live** on your custom domain

### You'll See This in Render Dashboard:

1. Go to [Render Dashboard](https://render.com/dashboard)
2. Select your static site
3. You'll see deployment history:
   - **In Progress** — Website is rebuilding
   - **Live** — New version is active
   - **Failed** — Something went wrong (developer needs to fix)

### During Deployment:

- Your website stays online (old version serves while new one builds)
- No downtime for visitors
- Usually takes 1-2 minutes
- You can check progress in Render dashboard

### If Deployment Fails:

- Old version stays live (safe fallback)
- Render sends error notification to developer
- Developer fixes the issue and pushes again
- Render redeploys automatically

**Bottom line:** You never need to manually deploy. It's all automatic!

---

## 5. Daily Operations

### 5.1 Adding a New Event

**Time: 2-3 minutes**

#### Step 1: Upload Event Photo to Cloudinary

1. Go to [Cloudinary.com](https://cloudinary.com)
2. Log in
3. Go to **Media Library** → **association-website** → **events**
4. Drag and drop your event photo
5. Click the uploaded image
6. Click **Copy URL** (icon at bottom right)
7. Paste the URL somewhere safe (you'll need it in 30 seconds)

#### Step 2: Add Event to Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Open your `Association Website Content` sheet
3. Go to the **events** tab
4. Click the first empty row at the bottom
5. Fill in:
   - **title:** Event name (e.g., "Spring Gala 2025")
   - **date:** Date (e.g., "2025-05-20") — use YYYY-MM-DD format
   - **description:** What happens (e.g., "Evening social with dinner and dancing")
   - **image:** Paste the Cloudinary URL you copied

6. Press **Enter**
7. **Done!** Changes appear on website within 2-5 minutes

#### Example:

| title | date | description | image |
|-------|------|-------------|-------|
| Spring Gala 2025 | 2025-05-20 | Evening social with dinner | https://res.cloudinary.com/... |

---

### 5.2 Adding a New Team Member

**Time: 2-3 minutes**

#### Step 1: Upload Photo

1. Go to Cloudinary
2. Navigate to **association-website** → **team**
3. Upload the person's photo
4. Copy the URL

#### Step 2: Update Google Sheet

1. Go to **teams** tab in Google Sheet
2. Add a new row:
   - **name:** Full name
   - **role:** Their position (e.g., "Vice President")
   - **department:** Which area (e.g., "Executive")
   - **image:** Paste Cloudinary URL

3. Press **Enter**
4. **Done!** Updates appear within minutes

---

### 5.3 Adding Compliance Items

**Time: 1 minute per item**

1. Open Google Sheet
2. Go to **compliance** tab
3. Add a new row:
   - **item:** What needs to be done (e.g., "File annual tax return")
   - **date:** When it's due (e.g., "2025-06-30")
   - **status:** Current status (Pending, In Progress, Completed)
   - **notes:** Any relevant details

**That's it.** Appears on website instantly.

---

### 5.4 Editing Existing Content

| To Change | Where | How |
|-----------|-------|-----|
| Event/team text | Google Sheet | Click the cell and edit |
| Event/team photo | Cloudinary + Sheet | Upload new image to Cloudinary, copy new URL, paste in sheet |
| Remove an entry | Google Sheet | Right-click row → Delete row |
| Reorder entries | Google Sheet | Click and drag rows to rearrange |

---

### 5.5 Quick Reference Card

**Print this and keep it handy:**

```
ADDING NEW CONTENT:
1. Upload image to Cloudinary (if needed)
2. Copy the image URL
3. Open Google Sheet
4. Add row with text + paste image URL
5. Press Enter
6. Check website in 5 minutes

UPDATING CONTENT:
1. Find the row in Google Sheet
2. Edit the cell
3. Changes appear in 2-5 minutes

UPLOADING IMAGES:
1. Go to Cloudinary.com
2. Log in
3. Navigate to right folder (events or team)
4. Drag and drop image
5. Copy URL when done
```

---

## 6. Image Optimization Guide

### 6.1 Why Image Size Matters

Larger images = slower website = more bandwidth costs (even free tiers have limits).

**Your free Cloudinary tier:** 2 GB storage, 20 GB bandwidth/month

With optimized images:
- ✅ Faster website
- ✅ Better for mobile users
- ✅ More images fit in your storage

### 6.2 Image Format: WebP is Best

**WebP format** is 25-35% smaller than JPEG with same quality.

| Format | File Size (example) | When to Use |
|--------|-------------------|------------|
| JPEG | 200 KB | Acceptable but not ideal |
| **WebP** | **130-150 KB** | **Recommended** ✅ |
| PNG | 400 KB+ | Only for transparent images |

### 6.3 How to Convert to WebP

#### Option 1: Online Converter (Easiest)

1. Go to [Squoosh.app](https://squoosh.app)
2. Drag and drop your image
3. On the right, change format to **WebP**
4. Download the compressed image

#### Option 2: Online Converter (Alternative)

1. Go to [TinyPNG.com](https://tinypng.com)
2. Drag and drop image
3. Download compressed version
4. Then convert to WebP using Squoosh

#### Option 3: On Your Computer (Mac)

Use Preview app:
1. Open image with Preview
2. **File** → **Export**
3. Format: **HEIC** or use Squoosh for WebP

#### Option 4: On Your Computer (Windows)

Use Paint.NET or similar:
1. Open image
2. **File** → **Export As**
3. Choose **WebP** format

### 6.4 Image Size Targets

Before uploading to Cloudinary:

| Image Type | Target Size | Maximum |
|----------|------------|---------|
| Team member photos | 100-150 KB | 200 KB |
| Event photos | 150-250 KB | 300 KB |
| Logos/graphics | 50-100 KB | 150 KB |

**Rule of thumb:** If image looks good at 150 KB, you're good.

### 6.5 Before & After Checklist

Before uploading:
- [ ] Image format is WebP (or JPEG if WebP not available)
- [ ] File size is under target (use file properties to check)
- [ ] Image quality looks good
- [ ] Image dimensions are reasonable (max 2000 px wide)

---

## 7. Data Backup & Recovery

### 7.1 Backup Strategy

**Google Sheets automatically keeps backups** through version history, but you should also:

| Backup Type | Frequency | How | Time Required |
|-------------|-----------|-----|----------------|
| **Version history** | Automatic | Google Sheets saves every change | None (automatic) |
| **Download backup** | Monthly | Download as Excel file | 5 minutes |
| **Cloudinary image backup** | Quarterly | Verify important images still exist | 10 minutes |

### 7.2 Download Monthly Backup

**Why:** In case something goes wrong, you have a copy.

1. Open your Google Sheet
2. Click **File** → **Download** → **Microsoft Excel (.xlsx)**
3. Save the file to your computer with today's date:
   ```
   Association Website - 2025-01-15.xlsx
   ```
4. Store in a safe folder (OneDrive, Google Drive, etc.)

**Do this once a month** (first Friday of the month is good).

### 7.3 Google Sheets Version History

**If you accidentally delete or change something:**

1. Open the sheet
2. Click **File** → **Version history** → **See version history**
3. A timeline appears on the right
4. Click any previous version to see it
5. Click **Restore this version** if needed

**Version history goes back 30 days** for most accounts (100 days for G Suite).

### 7.4 Accidental Deletion Recovery

**Someone deleted a row?**

1. Open **Version history** (see above)
2. Click a time before the deletion happened
3. Look at the data in that version
4. Click **Restore this version**
5. **Or** manually copy the data from the old version and add it back

**Note:** Restoring a version replaces the ENTIRE sheet, so do this carefully.

### 7.5 Cloudinary Image Backup

**Images are stored in Cloudinary, but what if the service goes down?**

Quarterly backup process:
1. Download important images from Cloudinary dashboard
2. Store them on your computer or Google Drive
3. Take note: If images ever stop loading, you can re-upload them

This is low priority (Cloudinary is very reliable) but good practice.

### 7.6 What NOT to Do

❌ **Don't rely only on Cloudinary links** in Google Sheet (if Cloudinary deleted images, links break)
❌ **Don't wait 6 months to backup** (too much data to recover)
❌ **Don't give backup files to everyone** (security risk)
✅ **Do keep backups in a safe, organized location** (Google Drive is fine)

---

## 8. Risk Mitigation & Contingencies

### 8.1 Risk Assessment

**For this setup with public content:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Data accidentally deleted | Low | Medium | Version history + monthly backup |
| Cloudinary image disappears | Very low | Medium | Monthly image verification |
| Google Sheets API quota exceeded | Very low | High | Daily quota set to 10,000 (safe limit) |
| Cloudinary storage full | Low | Medium | Use WebP format, delete old images |
| Typo/mistake in content | High | Low | Review before publishing |
| Website down | Very low | High | Render/Netlify monitoring (automatic) |
| Image URL broken | Low | Low | Placeholder image shows instead |
| Someone updates wrong data | Low | Medium | Restrict editor access to trusted people |

### 8.2 Contingency Plans

#### If Google Sheets API Fails

**What happens:** Website shows "Loading..." and doesn't update.

**Fallback Plan:**
1. Website automatically switches to CSV method (slower but works)
2. Changes appear within 5-10 minutes instead of 2-5 minutes
3. No action needed — automatic failover

#### If Cloudinary Images Don't Load

**What happens:** Images show as broken, site still functions.

**What to do:**
1. Check Cloudinary is still online (go to cloudinary.com)
2. Verify image URLs in Google Sheet are correct (no typos)
3. If image was deleted, re-upload from your backup
4. Update the URL in Google Sheet

**Fallback:** Website can use GitHub backup images temporarily (developer configures this).

#### If Website Goes Down

**What happens:** Visitors get error page.

**Who handles:** Render/Netlify automatically detects and notifies. Your developer handles recovery.

**What you do:** Contact your developer, let them investigate.

#### If Cloudinary Storage is Full (2 GB Exceeded)

**What happens:** Can't upload new images.

**Solutions:**
1. Delete old images you don't need anymore
2. Check Cloudinary dashboard for usage
3. Convert remaining images to WebP to save space
4. Upgrade to paid plan ($4-12/month) if needed

#### If Team Member Leaves and Still Has Access

**What to do (immediately):**
1. Go to Google Sheets → **Share** button
2. Find their name
3. Click remove (trash icon)
4. Go to Cloudinary → **Settings** → **Team**
5. Remove them

**Prevents:** Unauthorized changes to content.

### 8.3 What's NOT a Concern

✅ **Public data visibility** — Everything is meant to be public anyway
✅ **Google knowing your data** — They don't care about association event dates
✅ **API key exposed** — Restricted to your domain, can't be abused
✅ **Server attacks** — Render/Netlify handles security
✅ **Data loss from malice** — Version history protects against this

---

## 9. Troubleshooting

### 9.1 Website Shows "Loading..." (Data Won't Appear)

**Symptoms:** Page loads but events/team members don't show.

**Solutions (try in order):**

1. **Wait 2-5 minutes** — Google might be caching
2. **Hard refresh:** Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. **Check your Sheet:**
   - Is it still shared? (**Share** button → "Anyone with link")
   - Column headers exactly correct? (lowercase, no spaces: `title`, `date`, `description`, `image`)
   - Is there data in the sheet? (not just headers)
4. **Check browser console:**
   - Press `F12` (opens Developer Tools)
   - Click **Console** tab
   - Look for red error messages
   - Screenshot and send to developer
5. **Try incognito mode:**
   - Press `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - Visit your website
   - Does it work? If yes, clear your browser cache

**Still broken?** Contact your developer with the error message from step 4.

---

### 9.2 Images Not Displaying

**Symptoms:** Broken image icon or blank space where photo should be.

**Solutions (try in order):**

1. **Check the image in Cloudinary:**
   - Go to Cloudinary dashboard
   - Find the image
   - Does it still exist? (might be deleted)
   - If deleted, re-upload and get new URL

2. **Check the URL in Google Sheet:**
   - Open your sheet
   - Find the row with missing image
   - Is the image URL complete? (should start with `https://res.cloudinary.com`)
   - Are there extra spaces in the cell? (copy and paste, watch for spaces)

3. **Test the URL directly:**
   - Copy the image URL from Google Sheet
   - Paste it in a new browser tab
   - Does the image load?
   - If not, URL is broken — get a new one from Cloudinary

4. **Image file corrupted:**
   - Try uploading a different image
   - If new image works, original file was corrupted
   - Re-download and re-upload original

**Still not working?** Check that:
- Cloudinary folder path is correct (`association-website/events/` or `association-website/team/`)
- Image file format is supported (JPEG, PNG, WebP, GIF)
- Image file size under 10 MB

---

### 9.3 Data Not Updating on Website

**Symptoms:** You edited Google Sheet 10 minutes ago, website still shows old data.

**Solutions:**

1. **Wait longer** — Sometimes takes 5 minutes, occasionally up to 10
2. **Hard refresh browser:** `Ctrl+Shift+R` or `Cmd+Shift+R`
3. **Check your changes were saved:**
   - Go back to Google Sheet
   - Find the row you edited
   - Is your change there?
   - If not, save your changes again
4. **Check API quota isn't exceeded:**
   - Go to Google Cloud Console
   - Click your project
   - Go to **APIs & Services** → **Quotas**
   - Look for "Sheets API"
   - Is usage under 10,000 today? (should be)
5. **Try a different browser:** Chrome, Firefox, Safari
6. **Log out and log back in** (clears caches)

**If after 15 minutes it still doesn't show:**
- Restart your computer
- Try again
- Contact developer if persists

---

### 9.4 Cloudinary Shows "Limit Exceeded"

**Symptoms:** Can't upload new images to Cloudinary, error says limit exceeded.

**Why:** You've hit free tier storage or bandwidth limit (2 GB storage OR 20 GB bandwidth/month).

**Solutions:**

1. **Check what's full:**
   - Go to Cloudinary dashboard
   - Click **Usage** or **Media Library**
   - How much storage used?
   - How much bandwidth used?

2. **Delete old images you don't need:**
   - Go to **Media Library**
   - Find old/unused images
   - Right-click → Delete
   - Check Google Sheet — no rows should have that URL

3. **Convert to WebP to save space:**
   - See Section 6: Image Optimization Guide
   - Re-upload optimized versions

4. **Wait until next month:**
   - Storage resets monthly
   - Check Cloudinary dashboard for reset date

5. **Upgrade to paid** (if needed):
   - Cloudinary paid starts at $4/month
   - Gets you 200 GB storage, 1 TB bandwidth
   - But usually not needed for association sites

---

### 9.5 CORS Error (Technical)

**Symptoms:** Browser console shows error with "CORS" or "Access-Control-Allow-Origin".

**What it means:** Browser blocked the request for security reasons.

**This is normal and expected.** It means the fallback method (Plan B) is working. Data will still load, just 2-3 seconds slower.

**No action needed.** Website works fine. This is a technical detail, not an error.

---

### 9.6 "API Key Not Valid" or "403 Forbidden"

**Symptoms:** Console shows error mentioning API key or permission denied.

**Solutions:**

1. **Check API key in code:**
   - Ask developer to verify API key is correct
   - Check it matches what you saved earlier
   - No typos?

2. **Check API key is restricted properly:**
   - Go to Google Cloud Console
   - Go to **Credentials**
   - Click your API key
   - Under "HTTP referrers," is your website domain listed?
   - Examples: `yoursite.netlify.app/*`, `yourdomain.com/*`
   - Add if missing

3. **Check Google Sheets API is enabled:**
   - Go to Google Cloud Console
   - Go to **APIs & Services** → **Enabled APIs**
   - Is "Google Sheets API" listed?
   - If not, go to **Library** and enable it

4. **Check daily quota:**
   - Go to **Quotas** page
   - Is Sheets API usage under 10,000 for today?
   - Reset tomorrow automatically

---

### 9.7 Common Mistakes & Fixes

| Mistake | Problem | Fix |
|---------|---------|-----|
| Column header spelled wrong (`Title` instead of `title`) | Data not displaying | Correct spelling to lowercase |
| Extra spaces in image URL cell | Images don't load | Copy/paste URL carefully, no spaces |
| Sharing set to "Editor" instead of "Viewer" | Too many people can edit | Go to **Share** → change to **Viewer** |
| API key not restricted to your domain | Security risk (though low) | Add domain to restrictions in Google Cloud |
| Image URL pasted without `https://` | Images don't load | Make sure URL starts with `https://` |
| Deleting Google Sheet by accident | Data gone | Restore from **Version history** → earlier version |
| Editing header row | Breaks website display | Undo the change (use version history) |

---

## 10. Emergency Procedures

### 10.1 Website Down (What to Do)

1. **Check if it's really down:**
   - Try a different browser
   - Try on your phone
   - Ask a colleague to check from their computer

2. **Check service status:**
   - Go to [Netlify Status](https://status.netlify.com) or [Render Status](https://status.render.com)
   - Any reported outages?

3. **If website is down and services are up:**
   - Contact your developer
   - Provide:
     - Time it went down
     - What were you doing? (editing sheet, uploaded image?)
     - Screenshot of error message (if any)

4. **What to do while waiting:**
   - Don't keep refreshing (won't help)
   - Developer likely already got alert
   - Usually fixed within 30 minutes

### 10.2 Lost Access to Google Sheets

1. **If you forgot your Google password:**
   - Go to [Google Account Recovery](https://accounts.google.com/signin/recovery)
   - Follow password reset

2. **If you're locked out of your Google account:**
   - Contact Google Support
   - They'll verify your identity and unlock

3. **If someone removed you from the Sheet:**
   - Ask the other editor to re-add you
   - Or ask developer to add you back

### 10.3 Lost Access to Cloudinary

1. **If you forgot your Cloudinary password:**
   - Go to Cloudinary login page
   - Click **Forgot password**
   - Reset via email

2. **If locked out:**
   - Contact Cloudinary support at support@cloudinary.com

### 10.4 Someone Accidentally Deleted Important Content

1. **Immediate action:**
   - Don't panic — data is recoverable
   - Go to Google Sheet
   - Click **File** → **Version history** → **See version history**
   - Find a version from before deletion
   - Click **Restore this version**

2. **If you restored the whole sheet:**
   - All recent changes since that point are lost
   - You may need to re-add stuff you did after restoration point
   - Consider time — is it worth restoring or just re-entering?

3. **If you only need one row back:**
   - Look at version history
   - Manually copy the row from old version
   - Paste into current sheet
   - Manually re-add any newer rows

### 10.5 Major Data Loss (Multiple Rows Deleted)

1. **First:** Take a deep breath. Data is likely recoverable.

2. **Check version history:**
   - **File** → **Version history** → **See version history**
   - Is there a version where data was intact?
   - When was it last good?

3. **Restore that version:**
   - Click the version
   - Review what it looks like (sanity check)
   - Click **Restore this version**

4. **Check monthly backup:**
   - You downloaded the Excel file, right?
   - Open that file
   - Compare it to restored sheet
   - Manually add back anything newer than the backup

5. **If completely lost:**
   - Check if developer has a backup
   - Check if exported data is in email/archives
   - Worst case: re-enter data from records

**Prevention:** This is why we do monthly backups (Section 7.2).

### 10.6 Emergency Contacts

**Create this list and share with team:**

| Issue | Contact | Phone/Email | Available |
|-------|---------|-------------|-----------|
| Website down | [Developer name] | [Phone] | [Hours] |
| Can't edit Google Sheet | [Admin name] | [Phone] | [Hours] |
| Image upload not working | [Admin name] | [Phone] | [Hours] |
| Data loss/recovery | [Developer name] | [Phone] | [Hours] |
| Urgent security issue | [Developer name] | [Phone] | [Hours] |

**Print and post this somewhere accessible.**

---

## 11. Appendices

### Appendix A: Access Control Template

**Fill this out and keep it somewhere secure:**

| Service | Account Email | Account Owner | Who Has Access | Access Level |
|---------|--------------|--------------|----------------|--------------|
| Google Sheets | | | | |
| Google Cloud Console | | | | |
| Cloudinary | | | | |
| GitHub | | | | |
| Render | | | | |

**Example:**
| Google Sheets | john@email.com | John Doe | Jane (jane@email.com), Bob (bob@email.com) | Editor |

### Appendix B: Account Credentials Storage

**How to store credentials securely:**

❌ **DON'T:**
- Store in plain text file on desktop
- Email passwords to people
- Use same password everywhere
- Write passwords on sticky notes

✅ **DO:**
- Use a password manager (Bitwarden, 1Password, LastPass)
- Store in encrypted Google Drive folder (shared with team)
- Use unique passwords for each service
- Only share credentials with people who need them
- Change passwords annually

**Option: Google Drive Folder**
1. Create a folder "Association Website - Credentials" in Google Drive
2. Create a Google Doc with account info:
   ```
   Google Sheets: john@email.com / [password] / https://sheets.google.com/...
   Cloudinary: john@email.com / [password] / cloud-name: mycloud
   GitHub: johnsmith / [password] / https://github.com/association-site
   Render: john@email.com / [password] / site: your-site-name.onrender.com
   Google Cloud: john@email.com / [password] / API Key: xxx...
   ```
3. Share folder with "Editor" access only with authorized people
4. Make note: Passwords should be generated strongly (use browser password manager)

### Appendix C: Monthly Maintenance Checklist

**Do this once a month (same day each month):**

- [ ] Download Google Sheets backup (Excel file)
- [ ] Review Cloudinary usage (dashboard)
- [ ] Check website loads correctly (incognito mode)
- [ ] Verify a few images display properly
- [ ] Check Google Cloud Console for API errors
- [ ] Verify all team members still have correct access
- [ ] Test deploy hook/process

**Time required:** 10-15 minutes

**When:** First Friday of the month (or pick a day)

### Appendix D: Glossary (Non-Technical)

| Term | Simple Explanation |
|------|-------------------|
| **API Key** | A secret password that lets your website read from Google Sheets |
| **Cloudinary** | A website where you upload and store images |
| **Deploy** | Publishing your website so the internet can see it |
| **Domain** | Your website's web address (example.com) |
| **GitHub** | Where the website code is stored as a backup |
| **Google Sheets API** | Official tool Google provides to read spreadsheets |
| **Hosting** | The service that makes your website available 24/7 |
| **JSON** | A format for storing structured data (you don't need to know this) |
| **Render** | Service that hosts (publishes) your website |
| **Static Site** | A website that doesn't have a complex server (yours is this) |
| **URL** | A web address link (like https://example.com) |
| **Version History** | Google's automatic backup showing every change ever made |
| **WebP** | A modern image format that's smaller and faster than JPEG |

### Appendix E: Helpful Links

**Use these links regularly:**

- [Google Sheets](https://sheets.google.com) — Edit your content
- [Cloudinary Dashboard](https://cloudinary.com/console) — Upload images
- [Google Cloud Console](https://console.cloud.google.com) — Manage API key
- [Render Dashboard](https://render.com/dashboard) — Monitor deployments
- [Squoosh.app](https://squoosh.app) — Compress images to WebP

**Bookmark these!**

### Appendix G: Render Deployment Reference

**For your Render static site:**

#### Dashboard

- URL: https://render.com/dashboard
- Check deployment status
- View build logs (if needed)
- Monitor site health

#### Automatic Deployments

Your website automatically redeploys when:
- Code is pushed to your GitHub repository
- Usually takes 1-2 minutes

#### Manual Deploy (if needed)

1. Go to [Render Dashboard](https://render.com/dashboard)
2. Select your static site
3. Click **Manual Deploy**
4. Choose branch (usually `main`)
5. Click **Deploy latest commit**

#### Environment Variables

If your developer uses environment variables:
1. Go to site **Settings**
2. Click **Environment**
3. Variables are stored here (not in code)

#### Custom Domain

Your custom domain is already configured and working.

#### Support

For Render-specific issues: https://render.com/docs

---

### Appendix H: Comparison: Static vs Dynamic Website

**Before (Static Data)**
```
Website Code
├── index.html
├── css/style.css
└── js/app.js
    └── Events hardcoded in array
    └── Team members hardcoded in array
    └── Images hardcoded in array

Update needed? → Edit code → Git commit → Render deploy → Website updates
Time: 10-15 minutes
```

**After (Dynamic from Google Sheets)**
```
Website Code
├── index.html
├── css/style.css
└── js/app.js
    └── Fetches from Google Sheets API
    └── Fetches images from Cloudinary
    └── Displays dynamically

Update needed? → Edit Google Sheet → Done!
Time: 2-5 minutes (automatic)
```

**Key Difference:** No code changes needed for content updates!

### Appendix F: Quick Decision Tree

**When something goes wrong, use this:**

```
WEBSITE NOT LOADING?
├─ Check Netlify/Render status → if down, contact developer
├─ Hard refresh (Ctrl+Shift+R) → usually fixes it
├─ Try different browser → if works, clear cache
└─ Contact developer with screenshot of error

DATA NOT SHOWING?
├─ Wait 5 minutes (might be caching)
├─ Hard refresh browser
├─ Check Google Sheet is shared correctly
├─ Verify column headers are correct (lowercase)
└─ Contact developer if persists 15+ minutes

IMAGE NOT DISPLAYING?
├─ Check image URL in Google Sheet
├─ Try the URL in a new browser tab
├─ If broken, re-upload to Cloudinary and get new URL
├─ Check Cloudinary image still exists
└─ If still broken, contact developer

CAN'T UPLOAD IMAGE?
├─ Check Cloudinary storage is not full (2 GB limit)
├─ Delete old images if needed
├─ Try converting to WebP format to save space
├─ Contact developer if Cloudinary is actually full
└─ Consider upgrading Cloudinary ($4/month) if needed

DATA WAS DELETED?
├─ Open Google Sheet
├─ Click File → Version history → See version history
├─ Find version before deletion
├─ Click "Restore this version"
└─ Verify data is restored correctly
```

---

## Document Summary

**Version:** 3.1 (Updated for Render + Google Sheets API Integration)
**Last Updated:** December 31, 2025
**Audience:** Non-technical team members, administrators, and developers
**Scope:** Google Sheets API integration for dynamic content management
**Website Status:** Live on Render with custom domain
**Next Phase:** Adding Google Sheets + Cloudinary integration

### What's Changed in v3.1

- Updated to reflect website already deployed on Render
- Focused setup on Google Sheets API integration
- Added Render deployment workflow (automatic from GitHub)
- Added migration guide (static to dynamic data)
- Added Render-specific documentation
- Clarified developer vs non-developer tasks
- Added implementation roadmap (3 phases)

---

**This guide is the complete source of truth for how to maintain your association website. Share it with all team members who need it, and update it as your processes change.**

**Questions?**
- Non-technical issues: Contact your team admin
- Technical issues: Contact your developer
- Render deployment issues: Check [Render Dashboard](https://render.com/dashboard)
