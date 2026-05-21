# Keystone Impact Solutions — Website

Static HTML/CSS website for [keystoneimpactsolutions.au](https://keystoneimpactsolutions.au), ready for deployment on GitHub Pages.

---

## Pages

| File | URL |
|---|---|
| `index.html` | Home |
| `about.html` | About |
| `services.html` | Services |
| `case-studies.html` | Case Studies listing |
| `case-study-boogiecamp.html` | Case Study: Boogie Camp |
| `case-study-slappas.html` | Case Study: Slappas Thongs |
| `case-study-tca.html` | Case Study: Tenkile Conservation Alliance |
| `contact.html` | Contact |

---

## Deploying to GitHub Pages

### Step 1 — Create a GitHub repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New repository**
3. Name it `keystoneimpactsolutions` (or any name you prefer)
4. Set visibility to **Public** (required for free GitHub Pages)
5. Click **Create repository**

### Step 2 — Upload the files

**Option A — Upload via GitHub web interface (easiest)**

1. In your new repository, click **Add file → Upload files**
2. Drag and drop the entire contents of this `WEBSITE` folder (all `.html` files and the `assets/` folder)
3. Click **Commit changes**

**Option B — Using Git from Terminal**

```bash
cd /path/to/WEBSITE
git init
git add .
git commit -m "Initial website build"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### Step 3 — Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → scroll to **Pages** in the left sidebar
3. Under **Source**, select **Deploy from a branch**
4. Select **main** branch and **/ (root)** folder
5. Click **Save**

GitHub will give you a URL like: `https://your-username.github.io/your-repo/`

### Step 4 — Connect your custom domain (optional)

If you want to use `keystoneimpactsolutions.au`:

1. In the **Pages** settings, enter your domain in the **Custom domain** field
2. Add a `CNAME` DNS record pointing to `your-username.github.io` (via your domain registrar)
3. Tick **Enforce HTTPS** once DNS propagates (can take up to 48 hours)

---

## Contact Form

The contact form on `contact.html` currently has `action="#"` — it doesn't send emails yet. To make it work, you have two options:

- **Formspree** (easiest, free tier available): Sign up at [formspree.io](https://formspree.io), create a form, and replace `action="#"` with your Formspree endpoint
- **Netlify Forms**: If you later move hosting to Netlify, forms work automatically with just `data-netlify="true"` on the form tag

---

## File Structure

```
WEBSITE/
├── index.html
├── about.html
├── services.html
├── case-studies.html
├── case-study-boogiecamp.html
├── case-study-slappas.html
├── case-study-tca.html
├── contact.html
├── README.md
└── assets/
    ├── css/
    │   └── styles.css
    └── img/
        ├── logo-reverse.svg
        ├── logo-sand.svg
        ├── logo-sand-v2.svg
        ├── echidna-sand.svg
        └── echidna-icon.svg
```

---

## Brand

Built to KIS Brand Kit v2026. Colours, typography, and layout patterns are defined as CSS custom properties in `assets/css/styles.css`.
