<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use App\Traits\ApiResponses;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    use ApiResponses;

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role !== Role::Admin) {
            return $this->error('Forbidden. Admin access required.', 403);
        }

        return $next($request);
    }
}
