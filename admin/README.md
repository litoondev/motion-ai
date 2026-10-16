# Motion AI Admin Panel

Admin dashboard for managing the Motion AI After Effects plugin system.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Configure `.env.local` with your API URL and Google Client ID.

## Development

```bash
npm run dev
```

Runs on [http://localhost:3001](http://localhost:3001).

## Build

```bash
npm run build
npm start
```

## Notes

- This is a separate project from the frontend website
- Requires admin role — non-admin users are rejected at login
- All data comes from the Laravel API backend
- Uses cookie name `admin_auth_token` (separate from frontend)
