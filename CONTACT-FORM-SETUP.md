# Contact Form — Setup Instructions
**For: Martone Planning Studio**
**Prepared by: Felix Dalo / Martone Planning Studio developer**

---

## What the form does

When a visitor submits the contact form on martoneplanning.com:

1. **Instant notification** — an email lands in the Martone inbox with the enquirer's name, phone, email, and message. The reply-to is set to the enquirer's address, so hitting Reply goes straight back to them.
2. **Autoresponder** — 40 seconds later, the enquirer receives a confirmation email automatically.

### Autoresponder message (sent to the enquirer)

> **Subject:** Thank you for contacting Martone Planning Studio
>
> Dear [First Name],
>
> Thank you for getting in touch with Martone Planning Studio. We have received your enquiry and will review the details you shared.
>
> A member of our team will contact you to discuss the next step.
>
> Best regards,
> Martone Planning Studio
> Gaborone, Botswana

---

## Files that must be on the server

These two files go in `public_html/` on Hostinger. They are **not** inside the `dist/` folder.

| File | What it is |
|------|-----------|
| `contact.php` | The form handler. Already in the project — just upload it. |
| `contact-config.php` | Your credentials. **Must be created manually** — never stored in GitHub. |

---

## Step-by-step setup

### Step 1 — Create a Resend account

1. Go to **[resend.com](https://resend.com)** and sign up (free tier covers 100 emails/day).
2. Click **Domains** → **Add Domain**.
3. Enter `martoneplanning.com` (or whichever domain the client uses for email).
4. Resend will give you DNS records (TXT, MX, DKIM). Add these in Hostinger's DNS Zone Editor.
5. Click **Verify** in Resend and wait for the green checkmark (can take 5–30 minutes).

### Step 2 — Get your API key

1. In Resend, go to **API Keys** → **Create API Key**.
2. Name it `Martone Production`, permission: **Sending access**.
3. Copy the key — it starts with `re_`. **Save it somewhere safe — it's shown once.**

### Step 3 — Create `contact-config.php`

Create a new file called `contact-config.php` with the following content. Fill in the real values:

```php
<?php
// Your Resend API key
define('RESEND_API_KEY', 're_PASTE_YOUR_KEY_HERE');

// Where internal notifications are delivered (Martone's inbox)
define('CONTACT_TO_EMAIL', 'hello@martoneplanning.com');

// Verified sender address for notifications — must match your verified Resend domain
define('CONTACT_FROM_EMAIL', 'enquiries@martoneplanning.com');

// Verified sender address for the autoresponder sent to enquirers
define('AUTORESPONDER_FROM_EMAIL', 'hello@martoneplanning.com');

// Delay in seconds before the autoresponder is sent (default: 40)
define('AUTORESPONDER_DELAY_SECONDS', 40);
```

> **Note:** The email addresses under `CONTACT_FROM_EMAIL` and `AUTORESPONDER_FROM_EMAIL` must use the domain you verified in Resend (Step 1). If you verified `martoneplanning.com`, you can use any `@martoneplanning.com` address — Resend handles the sending.

### Step 4 — Upload files to Hostinger

1. Log in to Hostinger hPanel.
2. Go to **Files → File Manager**.
3. Open the `public_html/` folder.
4. Upload both files:
   - `contact.php` (from the project folder)
   - `contact-config.php` (the one you just created)

These files sit alongside `index.html`, `contact.html`, etc. at the root of `public_html/`.

### Step 5 — Test the form

1. Go to **martoneplanning.com/contact.html**.
2. Fill in the form with a real email address you can check.
3. Submit.
4. Check two things:
   - The Martone inbox receives the notification within seconds.
   - The email address you entered receives the autoresponder within ~40 seconds.

If the form shows an error, check Hostinger's **Error Logs** (hPanel → Advanced → PHP Error Logs) for details.

---

## Summary checklist

- [ ] Resend account created
- [ ] Domain verified in Resend (`martoneplanning.com`)
- [ ] API key generated and saved
- [ ] `contact-config.php` created with real credentials
- [ ] `contact.php` uploaded to `public_html/`
- [ ] `contact-config.php` uploaded to `public_html/`
- [ ] Form tested — notification received in Martone inbox
- [ ] Form tested — autoresponder received in enquirer inbox

---

*`contact-config.php` contains API credentials and is excluded from GitHub (it is in `.gitignore`). Never share this file publicly or commit it to version control.*
