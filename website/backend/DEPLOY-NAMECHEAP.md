# Deploying Motion AI Laravel API to Namecheap Shared Hosting

This guide covers deploying the Laravel backend to Namecheap shared hosting (cPanel) and the Next.js frontends to Vercel.

---

## 1. Prerequisites

### PHP Version
- PHP 8.2 or higher is required.
- In cPanel, go to **MultiPHP Manager** and set your domain/subdomain to PHP 8.2+.

### Required PHP Extensions
Ensure these extensions are enabled in **MultiPHP INI Editor** or **Select PHP Version**:

| Extension   | Purpose                        |
|-------------|--------------------------------|
| pdo_mysql   | MySQL database driver          |
| mbstring    | Multi-byte string handling     |
| gd          | Image processing               |
| zip         | ZIP archive support            |
| bcmath      | Arbitrary precision math       |
| intl        | Internationalization           |
| exif        | Image metadata reading         |
| openssl     | Encryption & HTTPS             |
| fileinfo    | MIME type detection             |
| tokenizer   | PHP tokenizer (usually built-in) |

To check which extensions are active, create a temporary `phpinfo.php` file:

```php
<?php phpinfo(); ?>
```

Upload it to your public directory, visit it in a browser, then **delete it immediately**.

---

## 2. Directory Layout

Namecheap shared hosting uses cPanel. The recommended layout keeps application code outside the web-accessible directory:

```
/home/USERNAME/
├── motion-ai-api/              # Laravel app (NOT web-accessible)
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   ├── vendor/
│   ├── .env
│   ├── artisan
│   └── composer.json
│
└── public_html/
    └── api.yourdomain.com/     # Subdomain document root (web-accessible)
        ├── index.php           # Modified entry point
        ├── .htaccess
        ├── storage -> ../../motion-ai-api/storage/app/public  (symlink)
        └── (other public assets)
```

### Setting Up the Subdomain
1. In cPanel, go to **Subdomains** (or **Domains** on newer cPanel).
2. Create subdomain: `api.yourdomain.com`
3. Set document root to: `public_html/api.yourdomain.com`

---

## 3. Modified public/index.php

Since the Laravel application lives outside the public directory, update the paths in `index.php`:

```php
<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../../motion-ai-api/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../../motion-ai-api/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
$app = require_once __DIR__.'/../../motion-ai-api/bootstrap/app.php';

$app->handleRequest(Request::capture());
```

Copy this file into `public_html/api.yourdomain.com/index.php`.

---

## 4. .htaccess

Place this `.htaccess` file in `public_html/api.yourdomain.com/`:

```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On
    RewriteBase /

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteRule ^index\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php/$1 [L]
</IfModule>
```

---

## 5. MySQL Setup

1. In cPanel, go to **MySQL Databases**.
2. Create a new database: `USERNAME_motion_ai` (cPanel prefixes your username).
3. Create a new user: `USERNAME_motionai` with a strong password.
4. Add the user to the database with **ALL PRIVILEGES**.

Note the full prefixed names for your `.env` file.

---

## 6. Production .env

Create the `.env` file in `/home/USERNAME/motion-ai-api/`:

```env
APP_NAME="Motion AI"
APP_ENV=production
APP_KEY=base64:GENERATE_THIS_KEY
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

LOG_CHANNEL=single
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=USERNAME_motion_ai
DB_USERNAME=USERNAME_motionai
DB_PASSWORD=your_strong_password_here

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Motion AI"

# CORS - allowed origins for frontend/admin
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Sanctum
SANCTUM_STATEFUL_DOMAINS=yourdomain.com,admin.yourdomain.com

# Gumroad (license verification)
GUMROAD_PRODUCT_ID=your_product_id
```

### Generating APP_KEY
If you have SSH access:
```bash
cd /home/USERNAME/motion-ai-api
php artisan key:generate
```

If no SSH access, generate locally with Docker:
```bash
docker compose exec app php artisan key:generate --show
```

Then paste the output into your `.env` file.

---

## 7. Running Migrations

### With SSH Access (Recommended)
```bash
cd /home/USERNAME/motion-ai-api
php artisan migrate --seed
```

