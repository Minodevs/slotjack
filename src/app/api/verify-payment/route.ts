import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PaymentType } from '@/services/StripeService';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_YOUR_TEST_KEY', {
  apiVersion: '2023-10-16'
});

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent', 'line_items']
    });

    // Check if payment was successful
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, message: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Extract metadata from the session
    const metadata = session.metadata;
    
    if (!metadata) {
      return NextResponse.json(
        { success: false, message: 'No metadata found in session' },
        { status: 400 }
      );
    }

    const { userId, paymentType, itemId } = metadata;

    // In a production app, you would save the payment details to your database
    // and update the user's account with the purchased items or spins
    
    // Process the payment based on type
    switch (paymentType) {
      case PaymentType.SPIN_PURCHASE:
        // Add spin credits to user account
        const spinCount = parseInt(metadata.spinCount || '1', 10);
        await processSpinPurchase(userId, spinCount);
        break;
        
      case PaymentType.COIN_PURCHASE:
        // Add coins to user account
        const coinAmount = parseInt(metadata.coinAmount || '0', 10);
        await processCoinPurchase(userId, coinAmount);
        break;
        
      case PaymentType.ITEM_PURCHASE:
        // Process item purchase
        await processItemPurchase(userId, itemId);
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: 'Unknown payment type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      session,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

// Function to process spin purchase
async function processSpinPurchase(userId: string, spinCount: number) {
  // Here you would update your database to add spin credits to the user
  // For now, we'll just log it
  console.log(`Adding ${spinCount} spins to user ${userId}`);
  
  // In a real implementation, you would:
  // 1. Connect to your database
  // 2. Update the user's spin count
  // 3. Log the transaction
  
  return true;
}

// Function to process coin purchase
async function processCoinPurchase(userId: string, coinAmount: number) {
  // Here you would update your database to add coins to the user
  console.log(`Adding ${coinAmount} JackCoins to user ${userId}`);
  
  // In a real implementation, you would:
  // 1. Connect to your database
  // 2. Update the user's coin balance
  // 3. Log the transaction
  
  return true;
}

// Function to process item purchase
async function processItemPurchase(userId: string, itemId: string) {
  // Here you would process an item purchase
  console.log(`Processing item ${itemId} purchase for user ${userId}`);
  
  // In a real implementation, you would:
  // 1. Connect to your database
  // 2. Add the item to the user's inventory
  // 3. Log the transaction
  
  return true;
} 