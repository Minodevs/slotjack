import { NextRequest, NextResponse } from 'next/server';
// @ts-ignore
import Stripe from 'stripe';
import { PaymentItem } from '@/services/StripeService';
import { SpinWheelService } from '@/services/SpinWheelService';

// Initialize Stripe with your secret key
// Use test key for development
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_your_test_key', {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const { items, userId } = await req.json();

    if (!items || !items.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
        },
        unit_amount: item.unitAmount,
      },
      quantity: item.quantity,
    }));

    // Create metadata to pass to the webhook
    const metadata: Record<string, string> = {
      userId,
    };

    // Add details about what's being purchased
    items.forEach((item: any, index: number) => {
      metadata[`item_${index}_type`] = item.type;
      metadata[`item_${index}_quantity`] = item.quantity.toString();
      
      if (item.id) {
        metadata[`item_${index}_id`] = item.id;
      }
      
      if (item.metadata) {
        Object.entries(item.metadata).forEach(([key, value]) => {
          metadata[`item_${index}_${key}`] = value as string;
        });
      }
    });

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancel`,
      metadata,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error.message);
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    );
  }
} 