### Without SSH Access

**Option A: Schema Dump**
1. Locally, run: `php artisan schema:dump`
2. This creates a SQL file in `database/schema/`
3. Import this SQL file via **phpMyAdmin** in cPanel

**Option B: One-Time Migration Route**
Add a temporary route protected by a secret token:

```php
// routes/web.php (REMOVE AFTER USE)
Route::get('/run-migrations/{token}', function ($token) {
    if ($token !== 'YOUR_SECRET_TOKEN_HERE') {
        abort(404);
    }
    Artisan::call('migrate', ['--seed' => true, '--force' => true]);
    return 'Migrations complete: ' . Artisan::output();
});
```

Visit `https://api.yourdomain.com/run-migrations/YOUR_SECRET_TOKEN_HERE` once, then **delete this route immediately**.

---

## 8. Queue & Cache Configuration

For shared hosting without Redis or Supervisor:

```env
QUEUE_CONNECTION=database
CACHE_STORE=file
SESSION_DRIVER=file
```

- **database** queue works with cron-based processing (see Section 9).
- **file** cache and sessions require no additional services.
- If your workload is light, you can use `QUEUE_CONNECTION=sync` to process jobs immediately (no cron needed, but slower HTTP responses).

---

## 9. Cron Jobs

In cPanel, go to **Cron Jobs**.

### Laravel Scheduler
Run every minute:
```
* * * * * /usr/local/bin/php /home/USERNAME/motion-ai-api/artisan schedule:run >> /dev/null 2>&1
```

### Queue Worker (if using database queue)
Run every minute:
```
* * * * * /usr/local/bin/php /home/USERNAME/motion-ai-api/artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

> **Note:** The `--stop-when-empty` flag ensures the process exits after clearing the queue, which is important on shared hosting where long-running processes may be killed.

### Finding the PHP Path
If `/usr/local/bin/php` doesn't work, check available PHP binaries:
- Try: `/usr/local/bin/ea-php82` (EasyApache format)
- Or use cPanel Terminal to run: `which php`

---

## 10. Storage Link

### With SSH Access
```bash
cd /home/USERNAME/motion-ai-api
php artisan storage:link
```

This creates a symlink from `public/storage` to `storage/app/public`.

### Without SSH or Symlink Support
If symlinks are not supported on your plan:
1. Manually copy contents of `storage/app/public/` to `public_html/api.yourdomain.com/storage/`
2. Re-copy whenever new files are uploaded
3. Alternatively, use the one-time route method:

```php
// routes/web.php (REMOVE AFTER USE)
Route::get('/create-storage-link/{token}', function ($token) {
    if ($token !== 'YOUR_SECRET_TOKEN_HERE') {
        abort(404);
    }
    Artisan::call('storage:link');
    return 'Storage link created: ' . Artisan::output();
});
```

---

## 11. Permissions

The following directories must be writable by the web server:

```bash
chmod -R 775 storage/
chmod -R 775 bootstrap/cache/
```

On shared hosting, you may need `777` if the web server runs as a different user:

```bash
chmod -R 777 storage/
chmod -R 777 bootstrap/cache/
```

You can also set these via cPanel **File Manager** > right-click folder > **Change Permissions**.

---

## 12. Production Caching

After deployment, cache configuration and routes for better performance:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

> **Important:** After caching config, the `.env` file is no longer read at runtime. If you change `.env`, you must re-run `php artisan config:cache`.

---

## 13. SMTP / Email Setup

### Using cPanel Email
1. Create an email account in cPanel (e.g., `noreply@yourdomain.com`)
2. Use these `.env` settings:

```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=465
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your_email_password
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Motion AI"
```

### Using External SMTP (Gmail, Mailgun, etc.)

**Gmail:**
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
```
> Use a Gmail App Password (not your regular password). Enable 2FA first, then generate an App Password at https://myaccount.google.com/apppasswords.

