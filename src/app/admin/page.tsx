'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '../page';
import { 
  Users, Shield, MessageSquare, Calendar, Ticket, 
  Trophy, ShoppingBag, Heart, Settings, Home, Youtube, CreditCard, Gift
} from 'lucide-react';
import ClientLayout from '../../components/ClientLayout';

export default function AdminPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user) {
      setLoading(false);
    }
  }, [user, loading, router]);
  
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
  
  // Admin sections
  const adminSections = [
    { title: 'Üyelerimiz', icon: <Users className="w-8 h-8 text-blue-500" />, href: '/admin/users', description: 'Üye profillerini görüntüle ve yönet' },
    { title: 'Rol Yönetimi', icon: <Shield className="w-8 h-8 text-purple-500" />, href: '/admin/roles', description: 'Sistem genelinde rol yetkilerini yapılandırma' },
    { title: 'Sponsorlar', icon: <Heart className="w-8 h-8" />, href: '/admin/sponsorlar', description: 'Sponsorları ekle ve düzenle' },
    { title: 'Kod Yönetimi', icon: <Gift className="w-8 h-8 text-orange-500" />, href: '/admin/kod-yonetimi', description: 'Bonus kodları oluştur ve yönet' },
    { title: 'Sohbet Moderasyonu', icon: <MessageSquare className="w-8 h-8" />, href: '/admin/chat', description: 'Kötü kelime filtresi ve kullanıcı yasaklama' },
    { title: 'Etkinlikler', icon: <Calendar className="w-8 h-8" />, href: '/admin/etkinlikler', description: 'Etkinlik oluştur ve düzenle' },
    { title: 'Biletler', icon: <Ticket className="w-8 h-8" />, href: '/admin/biletler', description: 'Bilet oluştur ve yönet' },
    { title: 'Turnuvalar', icon: <Trophy className="w-8 h-8" />, href: '/admin/turnuvalar', description: 'Turnuva oluştur ve düzenle' },
    { title: 'Canlı Yayın', icon: <Youtube className="w-8 h-8 text-red-500" />, href: '/admin/livestream', description: 'YouTube canlı yayın ayarlarını yönet' },
    { title: 'Market', icon: <ShoppingBag className="w-8 h-8" />, href: '/admin/market', description: 'Market ürünlerini yönet' },
    { title: 'İşlemler', icon: <CreditCard className="w-8 h-8 text-yellow-500" />, href: '/admin/transactions', description: 'Kullanıcı işlemlerini görüntüle' },
    { title: 'Genel Ayarlar', icon: <Settings className="w-8 h-8" />, href: '/admin/settings', description: 'Site ayarları ve yapılandırma' },
  ];
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Paneli</h1>
            <p className="text-gray-400">Site içeriğini ve kullanıcıları yönetin</p>
          </div>
          <Link href="/" className="flex items-center text-blue-400 hover:text-blue-300">
            <Home className="w-5 h-5 mr-2" /> Ana Sayfaya Dön
          </Link>
        </div>
        
        <div className="bg-gray-800 p-4 rounded-md shadow-lg mb-8">
          <div className="flex items-center">
            <Shield className="w-10 h-10 text-green-500 mr-4" />
            <div>
              <h2 className="text-xl font-semibold text-white">Admin olarak giriş yaptınız</h2>
              <p className="text-gray-400">Tüm site içeriğini yönetme yetkiniz var</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminSections.map((section) => (
            <Link href={section.href} key={section.title}>
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg hover:bg-gray-700 transition-colors cursor-pointer">
                <div className="mb-4 text-blue-400">{section.icon}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{section.title}</h3>
                <p className="text-gray-400 text-sm">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
} 