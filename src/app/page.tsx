'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Star, ArrowUp, ArrowDown, DollarSign, Coins, Calendar, MessageSquare, Activity, ChevronLeft, ChevronRight, UserPlus, Clock, Gift, Video, AlertCircle, X, Rocket } from 'lucide-react';
import ClientLayout from '../components/ClientLayout';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSiteSettings } from '@/components/SiteSettingsProvider';
import { UserRank, User, Transaction, Player, Tournament, SocialPlatform, RedemptionCode, isUser } from '@/types/user';

// Mock data remains the same
const topPlayers: Player[] = [
  { id: 1, name: 'emre_2024', points: 14500, avatar: '' },
  { id: 2, name: 'slotking', points: 12800, avatar: '' },
  { id: 3, name: 'jackmaster', points: 11200, avatar: '' },
  { id: 4, name: 'casinopro', points: 10150, avatar: '' },
  { id: 5, name: 'slotjack_vip', points: 9800, avatar: '' },
];

const upcomingTournaments: Tournament[] = [
   { id: 1, name: 'Haftalık Mega Turnuva', date: '23 Haziran 2024', prizePool: 25000, entryFee: 50, participants: 128 },
   { id: 2, name: 'VIP Özel Turnuva', date: '25 Haziran 2024', prizePool: 10000, entryFee: 0, participants: 64, isVipOnly: true },
   { id: 3, name: 'Aylık Şampiyona', date: '30 Haziran 2024', prizePool: 50000, entryFee: 100, participants: 256 },
];

// Slider items now come from site settings

