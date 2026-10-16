# Route Mapping: Old Next.js → New Laravel API

## API Routes

| Old Next.js Route | Method | New Laravel Endpoint | Notes |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | `POST /api/v1/auth/register` | Manual registration |
| | | `POST /api/v1/auth/login` | Email/password login |
| | | `POST /api/v1/auth/google` | Google ID token login |
| | | `POST /api/v1/auth/logout` | Revoke token |
| | | `GET /api/v1/auth/me` | Current user |
| | | `POST /api/v1/auth/forgot-password` | Send reset email |
| | | `POST /api/v1/auth/reset-password` | Reset password |
| | | `GET /api/v1/auth/verify-email/{id}/{hash}` | Email verification |
| | | `POST /api/v1/auth/email/resend` | Resend verification |
| `/api/license/verify` | POST | `POST /api/v1/license/verify` | Plugin-facing, backward-compatible |
| `/api/trial/activate` | POST | `POST /api/v1/trial/activate` | One trial per user |
| `/api/payment/checkout` | POST | `POST /api/v1/checkout` | Bank transfer + Stripe |
| `/api/devices/unlink` | POST | `POST /api/v1/devices/{device}/unlink` | Owner only |
| `/api/download` | GET | `GET /api/v1/download` | Active license required |
| `/api/admin/licenses/generate` | POST | `POST /api/v1/admin/licenses` | Admin only |
| `/api/admin/payments/review` | POST | `POST /api/v1/admin/payments/{payment}/approve` | Admin approve |
| | | `POST /api/v1/admin/payments/{payment}/reject` | Admin reject |
| `/api/dev/*` | * | Not ported | Dev-only helpers |

## New Endpoints (no old equivalent)

| New Laravel Endpoint | Method | Purpose |
|---|---|---|
| `GET /api/v1/pricing` | GET | Public pricing info from settings |
| `GET /api/v1/me/dashboard` | GET | Dashboard data (user + licenses + payments) |
| `PATCH /api/v1/me` | PATCH | Update profile |
| `GET /api/v1/licenses` | GET | User's licenses |
| `GET /api/v1/devices` | GET | User's devices |
| `GET /api/v1/payments` | GET | User's payments |
| `POST /api/v1/stripe/webhook` | POST | Stripe webhook handler |
| `GET /api/v1/admin/stats` | GET | Admin dashboard stats |
| `GET /api/v1/admin/users` | GET | Admin user list |
| `GET /api/v1/admin/users/{user}` | GET | Admin user detail |
| `POST /api/v1/admin/users/{user}/block` | POST | Block user |
| `POST /api/v1/admin/users/{user}/unblock` | POST | Unblock user |
| `PATCH /api/v1/admin/users/{user}/role` | PATCH | Change user role |
| `GET /api/v1/admin/licenses` | GET | Admin license list |
| `GET /api/v1/admin/licenses/{license}` | GET | Admin license detail |
| `POST /api/v1/admin/licenses/{license}/suspend` | POST | Suspend license |
| `POST /api/v1/admin/licenses/{license}/revoke` | POST | Revoke license |
| `POST /api/v1/admin/licenses/{license}/reactivate` | POST | Reactivate license |
| `POST /api/v1/admin/licenses/{license}/extend` | POST | Extend license |
| `PATCH /api/v1/admin/licenses/{license}/seats` | PATCH | Change seat count |
| `GET /api/v1/admin/devices` | GET | Admin device list |
| `POST /api/v1/admin/devices/{device}/unlink` | POST | Force unlink device |
| `GET /api/v1/admin/payments` | GET | Admin payment list |
| `GET /api/v1/admin/payments/{payment}` | GET | Payment detail |
| `GET /api/v1/admin/payments/{payment}/slip` | GET | Download bank slip |
| `POST /api/v1/admin/payments/{payment}/refund` | POST | Refund payment |
| `GET /api/v1/admin/settings` | GET | Get settings |
| `PUT /api/v1/admin/settings` | PUT | Update settings |
| `POST /api/v1/admin/settings/plugin` | POST | Upload plugin file |
| `GET /api/v1/admin/audit-logs` | GET | Audit log list |

## Page Routes

| Old Page Route | New Location | Project |
|---|---|---|
| `/` (landing) | `/` | frontend |
| `/login` | `/login` | frontend |
| `/register` | `/register` | frontend |
| — (new) | `/forgot-password` | frontend |
| — (new) | `/reset-password` | frontend |
| `/dashboard` | `/dashboard` | frontend |
| `/dashboard/billing` | `/dashboard/billing` | frontend |
| `/dashboard/settings` | `/dashboard/settings` | frontend |
| `/admin` | `/` | admin |
| `/admin/users` | `/users` | admin |
| `/admin/licenses` | `/licenses` | admin |
| `/admin/licenses/generate` | `/licenses/generate` | admin |
| `/admin/payments` | `/payments` | admin |
| — (new) | `/devices` | admin |
| — (new) | `/settings` | admin |
| — (new) | `/audit-logs` | admin |
