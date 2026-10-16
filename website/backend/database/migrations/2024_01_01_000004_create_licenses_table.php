<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('licenses', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('license_key')->unique();
            $table->string('type')->default('paid');
            $table->string('status')->default('active');
            $table->timestamp('purchased_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('updated_until')->nullable();
            $table->integer('seat_count')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licenses');
    }
};
