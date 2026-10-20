<?php

namespace App\Exceptions;

use Exception;

class ApiException extends Exception
{
    protected $errors;

    public function __construct(string $message = 'Error', int $code = 400, $errors = null)
    {
        parent::__construct($message, $code);
        $this->errors = $errors;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $this->getMessage(),
            'data' => null,
            'errors' => $this->errors,
        ], $this->getCode());
    }
}
