import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { MarketService } from '@/services/MarketService';
import { UserService } from '@/services/UserService';

// Initialize Stripe with the secret key
// Use environment variable for the Stripe secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Stripe webhook secret (use environment variable in production)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature') || '';
    
    let event;
    
    // Verify webhook signature
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }
    
    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (!session.metadata) {
        return NextResponse.json({ error: 'No metadata found' }, { status: 400 });
      }
      
      const { userId, itemTypes, itemDetails } = session.metadata;
      
      if (!userId || !itemTypes || !itemDetails) {
        return NextResponse.json({ error: 'Incomplete metadata' }, { status: 400 });
      }
      
      const user = await UserService.getUserById(userId);
      
      if (!user) {
        console.error(`User not found: ${userId}`);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      // Parse the item details
      const parsedItems = JSON.parse(itemDetails);
      
      // Process each item based on its type
      for (const item of parsedItems) {
        switch (item.type) {
          case 'spin':
            // Add extra spins to the user
            const extraSpins = item.quantity || 1;
            user.spinCount = (user.spinCount || 0) + extraSpins;
            console.log(`Added ${extraSpins} spins to user ${userId}`);
            break;
            
          case 'jackcoins':
            // Add JackCoins to the user
            const coinAmount = item.quantity || 1;
            user.jackCoins = (user.jackCoins || 0) + coinAmount;
            console.log(`Added ${coinAmount} JackCoins to user ${userId}`);
            break;
            
          case 'market_item':
            // Process market item purchase
            if (item.id) {
              const marketItem = await MarketService.getItemById(item.id);
              if (marketItem) {
                // Add the item to user's inventory
                if (!user.inventory) user.inventory = [];
                user.inventory.push({
                  id: marketItem.id,
                  name: marketItem.name,
                  dateAdded: new Date().toISOString(),
                  used: false,
                  ...item.metadata
                });
                
                // Decrease market item stock if it's not virtual
                if (!marketItem.isVirtual) {
                  marketItem.stock = Math.max(0, (marketItem.stock || 0) - (item.quantity || 1));
                  await MarketService.updateItem(marketItem);
                }
                
                console.log(`Added market item ${marketItem.name} to user ${userId}`);
              }
            }
            break;
            
          default:
            console.warn(`Unknown item type: ${item.type}`);
        }
      }
      
      // Save the updated user
      await UserService.updateUser(user);
      
      return NextResponse.json({ received: true });
    }
    
    // Return a 200 for other events
    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
} 