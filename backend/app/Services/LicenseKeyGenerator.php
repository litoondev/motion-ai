<?php

namespace App\Services;

class LicenseKeyGenerator
{
    public static function generate(): string
    {
        $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I
        $segments = 8;
        $segLen = 5;
        $parts = [];

        for ($i = 0; $i < $segments; $i++) {
            $seg = '';
            for ($j = 0; $j < $segLen; $j++) {
                $seg .= $chars[random_int(0, strlen($chars) - 1)];
            }
            $parts[] = $seg;
        }

        return implode('-', $parts);
    }
}
