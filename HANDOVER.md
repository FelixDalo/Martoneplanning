# Martone Planning Studio — Project Handover
**Site:** martoneplanning.com
**Prepared by:** Felix Dalo
**Handover date:** July 2026

---

## What has been delivered

| Item | Status |
|------|--------|
| 13-page website (HTML/CSS/TypeScript) | Done |
| GSAP animations (scroll, marquee gallery, counters) | Done |
| Fully responsive — mobile, tablet, desktop | Done |
| SEO meta tags, Open Graph, Twitter cards — all pages | Done |
| JSON-LD structured data (Google-readable business info) | Done |
| Social share image (og-image.png, 1200×630px) | Done |
| Contact form with autoresponder | Done (needs config — see below) |
| Deployed to GitHub (`FelixDalo/Martoneplanning`) | Done |
| Hostinger deploy branch connected | Done |
| Domain: martoneplanning.com | Done |

---

## Session agenda — client meeting

### 1. Contact form setup *(do together with client)*

The contact form is built and deployed. It needs a **Resend account** connected to the client's email domain. See [CONTACT-FORM-SETUP.md](CONTACT-FORM-SETUP.md) for the full step-by-step.

**What you need from the client:**
- Confirm the inbox email (e.g. `hello@martoneplanning.com`)
- Access to Hostinger DNS Zone Editor (to verify the domain in Resend)
- Access to Hostinger File Manager (to upload `contact-config.php`)

**What happens when the form works:**
- Martone receives an email immediately with the enquirer's name, phone, email and message
- The enquirer receives an automatic confirmation email 40 seconds later

---

### 2. Google My Business setup *(do together with client)*

Google My Business (now called **Google Business Profile**) puts Martone on Google Maps and in local search results.

**Go to:** [business.google.com](https://business.google.com) — log in with the client's Google account.

#### Steps:

1. **Search for the business** — type "Martone Planning Studio". If it already exists as an unverified listing, click **Claim this business**. If not, click **Add your business**.

2. **Business name:** `Martone Planning Studio`

3. **Category:** Search for `Urban planning department` — if unavailable, use `Business management consultant` or `Consultant`.

4. **Location:** Add a physical location if the office receives clients.
   - Address: Unit A2, Plot 8769, Bontleng, Gaborone, Botswana

5. **Service area:** Add Botswana (or specific cities: Gaborone, Francistown, Maun, Kasane, Palapye).

6. **Contact details:**
   - Phone: +267 71 658 936
   - Website: https://martoneplanning.com

7. **Business hours:** Confirm with client and set accordingly.

8. **Verify the listing:**
   - Google usually sends a **postcard** to the business address with a PIN (takes 5–14 days).
   - Some businesses can verify by **phone call** or **video call** — choose the fastest option available.
   - Enter the PIN once received → listing goes live on Google Maps.

9. **After verification — complete the profile:**
   - Add a **business description** (150–750 characters):
     > *Martone Planning Studio is a Botswana-based town planning and urban design consultancy. We guide clients from feasibility through to approval — covering master planning, urban design, project management, development consultancy and socio-economic analysis.*
   - Upload **photos:** office exterior, team, project images (use images from the website)
   - Add **services:** Town Planning, Urban Design, Master Planning, Project Management, Development Consultancy, Retail Network Planning, Socio-Economic Analysis

---

### 3. Responsiveness check *(run during or before meeting)*

Open the live site on:
- [ ] Desktop (Chrome)
- [ ] iPhone Safari (or use Chrome DevTools → Toggle device toolbar → iPhone 14)
- [ ] Android Chrome

Pages to check:
- [ ] Home (`/`)
- [ ] About (`/about.html`)
- [ ] Services (`/services.html`)
- [ ] Projects (`/projects.html`)
- [ ] Programmes (`/programmes.html`)
- [ ] Contact (`/contact.html`)

What to look for: text doesn't overflow, images scale correctly, marquee gallery scrolls, navigation works on mobile.

---

### 4. SEO check *(already implemented — run to confirm)*

The site already has: meta descriptions, Open Graph tags, Twitter cards, canonical URLs, and JSON-LD structured data on all 13 pages.

Run these free tools to confirm:

| Tool | URL | What it checks |
|------|-----|----------------|
| Google PageSpeed Insights | pagespeed.web.dev | Performance + mobile score |
| Google Rich Results Test | search.google.com/test/rich-results | Structured data / JSON-LD |
| Facebook Sharing Debugger | developers.facebook.com/tools/debug | OG image preview |

Target: PageSpeed mobile score above 70, desktop above 85.

---

## What the client needs to manage going forward

| Task | How |
|------|-----|
| Update project pages | Hostinger File Manager or FTP — edit HTML files in `public_html/` |
| Add new images | Upload to `public_html/assets/img/` via File Manager |
| Rebuild and redeploy after code changes | Run `npm run build` → push to GitHub → Hostinger pulls `deploy` branch |
| Renew domain | Hostinger hPanel → Domains |
| Renew hosting | Hostinger hPanel → Hosting Plans |
| Monitor contact form | Emails arrive in the inbox set in `contact-config.php` |
| Update Google Business Profile | business.google.com |

---

## Credentials to hand over to client

*(Fill in at the meeting and keep securely — do not store in GitHub)*

| Item | Value |
|------|-------|
| Hostinger login | |
| GitHub account | FelixDalo / Martoneplanning |
| Resend account login | |
| Resend API key | *(in contact-config.php on server)* |
| Google account (for Google Business Profile) | |

---

## Key file locations

| File | Location | Purpose |
|------|----------|---------|
| Source code | `c:/Users/frank/OneDrive/Desktop/Websites/Martone planning/` | Full project source |
| GitHub repo | github.com/FelixDalo/Martoneplanning | Version control |
| Live site (compiled) | `public_html/` on Hostinger | What visitors see |
| Contact handler | `public_html/contact.php` | Processes form submissions |
| Contact credentials | `public_html/contact-config.php` | API keys — never commit to GitHub |
| Contact form setup guide | `CONTACT-FORM-SETUP.md` | Step-by-step Resend setup |

---

*Website built by Felix Dalo · July 2026*
