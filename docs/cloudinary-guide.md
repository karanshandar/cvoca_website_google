# Cloudinary Image Upload Guide

**For Non-Technical Team Members**

This guide shows you how to upload images to Cloudinary and use them on the CVOCA website through Google Sheets.

---

## What is Cloudinary?

Cloudinary is a cloud service that stores and delivers images for the website. Instead of dealing with code or technical files, you can simply:
1. Drag and drop images to upload them
2. Copy the image URL
3. Paste it into Google Sheets

The website automatically displays the images!

---

## One-Time Setup (5 minutes)

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click **Sign Up** (it's free, no credit card required)
3. Fill in your details:
   - Email address
   - Password
   - Choose "I'm a developer" or "I'm a marketer" (doesn't matter)
4. Verify your email
5. Log in to your Cloudinary dashboard

### Step 2: Note Your Cloud Name

After logging in:
1. Look at the top of the dashboard
2. You'll see **Cloud Name**: `your-cloud-name`
3. Copy this name and save it somewhere (you might need it later)

### Step 3: Create Folder Structure

1. Click **Media Library** in the left sidebar
2. Click **Create Folder**
3. Name it: `cvoca-website`
4. Open the `cvoca-website` folder
5. Create these sub-folders inside:
   - `events` (for event flyers and photos)
   - `team` (for committee member photos)
   - `committee` (for managing committee photos)
   - `annual-reports` (for report cover images, if needed)

Your folder structure should look like:
```
cvoca-website/
├── events/
├── team/
├── committee/
└── annual-reports/
```

---

## Uploading Images (Every Time)

### For Event Images

1. Log in to Cloudinary
2. Go to **Media Library**
3. Navigate to `cvoca-website/events/`
4. Click **Upload** or simply **drag and drop** your image
5. Wait for upload to complete (you'll see a green checkmark)
6. Click on the uploaded image
7. Look for the **URL** (it starts with `https://res.cloudinary.com/...`)
8. Click **Copy URL** (or right-click the URL and copy)
9. Open your Google Sheet (Events tab)
10. Paste the URL in the **imageUrl** column for that event

**Done!** The website will show the image automatically.

### For Committee Member Photos

1. Log in to Cloudinary
2. Go to **Media Library**
3. Navigate to `cvoca-website/team/` or `cvoca-website/committee/`
4. Upload the photo (drag and drop)
5. Click on the uploaded photo
6. Copy the URL
7. Open your Google Sheet (managingCommittee or teams tab)
8. Paste the URL in the **photoUrl** column for that person

---

## Image Guidelines

### Recommended Image Sizes

| Type | Recommended Size | Format |
|------|------------------|--------|
| Event Flyers | 800 x 1200 pixels (portrait) | JPG or PNG |
| Event Photos | 1200 x 800 pixels (landscape) | JPG or PNG |
| Team Photos | 400 x 400 pixels (square) | JPG or PNG |
| Committee Photos | 400 x 400 pixels (square) | JPG or PNG |

### File Naming Conventions

Use clear, descriptive names with hyphens (no spaces):

**Good Examples:**
- `annual-meeting-2025.jpg`
- `diwali-celebration-2024.jpg`
- `john-doe-president.jpg`
- `jane-smith-secretary.jpg`

**Bad Examples:**
- `IMG_1234.jpg` (not descriptive)
- `my photo.jpg` (has spaces)
- `DSCN0001.jpg` (not descriptive)

### Image Quality Tips

- Use clear, well-lit photos
- Avoid blurry or pixelated images
- For team photos, use professional headshots if possible
- Keep file sizes under 2 MB (Cloudinary will optimize them)
- Use JPG for photos, PNG for graphics/logos

---

## Getting the Correct URL

Cloudinary provides multiple URL formats. Use the **default URL** that looks like this:

```
https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/cvoca-website/events/annual-meeting-2025.jpg
```

**Important:**
- Make sure to copy the FULL URL (starts with `https://`)
- Don't modify the URL
- Paste it exactly as copied into Google Sheets

---

## Updating or Replacing Images

### To Replace an Image:

**Option 1: Upload New, Update Sheet**
1. Upload the new image to Cloudinary
2. Copy the new URL
3. Paste it in Google Sheets (replacing the old URL)

**Option 2: Delete Old, Upload New**
1. In Cloudinary, find the old image
2. Click the three dots (...) → Delete
3. Upload the new image with the same name
4. Copy the new URL
5. Update Google Sheets

---

## Troubleshooting

### Image Not Showing on Website

**Check 1: Is the URL correct?**
- Make sure you copied the full URL from Cloudinary
- Check for extra spaces before or after the URL in Google Sheets
- The URL should start with `https://res.cloudinary.com/`

**Check 2: Is the image uploaded?**
- Log in to Cloudinary and verify the image is there
- Click on the image to make sure it's accessible

**Check 3: Wait a few minutes**
- Sometimes it takes 2-5 minutes for changes to appear on the website
- Try refreshing your browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

### Image Upload Failed

**Solutions:**
- Check your internet connection
- File might be too large (keep under 10 MB)
- Try a different browser
- Make sure file is JPG, PNG, or GIF format

### Can't Access Cloudinary

**Solutions:**
- Check if you're logged in
- Try resetting your password
- Clear browser cache and cookies
- Contact your website admin for access

---

## Quick Reference Card

| Task | Steps |
|------|-------|
| Upload event image | Cloudinary → events folder → Upload → Copy URL → Paste in Google Sheet |
| Upload team photo | Cloudinary → team folder → Upload → Copy URL → Paste in Google Sheet |
| Replace an image | Upload new → Copy new URL → Update Google Sheet |
| Delete an image | Cloudinary → Find image → Three dots → Delete |

---

## Free Tier Limits

Cloudinary's free plan includes:
- **25 credits per month** (plenty for most needs)
- **10 GB storage** (~2,000 high-quality photos)
- **20 GB bandwidth** (~10,000+ page views)

**This is more than enough for the CVOCA website!**

---

## Need Help?

If you run into issues:
1. Check this guide first
2. Try the troubleshooting section
3. Contact your website administrator
4. Email: [your-admin-email]

---

**Last Updated:** January 2026
**Version:** 1.0
