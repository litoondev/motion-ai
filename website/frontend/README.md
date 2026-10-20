# Motion AI – Frontend

Customer portal for the Motion AI After Effects plugin: landing page, sign-up / sign-in (email + optional Google),
dashboard (license key, devices, plugin download), billing (Stripe card or bank transfer with receipt upload),
payment history and account settings. Talks to the Laravel API (`/api/v1`).

It is a **static site**: `npm run build` produces a plain HTML/CSS/JS folder (`out/`) that you can upload to any server.
No Node.js is needed in production.

## 1. Run locally

```bash
npm install
cp .env.example .env.local      # set NEXT_PUBLIC_API_URL
npm run dev                     # http://localhost:3000
```

## 2. Build the `out` folder for a server

```bash
# the API URL is baked in at build time, so set it for the server you deploy to:
NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 npm run build
```

On Windows PowerShell:

```powershell
$env:NEXT_PUBLIC_API_URL="https://api.example.com/api/v1"; npm run build
```

(or put the values in `.env.production` and run `npm run build`).

Upload **the contents of `out/`** to the web root. Preview the result locally with `npm run preview`.

| Host | Notes |
|---|---|
| Apache / shared hosting | `out/.htaccess` is included (404 page, no directory listing). |
| Nginx | `root /path/to/out; index index.html; error_page 404 /404.html; location / { try_files $uri $uri/ =404; }` |
| Netlify / Vercel / S3 + CloudFront | Publish directory: `out`. |

## 3. Backend settings you must match

The browser calls the API directly, so on the **Laravel** side:

1. `CORS_ALLOWED_ORIGINS` must contain the exact origin of the deployed site
   (e.g. `https://app.example.com`, no trailing slash, `http` vs `https` matters).
2. `FRONTEND_URL` must be that same origin. It is used for password-reset links, e-mail verification redirects and
   the Stripe success / cancel URLs.
3. For HTTPS sites, the API must be HTTPS too (browsers block mixed content).

## Environment variables (build time)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base, including `/api/v1` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Enables the Google button (leave empty to hide it) |
| `NEXT_PUBLIC_BANK_*` | Bank details on the billing page. The *Bank transfer* option only appears when `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` is set |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Contact address shown on the site |

## How it works

* Auth: the API returns a Sanctum token on login / register / Google. It is kept in `localStorage`
  (`src/lib/token.ts`) and sent as `Authorization: Bearer …` (`src/lib/api.ts`). A `401` anywhere signs the user out.
* Route protection: static hosting has no middleware, so `(dashboard)/layout.tsx` redirects to `/login/` in the browser
  and `(auth)/layout.tsx` redirects signed-in users to the dashboard.
* Plugin download: `/download` needs the token, so the file is fetched with `fetch` and saved from a Blob.
* Checkout: card -> API returns a Stripe `checkout_url` and the browser is redirected; bank transfer -> `multipart/form-data`
  with `tx_ref` and an optional receipt (`slip`).

## Structure

```
src/
  app/
    (marketing)/   landing page, docs, privacy, terms, refund
    (auth)/        login, register, forgot-password, reset-password
    (dashboard)/   dashboard, dashboard/billing, dashboard/settings
  components/      ui/, layout/, dashboard/, auth/, providers/
  lib/             api client, auth context, token store, config, types, utils
  services/        auth, user, pricing (thin wrappers around the API)
```

> The docs / privacy / terms / refund pages are starting-point copy. Have them reviewed before launch.
