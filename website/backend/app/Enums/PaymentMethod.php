<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Card = 'card';
    case BankTransfer = 'bank_transfer';
    case Bkash = 'bkash';
    case Payoneer = 'payoneer';
    case Wise = 'wise';

    public function isManual(): bool
    {
        return $this !== self::Card;
    }
}
