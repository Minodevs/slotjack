'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft, Shield, User, Award, Gift, Users, 
  ExternalLink, Mail, Phone, Check, Calendar, Clock,
  MessageCircle
} from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { useAuth } from '@/contexts/AuthContext';
import { UserRank } from '@/types/user';

// Social media icons components
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21.198 2.433a2.242 2.242 0 0 0-1.022.215l-16.555 6.75a2.25 2.25 0 0 0-.124 4.052L8.0 15.833v5.167a1 1 0 0 0 1.707.707l3.614-3.614 4.834 3.65a2.25 2.25 0 0 0 3.551-1.169l3.275-14.86a2.25 2.25 0 0 0-1.783-2.781z" />
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M9 12h6m-6-4h6m-6 8h6M8 7.344C11.109 5.531 13.93 5.53 17 7.344c.7863 5.6-1.644 8.67-3.5 9.656-2.12-1.325-3.399-4.656-3.5-9.656zm.059-.266C7.814 11.5 7.034 14.149 6 15.749c1.457 1.216 4.148 1.187 6 0-1.457-1.216-3.398-3.085-4.059-8.405.108-.2 0-.266 0-.266h.118z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// Social platforms config
const socialPlatforms = [
  { id: 'telegram', name: 'Telegram', icon: TelegramIcon, color: '#0088cc', baseUrl: 'https://t.me/' },
  { id: 'discord', name: 'Discord', icon: DiscordIcon, color: '#5865F2', baseUrl: '' },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon, color: '#FF0000', baseUrl: 'https://youtube.com/@' },
  { id: 'twitter', name: 'Twitter', icon: TwitterIcon, color: '#1DA1F2', baseUrl: 'https://twitter.com/' },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon, color: '#C13584', baseUrl: 'https://instagram.com/' }
];

// Prevent static generation of this page
export const dynamic = 'force-dynamic';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // Get userId from params
  const userId = params?.userId ? String(params.userId) : '';

  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    // Load user data from localStorage or API
    const loadUserData = () => {
      try {
        // In a real app, fetch from API: 
        // const response = await fetch(`/api/users/${userId}`);
        // const data = await response.json();
        
        // For now, get from localStorage if any exist
        const storedUsers = localStorage.getItem('slotjack_registered_users');
        
        if (storedUsers) {
          const users = JSON.parse(storedUsers);
          // Find user by userId
          let foundUser = null;
          
          Object.entries(users).forEach(([email, user]: [string, any]) => {
            if (user.id === userId) {
              foundUser = { ...user, email };
            }
          });
          
          if (foundUser) {
            setUserData(foundUser);
          } else {
            console.error('User not found');
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, router, userId]);

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto py-8 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto py-8">
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <div className="flex items-center mb-6">
            <Link href="/admin/users" className="flex items-center text-gray-400 hover:text-white mr-4">
              <ChevronLeft size={18} className="mr-1" />
              <span>Kullanıcı Listesine Dön</span>
            </Link>
            <h1 className="text-xl font-bold flex-1">Kullanıcı Profili</h1>
            <div className="bg-blue-900/30 px-3 py-1 rounded-md text-blue-300 text-sm flex items-center">
              <Shield size={14} className="mr-1.5" />
              <span>Admin Görünümü</span>
            </div>
          </div>
          
          <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gray-800 rounded-full mr-4">
                <User size={24} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{userData?.name || 'Kullanıcı'}</h2>
                <p className="text-gray-400">{userData?.email || 'email@example.com'}</p>
              </div>
            </div>
            
            {/* User Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4 border-b border-gray-700 pb-2">Kullanıcı Bilgileri</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{userData?.email || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Telefon</p>
                      <p className="text-white">
                        {userData?.phoneNumber ? (
                          <span className="flex items-center">
                            {userData.phoneNumber}
                            {userData.phoneVerified && (
                              <Check className="w-4 h-4 text-green-500 ml-1.5" />
                            )}
                          </span>
                        ) : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Kayıt Tarihi</p>
                      <p className="text-white">{userData?.createdAt ? formatDate(userData.createdAt) : '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm text-gray-400">Son Güncelleme</p>
                      <p className="text-white">{userData?.lastUpdated ? formatDate(userData.lastUpdated) : '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Social Media Platforms */}
              <div className="bg-gray-800 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4 border-b border-gray-700 pb-2">Sosyal Medya Platformları</h3>
                
                <div className="space-y-3">
                  {socialPlatforms.map(platform => {
                    const username = userData?.socialAccounts?.[platform.id];
                    const isVerified = userData?.socialAccounts?.[`${platform.id}_verified`] === 'true';
                    
                    return (
                      <div key={platform.id} className="flex items-start">
                        <div className="mt-0.5 mr-3" style={{ color: platform.color }}>
                          <platform.icon />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-400">{platform.name}</p>
                          {username ? (
                            <div className="flex items-center">
                              <p className="text-white">{username}</p>
                              {isVerified && (
                                <span className="ml-1.5 text-green-500 flex items-center text-xs">
                                  <Check className="w-3 h-3 mr-0.5" /> Doğrulanmış
                                </span>
                              )}
                              {platform.baseUrl && (
                                <a 
                                  href={`${platform.baseUrl}${username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-400 hover:text-blue-300 inline-flex items-center text-xs"
                                >
                                  <ExternalLink className="w-3 h-3 mr-0.5" /> Aç
                                </a>
                              )}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic">Belirtilmemiş</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Link 
                href={`/admin/users/${userId}/awards`}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center transition-colors"
              >
                <Award size={20} className="text-yellow-500 mr-3" />
                <span>Ödüller</span>
              </Link>
              
              <Link 
                href={`/admin/users/${userId}/bonuses`}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center transition-colors"
              >
                <Gift size={20} className="text-green-500 mr-3" />
                <span>Bonuslar</span>
              </Link>
              
              <Link 
                href={`/admin/users/${userId}/partners`}
                className="bg-gray-800 hover:bg-gray-700 p-4 rounded-lg flex items-center transition-colors"
              >
                <Users size={20} className="text-blue-500 mr-3" />
                <span>Referanslar</span>
              </Link>
            </div>
            
            {/* Quick Actions */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-sm uppercase text-gray-400 mb-3">Hızlı İşlemler</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    // Copy telegram username to clipboard if available
                    const telegram = userData?.socialAccounts?.telegram;
                    if (telegram) {
                      navigator.clipboard.writeText(telegram)
                        .then(() => alert(`Telegram kullanıcı adı panoya kopyalandı: ${telegram}`))
                        .catch(err => console.error('Kopyalama hatası:', err));
                    } else {
                      alert('Bu kullanıcı için Telegram bilgisi bulunamadı.');
                    }
                  }}
                  className="bg-[#0088cc] hover:bg-opacity-80 text-white text-sm py-1.5 px-3 rounded flex items-center"
                >
                  <TelegramIcon />
                  <span className="ml-1.5">Telegram Kopyala</span>
                </button>
                
                <button
                  onClick={() => {
                    // Send message link (would be implemented in a real app)
                    alert('Mesaj gönderme özelliği henüz eklenmedi.');
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1.5 px-3 rounded flex items-center"
                >
                  <MessageCircle className="w-4 h-4 mr-1.5" />
                  <span>Mesaj Gönder</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
