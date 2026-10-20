<?php

namespace App\Enums;

enum LicenseType: string
{
    case Trial = 'trial';
    case Paid = 'paid';
}
