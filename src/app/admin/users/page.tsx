'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/app/page';
import ClientLayout from '@/components/ClientLayout';
import { 
  ChevronLeft, Shield, Crown, UserIcon, Search, Filter,
  Eye, RefreshCw, Check, X
} from 'lucide-react';

interface SocialVerification {
  platform: string;
  isVerified: boolean;
  username?: string;
  verifiedAt?: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  rank: UserRank;
  jackPoints: number;
  isVerified: boolean;
  phoneVerified: boolean;
  hasReceivedBonus: boolean;
  lastActive: number;
  createdAt: number;
  socialVerifications: {
    youtube?: SocialVerification;
    instagram?: SocialVerification;
    twitter?: SocialVerification;
    facebook?: SocialVerification;
    telegram?: SocialVerification;
    discord?: SocialVerification;
    twitch?: SocialVerification;
    kick?: SocialVerification;
    tiktok?: SocialVerification;
  };
}

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRank, setFilterRank] = useState<UserRank | 'all'>('all');

  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    fetchUsers();

    // Set up a storage event listener to automatically refresh when user data changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'slotjack_registered_users') {
        fetchUsers();
      }
    };

    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);

    // Set up interval for periodic updates
    const updateInterval = setInterval(fetchUsers, 10000);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, router]);

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
      if (!registeredUsersStr) {
        setUsers([]);
        return;
      }

      const registeredUsers = JSON.parse(registeredUsersStr);
      const usersList: User[] = Object.entries(registeredUsers).map(([email, userData]: [string, any]) => ({
        id: userData.id,
        email,
        name: userData.name || 'İsimsiz Kullanıcı',
        rank: userData.rank,
        jackPoints: userData.jackPoints || 0,
        isVerified: userData.isVerified || false,
        phoneVerified: userData.phoneVerified || false,
        hasReceivedBonus: userData.hasReceivedBonus || false,
        lastActive: userData.lastActive || userData.lastUpdated || Date.now(),
        createdAt: userData.createdAt || Date.now(),
        socialVerifications: userData.socialVerifications || {},
      }));

      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRank = filterRank === 'all' || user.rank === filterRank;
    
    return matchesSearch && matchesRank;
  });

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Hiç giriş yapmadı';
    
    const date = new Date(timestamp);
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  const getRankBadge = (rank: UserRank) => {
    switch (rank) {
      case UserRank.ADMIN:
        return <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">Admin</span>;
      case UserRank.VIP:
        return <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">VIP</span>;
      case UserRank.NORMAL:
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Üye</span>;
      default:
        return null;
    }
  };

  const getSocialVerificationCount = (user: User) => {
    if (!user.socialVerifications) return 0;
    return Object.values(user.socialVerifications).filter(v => v?.isVerified).length;
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
            <h1 className="text-3xl font-bold text-white">Üyelerimiz</h1>
            <p className="text-gray-400">Kullanıcıları yönetin ve yetkilerini düzenleyin</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={fetchUsers} 
              className={`px-3 py-2 bg-blue-600 text-white rounded-md flex items-center ${refreshing ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Yenileniyor...' : 'Yenile'}
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="İsim veya email ara..."
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <div className="relative">
              <select
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                value={filterRank}
                onChange={(e) => setFilterRank(e.target.value as UserRank | 'all')}
              >
                <option value="all">Tüm Rütbeler</option>
                <option value={UserRank.ADMIN}>Admin</option>
                <option value={UserRank.VIP}>VIP</option>
                <option value={UserRank.NORMAL}>Normal</option>
              </select>
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-700">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">JackPoints</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rütbe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Son Aktif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Doğrulama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sosyal Medya</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-600 rounded-full flex items-center justify-center text-lg font-semibold text-white">
                            {user.name?.charAt(0) || user.email.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{user.name || 'İsimsiz Kullanıcı'}</div>
                            <div className="text-sm text-gray-400">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400 font-medium">{user.jackPoints.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{getRankBadge(user.rank)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{formatDate(user.lastActive)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="flex items-center">
                            <span className="text-xs text-gray-400 mr-1">Email:</span>
                            {user.isVerified ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                          <span className="flex items-center">
                            <span className="text-xs text-gray-400 mr-1">Tel:</span>
                            {user.phoneVerified ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getSocialVerificationCount(user) > 0 ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'
                        }`}>
                          {getSocialVerificationCount(user)} Platform
                        </span>
                        {getSocialVerificationCount(user) > 0 && (
                          <div className="flex items-center space-x-1 mt-1 justify-center">
                            {user.socialVerifications?.youtube?.isVerified && (
                              <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center" 
                                    title="YouTube">
                                <span className="text-white text-[8px]">YT</span>
                              </span>
                            )}
                            {user.socialVerifications?.instagram?.isVerified && (
                              <span className="w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center" 
                                    title="Instagram">
                                <span className="text-white text-[8px]">IG</span>
                              </span>
                            )}
                            {user.socialVerifications?.twitter?.isVerified && (
                              <span className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center" 
                                    title="Twitter">
                                <span className="text-white text-[8px]">TW</span>
                              </span>
                            )}
                            {user.socialVerifications?.facebook?.isVerified && (
                              <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center" 
                                    title="Facebook">
                                <span className="text-white text-[8px]">FB</span>
                              </span>
                            )}
                            {user.socialVerifications?.telegram?.isVerified && (
                              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center" 
                                    title="Telegram">
                                <span className="text-white text-[8px]">TG</span>
                              </span>
                            )}
                            {user.socialVerifications?.discord?.isVerified && (
                              <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center" 
                                    title="Discord">
                                <span className="text-white text-[8px]">DC</span>
                              </span>
                            )}
                            {user.socialVerifications?.twitch?.isVerified && (
                              <span className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center" 
                                    title="Twitch">
                                <span className="text-white text-[8px]">TW</span>
                              </span>
                            )}
                            {user.socialVerifications?.kick?.isVerified && (
                              <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center" 
                                    title="Kick">
                                <span className="text-white text-[8px]">K</span>
                              </span>
                            )}
                            {user.socialVerifications?.tiktok?.isVerified && (
                              <span className="w-4 h-4 bg-gray-800 rounded-full flex items-center justify-center" 
                                    title="TikTok">
                                <span className="text-white text-[8px]">TT</span>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                        <button
                          onClick={() => router.push(`/admin/users/${user.id}`)}
                          className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                          title="Profili Görüntüle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-gray-500">
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 