**Mailgun:**
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_SECRET=your-mailgun-api-key
```

---

## 14. Update Procedure

When deploying new code:

### 1. Upload Files
Upload updated files via SFTP (FileZilla, WinSCP) or Git (if SSH available):
```bash
cd /home/USERNAME/motion-ai-api
git pull origin main
```

### 2. Install Dependencies
```bash
composer install --no-dev --optimize-autoloader
```

### 3. Run Migrations
```bash
php artisan migrate --force
```

### 4. Clear Caches
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

### 5. Re-cache for Production
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Without SSH
Upload files via SFTP, then use a one-time update route:

```php
// routes/web.php (REMOVE AFTER USE)
Route::get('/deploy/{token}', function ($token) {
    if ($token !== 'YOUR_SECRET_TOKEN_HERE') {
        abort(404);
    }
    Artisan::call('migrate', ['--force' => true]);
    Artisan::call('config:cache');
    Artisan::call('route:cache');
    Artisan::call('view:cache');
    return 'Deployed: ' . Artisan::output();
});
```

---

## 15. Rollback

### Strategy
Keep the previous release in a separate folder:

```
/home/USERNAME/
├── motion-ai-api/          # Current release
├── motion-ai-api-backup/   # Previous release
```

Before each deployment:
```bash
cp -r motion-ai-api motion-ai-api-backup
```

To rollback:
```bash
mv motion-ai-api motion-ai-api-failed
mv motion-ai-api-backup motion-ai-api
```

### Database Rollback
```bash
php artisan migrate:rollback
```

---

## 16. Next.js Frontend Deployment (Vercel)

**Namecheap shared hosting cannot reliably run Node.js server processes.** Deploy the frontend and admin Next.js apps to **Vercel** instead.

### Why Vercel
- Native Next.js support (zero configuration)
- Automatic HTTPS
- Preview deployments for every branch/PR
- Global edge network (fast worldwide)
- Free tier is generous for most projects

### Steps
1. Push your Next.js code to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Set the root directory if the Next.js app is in a subdirectory.
4. Add environment variables in Vercel Dashboard > Settings > Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
   - Any other env vars your frontend needs
5. Deploy. Vercel auto-deploys on every push to main.

### Custom Domain on Vercel
1. In Vercel Dashboard > Settings > Domains, add `yourdomain.com`.
2. Add the DNS records Vercel provides to your Namecheap DNS settings.
3. For the admin panel, use a separate Vercel project with `admin.yourdomain.com`.

### Alternative: Netlify
Netlify also supports Next.js via its adapter:
1. Install `@netlify/plugin-nextjs`
2. Deploy via Netlify CLI or Git integration
3. Similar features: HTTPS, preview deploys, CDN

---

## 17. SSL / HTTPS

### API Subdomain (Namecheap)
1. In cPanel, go to **SSL/TLS Status** or **AutoSSL**.
2. Run AutoSSL to provision a free SSL certificate for `api.yourdomain.com`.
3. AutoSSL renews automatically.

### Frontend/Admin (Vercel)
- HTTPS is automatic on Vercel. No configuration needed.
- Custom domains on Vercel also get automatic SSL.

### Force HTTPS
Add to your `.htaccess`:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## Quick Reference

| Service         | URL                                  | Hosting          |
|-----------------|--------------------------------------|------------------|
| API             | https://api.yourdomain.com           | Namecheap cPanel |
| Frontend        | https://yourdomain.com               | Vercel           |
| Admin Panel     | https://admin.yourdomain.com         | Vercel           |
| API Docs        | https://api.yourdomain.com/docs/api  | Namecheap cPanel |

---

## Troubleshooting

| Issue                        | Solution                                                       |
|------------------------------|----------------------------------------------------------------|
| 500 Internal Server Error    | Check `storage/logs/laravel.log`. Ensure permissions are set.  |
| Class not found              | Run `composer dump-autoload -o`                                |
| CORS errors                  | Check `CORS_ALLOWED_ORIGINS` in `.env`                         |
| Migrations won't run         | Verify database credentials. Try the one-time route method.    |
| Emails not sending           | Verify SMTP credentials. Check spam folder. Try `sync` mailer. |
| Storage files not accessible | Re-run `storage:link` or manually copy files.                  |
| PHP version mismatch         | Set PHP 8.2+ in MultiPHP Manager for your subdomain.           |
