// Creates a payment record for bank transfer, or a Stripe session for card
// Stripe integration stub – wire up STRIPE_SECRET_KEY to enable card payments
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const PRICE_PER_SEAT_YEAR = 49;
const TEAM_PRICE_PER_SEAT_YEAR = 39; // 5+ seats

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    seats:   number;
    years:   number;
    method:  "card" | "bank";
    txRef?:  string;
  };

  const { seats, years, method, txRef } = body;

  if (!seats || !years || !method) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const pricePerSeatYear = seats >= 5 ? TEAM_PRICE_PER_SEAT_YEAR : PRICE_PER_SEAT_YEAR;
  const amount = seats * years * pricePerSeatYear;

  if (method === "bank") {
    if (!txRef) return NextResponse.json({ error: "Transaction reference required" }, { status: 400 });

    await prisma.payment.create({
      data: {
        userId:    session.user.id,
        method:    "BANK_TRANSFER",
        status:    "PENDING",
        amount,
        currency:  "USD",
        seatCount: seats,
        yearCount: years,
        bankTxRef: txRef,
      },
    });

    return NextResponse.json({ ok: true, message: "Payment request submitted. Admin will review within 24 hours." });
  }

  // ── Card payment (Stripe) ──────────────────────────────────────────
  // Uncomment and configure when STRIPE_SECRET_KEY is set
  //
  // import Stripe from "stripe";
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const stripeSession = await stripe.checkout.sessions.create({
  //   mode: "payment",
  //   line_items: [{ price_data: { currency: "usd", product_data: { name: "Motion AI License" }, unit_amount: amount * 100 }, quantity: 1 }],
  //   success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
  //   cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  //   metadata: { userId: session.user.id, seats: String(seats), years: String(years) },
  // });
  // return NextResponse.json({ url: stripeSession.url });

  return NextResponse.json({ error: "Card payments not configured yet. Please use bank transfer." }, { status: 503 });
}
