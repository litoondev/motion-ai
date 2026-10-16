# Motion AI Frontend

Next.js frontend for the Motion AI After Effects plugin website. Communicates with a Laravel API backend.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Configure `.env.local` with your API URL and Google Client ID.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Public API base URL (used by client-side fetches) |
| `API_URL` | Server-side API base URL (defaults to `NEXT_PUBLIC_API_URL`) |
| `NEXT_PUBLIC_SITE_URL` | This frontend's URL |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for sign-in |
