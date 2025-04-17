'use client';

import ClientLayout from '@/components/ClientLayout';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <ClientLayout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="p-8 text-center">
            <div className="mb-6 flex justify-center">
              <XCircle className="w-20 h-20 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-orange-400">Ödeme İptal Edildi</h2>
            <p className="text-lg mb-6">Ödeme işleminiz iptal edildi veya tamamlanmadı.</p>
            <p className="text-gray-400 mb-8">Endişelenmeyin, hesabınızdan herhangi bir ücret tahsil edilmedi.</p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
              <Link 
                href="/"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Ana Sayfaya Dön
              </Link>
              <Link 
                href="/cark-cevir"
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-lg flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Tekrar Deneyin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 