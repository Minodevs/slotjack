import { loadStripe } from '@stripe/stripe-js';

// Use test key for development, will be replaced with live key in production
const STRIPE_PUBLIC_KEY = 'pk_test_TYooMQauvdEDq54NiTphI7jx';

let stripePromise: Promise<any> | null = null;

/**
 * Initialize and get the Stripe instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  }
  return stripePromise;
};

/**
 * Payment item interface for checkout
 */
export interface PaymentItem {
  id: string;
  name: string;
  description: string;
  price: number; // Price in smallest currency unit (cents for USD)
  quantity: number;
  type: 'spin' | 'coin' | 'item'; // Type of purchase
  metadata?: Record<string, string>; // Additional metadata
}

/**
 * Create a checkout session for the given items
 * @param items Items to be purchased
 * @param userId Current user's ID
 * @param successUrl URL to redirect on successful payment
 * @param cancelUrl URL to redirect on canceled payment
 */
export const createCheckoutSession = async (
  items: PaymentItem[],
  userId: string,
  successUrl: string = `${window.location.origin}/payment/success`,
  cancelUrl: string = `${window.location.origin}/payment/cancel`
) => {
  try {
    // Call our API to create a checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        userId,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }

    const session = await response.json();
    
    // Redirect to Stripe checkout
    const stripe = await getStripe();
    const { error } = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (error) {
      console.error('Stripe checkout error:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

/**
 * Handle payment success
 * @param sessionId The Stripe session ID from the success URL query parameter
 */
export const handlePaymentSuccess = async (sessionId: string) => {
  try {
    // Verify payment with our backend
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
};

/**
 * Purchase additional spin wheel chances
 * @param quantity Number of spins to purchase
 * @param userId User ID
 */
export const purchaseAdditionalSpins = async (quantity: number, userId: string) => {
  try {
    const items: PaymentItem[] = [
      {
        id: 'spin-wheel-chance',
        name: 'Spin Wheel Chance',
        description: `${quantity} additional spin${quantity > 1 ? 's' : ''} for the JackCoin Wheel`,
        price: 100, // $1.00 per spin
        quantity,
        type: 'spin',
        metadata: {
          spinQuantity: quantity.toString(),
        },
      },
    ];
    
    await createCheckoutSession(items, userId);
    return true;
  } catch (error) {
    console.error('Error purchasing additional spins:', error);
    return false;
  }
};

/**
 * Purchase JackCoins via Stripe
 * @param coinAmount Number of coins to purchase
 * @param userId User ID
 */
export const purchaseJackCoins = async (coinAmount: number, userId: string) => {
  try {
    // Calculate price based on coin amount (e.g., 100 coins = $1)
    const price = Math.ceil(coinAmount / 100);
    
    const items: PaymentItem[] = [
      {
        id: 'jackcoins-purchase',
        name: 'JackCoins Purchase',
        description: `${coinAmount} JackCoins`,
        price: price * 100, // Price in cents
        quantity: 1,
        type: 'coin',
        metadata: {
          coinAmount: coinAmount.toString(),
        },
      },
    ];
    
    await createCheckoutSession(items, userId);
    return true;
  } catch (error) {
    console.error('Error purchasing JackCoins:', error);
    return false;
  }
};

/**
 * Get price in formatted currency (e.g., $10.00)
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
  }).format(amount / 100);
}

// Predefined products for spins
export const spinProducts: PaymentItem[] = [
  {
    id: 'spin_1',
    name: '1 Ekstra Çevirme Hakkı',
    description: 'Çark çevirme oyunu için 1 ekstra çevirme hakkı',
    price: 1000, // 10.00 TRY in kuruş
    quantity: 1,
    type: 'spin',
    metadata: {
      spinCount: '1'
    }
  },
  {
    id: 'spin_3',
    name: '3 Ekstra Çevirme Hakkı',
    description: 'Çark çevirme oyunu için 3 ekstra çevirme hakkı',
    price: 2500, // 25.00 TRY in kuruş
    quantity: 3,
    type: 'spin',
    metadata: {
      spinCount: '3'
    }
  },
  {
    id: 'spin_5',
    name: '5 Ekstra Çevirme Hakkı',
    description: 'Çark çevirme oyunu için 5 ekstra çevirme hakkı + Bonus',
    price: 4000, // 40.00 TRY in kuruş
    quantity: 5,
    type: 'spin',
    metadata: {
      spinCount: '5'
    }
  },
];

// Predefined products for coin purchases
export const coinProducts: PaymentItem[] = [
  {
    id: 'coins_500',
    name: '500 JackCoin',
    description: '500 JackCoin satın alın',
    price: 5000, // 50.00 TRY in kuruş
    quantity: 500,
    type: 'coin',
    metadata: {
      coinAmount: '500'
    }
  },
  {
    id: 'coins_1000',
    name: '1000 JackCoin',
    description: '1000 JackCoin satın alın',
    price: 9000, // 90.00 TRY in kuruş
    quantity: 1000,
    type: 'coin',
    metadata: {
      coinAmount: '1000'
    }
  },
  {
    id: 'coins_2500',
    name: '2500 JackCoin',
    description: '2500 JackCoin satın alın - BONUS',
    price: 20000, // 200.00 TRY in kuruş
    quantity: 2500,
    type: 'coin',
    metadata: {
      coinAmount: '2500'
    }
  },
]; 