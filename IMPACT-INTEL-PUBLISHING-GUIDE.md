# Impact Intel: Publishing Guide

How to publish a new post. Budget: 20-30 minutes per article.

---

## What you need to touch each time

Two files:

1. `blog-posts.js` (at the site root) — adds the post to the listing page
2. `impact-intel/your-post-slug.html` — the actual article

That is it. The listing page (`impact-intel.html`) updates itself automatically.

---

## Step-by-step

### 1. Write your article

Write in your preferred tool (Word, Google Docs, notes). Keep the structure in mind:

- **Opening paragraph:** the problem or question. Hook the reader in 2-3 sentences.
- **Body:** 2-4 sections, alternating between Warm Sand (light) and Charcoal (dark) background in the HTML. Each section has a heading and 2-4 paragraphs.
- **Takeaways box:** always end with a short summary list. Readers scan.
- **Soft CTA:** one line at the end pointing toward contact or a relevant service.

Target: 600-1000 words of body text. Enough to be genuinely useful.

---

### 2. Create the HTML file

1. Open `impact-intel/post-template.html`
2. Save a copy as `impact-intel/your-post-slug.html`
   (use lowercase, hyphens for spaces: `reading-grant-guidelines.html`)
3. Find every `[bracketed placeholder]` and replace it with your content
4. Paste your article text into the appropriate section blocks

The template has comments explaining what each section is for. Sections alternate: the first body section is light (Warm Sand), the second is dark (Charcoal), the third is light again. Add or remove sections as needed — just keep the alternating pattern.

**To add an insight box:**
```html
<div class="insight-box">
  <p class="box-label">Insight</p>
  <h4>Short headline</h4>
  <p>1-2 sentences of specific, useful content.</p>
</div>
```

**To add a tip box:**
```html
<div class="tip-box">
  <p class="box-label">Tip</p>
  <p>One clear, specific action the reader can take.</p>
</div>
```

---

### 3. Add the post to blog-posts.js

Open `blog-posts.js` and copy this block to the TOP of the `blogPosts` array:

```javascript
{
  slug: "impact-intel/your-post-slug.html",
  title: "Your post title exactly as it appears in the HTML",
  category: "Funding Intelligence",
  date: "2026-06-16",
  dateDisplay: "16 June 2026",
  readTime: "5 min read",
  excerpt: "1-2 sentence teaser. Plain text only, no HTML. This is what appears on the card.",
  featured: false
},
```

**Category options:**
- Funding Intelligence
- Grant Strategy
- Awards & Recognition
- From the Field
- Sector Intelligence

**To feature this post** (shows as the large card at the top of the listing page):
- Set `featured: true` on this post
- Find the previously featured post and change it to `featured: false`
- Only one post should have `featured: true` at any time

---

### 4. Preview locally (optional)

To preview before pushing to GitHub, you need to serve the files from a local server (not by double-clicking the HTML file — the listing page uses JavaScript that requires a server).

If you have Python installed:
```
cd /path/to/your/site
python3 -m http.server 8000
```
Then open http://localhost:8000/impact-intel.html in your browser.

VS Code users: install the "Live Server" extension (free) and right-click any HTML file to open with Live Server.

---

### 5. Commit to GitHub

Push both files:
- `blog-posts.js`
- `impact-intel/your-post-slug.html`

GitHub Pages will deploy within 1-2 minutes.

---

## Checklist before publishing

- [ ] Post slug is lowercase with hyphens (e.g. `grant-readiness-tips.html`)
- [ ] Title and date match between the HTML file and blog-posts.js
- [ ] Excerpt is plain text (no HTML tags)
- [ ] Section backgrounds alternate (light, dark, light or dark, light, dark)
- [ ] Takeaways box included at the end
- [ ] CTA banner updated to relate to the post topic
- [ ] `featured` flag is correct (only one post set to true)
- [ ] ABN placeholder updated if not already done
- [ ] Proofread for Australian English (organisation, colour, programme, recognise)
- [ ] No em dashes in the copy (use commas, colons, full stops, or parentheses)

---

## File structure reference

```
/ (site root)
├── impact-intel.html         ← listing page (do not edit for new posts)
├── blog-posts.js             ← edit this to add new posts
├── impact-intel/
│   ├── post-template.html    ← copy this for each new post
│   ├── commission-based-grant-writing.html
│   └── [your new posts go here]
```

---

## Delegating to Dee

If Dee is handling publishing:

1. Send Dee your article text (Word or Google Doc)
2. Send Dee the slug you want (e.g. `reading-grant-guidelines`)
3. Dee creates the HTML from the template and updates blog-posts.js
4. Dee sends you a preview link or screenshots for approval
5. You approve, Dee commits to GitHub

The template comments are written for Dee to follow without needing to ask questions. The blog-posts.js comments at the top of the file explain every field.

---

*Last updated: May 2026*
