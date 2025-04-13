'use client';

import { useState } from 'react';
import { ShoppingBag, Filter, Search, Star, ShoppingCart } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for market items
const marketItems = [
  {
    id: 1,
    name: 'SLOTJACK Premium Üyelik (1 Ay)',
    image: 'https://picsum.photos/id/1045/400/400',
    price: 99.99,
    category: 'membership',
    rating: 4.8,
    reviews: 125,
    description: 'Premium üyelik ile tüm özelliklere erişim ve özel avantajlar.',
  },
  {
    id: 2,
    name: 'SLOTJACK T-Shirt',
    image: 'https://picsum.photos/id/1046/400/400',
    price: 29.99,
    category: 'merchandise',
    rating: 4.5,
    reviews: 48,
    description: 'Resmi SLOTJACK T-shirt, %100 pamuk.',
  },
  {
    id: 3,
    name: 'SLOTJACK Hoodie',
    image: 'https://picsum.photos/id/1047/400/400',
    price: 59.99,
    category: 'merchandise',
    rating: 4.7,
    reviews: 32,
    description: 'Resmi SLOTJACK Hoodie, sıcak ve rahat.',
  },
  {
    id: 4,
    name: 'SLOTJACK Mouse Pad',
    image: 'https://picsum.photos/id/1048/400/400',
    price: 14.99,
    category: 'accessories',
    rating: 4.3,
    reviews: 67,
    description: 'Yüksek kaliteli oyun mouse pad.',
  },
  {
    id: 5,
    name: 'SLOTJACK Premium Üyelik (3 Ay)',
    image: 'https://picsum.photos/id/1049/400/400',
    price: 249.99,
    category: 'membership',
    rating: 4.9,
    reviews: 89,
    description: '3 aylık premium üyelik ile tüm özelliklere erişim ve özel avantajlar.',
  },
  {
    id: 6,
    name: 'SLOTJACK Cap',
    image: 'https://picsum.photos/id/1050/400/400',
    price: 19.99,
    category: 'merchandise',
    rating: 4.4,
    reviews: 42,
    description: 'Resmi SLOTJACK şapka, ayarlanabilir.',
  },
  {
    id: 7,
    name: 'SLOTJACK Premium Üyelik (1 Yıl)',
    image: 'https://picsum.photos/id/1051/400/400',
    price: 899.99,
    category: 'membership',
    rating: 4.9,
    reviews: 56,
    description: '1 yıllık premium üyelik ile tüm özelliklere erişim ve özel avantajlar.',
  },
  {
    id: 8,
    name: 'SLOTJACK Mug',
    image: 'https://picsum.photos/id/1052/400/400',
    price: 12.99,
    category: 'accessories',
    rating: 4.6,
    reviews: 38,
    description: 'Resmi SLOTJACK kahve fincanı.',
  },
  {
    id: 9,
    name: 'SLOTJACK Sticker Pack',
    image: 'https://picsum.photos/id/1053/400/400',
    price: 9.99,
    category: 'accessories',
    rating: 4.7,
    reviews: 92,
    description: '10 adet SLOTJACK çıkartması içeren paket.',
  },
];

// Filter options
const filterOptions = [
  { id: 'all', name: 'Tümü' },
  { id: 'membership', name: 'Üyelikler' },
  { id: 'merchandise', name: 'Giyim' },
  { id: 'accessories', name: 'Aksesuarlar' },
];

export default function MarketPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<number[]>([]);

  // Filter items based on selected category and search query
  const filteredItems = marketItems.filter(
    (item) => 
      (selectedFilter === 'all' || item.category === selectedFilter) &&
      (searchQuery === '' || 
       item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
       item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Function to add item to cart
  const addToCart = (itemId: number) => {
    setCartItems([...cartItems, itemId]);
  };

  // Function to check if item is in cart
  const isInCart = (itemId: number) => {
    return cartItems.includes(itemId);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Market" 
        description="SLOTJACK ürünleri ve üyelikler" 
        icon={ShoppingBag} 
      />

      {/* Search and filter section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-400" />
            <h2 className="text-lg font-semibold mr-4">Filtrele</h2>
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedFilter(option.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedFilter === option.id
                      ? 'bg-[#FF6B00] text-white'
                      : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#2A2A2A]'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Market items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-64">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-gray-400 mb-4">{item.description}</p>
              <div className="flex items-center mb-4">
                <div className="flex items-center mr-4">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span className="font-medium">{item.rating}</span>
                </div>
                <span className="text-gray-400">({item.reviews} değerlendirme)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#FF6B00]">{item.price.toFixed(2)} TL</span>
                <button 
                  onClick={() => addToCart(item.id)}
                  disabled={isInCart(item.id)}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isInCart(item.id)
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FF6B00] hover:bg-[#FF8533] text-white'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart(item.id) ? 'Sepette' : 'Sepete Ekle'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 