// Floating Coin Animation Component
function FloatingCoin({ amount, isVisible, onAnimationEnd }: { amount: number; isVisible: boolean; onAnimationEnd: () => void }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if (isVisible && isMounted) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationEnd, isMounted]);

  if (!isVisible || !isMounted) return null;

  return (
    <div className="fixed top-20 right-20 z-50 animate-float-up">
      <div className={`flex items-center font-bold text-xl ${amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
        <Coins className="w-8 h-8 mr-2" />
        <span>{amount > 0 ? '+' : ''}{amount}</span>
      </div>
    </div>
  );
}

// Transaction Item Component
function TransactionItem({ transaction }: { transaction: Transaction }) {
  const getTypeColor = useCallback((type: string) => {
    switch (type) {
      case 'earn': return 'text-green-400';
      case 'spend': return 'text-red-400';
      case 'bonus': return 'text-yellow-400';
      case 'event': return 'text-blue-400';
      case 'admin': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  }, []);

  const getTypeIcon = useCallback((type: string) => {
    switch (type) {
      case 'earn': return <ArrowUp className="w-4 h-4" />;
      case 'spend': return <ArrowDown className="w-4 h-4" />;
      case 'bonus': return <Gift className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'admin': return <AlertCircle className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  }, []);

  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  }, []);

  return (
    <div className="p-3 border-b border-gray-700 last:border-0 flex justify-between items-center">
      <div className="flex-1">
        <p className="font-medium">{transaction.description}</p>
        <span className="text-gray-400 text-sm">{formatDate(transaction.timestamp)}</span>
      </div>
      <div className={`flex items-center ${getTypeColor(transaction.type)}`}>
        {getTypeIcon(transaction.type)}
        <span className="ml-1">{transaction.amount > 0 ? '+' : ''}{transaction.amount}</span>
      </div>
    </div>
  );
}

// FloatingCoin component props
interface FloatingCoinProps {
  amount: number;
  isVisible: boolean;
  onAnimationEnd: () => void;
}

export default function HomePage() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const router = useRouter();
  const authContext = useAuth();
  const { settings } = useSiteSettings();
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user: currentUser, leaderboard, updateJackPoints, loading, getRecentTransactions } = authContext;
  const typedUser = currentUser as User | null;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showThunder, setShowThunder] = useState(false);
  const [coinAnimation, setCoinAnimation] = useState<{ amount: number; isVisible: boolean }>({ amount: 0, isVisible: false });
  const [isMounted, setIsMounted] = useState(false);
  const [isDailyBonusClaimed, setIsDailyBonusClaimed] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('Öne Çıkanlar');
  
  // New states for code redemption and daily bonus
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [isProcessingCode, setIsProcessingCode] = useState(false);
  const [dailyBonusTimeRemaining, setDailyBonusTimeRemaining] = useState<string>('');
  const [canClaimDailyBonus, setCanClaimDailyBonus] = useState(false);
  
  // Update current slide if it's out of bounds
  useEffect(() => {
    const banners = settings.banners || [];
    if (banners.length > 0 && currentSlide >= banners.length) {
      setCurrentSlide(0);
    }
  }, [settings.banners, currentSlide]);
  
  useEffect(() => {
    setIsMounted(true);
    
    if (sessionStorage.getItem('introPlayed') === 'true') {
      setIsVideoPlaying(false);
    }

    if (typedUser && getRecentTransactions) {
        setRecentTransactions(getRecentTransactions(5));
        // TODO: Check daily bonus status
    }
    const slideInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(slideInterval);
  }, [typedUser, getRecentTransactions]);
  
  const nextSlide = useCallback(() => {
    const banners = settings.banners || [];
    if (banners.length === 0) return;
    
    setShowThunder(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
      setTimeout(() => {
        setShowThunder(false);
      }, 300);
    }, 100);
  }, [settings.banners]);
  
  const prevSlide = useCallback(() => {
    const banners = settings.banners || [];
    if (banners.length === 0) return;
    
    setShowThunder(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
      setTimeout(() => {
        setShowThunder(false);
      }, 300);
    }, 100);
  }, [settings.banners]);
  
  const goToSlide = useCallback((index: number) => {
    const banners = settings.banners || [];
    if (banners.length === 0 || currentSlide === index) return;
    
    setShowThunder(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => {
        setShowThunder(false);
      }, 300);
    }, 100);
  }, [currentSlide, settings.banners]);

  useEffect(() => {
    if (isMounted) {
      const timer = setInterval(() => {
        nextSlide();
      }, 5000);
      
      return () => clearInterval(timer);
    }
  }, [isMounted, nextSlide]);
  
  const showCoinAnimation = (amount: number) => {
    setCoinAnimation({ amount, isVisible: true });
  };

  const handleAnimationEnd = () => {
    setCoinAnimation({ ...coinAnimation, isVisible: false });
  };

  // Check if user can claim daily bonus
  useEffect(() => {
    if (!typedUser) return;
    
    const checkDailyBonus = () => {
      // If user has never claimed daily bonus, they can claim it
      if (!typedUser.lastDailyBonus) {
        setCanClaimDailyBonus(true);
        setDailyBonusTimeRemaining('');
        return;
      }
      
      const now = new Date();
      const lastClaim = new Date(typedUser.lastDailyBonus);
      
      // Reset at midnight local time
      const tomorrow = new Date(lastClaim);
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const timeUntilReset = tomorrow.getTime() - now.getTime();
      
      if (timeUntilReset <= 0) {
        // Can claim daily bonus
        setCanClaimDailyBonus(true);
        setDailyBonusTimeRemaining('');
      } else {
        // Calculate remaining time until next claim
        setCanClaimDailyBonus(false);
        
        const hours = Math.floor(timeUntilReset / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilReset % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeUntilReset % (1000 * 60)) / 1000);
        
        setDailyBonusTimeRemaining(`${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    };
    
    checkDailyBonus();
    const timer = setInterval(checkDailyBonus, 1000);
    
    return () => clearInterval(timer);
  }, [typedUser]);

  const claimDailyBonus = async () => {
    if (!typedUser || !canClaimDailyBonus) return;

    toast.promise(
      new Promise(resolve => setTimeout(resolve, 1000)),
      {
        loading: 'Bonus talep ediliyor...',
        success: (data) => {
          // Update user points
          updateJackPoints(20, 'Günlük Bonus', 'bonus');
          
          // Show animation
          showCoinAnimation(20);
          
          // Update last bonus time in local storage
          if (typeof window !== 'undefined') {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const updatedUsers = users.map((u: User) => {
              if (u.id === typedUser.id) {
                return { ...u, lastDailyBonus: Date.now() };
              }
              return u;
            });
            localStorage.setItem('users', JSON.stringify(updatedUsers));
          }
          
          // Update state
          setCanClaimDailyBonus(false);
          
          return 'Günlük bonus başarıyla alındı!';
        },
        error: 'Bonus alınamadı. Lütfen tekrar deneyin.',
      }
    );
  };

  // Handle code redemption
  const handleCodeSubmit = () => {
    if (!typedUser || !codeInput.trim() || isProcessingCode) return;

    setIsProcessingCode(true);

    toast.promise(
      new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            // Get redemption codes from localStorage
            const storedCodes = JSON.parse(localStorage.getItem('redemptionCodes') || '[]') as RedemptionCode[];
            
            // Find the code
            const codeIndex = storedCodes.findIndex(
              c => c.code.toLowerCase() === codeInput.trim().toLowerCase() && !c.isUsed
            );
            
            if (codeIndex === -1) {
              reject('Geçersiz kod veya bu kod zaten kullanılmış.');
              return;
            }
            
            const code = storedCodes[codeIndex];
            
            // Mark the code as used
            storedCodes[codeIndex] = {
              ...code,
              isUsed: true,
              usedAt: Date.now(),
              usedBy: typedUser.email
            };
            
            // Save back to localStorage
            localStorage.setItem('redemptionCodes', JSON.stringify(storedCodes));
            
            // Add points to user
            updateJackPoints(code.pointValue, 'Kod Bonus: ' + code.code, 'bonus');
            
            // Success
            resolve(`${code.pointValue} JackPoint kazandınız!`);
          } else {
            reject('İşlem sırasında bir hata oluştu.');
          }
        }, 1000);
      }),
      {
        loading: 'Kod doğrulanıyor...',
        success: (msg) => {
          // Show animation
          showCoinAnimation(parseInt(msg));
          
          // Reset code input and close modal
          setCodeInput('');
          setShowCodeModal(false);
          
          return msg;
        },
        error: (err) => {
          return err;
        },
      }
    ).finally(() => {
      setIsProcessingCode(false);
    });
  };

  const claimSocialBonus = async (platform: string) => {
     if (!typedUser) {
       toast.error('Bonus talep etmek için giriş yapmalısınız.');
       return;
     }
     toast.success(`${platform} bonusu için talep alındı! (Simüle edildi)`);
  };

  const joinEvent = async (eventName: string) => {
    if (!typedUser) {
       toast.error('Etkinliğe katılmak için giriş yapmalısınız.');
       return;
     }
     toast.success(`"${eventName}" etkinliğine katıldınız! (Simüle edildi)`);
  };
  
  const formatDate = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  }, []);
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Öne Çıkanlar':
        return (
          <div>
            <h4 className="text-lg font-semibold mb-3">Haftanın En İyileri</h4>
            <div className="space-y-2">
              {leaderboard
                // Filter out system accounts by checking email patterns
                .filter(player => {
                  // Skip system/demo accounts
                  const systemEmails = ['admin@example.com', 'sezarpaypals2@gmail.com', 'vip@example.com', 'normal@example.com', 'user1@example.com', 'user2@example.com'];
                  const isSystemAccount = systemEmails.includes(player.email.toLowerCase());
                  
                  // Skip accounts with test/example domains
                  const testDomains = ['example.com', 'test.com', 'demo.com'];
                  const isTestDomain = testDomains.some(domain => player.email.toLowerCase().endsWith(`@${domain}`));
                  
                  return !isSystemAccount && !isTestDomain;
                })
                .slice(0, 3)
                .map((player, index) => (
                <div key={player.id} className="flex items-center bg-gray-700 p-2 rounded">
                  <span className={`font-bold mr-2 ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : 'text-orange-400'}`}>#{index + 1}</span>
                  <div className="w-6 h-6 rounded-full mr-2 bg-gray-600 flex items-center justify-center text-xs">
                    {(player.name || player.email).charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1">{player.name || player.email.split('@')[0]}</span>
                  <span className="text-yellow-400 font-medium">{player.jackPoints.toLocaleString()} JP</span>
                </div>
              ))}
            </div>
            <Link href="/liderlik-tablosu" className="text-blue-400 hover:underline text-sm mt-3 inline-block">Tüm Liderlik Tablosu</Link>
            
            <h4 className="text-lg font-semibold mt-6 mb-3">Yaklaşan Etkinlik</h4>
            {upcomingTournaments.length > 0 ? (
               <div className="bg-gray-700 p-3 rounded">
                 <p className="font-semibold">{upcomingTournaments[0].name}</p>
                 <p className="text-sm text-gray-400">{upcomingTournaments[0].date} - Ödül Havuzu: {upcomingTournaments[0].prizePool.toLocaleString()} JP</p>
                 <button 
                  onClick={() => joinEvent(upcomingTournaments[0].name)}
                  className="mt-2 bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                 >
                   Hemen Katıl!
                 </button>
               </div>
             ) : (
               <p className="text-gray-400 text-sm">Yaklaşan etkinlik bulunmuyor.</p>
             )}
            <Link href="/etkinlikler" className="text-blue-400 hover:underline text-sm mt-3 inline-block">Tüm Etkinlikler</Link>
          </div>
        );
      case 'Turnuvalar':
        return (
          <div>
            <h4 className="text-lg font-semibold mb-3">Aktif & Yaklaşan Turnuvalar</h4>
            {upcomingTournaments.map((tournament: Tournament) => (
              <div key={tournament.id} className="mb-3 pb-3 border-b border-gray-700 last:border-0 last:mb-0 last:pb-0">
                <h5 className="font-semibold">{tournament.name} {tournament.isVipOnly && <Star className="w-4 h-4 inline text-yellow-400 ml-1" />}</h5>
                <p className="text-sm text-gray-400">Tarih: {tournament.date} | Ödül: {tournament.prizePool.toLocaleString()} JP | Giriş: {tournament.entryFee} JP</p>
                <p className="text-sm text-gray-400">Katılımcı: {tournament.participants}</p>
                 <button 
                   onClick={() => joinEvent(tournament.name)}
                   className="mt-1 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs font-medium transition-colors"
                 >
                   Katıl
                 </button>
              </div>
            ))}
             <Link href="/turnuvalar" className="text-blue-400 hover:underline text-sm mt-3 inline-block">Tüm Turnuvalar</Link>
          </div>
        );
      case 'Etkinlikler':
        return (
          <div>
            <h4 className="text-lg font-semibold mb-3">Özel Etkinlikler</h4>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-lg mb-4">
              <h5 className="font-bold text-white">Hafta Sonu Jackpot Çılgınlığı!</h5>
              <p className="text-sm text-purple-100">Bu hafta sonu tüm slot oyunlarında %20 ekstra JackPoint kazanın!</p>
              <span className="text-xs text-purple-200 block mt-1">22 Haziran - 23 Haziran</span>
            </div>
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-4 rounded-lg">
              <h5 className="font-bold text-white">Yeni Oyun Lansmanı</h5>
              <p className="text-sm text-teal-100">"Atlantis'in Hazineleri" slot oyununu deneyin, ilk 10 spinde 50 JP kazanın!</p>
               <span className="text-xs text-teal-200 block mt-1">Sadece Bugün!</span>
            </div>
            <Link href="/etkinlikler" className="text-blue-400 hover:underline text-sm mt-4 inline-block">Tüm Etkinlikler</Link>
          </div>
        );
      case 'Haberler':
         return (
          <div>
            <h4 className="text-lg font-semibold mb-3">Son Haberler & Duyurular</h4>
            <div className="mb-3 pb-3 border-b border-gray-700 last:border-0 last:mb-0 last:pb-0">
              <h5 className="font-semibold">Mobil Uygulamamız Güncellendi!</h5>
              <p className="text-sm text-gray-400">Daha hızlı ve stabil bir deneyim için uygulamayı güncellemeyi unutmayın.</p>
              <span className="text-xs text-gray-500">20 Haziran 2024</span>
            </div>
            <div className="mb-3 pb-3 border-b border-gray-700 last:border-0 last:mb-0 last:pb-0">
              <h5 className="font-semibold">Yeni Ödeme Yöntemi Eklendi: Papara</h5>
              <p className="text-sm text-gray-400">Artık Papara ile kolayca bakiye yükleyebilirsiniz.</p>
               <span className="text-xs text-gray-500">18 Haziran 2024</span>
            </div>
            <Link href="/haberler" className="text-blue-400 hover:underline text-sm mt-3 inline-block">Tüm Haberler</Link>
          </div>
        );
      default:
        return null;
    }
  };

  // Create social platforms array using settings
  const socialPlatforms: SocialPlatform[] = [
    { id: 1, name: "Telegram", icon: "T", color: "bg-blue-500", link: settings.socialLinks.telegram },
    { id: 2, name: "Twitter", icon: "T", color: "bg-black", link: settings.socialLinks.twitter },
    { id: 3, name: "Instagram", icon: "I", color: "bg-pink-600", link: settings.socialLinks.instagram },
    { id: 4, name: "Youtube", icon: "Y", color: "bg-red-600", link: settings.socialLinks.youtube },
    { id: 5, name: "Kick", icon: "K", color: "bg-green-500", link: settings.socialLinks.kick },
  ];

  return (
    <>
      {isVideoPlaying && (
        <video
          key="intro-video"
          src="/video/loading.mp4"
          autoPlay
          muted
          playsInline
          onEnded={() => {
            setIsVideoPlaying(false);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('introPlayed', 'true');
            }
          }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: 9999,
            backgroundColor: '#111',
          }}
        />
      )}
      {!isVideoPlaying && (
        <ClientLayout>
          <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-8 relative">
            <FloatingCoin 
              amount={coinAnimation.amount} 
              isVisible={coinAnimation.isVisible} 
              onAnimationEnd={handleAnimationEnd} 
            />

            {/* Bonus Feature Cards */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg flex items-center">
                <div className="w-12 h-12 mr-4 flex-shrink-0">
                  <Image src="/gift-box.png" alt="Kod Gir" width={48} height={48} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Kod Gir</h3>
                  <p className="text-sm text-gray-300">Canlı Yayında Paylaşılan Kodu Gir</p>
                </div>
                <button 
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition-colors" 
                  onClick={() => setShowCodeModal(true)}
                >
                  Kodu Gir
                </button>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4 shadow-lg flex items-center">
                <div className="w-12 h-12 mr-4 flex-shrink-0">
                  <Image src="/rocket.png" alt="Günlük Puan" width={48} height={48} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">Günlük Puan</h3>
                  <p className="text-sm text-gray-300">Günlük giriş puanınızı alın</p>
                  {dailyBonusTimeRemaining && (
                    <p className="text-xs text-gray-400">Kalan süre: {dailyBonusTimeRemaining}</p>
                  )}
                </div>
                <button 
                  className={`font-bold py-2 px-4 rounded transition-colors ${
                    canClaimDailyBonus 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`} 
                  onClick={claimDailyBonus}
                  disabled={!canClaimDailyBonus}
                >
                  Puanı Al
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-6">
                {typedUser ? (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 rounded-lg p-6 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-2xl font-semibold">Hoş Geldin, {typedUser.name || typedUser.email}!</h2>
                      <Link href="/profil" className="text-sm text-blue-400 hover:underline">Profili Düzenle</Link>
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold">
                        {typedUser.name ? typedUser.name.charAt(0).toUpperCase() : typedUser.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-lg font-medium">{typedUser.name || 'Kullanıcı'}</p>
                        <p className="text-gray-400 text-sm">{typedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-gray-700 p-3 rounded-md">
                      <div className="flex items-center text-yellow-400">
                        <Coins className="w-6 h-6 mr-2" />
                        <span className="text-xl font-bold">{typedUser.jackPoints.toLocaleString()}</span>
                        <span className="ml-1 text-sm text-gray-300">JackPoints</span>
                      </div>
                      <button 
                        onClick={() => showCoinAnimation(5)}
                        className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                      >
                        Puan Kazan (Test)
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Son güncelleme: {formatDate(typedUser.lastUpdated)}</p>
                  </motion.div>
                ) : (
                  <div className="bg-gray-800 rounded-lg p-6 shadow-lg text-center">
                    <p className="mb-4">SlotJack dünyasına hoş geldiniz!</p>
                    <Link href="/giris" className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-medium transition-colors mr-2">Giriş Yap</Link>
                    <Link href="/kayit" className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-medium transition-colors">Kayıt Ol</Link>
                  </div>
                )}

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-4">Hızlı İşlemler & Bonuslar</h3>
                  <div className="space-y-3">
                    <Link
                      href="/cark-cevir"
                      className="block w-full relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-yellow-300 animate-pulse"
                    >
                      <div className="flex items-center justify-center">
                        <div className="relative mr-3">
                          <div className="w-8 h-8 rounded-full border-4 border-white border-dashed animate-spin-slow"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Coins className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <span className="text-md">ÇARK ÇEVİR</span>
                      </div>
                      <div className="text-xs mt-1 text-yellow-100 text-center">Her Gün Bedava JackCoin Kazanın!</div>
                      <div className="absolute -top-10 -right-10 w-20 h-20 bg-yellow-300 opacity-20 rounded-full animate-ping"></div>
                    </Link>
                    <button 
                      onClick={() => claimSocialBonus('Telegram')} 
                      className="w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-medium transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" /> Telegram Bonusu
                    </button>
                    <Link href="/market" className="block w-full text-center bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded font-medium transition-colors">
                      <Coins className="w-5 h-5 inline-block mr-2" /> JackPoint Market
                    </Link>
                     <Link href="/profil?tab=bakiye" className="block w-full text-center bg-green-500 hover:bg-green-600 px-4 py-2 rounded font-medium transition-colors">
                      <DollarSign className="w-5 h-5 inline-block mr-2" /> Bakiye Yükle
                    </Link>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-4">Son Hareketler</h3>
                  <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                    {recentTransactions.length > 0 ? (
                      recentTransactions.map(tx => <TransactionItem key={tx.id} transaction={tx} />)
                    ) : (
                      <p className="text-gray-400 text-sm">Henüz bir hareket yok.</p>
                    )}
                  </div>
                </motion.div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="relative bg-gray-800 rounded-lg shadow-lg overflow-hidden w-full"
                >
                  {(settings.banners || []).length > 0 ? (
                    <>
                      <div className="relative w-full h-48 md:h-64 bg-gray-900">
                        <Image 
                          src={(settings.banners || [])[currentSlide]?.imageUrl || '/placeholder-image.jpg'} 
                          alt={(settings.banners || [])[currentSlide]?.title || 'Banner'}
                          fill
                          priority
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 bg-black bg-opacity-50 flex items-end p-4">
                        <h3 className="text-white text-lg md:text-xl font-bold">
                          {(settings.banners || [])[currentSlide]?.title || 'Banner'}
                        </h3>
                      </div>
                      
                      {(settings.banners || []).length > 1 && (
                        <>
                          <button 
                            onClick={prevSlide} 
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={nextSlide} 
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 transition-opacity"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-2">
                            {(settings.banners || []).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-gray-400'} transition-colors`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-48 md:h-64 bg-gray-700 flex items-center justify-center">
                      <p className="text-gray-400">Henüz banner eklenmemiş</p>
                    </div>
                  )}
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                 >
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Öne Çıkanlar', 'Turnuvalar', 'Etkinlikler', 'Haberler'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-800 rounded-lg p-6 shadow-lg min-h-[300px]">
                    {renderTabContent()}
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="bg-gray-800 rounded-lg p-6 shadow-lg"
                 >
                    <h3 className="text-xl font-semibold mb-4 text-center">Bizi Takip Edin!</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                      {socialPlatforms.map((platform: SocialPlatform) => (
                        <a 
                          key={platform.id} 
                          href={platform.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className={`flex flex-col items-center justify-center w-20 h-20 ${platform.color} text-white rounded-lg hover:opacity-80 transition-opacity`}
                        >
                          <span className="text-3xl font-bold">{platform.icon}</span>
                          <span className="text-xs mt-1">{platform.name}</span>
                        </a>
                      ))}
                    </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Code Redemption Modal */}
          {showCodeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 relative">
                <button 
                  onClick={() => setShowCodeModal(false)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-xl font-bold mb-4">Kodu Giriniz</h2>
                
                <div className="mb-4">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                    placeholder="Kod Yazınız"
                    className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center uppercase"
                    disabled={isProcessingCode}
                  />
                </div>
                
                <button
                  onClick={handleCodeSubmit}
                  disabled={!codeInput.trim() || isProcessingCode}
                  className={`w-full rounded-lg py-3 font-bold ${
                    !codeInput.trim() || isProcessingCode
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {isProcessingCode ? 'İşleniyor...' : 'Kodu Gir'}
                </button>
              </div>
            </div>
          )}
        </ClientLayout>
      )}
    </>
  );
}

