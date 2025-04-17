'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ClientLayout from '@/components/ClientLayout';
import { handlePaymentSuccess } from '@/services/StripeService';
import { CheckCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError('No session ID found');
      setVerifying(false);
      return;
    }
    
    // Verify the payment
    const verifyPayment = async () => {
      try {
        const success = await handlePaymentSuccess(sessionId);
        setVerified(success);
        
        // If payment was successful, redirect after a delay
        if (success) {
          setTimeout(() => {
            router.push('/');
          }, 5000);
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setError('Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };
    
    verifyPayment();
  }, [searchParams, router]);
  
  return (
    <ClientLayout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {verifying ? (
            <div className="p-8 text-center">
              <div className="inline-block w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Ödemeniz İşleniyor</h2>
              <p className="text-gray-400">Lütfen bekleyin, ödemeniz doğrulanıyor...</p>
            </div>
          ) : verified ? (
            <div className="p-8 text-center">
              <div className="mb-6 flex justify-center">
                <CheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-green-400">Ödeme Başarılı!</h2>
              <p className="text-lg mb-6">Ödemeniz başarıyla tamamlandı.</p>
              <p className="text-gray-400 mb-8">Satın aldığınız öğeler hesabınıza eklenmiştir.</p>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
                <Link 
                  href="/"
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Ana Sayfaya Dön
                </Link>
                <Link 
                  href="/profil"
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Satın Alımlarımı Gör
                </Link>
              </div>
              
              <p className="mt-8 text-sm text-gray-500">5 saniye içinde otomatik olarak yönlendirileceksiniz.</p>
            </div>
          ) : (
            <div className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-2 text-red-400">Ödeme Doğrulanamadı</h2>
              <p className="text-gray-400 mb-6">{error || 'Ödemeniz doğrulanırken bir hata oluştu.'}</p>
              
              <Link 
                href="/"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg inline-flex items-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ana Sayfaya Dön
              </Link>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 