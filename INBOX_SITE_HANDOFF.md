# Inbox Site Handoff

This document is the handoff for any other Probably Fine Studios property that needs to send contact messages into the shared inbox.

## Current live inbox endpoints

- Public site submit endpoint: `https://mail.probablyfinestudios.com/api/public/messages`
- Admin inbox login: `https://mail.probablyfinestudios.com/api/admin/login`
- Admin inbox read/write: `https://mail.probablyfinestudios.com/api/admin/messages`

Public site forms should only use the public submit endpoint.

## Current public-enabled sites

Right now, public submissions are enabled for:

- `probablyfinestudios`
- `fieldkit`

Other sites must be added in the worker before their forms can submit.

## Site onboarding requirements

FieldKit is already connected for public submissions.

For every additional site you want connected, I need:

- the target site slug
- the allowed origin URLs for that site

## Exact implementation steps for the next site

1. Update the shared inbox worker allowlist in `message-hub/src/index.ts`:
   - add the new site to `ALLOWED_SITES`
   - add the new site to `PUBLIC_SUBMIT_SITES`
   - add the new site origins to `SITE_ALLOWED_ORIGINS`

2. Deploy the shared inbox worker:

```powershell
Set-Location "c:\Users\chris\Documents\code\probablyfinestudios\message-hub"
npm run deploy
```

3. In the client app, wire the contact form to submit directly to:

`POST https://mail.probablyfinestudios.com/api/public/messages`

4. Send the request body with:

```json
{
  "source_site": "your-site-slug",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello, I want to work together.",
  "company": ""
}
```

5. Keep the honeypot field in the form markup but visually hidden, and reset the form after a successful response.

6. Verify the submission by checking the shared inbox dashboard for the new message.

## Worker files to update when onboarding a new site

File:

- `message-hub/src/index.ts`

Update these constants:

1. `ALLOWED_SITES`
2. `PUBLIC_SUBMIT_SITES`
3. `SITE_ALLOWED_ORIGINS`

Example for onboarding `cookbookverse`:

```ts
const ALLOWED_SITES = new Set([
  'cookbookverse',
  'fieldkit',
  'chrisocphoto',
  'probablyfinestudios',
]);

const PUBLIC_SUBMIT_SITES = new Set([
  'probablyfinestudios',
  'cookbookverse',
]);

const SITE_ALLOWED_ORIGINS: Record<string, string[]> = {
  probablyfinestudios: [
    'http://localhost:3000',
    'https://probablyfinestudios.com',
    'https://www.probablyfinestudios.com',
  ],
  cookbookverse: [
    'http://localhost:3000',
    'https://cookbookverse.com',
    'https://www.cookbookverse.com',
  ],
};
```

After changing this file, redeploy the worker:

```powershell
Set-Location "c:\Users\chris\Documents\code\probablyfinestudios\message-hub"
npm run deploy
```

## Public request contract

Endpoint:

`POST https://mail.probablyfinestudios.com/api/public/messages`

JSON body:

```json
{
  "source_site": "probablyfinestudios",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hello, I want to work together.",
  "company": ""
}
```

Notes:

- `source_site` must exactly match the site slug allowed in the worker
- `company` is a honeypot field and should stay empty
- Requests are origin-checked against `SITE_ALLOWED_ORIGINS`

## Frontend integration example

```ts
const response = await fetch('https://mail.probablyfinestudios.com/api/public/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source_site: 'probablyfinestudios',
    name,
    email,
    message,
    company: '',
  }),
});

const payload = await response.json();

if (!response.ok) {
  throw new Error(payload.error ?? 'Request failed.');
}
```

## Recommended UX for each site

- Show a simple success message on `201`
- Do not expose admin inbox endpoints on public sites
- Keep the honeypot field in the DOM but visually hidden
- Reset the form after successful submission

## Recommended next hardening

- Add Cloudflare Turnstile before enabling more public sites
- Add per-site rate limiting in the worker
- Add richer message metadata later if needed, such as subject or project type
