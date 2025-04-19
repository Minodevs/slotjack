'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Info, AlertTriangle, ShoppingBag, Tag, Search, Filter, Coins } from 'lucide-react';
import { MarketItem, MARKET_CATEGORIES, MARKET_ITEMS_STORAGE_KEY } from '@/types/market';
import { toast } from 'react-hot-toast';
import ClientLayout from '@/components/ClientLayout';
import GridCard, { 
  GridCardContainer, 
  GridCardContent, 
  GridCardFooter, 
  GridCardImage, 
  GridCardTitle, 
  GridCardDescription 
} from '@/components/GridCard';

export default function MarketPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MarketItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MarketItem | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user from auth context
  const { user } = authContext || {};
  const userPoints = user?.jackPoints || 0;

  // Load market items from API and fall back to localStorage if API fails
  useEffect(() => {
    const loadMarketItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Add timestamp to prevent caching
        const response = await fetch(`/api/market/items?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.items && Array.isArray(data.items)) {
          console.log('Loaded market items:', data.items.length);
          setMarketItems(data.items);
          setFilteredItems(data.items);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error loading market items:', error);
        setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        
        // Try to load from localStorage as fallback
        try {
          const storedItems = localStorage.getItem(MARKET_ITEMS_STORAGE_KEY);
          if (storedItems) {
            const parsedItems = JSON.parse(storedItems);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              setMarketItems(parsedItems);
              setFilteredItems(parsedItems);
              toast.success('Veriler çevrimdışı modda yüklendi');
            }
          }
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadMarketItems();
  }, []);
  
  // Filter items based on search query and category
  useEffect(() => {
    if (!marketItems.length) return;
    
    let filtered = [...marketItems];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.description.toLowerCase().includes(query)
      );
    }
    
    // Move featured items to the top
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
    
    setFilteredItems(filtered);
  }, [marketItems, searchQuery]);
  
  // Handle purchase click
  const handlePurchaseClick = (item: MarketItem) => {
    if (!user) {
      toast.error('Satın alma işlemi için giriş yapmalısınız');
      router.push('/auth/login');
      return;
    }
    
    if (userPoints < item.points) {
      toast.error('Yeterli JackPoint\'iniz bulunmamaktadır');
      return;
    }
    
    setSelectedItem(item);
    setIsPurchaseModalOpen(true);
  };
  
  // Complete purchase
  const completePurchase = () => {
    if (!selectedItem || !user || !authContext) return;
    
    // Deduct points from user
    const newPoints = userPoints - selectedItem.points;
    
    // Update user points in context (updateJackPoints is the method in AuthContext)
    if (authContext.updateJackPoints) {
      authContext.updateJackPoints(
        -selectedItem.points, 
        `${selectedItem.name} satın alındı`, 
        'spend'
      );
    }
    
    // Close modal
    setIsPurchaseModalOpen(false);
    
    // Show success toast with Telegram contact info
    toast.success('Satın alma işlemi başarılı! Telegram üzerinden bizimle iletişime geçin: @slotjack');
  };
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
            <ArrowLeft className="w-5 h-5 mr-1" /> Ana Sayfaya Dön
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Puan Marketi</h1>
            <p className="text-gray-400 text-sm mt-1">Kazandığınız puanlar ile markette bulunan kartlardan taleplerinizi gerçekleştirin!</p>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
              <p>{error}</p>
            </div>
          </div>
        )}
        
        {/* Warning Banner */}
        <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="bg-amber-500 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
              <AlertTriangle className="text-black w-4 h-4" />
            </div>
            <div>
              <p className="text-amber-500 font-semibold text-sm mb-1">Üyeler Ayda 1 Kere Nakit Ödül Alabilir.</p>
              <p className="text-amber-200 text-xs">Mutil hesapla kasım sağlayanların puanları iptal edilmeyecek ve etkinliklerden men edilecektir.</p>
            </div>
          </div>
        </div>
        
        {/* Item Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-400 mb-6">Arama kriterlerinize uygun ürün bulunamadı.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory(null);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md inline-flex items-center"
            >
              <Filter className="w-4 h-4 mr-1.5" /> Filtreleri Temizle
            </button>
          </div>
        ) : (
          <GridCardContainer>
            {filteredItems.map((item) => (
              <GridCard key={item.id}>
                {/* Product Name */}
                <div className="px-3 py-2 text-center border-b border-gray-700">
                  <GridCardTitle>{item.name}</GridCardTitle>
                </div>
                
                {/* Product Image */}
                <GridCardImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-36"
                />
                
                {/* Product Description */}
                <GridCardContent>
                  <GridCardDescription title={item.description}>
                    {item.description}
                  </GridCardDescription>
                </GridCardContent>
                
                {/* Product Footer */}
                <GridCardFooter className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-bold text-white text-sm">{item.points}</span>
                  </div>
                  
                  <button
                    onClick={() => handlePurchaseClick(item)}
                    className="bg-[#FF6B00] hover:bg-[#E05A00] text-white text-xs font-medium px-3 py-1 rounded"
                    disabled={userPoints < item.points}
                  >
                    Satın Al
                  </button>
                </GridCardFooter>
              </GridCard>
            ))}
          </GridCardContainer>
        )}
      </div>
      
      {/* Purchase Confirmation Modal */}
      {isPurchaseModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-4">Satın Alma Onayı</h3>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="relative w-16 h-16 bg-gray-800 rounded overflow-hidden mr-4 flex-shrink-0">
                    <Image
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      fill
                      style={{ objectFit: 'contain' }}
                      className="p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium">{selectedItem.name}</h4>
                    <div className="flex items-center mt-1 text-yellow-500">
                      <Coins className="w-4 h-4 mr-1" />
                      <span className="font-bold">{selectedItem.points} JackPoint</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-300 mb-2">Bu ürünü satın almak istiyor musunuz?</p>
                <p className="text-sm text-gray-400">
                  Satın alma işlemi sonrasında puanlarınız düşürülecek ve ürün bilgileriniz size tanımlanacaktır.
                  Telegram üzerinden bizimle iletişime geçmeniz gerekmektedir.
                </p>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600"
                >
                  İptal
                </button>
                
                <button
                  onClick={completePurchase}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  Onaylıyorum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
} 