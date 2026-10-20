#!/bin/sh
set -e
cd /var/www/html

# Laravel writable directories (a missing one = HTTP 500)
mkdir -p storage/app/public storage/app/private \
         storage/framework/cache/data storage/framework/sessions storage/framework/views \
         storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true
chmod -R ug+rwX storage bootstrap/cache 2>/dev/null || true

# The bind mount (.:/var/www/html) hides the vendor folder built in the image
if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist
fi

# Stale package/service caches are a common cause of "Class not found" 500s
rm -f bootstrap/cache/packages.php bootstrap/cache/services.php

[ -e public/storage ] || php artisan storage:link 2>/dev/null || true

exec "$@"
