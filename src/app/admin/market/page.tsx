'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '../../page';
import Image from 'next/image';
import { 
  ChevronLeft, Plus, Search, 
  ShoppingBag, X, Edit, Trash2, Save, 
  Tag, DollarSign, Package, Layers, Gift,
  Upload, AlertCircle, Coins
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import { toast } from 'react-hot-toast';

// Local storage key for market items
const MARKET_ITEMS_STORAGE_KEY = 'slotjack_market_items';

// Item category options
const itemCategories = [
  { value: 'clothing', label: 'Giyim' },
  { value: 'merchandise', label: 'Aksesuar' },
  { value: 'collectible', label: 'Koleksiyon' },
  { value: 'virtual', label: 'Sanal Ürün' },
  { value: 'ticket', label: 'Bilet/Kupon' },
  { value: 'betting', label: 'Bahis Sitesi' }
];

// MarketItem interface
interface MarketItem {
  id: string;
  name: string;
  price: number | string;
  points: number;
  category: string;
  description: string;
  imageUrl: string;
  stock?: number | null;
  featured: boolean;
  virtual: boolean;
  priceValue?: number;
}

export default function AdminMarketPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [marketItems, setMarketItems] = useState<MarketItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for adding/editing market item
  const [itemFormData, setItemFormData] = useState({
    name: '',
    price: 0,
    points: 0,
    category: '',
    description: '',
    imageUrl: '',
    stock: 100,
    featured: false,
    virtual: false,
    priceType: 'TRY' // Default currency type
  });
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin and load market items
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      loadMarketItems();
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
        // Get items from the market page if no stored items exist
        const defaultItems = [
          { 
            id: '1', 
            name: 'Esbet', 
            price: '30$',
            points: 3500,
            category: 'betting',
            description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Esbet kullanıcı adınızı iletmeniz Gerekmektedir.',
            imageUrl: '/market-img/esbet.jpg',
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
            category: 'betting',
            description: 'Market Üzerinden Satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere BullBahis kullanıcı adınızı iletmeniz Gerekmektedir.',
            imageUrl: '/market-img/bullbahis.jpg',
            stock: null,
            featured: true,
            virtual: true,
            priceValue: 30
          }
        ];
        setMarketItems(defaultItems);
        localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(defaultItems));
      }
    } catch (err) {
      console.error('Error loading market items:', err);
      setError('Ürünler yüklenirken bir hata oluştu');
    }
  };
  
  // Save market items to localStorage
  const saveMarketItems = (items: MarketItem[]) => {
    try {
      localStorage.setItem(MARKET_ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Error saving market items:', err);
      setError('Ürünler kaydedilirken bir hata oluştu');
    }
  };
  
  // Filter items based on search
  const filteredItems = marketItems.filter(item =>
    searchQuery === '' ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get category label from value
  const getCategoryLabel = (categoryValue: string) => {
    const category = itemCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  // Open modal for adding new item
  const handleAddItem = () => {
    setEditingItemId(null);
    setItemFormData({
      name: '',
      price: 0,
      points: 0,
      category: '',
      description: '',
      imageUrl: '',
      stock: 100,
      featured: false,
      virtual: false,
      priceType: 'TRY'
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
    setError(null);
  };
  
  // Open modal for editing item
  const handleEditItem = (item: MarketItem) => {
    setEditingItemId(item.id);
    
    // Handle different price formats
    let priceValue = 0;
    let priceType = 'TRY';
    
    if (typeof item.price === 'string') {
      if (item.price.includes('$')) {
        priceValue = Number(item.price.replace('$', ''));
        priceType = 'USD';
      } else if (item.price.includes('₺')) {
        priceValue = Number(item.price.replace('₺', ''));
        priceType = 'TRY';
      } else {
        priceValue = Number(item.price);
      }
    } else {
      priceValue = item.price;
    }
    
    setItemFormData({
      name: item.name,
      price: priceValue,
      points: item.points || 0,
      category: item.category || '',
      description: item.description,
      imageUrl: item.imageUrl || '',
      stock: item.stock === null ? 0 : (item.stock || 0),
      featured: item.featured || false,
      virtual: item.virtual || false,
      priceType
    });
    
    setImagePreview(item.imageUrl || '');
    setIsModalOpen(true);
    setError(null);
  };
  
  // Handle delete item
  const handleDeleteItem = (id: string) => {
    if (confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      const updatedItems = marketItems.filter(item => item.id !== id);
      setMarketItems(updatedItems);
      saveMarketItems(updatedItems);
      toast.success('Ürün başarıyla silindi');
    }
  };
  
  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Format price with currency
  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `${price}$`;
    } else if (currency === 'TRY') {
      return `${price}₺`;
    }
    return `${price}`;
  };
  
  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Form validation
      if (!itemFormData.name.trim()) {
        throw new Error('Ürün adı gereklidir');
      }
      
      if (itemFormData.price <= 0) {
        throw new Error('Ürün fiyatı sıfırdan büyük olmalıdır');
      }
      
      if (itemFormData.points <= 0) {
        throw new Error('JackPoint değeri sıfırdan büyük olmalıdır');
      }
      
      if (!itemFormData.category) {
        throw new Error('Kategori seçilmelidir');
      }
      
      // Create formatted price string
      const formattedPrice = formatPrice(Number(itemFormData.price), itemFormData.priceType);
      
      // Create new item data
      const itemData: MarketItem = {
        id: editingItemId || Date.now().toString(),
        name: itemFormData.name.trim(),
        price: formattedPrice,
        points: Number(itemFormData.points),
        category: itemFormData.category,
        description: itemFormData.description.trim(),
        imageUrl: imagePreview || itemFormData.imageUrl,
        stock: itemFormData.virtual ? null : Number(itemFormData.stock),
        featured: itemFormData.featured,
        virtual: itemFormData.virtual,
        priceValue: Number(itemFormData.price)
      };
      
      // Update existing item or add new item
      let updatedItems: MarketItem[];
      
      if (editingItemId) {
        // Update existing item
        updatedItems = marketItems.map(item => 
          item.id === editingItemId ? itemData : item
        );
        toast.success('Ürün başarıyla güncellendi');
      } else {
        // Add new item
        updatedItems = [...marketItems, itemData];
        toast.success('Yeni ürün başarıyla eklendi');
      }
      
      // Update state and save to storage
      setMarketItems(updatedItems);
      saveMarketItems(updatedItems);
      setIsModalOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Bilinmeyen bir hata oluştu');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
              <ChevronLeft className="w-5 h-5 mr-1" /> Admin Paneline Dön
            </Link>
            <h1 className="text-3xl font-bold text-white">Market Yönetimi</h1>
            <p className="text-gray-400">Ürünleri ekle, düzenle veya sil</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1.5" /> Yeni Ürün
            </button>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded-md mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Hata oluştu</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {filteredItems.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-400 mb-6">Arama kriterlerinize uygun ürün bulunamadı.</p>
            <button
              onClick={handleAddItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-1.5" /> Yeni Ürün Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <div className="relative h-48">
                  {item.imageUrl ? (
                    <div className="w-full h-full bg-cover bg-center bg-no-repeat" style={{backgroundImage: `url(${item.imageUrl})`}}></div>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-700">
                      <Package className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  {item.featured && (
                    <span className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-medium px-2 py-1 rounded-full">
                      Öne Çıkan
                    </span>
                  )}
                  {item.virtual && (
                    <span className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      Sanal Ürün
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-white">{item.name}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Düzenle"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <Tag className="w-4 h-4 mr-1.5" />
                    <span>{getCategoryLabel(item.category)}</span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 text-green-400 mr-1" />
                      <span className="text-white font-medium">{item.price}</span>
                    </div>
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-white font-medium">{item.points} JP</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Add/Edit Item Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  {editingItemId ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {error && (
                <div className="mx-6 mt-4 bg-red-900/50 border border-red-800 text-red-100 px-4 py-3 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                  <p>{error}</p>
                </div>
              )}
              
              <form onSubmit={handleFormSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Ürün Adı
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={itemFormData.name}
                      onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Fiyat
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full bg-gray-700 text-white border border-gray-600 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={itemFormData.price}
                        onChange={(e) => setItemFormData({ ...itemFormData, price: Number(e.target.value) })}
                        required
                      />
                      <select
                        className="bg-gray-700 text-white border border-gray-600 border-l-0 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={itemFormData.priceType}
                        onChange={(e) => setItemFormData({ ...itemFormData, priceType: e.target.value })}
                      >
                        <option value="TRY">₺</option>
                        <option value="USD">$</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      JackPoints Değeri
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={itemFormData.points}
                      onChange={(e) => setItemFormData({ ...itemFormData, points: Number(e.target.value) })}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Kategori
                    </label>
                    <select
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={itemFormData.category}
                      onChange={(e) => setItemFormData({ ...itemFormData, category: e.target.value })}
                      required
                    >
                      <option value="">Kategori Seçin</option>
                      {itemCategories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Görsel URL
                    </label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={itemFormData.imageUrl}
                      onChange={(e) => setItemFormData({ ...itemFormData, imageUrl: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-400 text-sm font-medium mb-2">
                      Stok Adedi
                    </label>
                    <input
                      type="number"
                      min="0"
                      className={`w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${itemFormData.virtual ? 'opacity-50' : ''}`}
                      value={itemFormData.stock}
                      onChange={(e) => setItemFormData({ ...itemFormData, stock: Number(e.target.value) })}
                      disabled={itemFormData.virtual}
                      placeholder={itemFormData.virtual ? 'Sınırsız' : ''}
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Görsel Yükle
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center justify-center px-4 py-2 bg-gray-700 border border-gray-600 rounded-md cursor-pointer hover:bg-gray-600 transition-colors">
                      <Upload className="w-5 h-5 mr-2" />
                      <span>Görsel Seç</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    {imagePreview && (
                      <div className="w-16 h-16 relative bg-gray-700 rounded-md overflow-hidden">
                        <div
                          className="w-full h-full bg-cover bg-center bg-no-repeat"
                          style={{ backgroundImage: `url(${imagePreview})` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-400 text-sm font-medium mb-2">
                    Açıklama
                  </label>
                  <textarea
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={itemFormData.description}
                    onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                  ></textarea>
                </div>
                
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mb-6">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500 rounded bg-gray-700 border-gray-600"
                      checked={itemFormData.featured}
                      onChange={(e) => setItemFormData({ ...itemFormData, featured: e.target.checked })}
                    />
                    <span className="ml-2 text-gray-300">Öne Çıkan Ürün</span>
                  </label>
                  
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-500 rounded bg-gray-700 border-gray-600"
                      checked={itemFormData.virtual}
                      onChange={(e) => setItemFormData({ 
                        ...itemFormData, 
                        virtual: e.target.checked,
                        stock: e.target.checked ? 0 : itemFormData.stock
                      })}
                    />
                    <span className="ml-2 text-gray-300">Sanal Ürün (sınırsız stok)</span>
                  </label>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-700 rounded-md text-gray-300 hover:bg-gray-600"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-1.5" />
                        {editingItemId ? 'Güncelle' : 'Kaydet'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 