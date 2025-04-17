'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import { Coins, ShoppingBag, CalendarCheck, Bell, AlertTriangle } from 'lucide-react';
import ClientLayout from '../../components/ClientLayout';
import { toast } from 'react-hot-toast';

// Define the MarketItem interface
interface MarketItem {
  id: string;
  name: string;
  price: string;
  points: number;
  description: string;
  imageUrl: string;
  category?: string;
  stock?: number | null;
  featured?: boolean;
  virtual?: boolean;
  priceValue?: number;
}

// Local storage key for market items
const MARKET_ITEMS_STORAGE_KEY = 'slotjack_market_items';

// Default market items if none exist in localStorage
const defaultMarketItems: MarketItem[] = [
  { 
    id: '1', 
    name: 'Esbet', 
    price: '30$',
    points: 3500,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Esbet kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/esbet.jpg',
    category: 'betting',
    stock: null,
    featured: true,
    virtual: true,
    priceValue: 30
  },
  { 
    id: '2', 
    name: 'BullBahis', 
    price: '30$',
    points: 3500,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere BullBahis kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/bullbahis.jpg',
    category: 'betting',
    stock: null,
    featured: true,
    virtual: true,
    priceValue: 30
  },
  { 
    id: '3', 
    name: 'Sterlinbet', 
    price: '1000₺',
    points: 3500,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Sterlinbet kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/sterlinbet.jpg',
    category: 'betting',
    stock: null,
    featured: false,
    virtual: true,
    priceValue: 1000
  },
  { 
    id: '4', 
    name: 'Siribet', 
    price: '1000₺',
    points: 3500,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Siribet kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/siribet.jpg',
    category: 'betting',
    stock: null,
    featured: false,
    virtual: true,
    priceValue: 1000
  },
  { 
    id: '5', 
    name: 'Risebet', 
    price: '20$',
    points: 3000,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Risebet kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/risebet20.jpg',
    category: 'betting',
    stock: null,
    featured: false,
    virtual: true,
    priceValue: 20
  },
  { 
    id: '6', 
    name: 'Risebet', 
    price: '10$',
    points: 2500,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Risebet kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/risebet10.jpg',
    category: 'betting',
    stock: null,
    featured: false,
    virtual: true,
    priceValue: 10
  },
  { 
    id: '7', 
    name: 'Baywin', 
    price: '1000₺',
    points: 3500,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Baywin kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/baywin.jpg',
    category: 'betting',
    stock: null,
    featured: false,
    virtual: true,
    priceValue: 1000
  },
  { 
    id: '8', 
    name: 'Zlot', 
    price: '1000₺',
    points: 3500,
    description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Zlot kullanıcı adınızı iletmeniz Gerekmektedir.',
    imageUrl: '/market-img/zlot.jpg',
    category: 'betting',
    stock: null,
    featured: false,
    virtual: true,
    priceValue: 1000
  }
];

// Sample daily tasks
const dailyTasks = [
  {
    id: '1',
    name: 'Günlük Giriş',
    description: 'Siteye giriş yap',
    reward: 50,
    completed: true
  },
  {
    id: '2',
    name: 'Etkinlik Takvimini İncele',
    description: 'Etkinlik takvimindeki en az 3 etkinliği görüntüle',
    reward: 25,
    completed: false
  },
  {
    id: '3',
    name: 'Sohbete Katıl',
    description: 'Genel sohbette en az bir mesaj gönder',
    reward: 35,
    completed: false
  },
  {
    id: '4',
    name: 'Profili Güncelle',
    description: 'Profil bilgilerini veya fotoğrafını güncelle',
    reward: 40,
    completed: false
  }
];

