# Association Website Implementation Guide

**Complete Technical & Operational Documentation**  
Version 2.0

---

## Table of Contents

1. [Overview](#1-overview)
2. [Google Sheets Setup](#2-google-sheets-setup)
3. [Cloudinary Image Hosting](#3-cloudinary-image-hosting)
4. [Deployment](#4-deployment)
5. [Error Handling & Reliability](#5-error-handling--reliability)
6. [Daily Operations](#6-daily-operations)
7. [Troubleshooting](#7-troubleshooting)
8. [Migration Between Plans](#8-migration-between-plans)
9. [Health Check System](#9-health-check-system)
10. [Go-Live Checklist](#10-go-live-checklist)

---

## 1. Overview

### 1.1 What We're Building

A static website that pulls content from Google Sheets, making it easy for non-technical members to update events and team information. Images are hosted on Cloudinary for easy drag-and-drop management.

### 1.2 Architecture

The system consists of four components working together:

| Component | Purpose |
|-----------|---------|
| **Google Sheets** | Stores all text content (events, team members) |
| **Cloudinary** | Hosts and optimizes all images |
| **GitHub** | Stores website code (HTML, CSS, JavaScript) |
| **Netlify or Render** | Hosts and serves the website |

**Data Flow:**
```
Google Sheets + Cloudinary Images → Website Code (GitHub) → Hosting Platform → Visitors
```

### 1.3 Primary & Fallback Strategy

| Layer | Plan A (Primary) | Plan B (Fallback) |
|-------|------------------|-------------------|
| **Data** | Google Sheets API | CSV Publish to Web |
| **Images** | Cloudinary | GitHub Repository |
| **Hosting** | Netlify or Render | Either works |

### 1.4 Cost Summary

| Service | Free Limit | Typical Usage | Long-term Viability |
|---------|------------|---------------|---------------------|
| Netlify/Render | 100 GB bandwidth/month | ~50,000 visits | ✅ Excellent |
| Google Sheets | Unlimited | No issues | ✅ Excellent |
| Cloudinary | 25 credits/month | ~10 GB storage | ✅ Excellent |
| GitHub | Unlimited repos | Code + backup images | ✅ Excellent |

**Total Monthly Cost: $0**

---

## 2. Google Sheets Setup

### 2.1 Understanding the Data Flow

Google Sheets stores your content, but websites cannot read spreadsheets directly. We need a **bridge** — a way for the website's code to request and receive that spreadsheet data.

There are two methods to achieve this, and we recommend having both ready.

### 2.2 Plan A: Google Sheets API (Recommended)

**What it is:** The official Google API that returns structured JSON data. Requires a free API key from Google Cloud Console.

**Why it's better:**
- Official and reliable — Google maintains it
- Returns clean, structured JSON data
- Better error handling capabilities
- No CORS (cross-origin) issues

#### Setup Steps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (name it something like "Association Website")
3. Navigate to **APIs & Services** → **Library**
4. Search for and enable **Google Sheets API**
5. Go to **APIs & Services** → **Credentials**
6. Click **Create Credentials** → **API Key**
7. Restrict the key (see Security section below)

#### API URL Pattern

```
https://sheets.googleapis.com/v4/spreadsheets/[SHEET_ID]/values/[TAB_NAME]?key=[API_KEY]
```

#### API Key Security (Critical!)

Since this is a client-side application, your API key will be visible in the browser. You **must** restrict it to prevent abuse.

**In Google Cloud Console:**

1. Go to **APIs & Services** → **Credentials**
2. Click your API key → **Edit API key**
3. Under **Application restrictions**:
   - Select **HTTP referrers (websites)**
   - Add your domains:
     - `yoursite.netlify.app/*`
     - `www.yourdomain.com/*`
     - `yourdomain.com/*`
4. Under **API restrictions**:
   - Select **Restrict key**
   - Choose only **Google Sheets API**
5. Set a daily quota limit (e.g., 10,000 requests)
6. Click **Save**

### 2.3 Plan B: Publish to Web (Fallback)

**What it is:** Google Sheets can publish your data as a web-accessible CSV file. Your website fetches this URL and parses the data.

**Limitations:**
- Data may cache for up to 5 minutes before updates appear
- Can occasionally face CORS issues in some browsers
- Less reliable — format could change without notice

#### Setup Steps

1. Open your Google Sheet
2. Go to **File** → **Share** → **Publish to web**
3. Select the specific tab (e.g., "events")
4. Choose format: **Comma-separated values (.csv)**
5. Click **Publish**
6. Copy the generated URL

#### CSV URL Pattern

```
https://docs.google.com/spreadsheets/d/e/[LONG_ID]/pub?gid=0&single=true&output=csv
```

### 2.4 Create the Spreadsheet

Create a Google Sheet with **two tabs**:

#### Tab 1: `events`

| title | date | description | image |
|-------|------|-------------|-------|
| Annual Meet 2025 | 2025-03-15 | Our yearly gathering | [Cloudinary URL] |
| Workshop Series | 2025-04-10 | Monthly skill building | [Cloudinary URL] |

#### Tab 2: `teams`

| name | role | department | image |
|------|------|------------|-------|
| John Doe | President | Executive | [Cloudinary URL] |
| Jane Smith | Secretary | Executive | [Cloudinary URL] |

#### Important Configuration

- **Column headers must be exactly as shown** (lowercase, no spaces)
- **Lock the header row:** Select row 1 → View → Freeze → 1 row
- **Set sharing:** Click Share → Anyone with the link → Viewer
- **Copy the Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/[THIS_IS_YOUR_SHEET_ID]/edit`

### 2.5 Protecting Your Sheet

To prevent accidental changes to structure:

1. **Protect header row:**
   - Right-click row 1 → Protect range
   - Set permissions to only allow specific editors

2. **Add data validation for dates:**
   - Select the date column
   - Data → Data validation → Date

3. **Use dropdown for departments:**
   - Select department column
   - Data → Data validation → List of items
   - Enter: Executive, Operations, Marketing, etc.

---

## 3. Cloudinary Image Hosting

### 3.1 What is Cloudinary?

Cloudinary is a cloud service that stores, optimizes, and delivers images. Instead of uploading images to GitHub (which requires technical knowledge), you upload them to Cloudinary using simple drag-and-drop, then paste the URL into your Google Sheet.

#### Cloudinary vs GitHub for Images

| Aspect | GitHub | Cloudinary |
|--------|--------|------------|
| Upload method | Requires Git knowledge | Drag-and-drop |
| Compression | Manual (you do it) | Automatic |
| CDN | Not included | Global CDN included |
| URL handling | Filename must match exactly | Just copy/paste URL |
| Non-technical friendly | ❌ No | ✅ Yes |

### 3.2 Free Tier Limits

Cloudinary's free plan is **not time-limited**. You can use it indefinitely as long as you stay within the usage limits.

| Resource | Free Allowance | What It Means |
|----------|----------------|---------------|
| Credits | 25 per month | Flexible usage units |
| Storage | 10 GB | ~2,000 high-quality photos |
| Bandwidth | 20 GB per month | ~10,000+ page views |
| Transformations | 20,000 per month | Auto resize/optimize operations |
| Max Image Size | 10 MB per file | More than enough for web |
| Max Video Size | 100 MB per file | Short clips only |
| Total Assets | 300,000 | Practically unlimited |

#### How Credits Work

**1 credit = 1,000 transformations OR 1 GB storage OR 1 GB bandwidth**

You can flexibly use credits across these three areas based on your needs. For a typical association website:
- You'll use mostly storage (uploading images)
- Some bandwidth (visitors viewing images)
- Minimal transformations (auto-optimization)

**25 credits is more than enough for most association websites.**

### 3.3 Setup Steps

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (no credit card required)
2. Note your **Cloud Name** from the dashboard
3. Go to **Media Library**
4. Create folder structure:
   - Click **Create Folder** → name it `association-site`
   - Inside that, create `events` and `team` folders
5. Upload images:
   - Navigate to the appropriate folder
   - Drag and drop images
6. Get image URL:
   - Click on uploaded image
   - Click **Copy URL** (or right-click → Copy link address)
7. Paste the full URL into your Google Sheet's image column

### 3.4 Recommended Folder Structure

```
your-cloud-name/
└── association-site/
    ├── events/
    │   ├── annual-meet-2025.jpg
    │   ├── workshop-march.jpg
    │   └── conference-2025.jpg
    └── team/
        ├── john-doe.jpg
        ├── jane-smith.jpg
        └── placeholder.jpg
```

### 3.5 Auto-Optimization URLs (Bonus)

Cloudinary can resize and optimize images automatically by modifying the URL. This means you upload ONE high-resolution image and Cloudinary serves optimized versions.

| Need | Add to URL |
|------|------------|
| Resize to 400px wide | `.../upload/w_400/image.jpg` |
| Auto format & quality | `.../upload/f_auto,q_auto/image.jpg` |
| Crop to square (300x300) | `.../upload/w_300,h_300,c_fill/image.jpg` |
| All optimizations | `.../upload/w_400,f_auto,q_auto/image.jpg` |

#### Example

Original URL:
```
https://res.cloudinary.com/yourcloud/image/upload/v123456/association-site/team/john-doe.jpg
```

Optimized URL (400px, auto format/quality):
```
https://res.cloudinary.com/yourcloud/image/upload/w_400,f_auto,q_auto/v123456/association-site/team/john-doe.jpg
```

### 3.6 Plan B: GitHub for Images

If Cloudinary is ever unavailable or you exceed limits, images can be stored in GitHub as a fallback.

**Setup:**
- Store in `/images/events/` and `/images/team/` folders
- Use lowercase filenames with hyphens: `annual-meet-2025.jpg`
- Compress images before uploading (use [tinypng.com](https://tinypng.com) or [squoosh.app](https://squoosh.app))
- Target size: under 200KB per image

**⚠️ Note:** This requires someone with GitHub access to upload images.

---

## 4. Deployment

### 4.1 Repository Structure

```
your-repo/
├── index.html              # Main website
├── css/
│   └── style.css           # Styles
├── js/
│   └── app.js              # Fetches & displays data
├── images/                 # Backup images (Plan B)
│   ├── events/
│   └── team/
└── README.md               # Documentation
```

### 4.2 Option A: Netlify

#### Initial Setup

1. Go to [netlify.com](https://netlify.com) and sign up with GitHub
2. Click **Add new site** → **Import an existing project**
3. Select your GitHub repository
4. Configure:
   - Build command: *(leave blank — static site)*
   - Publish directory: `.` or `/`
5. Click **Deploy**

#### Create Deploy Hook (for manual refresh)

1. Go to **Site settings** → **Build & deploy** → **Build hooks**
2. Click **Add build hook**
3. Name it `sheets-update`
4. Copy the URL
5. Save as a browser bookmark for easy access

#### Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **Add custom domain**
3. Follow DNS configuration instructions

### 4.3 Option B: Render

#### Initial Setup

1. Go to [render.com](https://render.com) and sign up with GitHub
2. Click **New** → **Static Site**
3. Connect your GitHub repository
4. Configure:
   - Name: your-site-name
   - Publish directory: `.` or `public`
5. Click **Create Static Site**

#### Create Deploy Hook

1. Go to your site's **Settings**
2. Scroll to **Deploy Hook** section
3. Copy the URL
4. Save as a browser bookmark

### 4.4 Platform Comparison

| Feature | Netlify (Free) | Render (Free) |
|---------|----------------|---------------|
| Bandwidth | 100 GB/month | 100 GB/month |
| Build Minutes | 300/month | 500/month |
| Deploy Hooks | ✅ Yes | ✅ Yes |
| Auto-deploy from Git | ✅ Yes | ✅ Yes |
| Custom Domain | ✅ Yes | ✅ Yes |
| SSL Certificate | ✅ Free | ✅ Free |

**Verdict:** Both work equally well. Choose based on team familiarity.

---

## 5. Error Handling & Reliability

### 5.1 Required Error Handling

The website code **must** handle these failure scenarios gracefully:

| Scenario | User Should See | Implementation |
|----------|-----------------|----------------|
| Sheet data fails to load | "Loading..." or cached data | Try/catch with fallback |
| Image URL broken | Placeholder image | `onerror` handler on `<img>` |
| Slow connection | Loading spinner | Loading state in UI |
| Required column missing | Graceful degradation | Validate structure first |
| API quota exceeded | Switch to Plan B | Fallback fetch logic |

### 5.2 Data Validation Requirements

Before displaying data, the website should validate:

- ✅ Required columns exist (title, date, name, etc.)
- ✅ Data array is not empty
- ✅ Date formats are valid
- ✅ Image URLs are properly formatted (if provided)

### 5.3 Client-Side vs Build-Time Fetching

For this architecture, we use **client-side fetching**, which means:

| Aspect | How It Works |
|--------|--------------|
| When data loads | Every time a visitor loads the page |
| Update visibility | Changes appear immediately (no deploy needed) |
| Initial load speed | Slightly slower (fetching data) |
| SEO | Less optimal (content not in HTML) |
| Best for | Low-to-medium traffic sites |

**Why client-side for this project:**
- Simpler setup
- Instant updates without redeploying
- No build process needed
- Good enough for association website traffic levels

### 5.4 Caching Considerations

For improved performance, consider:

| Strategy | Benefit | Complexity |
|----------|---------|------------|
| Browser caching headers | Reduces repeated fetches | Low |
| LocalStorage cache | Shows last data while refreshing | Medium |
| Service worker | Offline capability | High |

**Recommendation:** Basic browser caching is sufficient for most association sites.

---

## 6. Daily Operations

### 6.1 Adding a New Event

**Step 1: Upload photo to Cloudinary**
1. Go to Cloudinary dashboard
2. Navigate to `association-site/events/` folder
3. Drag and drop the image
4. Click on uploaded image → Copy URL

**Step 2: Update Google Sheet**
1. Open Google Sheet
2. Go to `events` tab
3. Add a new row with event details
4. Paste Cloudinary URL in the `image` column

**Step 3: Done!**
- Changes appear on the website within minutes
- No deployment needed

### 6.2 Adding a New Team Member

**Step 1: Upload photo to Cloudinary**
1. Go to Cloudinary dashboard
2. Navigate to `association-site/team/` folder
3. Upload the photo (ideally square or will be cropped)
4. Copy the URL

**Step 2: Update Google Sheet**
1. Open Google Sheet
2. Go to `teams` tab
3. Add new row with member details
4. Paste image URL

**Step 3: Done!**

### 6.3 Updating Existing Content

| To Change | Where | Action |
|-----------|-------|--------|
| Event/team text | Google Sheet | Edit the cell directly |
| Event/team photo | Cloudinary + Sheet | Upload new image, update URL in sheet |
| Remove an entry | Google Sheet | Delete the entire row |
| Reorder entries | Google Sheet | Cut and paste rows |

### 6.4 Quick Reference Card

| Task | Where | How |
|------|-------|-----|
| Update text | Google Sheet | Edit cells directly |
| Add new photo | Cloudinary | Upload → copy URL → paste in Sheet |
| Change website design | GitHub | Edit HTML/CSS files (requires dev) |
| Force refresh | Netlify/Render | Click deploy hook bookmark |
| Check image usage | Cloudinary | Dashboard → Usage stats |

---

## 7. Troubleshooting

### 7.1 Data Not Updating on Website

**Symptoms:** You updated the Google Sheet but changes don't appear.

**Solutions:**
1. Wait 2-5 minutes (Google Sheets may cache)
2. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check sheet is still shared as "Anyone with link"
4. Verify column headers haven't changed
5. Check browser console (F12) for errors

### 7.2 Image Not Displaying

**Symptoms:** Broken image icon or placeholder showing.

**Solutions:**
1. Verify the Cloudinary URL is complete and correct
2. Test the URL directly in a new browser tab
3. Check if image was accidentally deleted from Cloudinary
4. Ensure there are no extra spaces in the URL cell
5. Verify the image file isn't corrupted

### 7.3 API Key Not Working

**Symptoms:** Console shows 403 Forbidden or API errors.

**Solutions:**
1. Check domain restrictions match your actual site URL
2. Verify Google Sheets API is enabled in Cloud Console
3. Check if daily quota has been exceeded
4. Ensure the Sheet ID in code matches your actual sheet
5. Try switching to Plan B (CSV publish) temporarily

### 7.4 Website Shows "Loading..." Indefinitely

**Symptoms:** Page never finishes loading data.

**Solutions:**
1. Open browser developer tools (F12) → Console tab
2. Look for red error messages
3. Verify Sheet ID in the code matches your actual sheet
4. Check network connectivity
5. Test if Google Sheets is accessible directly
6. Contact developer if issue persists

### 7.5 Cloudinary Showing "Limit Exceeded"

**Symptoms:** New uploads fail or images stop loading.

**Solutions:**
1. Check usage in Cloudinary dashboard
2. Wait until next month for credits to reset
3. Switch to GitHub for images temporarily (Plan B)
4. Delete unused images to free up storage
5. Consider upgrading if limits are consistently hit

### 7.6 CORS Errors (Plan B CSV Method)

**Symptoms:** Console shows "CORS policy" or "Access-Control-Allow-Origin" errors.

**Solutions:**
1. Switch to Plan A (Google Sheets API) - recommended
2. Use a CORS proxy (temporary fix)
3. Ensure the sheet is properly published to web

### 7.7 Preventive Measures

- ✅ Lock the header row in Google Sheets
- ✅ Use data validation for date columns
- ✅ Maintain consistent naming conventions
- ✅ Keep a backup of important images in Google Drive
- ✅ Document who has access to what systems
- ✅ Test changes in incognito/private browser window

---

## 8. Migration Between Plans

### 8.1 Switching Data Methods (API ↔ CSV)

| Direction | Effort | Steps |
|-----------|--------|-------|
| API → CSV | Low | Change fetch URL, adjust JSON parsing to CSV parsing |
| CSV → API | Low | Get API key, update fetch URL, adjust parsing |

### 8.2 Switching Image Hosts (Cloudinary ↔ GitHub)

| Direction | Effort | Steps |
|-----------|--------|-------|
| Cloudinary → GitHub | Medium | Download images, upload to repo, update all URLs in Sheet |
| GitHub → Cloudinary | Medium | Upload images to Cloudinary, update all URLs in Sheet |

### 8.3 Switching Hosting (Netlify ↔ Render)

| Direction | Effort | Steps |
|-----------|--------|-------|
| Netlify → Render | Low | Create Render site, connect same GitHub repo, update DNS |
| Render → Netlify | Low | Create Netlify site, connect same GitHub repo, update DNS |

---

## 9. Health Check System

### 9.1 What to Monitor

Create a simple admin page (not linked publicly) that validates:

| Check | What It Verifies |
|-------|------------------|
| ✅ Sheet accessible | API/CSV endpoint returns data |
| ✅ Required columns exist | title, date, name, etc. present |
| ✅ No empty required fields | All entries have minimum data |
| ✅ Image URLs valid | All URLs return HTTP 200 |
| ✅ Cloudinary accessible | Can reach Cloudinary CDN |

### 9.2 Manual Health Check Process

**Weekly (5 minutes):**
1. Visit the website in incognito mode
2. Verify all sections load correctly
3. Check a few images load properly
4. Review Cloudinary usage stats

**Monthly (15 minutes):**
1. Check Google Cloud Console for API errors
2. Review Cloudinary bandwidth usage
3. Verify all team members still have correct access
4. Test the deploy hook still works

---

## 10. Go-Live Checklist

### 10.1 Technical Setup

- [ ] Google Sheet created with correct column headers
- [ ] Sheet sharing set to "Anyone with link can view"
- [ ] Header row frozen and protected
- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] API key created and restricted
- [ ] Sheet ID added to website code
- [ ] Cloudinary account created
- [ ] Folder structure created in Cloudinary
- [ ] Test images uploaded and URLs working

### 10.2 Deployment

- [ ] GitHub repository set up with all code
- [ ] Netlify/Render connected to GitHub
- [ ] Site deploys successfully
- [ ] Deploy hook created and tested
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active

### 10.3 Testing

- [ ] Website loads correctly on desktop
- [ ] Website loads correctly on mobile
- [ ] All images display properly
- [ ] Data updates reflect within 5 minutes
- [ ] Error states handled gracefully
- [ ] Tested in multiple browsers (Chrome, Firefox, Safari)

### 10.4 Documentation & Training

- [ ] This guide shared with team
- [ ] Team trained on Google Sheets updates
- [ ] Team trained on Cloudinary uploads
- [ ] Deploy hook bookmark shared with authorized users
- [ ] Emergency contact list created
- [ ] Access credentials documented securely

### 10.5 Handover

- [ ] All account credentials transferred/documented
- [ ] Team has access to:
  - [ ] Google Sheet (editor access)
  - [ ] Cloudinary (contributor access)
  - [ ] GitHub (if technical changes needed)
  - [ ] Netlify/Render (if deployment issues)
- [ ] Support contact established for technical issues

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **API** | Application Programming Interface — how software talks to other software |
| **API Key** | A password that identifies your application to Google |
| **CDN** | Content Delivery Network — servers worldwide that deliver your images fast |
| **CORS** | Cross-Origin Resource Sharing — browser security that can block data requests |
| **CSV** | Comma-Separated Values — a simple text format for spreadsheet data |
| **Deploy** | Publishing your website so visitors can see changes |
| **Deploy Hook** | A special URL that triggers your website to update |
| **JSON** | JavaScript Object Notation — a structured data format |
| **Static Site** | A website with fixed content (no server-side processing) |

---

## Appendix B: Account Access Template

| Service | URL | Account Email | Who Has Access |
|---------|-----|---------------|----------------|
| Google Sheet | [link] | | |
| Google Cloud Console | console.cloud.google.com | | |
| Cloudinary | cloudinary.com | | |
| GitHub | github.com/[repo] | | |
| Netlify/Render | [link] | | |

---

## Appendix C: Emergency Contacts

| Issue Type | Contact | Method |
|------------|---------|--------|
| Website down | [Developer] | [Phone/Email] |
| Can't update Sheet | [Admin] | [Phone/Email] |
| Image issues | [Admin] | [Phone/Email] |
| Security concern | [Developer] | [Phone/Email] |

---

*Document Version: 2.0*  
*Last Updated: [Date]*  
*Maintained by: [Team/Person]*
