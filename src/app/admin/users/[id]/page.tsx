'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/app/page';
import ClientLayout from '@/components/ClientLayout';
import { 
  ChevronLeft, Shield, Crown, UserIcon, Check, X, CreditCard, Mail, Phone,
  Youtube, Instagram, Twitter, Facebook, MessageCircle, Send, Twitch, Users, Clock, Play
} from 'lucide-react';

type SocialPlatform = 'youtube' | 'instagram' | 'twitter' | 'facebook' | 'telegram' | 'discord' | 'twitch' | 'kick' | 'tiktok';

interface SocialVerification {
  platform: SocialPlatform;
  isVerified: boolean;
  username?: string;
  verifiedAt?: number;
}

interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  name: string;
  rank: UserRank;
  jackPoints: number;
  isVerified: boolean;
  phoneVerified: boolean;
  hasReceivedBonus: boolean;
  lastActive: number;
  createdAt: number;
  socialVerifications: {
    [K in SocialPlatform]?: SocialVerification;
  };
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bonusAmount, setBonusAmount] = useState<number>(100);
  const [processing, setProcessing] = useState(false);

  const refreshUserProfile = () => {
    const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
    if (!registeredUsersStr) {
      setUserProfile(null);
      return;
    }

    const registeredUsers = JSON.parse(registeredUsersStr);
    let foundUser: UserProfile | null = null;

    // Search through all users to find matching ID
    Object.entries(registeredUsers).forEach(([email, userData]: [string, any]) => {
      if (userData.id === params.id) {
        // Ensure all social verifications are properly loaded
        const socialVerifications = userData.socialVerifications || {};
        
        // Ensure phone data is properly formatted
        const phoneNumber = userData.phone || '';
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : phoneNumber ? `+${phoneNumber}` : '';

        foundUser = {
          id: userData.id,
          email,
          phone: formattedPhone,
          name: userData.name || 'İsimsiz Kullanıcı',
          rank: userData.rank,
          jackPoints: userData.jackPoints || 0,
          isVerified: userData.isVerified || false,
          phoneVerified: userData.phoneVerified || false,
          hasReceivedBonus: userData.hasReceivedBonus || false,
          lastActive: userData.lastActive || userData.lastUpdated || Date.now(),
          createdAt: userData.createdAt || Date.now(),
          socialVerifications: Object.entries(socialVerifications).reduce((acc, [platform, verification]) => {
            if (isValidVerification(verification)) {
              acc[platform as SocialPlatform] = {
                platform: platform as SocialPlatform,
                isVerified: Boolean(verification.isVerified),
                username: String(verification.username || ''),
                verifiedAt: Number(verification.verifiedAt) || Date.now()
              };
            }
            return acc;
          }, {} as Record<SocialPlatform, SocialVerification>)
        };
      }
    });

    setUserProfile(foundUser);
  };

  useEffect(() => {
    if (!currentUser || currentUser.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    const loadUserProfile = () => {
      setLoading(true);
      refreshUserProfile();
      setLoading(false);
    };

    // Initial load
    loadUserProfile();

    // Set up real-time updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'slotjack_registered_users') {
        loadUserProfile();
      }
    };

    // Set up interval for periodic updates
    const updateInterval = setInterval(loadUserProfile, 5000);

    // Add storage event listener
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(updateInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser, params.id, router]);

  const handleRankChange = async (newRank: UserRank) => {
    if (!userProfile) return;
    setProcessing(true);

    try {
      const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
      if (registeredUsersStr) {
        const registeredUsers = JSON.parse(registeredUsersStr);
        if (registeredUsers[userProfile.email]) {
          registeredUsers[userProfile.email].rank = newRank;
          localStorage.setItem('slotjack_registered_users', JSON.stringify(registeredUsers));
        }
      }

      // Update in leaderboard
      const leaderboardStr = localStorage.getItem('slotjack_leaderboard');
      if (leaderboardStr) {
        const leaderboard = JSON.parse(leaderboardStr);
        const updatedLeaderboard = leaderboard.map((u: any) =>
          u.id === userProfile.id ? { ...u, rank: newRank } : u
        );
        localStorage.setItem('slotjack_leaderboard', JSON.stringify(updatedLeaderboard));
      }

      // Refresh the entire user profile
      refreshUserProfile();
      alert('Kullanıcı rütbesi başarıyla güncellendi.');
    } catch (error) {
      console.error('Error updating rank:', error);
      alert('Rütbe güncellenirken bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddBonus = async () => {
    if (!userProfile || processing) return;
    if (!userProfile.isVerified && !userProfile.phoneVerified) {
      alert('Bonus eklemek için kullanıcının doğrulanmış olması gerekiyor.');
      return;
    }

    setProcessing(true);
    try {
      const registeredUsersStr = localStorage.getItem('slotjack_registered_users');
      if (registeredUsersStr) {
        const registeredUsers = JSON.parse(registeredUsersStr);
        if (registeredUsers[userProfile.email]) {
          registeredUsers[userProfile.email].jackPoints = (registeredUsers[userProfile.email].jackPoints || 0) + bonusAmount;
          registeredUsers[userProfile.email].hasReceivedBonus = true;
          localStorage.setItem('slotjack_registered_users', JSON.stringify(registeredUsers));
        }
      }

      // Refresh the entire user profile
      refreshUserProfile();
      alert(`${bonusAmount} JackPoints başarıyla eklendi.`);
    } catch (error) {
      console.error('Error adding bonus:', error);
      alert('Bonus eklenirken bir hata oluştu.');
    } finally {
      setProcessing(false);
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-blue-400" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'telegram':
        return <Send className="w-5 h-5 text-blue-500" />;
      case 'discord':
        return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      case 'twitch':
        return <Twitch className="w-5 h-5 text-purple-500" />;
      case 'kick':
        return <Users className="w-5 h-5 text-green-500" />;
      case 'tiktok':
        return <Play className="w-5 h-5 text-gray-200" />;
      default:
        return null;
    }
  };

  const formatVerificationDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleDateString('tr-TR');
  };

  // Add a function to format the phone number display
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'Belirtilmemiş';
    return phone.startsWith('+') ? phone : `+${phone}`;
  };

  // Add type guard for verification object
  const isValidVerification = (obj: any): obj is SocialVerification => {
    return obj 
      && typeof obj === 'object'
      && 'isVerified' in obj
      && 'username' in obj
      && 'verifiedAt' in obj;
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

  if (!userProfile) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8">
          <Link href="/admin/users" className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
            <ChevronLeft className="w-5 h-5 mr-1" /> Kullanıcı Listesine Dön
          </Link>
          <div className="text-center py-12">
            <p className="text-xl text-red-400">Kullanıcı bulunamadı.</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <Link href="/admin/users" className="flex items-center text-blue-400 hover:text-blue-300 mb-4">
          <ChevronLeft className="w-5 h-5 mr-1" /> Kullanıcı Listesine Dön
        </Link>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                {userProfile.name?.charAt(0) || userProfile.email.charAt(0)}
              </div>
              <div className="ml-6">
                <h1 className="text-2xl font-bold text-white">{userProfile.name}</h1>
                <p className="text-gray-400">{userProfile.email}</p>
                {Object.values(userProfile.socialVerifications || {}).filter(v => v?.isVerified).length > 0 && (
                  <div className="flex items-center mt-2 space-x-1">
                    {(['youtube', 'instagram', 'twitter', 'facebook', 'telegram', 'discord', 'twitch', 'kick', 'tiktok'] as SocialPlatform[]).map(platform => 
                      userProfile.socialVerifications?.[platform]?.isVerified ? (
                        <div key={platform} 
                             className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden" 
                             title={`${platform} (${userProfile.socialVerifications?.[platform]?.username || 'Verified'})`}>
                          {getSocialIcon(platform)}
                        </div>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-white mb-4">Temel Bilgiler ve Doğrulamalar</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-600/50 p-3 rounded">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-gray-300">Email:</span>
                          <span className="text-white">{userProfile.email}</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {userProfile.isVerified ? (
                          <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">Doğrulanmış</span>
                        ) : (
                          <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded-full">Doğrulanmamış</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-600/50 p-3 rounded">
                      <div className="flex items-center space-x-2">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-gray-300">Telefon:</span>
                          <span className="text-white">
                            {userProfile.phone ? (
                              <a href={`tel:${formatPhoneNumber(userProfile.phone)}`} className="text-blue-400 hover:underline">
                                {formatPhoneNumber(userProfile.phone)}
                              </a>
                            ) : (
                              <span className="text-gray-500">Telefon Numarası Yok</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {userProfile.phoneVerified ? (
                          <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full">Doğrulanmış</span>
                        ) : (
                          <span className="bg-red-500/20 text-red-500 text-xs px-2 py-1 rounded-full">Doğrulanmamış</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-600/50 p-3 rounded">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-gray-300">JackPoints:</span>
                          <span className="text-yellow-400 font-medium">{userProfile.jackPoints.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-600/50 p-3 rounded">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div className="flex flex-col">
                          <span className="text-gray-300">Son Aktif:</span>
                          <span className="text-white">{new Date(userProfile.lastActive).toLocaleString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h2 className="text-lg font-semibold text-white mb-4">Sosyal Medya Doğrulamaları</h2>
                  <div className="space-y-3">
                    {(['youtube', 'instagram', 'twitter', 'facebook', 'telegram', 'discord', 'twitch', 'kick', 'tiktok'] as SocialPlatform[]).map((platform) => {
                      const verification = userProfile.socialVerifications?.[platform];
                      const isVerified = verification?.isVerified;
                      const username = verification?.username || '';
                      const verifiedAt = verification?.verifiedAt;
                      
                      return (
                        <div key={platform} className={`flex items-center justify-between bg-gray-600/50 p-3 rounded transition-all ${isVerified ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-gray-600'}`}>
                          <div className="flex items-center space-x-3 flex-1">
                            <div className={`w-10 h-10 flex items-center justify-center rounded ${isVerified ? 'bg-green-800/30' : 'bg-gray-700/50'}`}>
                              {getSocialIcon(platform)}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-gray-200 capitalize">{platform}</span>
                              {isVerified ? (
                                <div className="flex flex-col text-xs">
                                  <span className="text-green-400 truncate font-medium">{username}</span>
                                  <span className="text-gray-400">
                                    {verifiedAt ? `Doğrulanma: ${formatVerificationDate(verifiedAt)}` : ''}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">Doğrulanmamış</span>
                              )}
                            </div>
                            {isVerified && (
                              <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded-full whitespace-nowrap flex items-center">
                                <Check className="w-3 h-3 mr-1" /> Doğrulanmış
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            {isVerified ? (
                              <div className="flex items-center">
                                <div className="px-3 py-1 bg-gray-700 rounded-lg text-xs text-gray-300 flex items-center">
                                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                  <span>Otomatik doğrulandı</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="px-3 py-1 bg-gray-700 rounded-lg text-xs text-gray-400 flex items-center">
                                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                                  <span>Kullanıcı tarafından doğrulanmamış</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h2 className="text-lg font-semibold text-white mb-4">Yönetim İşlemleri</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Rütbe Değiştir</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRankChange(UserRank.ADMIN)}
                        disabled={processing}
                        className={`p-2 rounded ${userProfile.rank === UserRank.ADMIN ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                      >
                        <Shield className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRankChange(UserRank.VIP)}
                        disabled={processing}
                        className={`p-2 rounded ${userProfile.rank === UserRank.VIP ? 'bg-purple-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                      >
                        <Crown className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRankChange(UserRank.NORMAL)}
                        disabled={processing}
                        className={`p-2 rounded ${userProfile.rank === UserRank.NORMAL ? 'bg-gray-500' : 'bg-gray-600 hover:bg-gray-500'}`}
                      >
                        <UserIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">Bonus Ekle</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={bonusAmount}
                        onChange={(e) => setBonusAmount(Number(e.target.value))}
                        className="bg-gray-600 text-white px-3 py-2 rounded w-32"
                        min="1"
                      />
                      <button
                        onClick={handleAddBonus}
                        disabled={processing || (!userProfile.isVerified && !userProfile.phoneVerified)}
                        className={`px-4 py-2 rounded ${
                          processing || (!userProfile.isVerified && !userProfile.phoneVerified)
                            ? 'bg-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        Ekle
                      </button>
                    </div>
                    {!userProfile.isVerified && !userProfile.phoneVerified && (
                      <p className="text-red-400 text-sm mt-2">
                        Bonus eklemek için kullanıcının doğrulanmış olması gerekiyor.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
} 