export default function MarketPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('market');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Load market items from localStorage
  useEffect(() => {
    loadMarketItems();
  }, []);
  
  // Check if user is logged in
  useEffect(() => {
    if (user) {
      setLoading(false);
    } else {
      // If not logged in, still allow viewing the market but disable purchases
      setLoading(false);
    }
  }, [user, loading, router]);
  
  // Load market items from localStorage
  const loadMarketItems = () => {
    try {
      const storedItems = localStorage.getItem(MARKET_ITEMS_STORAGE_KEY);
      if (storedItems) {
        const items = JSON.parse(storedItems);
        setMarketItems(items);
      } else {
        // Initialize with default items if none exist
        setMarketItems(defaultMarketItems);
        localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(defaultMarketItems));
      }
      setLoading(false);
    } catch (err) {
      console.error('Error loading market items:', err);
      setError('Ürünler yüklenirken bir hata oluştu');
      setMarketItems(defaultMarketItems);
      setLoading(false);
    }
  };
  
  // Handle purchase
  const handlePurchase = (item: MarketItem) => {
    if (!user) {
      toast.error('Satın almak için giriş yapmalısınız');
      return;
    }
    
    // Check if user has enough points
    if (user.jackPoints < item.points) {
      toast.error('Yeterli JackPoint bakiyeniz bulunmuyor');
      return;
    }
    
    // Deduct points from user's account
    const { updateJackPoints } = authContext;
    updateJackPoints(-item.points, `${item.name} ${item.price} satın alındı`, 'spend')
      .then((transaction) => {
        if (transaction) {
          // Purchase successful
          setNotification(`${item.name} ${item.price} başarıyla satın alındı!`);
          setTimeout(() => setNotification(null), 3000);
          toast.success(`${item.name} ${item.price} başarıyla satın alındı!`);
        } else {
          toast.error('İşlem sırasında bir hata oluştu');
        }
      })
      .catch((error) => {
        console.error('Purchase error:', error);
        toast.error('İşlem sırasında bir hata oluştu');
      });
  };
  
  // Complete task
  const completeTask = (task: typeof dailyTasks[0]) => {
    if (!user) {
      toast.error('Görev tamamlamak için giriş yapmalısınız');
      return;
    }
    
    if (task.completed) {
      toast.error('Bu görev zaten tamamlandı');
      return;
    }
    
    // Update task status and add points to user account
    const { updateJackPoints } = authContext;
    updateJackPoints(task.reward, `${task.name} görevi tamamlandı`, 'earn')
      .then((transaction) => {
        if (transaction) {
          // Update task status locally
          const updatedTasks = dailyTasks.map(t =>
            t.id === task.id ? { ...t, completed: true } : t
          );
          
          // Show success notification
          toast.success(`${task.reward} JackPoint kazandınız!`);
        } else {
          toast.error('İşlem sırasında bir hata oluştu');
        }
      })
      .catch((error) => {
        console.error('Task completion error:', error);
        toast.error('İşlem sırasında bir hata oluştu');
      });
  };
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-[#FF6B00] border-gray-600 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-6">
        {notification && (
          <div className="fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center z-50">
            <Bell className="mr-2 h-5 w-5" />
            {notification}
          </div>
        )}

        <div className="mb-6">
          <div className="flex items-center bg-orange-900/30 border border-orange-800 text-orange-100 px-4 py-3 rounded-md">
            <AlertTriangle className="text-orange-500 w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-orange-400 text-lg">Üyeler Ayda 1 Kere Nakit Ödül Alabilir.</h2>
              <p className="text-sm">Multi hesapla katılım sağlayanların puanları iade edilmeyecek ve etkinliklerden men edilecektir.</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <span className="bg-yellow-500 text-black font-bold rounded-full p-1 mr-2">
                <Coins className="w-5 h-5" />
              </span>
              JACKCOIN MARKET
            </h1>
          </div>
          {user && (
            <div className="bg-gray-800 px-4 py-2 rounded-lg flex items-center">
              <Coins className="text-yellow-500 w-5 h-5 mr-2" />
              <span className="text-yellow-400 font-semibold">{user.jackPoints || 0} JackPoints</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('market')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === 'market' 
                ? 'bg-[#FF6B00] text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              <span>Market</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-lg flex items-center ${
              activeTab === 'tasks' 
                ? 'bg-[#FF6B00] text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center">
              <CalendarCheck className="w-5 h-5 mr-2" />
              <span>JackPoint Kazan</span>
            </div>
          </button>
        </div>
        
        {activeTab === 'market' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {marketItems.length === 0 ? (
              <div className="col-span-4 bg-gray-800 rounded-lg p-8 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">Şu anda ürün bulunmamaktadır</h3>
                <p className="text-gray-400">Daha sonra tekrar kontrol edin veya görevleri tamamlayarak JackPoint kazanın.</p>
              </div>
            ) : (
              marketItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 hover:-translate-y-1"
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <div className="relative h-48">
                    {item.imageUrl ? (
                      <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${item.imageUrl})`}}></div>
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-r from-indigo-500 to-purple-600">
                        <span className="text-white text-5xl font-bold">{item.price}</span>
                      </div>
                    )}
                    {item.featured && (
                      <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-medium px-2 py-1 rounded-full">
                        Öne Çıkan
                      </span>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-white mb-1">{item.name} {item.price}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-gray-700 rounded-full w-7 h-7 flex items-center justify-center mr-2">
                          <Coins className="w-4 h-4 text-yellow-500" />
                        </div>
                        <span className="text-yellow-400 font-semibold">{item.points}</span>
                      </div>
                      <button
                        onClick={() => handlePurchase(item)}
                        className="bg-[#FF6B00] hover:bg-orange-600 text-white px-3 py-1.5 rounded font-medium transition-colors"
                        disabled={user ? user.jackPoints < item.points : true}
                      >
                        Satın Al
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">Günlük Görevler</h2>
            <div className="grid gap-4">
              {dailyTasks.map(task => (
                <div key={task.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{task.name}</h3>
                      <p className="text-gray-400 text-sm">{task.description}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Coins className="text-[#FF6B00] w-4 h-4 mr-1" />
                        <span>{task.reward}</span>
                      </div>
                      <button 
                        onClick={() => completeTask(task)}
                        className={`px-3 py-1 rounded-lg ${task.completed 
                          ? 'bg-green-900/50 text-green-400 cursor-not-allowed' 
                          : 'bg-[#FF6B00] hover:bg-[#FF8533]'}`}
                        disabled={task.completed}
                      >
                        {task.completed ? 'Tamamlandı' : 'Tamamla'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 