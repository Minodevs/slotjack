import { User } from '@/types/User';

export interface PaymentItem {
  id?: string;
  name: string;
  description?: string;
  unitAmount: number; // in cents
  quantity: number;
  type: 'spin' | 'jackcoins' | 'market_item';
  metadata?: Record<string, any>;
}

export const PaymentService = {
  async createCheckoutSession(items: PaymentItem[], user: User) {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items, 
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
      return true;
    } catch (error: any) {
      console.error('Payment error:', error.message);
      return false;
    }
  },

  async handleSpinWheelPurchase(spinCount: number, user: User) {
    const items: PaymentItem[] = [
      {
        name: `${spinCount} Extra Spin${spinCount > 1 ? 's' : ''}`,
        description: `Purchase ${spinCount} extra spin${spinCount > 1 ? 's' : ''} for the prize wheel`,
        unitAmount: 100, // $1.00 per spin
        quantity: spinCount,
        type: 'spin'
      }
    ];

    return this.createCheckoutSession(items, user);
  },

  async handleJackCoinsPurchase(coinAmount: number, user: User) {
    const items: PaymentItem[] = [
      {
        name: `${coinAmount} JackCoin${coinAmount > 1 ? 's' : ''}`,
        description: `Purchase ${coinAmount} JackCoin${coinAmount > 1 ? 's' : ''}`,
        unitAmount: 10, // $0.10 per JackCoin
        quantity: coinAmount,
        type: 'jackcoins'
      }
    ];

    return this.createCheckoutSession(items, user);
  },

  async handleMarketItemPurchase(marketItem: any, user: User) {
    const items: PaymentItem[] = [
      {
        id: marketItem.id,
        name: marketItem.name,
        description: marketItem.description,
        unitAmount: marketItem.price * 100, // Convert to cents
        quantity: 1,
        type: 'market_item',
        metadata: {
          itemId: marketItem.id,
          category: marketItem.category,
          isVirtual: marketItem.isVirtual
        }
      }
    ];

    return this.createCheckoutSession(items, user);
  }
}; 