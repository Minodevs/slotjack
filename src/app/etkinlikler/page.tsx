'use client';

import { useState, useEffect } from 'react';
import { Calendar, Tag, MapPin, Users, Clock, Bookmark, Trash2, Coins, X, Plus, Check } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

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

// Function to format date for display
const formatEventDate = (dateString: string) => {
  return dateString;
};

// Define the Event interface
interface Event {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: string; 
  time: string;
  location: string;
  category: string;
  description: string;
  participants: number;
  maxParticipants: number;
  reward: number;
  backgroundGradient: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  stats: {
    available: number;
    participating: number;
    limit: number;
    prizePool: number;
  };
  beginDate?: string;
  endDate?: string;
  minDeposit?: number;
  depositText?: string;
}

// Local storage key for events data
const EVENTS_STORAGE_KEY = 'slotjack_events';
const JOINED_EVENTS_KEY = 'slotjack_joined_events';
const SAVED_EVENTS_KEY = 'slotjack_saved_events';

// Default events data if none are in localStorage
const defaultEventsData: Event[] = [
  {
    id: '1',
    title: 'SPORTSBET.IO X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ',
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/sportsbet-event.jpg',
    date: '15 Temmuz 2024',
    time: '19:00',
    location: 'Online',
    category: 'Nakit Etkinlik',
    description: 'Sportsbet.io ile ortak nakit etkinliğimize katılın ve büyük ödülleri kazanma şansı yakalayın.',
    participants: 58,
    maxParticipants: 100,
    reward: 50,
    backgroundGradient: 'from-green-500 to-blue-500',
    partnerId: 'sportsbet',
    partnerName: 'Sportsbet.io',
    partnerLogo: '/partner-logos/sportsbet.png',
    stats: {
      available: 11,
      participating: 28,
      limit: 20,
      prizePool: 100000
    },
    beginDate: '2023-04-16',
    endDate: '2023-04-17',
    minDeposit: 1000,
    depositText: 'SPORTSBET\'TEN 20 KİŞİYE 100.000₺ NAKİT'
  },
  {
    id: '2',
    title: 'ISISBET X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ',
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/isisbet-event.jpg',
    date: '20 Temmuz 2024',
    time: '21:00',
    location: 'Online',
    category: 'Nakit Etkinlik',
    description: 'IsIsBet ile özel nakit etkinliği. Katılın ve büyük ödüller kazanma fırsatını kaçırmayın.',
    participants: 15,
    maxParticipants: 30,
    reward: 75,
    backgroundGradient: 'from-pink-500 to-purple-500',
    partnerId: 'isisbet',
    partnerName: 'IsIsBet',
    partnerLogo: '/partner-logos/isisbet.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 50000
    },
    beginDate: '2023-05-01',
    endDate: '2023-05-15',
    minDeposit: 500,
    depositText: 'ISISBET\'TEN ÖZEL NAKİT ÖDÜLÜ'
  },
  {
    id: '3',
    title: 'GAMBİ X SLOTJACK ÖZEL FS ETKİNLİĞİ',
    subtitle: 'Özel Freespin Etkinliği',
    image: '/images/events/gambi-event.jpg',
    date: '25 Temmuz 2024',
    time: '20:00',
    location: 'Online',
    category: 'Freespin',
    description: 'GAMBİ ile freespin etkinliğimize katılın. İlk oynayanlar için özel bonuslar.',
    participants: 120,
    maxParticipants: 250,
    reward: 100,
    backgroundGradient: 'from-green-400 to-teal-500',
    partnerId: 'gambi',
    partnerName: 'GAMBİ',
    partnerLogo: '/partner-logos/gambi.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 75000
    },
    beginDate: '2023-06-01',
    endDate: '2023-06-30',
    minDeposit: 750,
    depositText: 'GAMBİ\'DEN FREESPIN ÖDÜLÜ'
  },
  {
    id: '4',
    title: 'SLOTJACK X EFESBET ÖZEL NAKİT ETKİNLİĞİ',
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/efesbet-event.jpg',
    date: '30 Temmuz 2024',
    time: '18:00',
    location: 'Online',
    category: 'Nakit Etkinlik',
    description: 'Efesbet ile nakit etkinliğimize katılın ve bonuslar kazanın.',
    participants: 200,
    maxParticipants: 500,
    reward: 25,
    backgroundGradient: 'from-blue-400 to-cyan-300',
    partnerId: 'efesbet',
    partnerName: 'Efesbet',
    partnerLogo: '/partner-logos/efesbet.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 25000
    },
    beginDate: '2023-07-01',
    endDate: '2023-07-15',
    minDeposit: 250,
    depositText: 'EFESBET\'TEN NAKİT ÖDÜLÜ'
  },
  {
    id: '5',
    title: 'ZLOT X SLOTJACK KADINLAR GÜNÜ ÖZEL ETKİNLİĞİ',
    subtitle: 'Kadınlar Günü Özel Etkinliği',
    image: '/images/events/zlot-event.jpg',
    date: '5 Ağustos 2024',
    time: '19:30',
    location: 'Online',
    category: 'Özel Etkinlik',
    description: 'Kadınlar günü için özel etkinliğimize katılın.',
    participants: 45,
    maxParticipants: 80,
    reward: 60,
    backgroundGradient: 'from-rose-400 to-red-500',
    partnerId: 'zlot',
    partnerName: 'Zlot',
    partnerLogo: '/partner-logos/zlot.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 40000
    },
    beginDate: '2023-08-01',
    endDate: '2023-08-15',
    minDeposit: 500,
    depositText: 'ZLOT\'TAN KADINLAR GÜNÜ ÖZEL ÖDÜLÜ'
  },
  {
    id: '6',
    title: 'BETNANO X SLOTJACK ÖZEL KAYIT ETKİNLİĞİ',
    subtitle: 'Özel Kayıt Etkinliği',
    image: '/images/events/betnano-event.jpg',
    date: '10 Ağustos 2024',
    time: '17:00',
    location: 'Online',
    category: 'Kayıt Etkinlik',
    description: 'Betnano ile kayıt etkinliğimize katılın ve özel bonuslar kazanın.',
    participants: 75,
    maxParticipants: 150,
    reward: 30,
    backgroundGradient: 'from-amber-500 to-orange-500',
    partnerId: 'betnano',
    partnerName: 'Betnano',
    partnerLogo: '/partner-logos/betnano.png',
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 30000
    },
    beginDate: '2023-09-01',
    endDate: '2023-09-30',
    minDeposit: 300,
    depositText: 'BETNANO\'DAN KAYIT ÖDÜLÜ'
  }
];

export default function EventsPage() {
  const { user, updateJackPoints } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [coinAnimation, setCoinAnimation] = useState<{ amount: number; visible: boolean }>({ amount: 0, visible: false });
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  
  // Load events from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      if (typeof window !== 'undefined') {
        try {
          // Load events
          const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
          if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
          } else {
            // Initialize localStorage with default events
            localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(defaultEventsData));
            setEvents(defaultEventsData);
          }
          
          // Load saved events
          const savedEventsData = localStorage.getItem(SAVED_EVENTS_KEY);
          if (savedEventsData) {
            setSavedEvents(JSON.parse(savedEventsData));
          }
          
          // Load joined events
          const joinedEventsData = localStorage.getItem(JOINED_EVENTS_KEY);
          if (joinedEventsData) {
            setJoinedEvents(JSON.parse(joinedEventsData));
          }
        } catch (error) {
          console.error('Error loading data from localStorage:', error);
          setEvents(defaultEventsData);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    // Add storage event listener to sync changes across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === EVENTS_STORAGE_KEY) {
        loadData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Save to localStorage when changes occur
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      localStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(savedEvents));
    }
  }, [savedEvents, loading]);
  
  useEffect(() => {
    if (!loading && typeof window !== 'undefined') {
      localStorage.setItem(JOINED_EVENTS_KEY, JSON.stringify(joinedEvents));
    }
  }, [joinedEvents, loading]);
  
  // Toggle saved event
  const toggleSavedEvent = (eventId: string) => {
    if (savedEvents.includes(eventId)) {
      setSavedEvents(savedEvents.filter(id => id !== eventId));
    } else {
      setSavedEvents([...savedEvents, eventId]);
    }
  };
  
  // Function to trigger coin animation
  const showCoinAnimation = (amount: number) => {
    setCoinAnimation({ amount, visible: true });
  };
  
  // Join event and get reward points
  const joinEvent = async (eventId: string, eventTitle: string, reward: number) => {
    if (!user) {
      alert('Etkinliğe katılmak için giriş yapmalısınız!');
      return;
    }
    
    // Check if already joined
    if (joinedEvents.includes(eventId)) {
      alert('Bu etkinliğe zaten katıldınız!');
      return;
    }

    // Find the event and show details modal first
    const event = events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowEventDetails(true);
    }
  };

  // Proceed to join modal after viewing details
  const handleProceedToJoin = () => {
    setShowEventDetails(false);
    setJoinModalOpen(true);
  };

  // Handle final event join after confirmation
  const handleJoinConfirm = async () => {
    if (!selectedEvent || !username.trim()) return;
    
    // Show loading state
    const joinButton = document.getElementById('join-button') as HTMLButtonElement;
    if (joinButton) {
      joinButton.innerHTML = '<span class="animate-pulse">İşleniyor...</span>';
      joinButton.disabled = true;
    }
    
    try {
      // Update joined events
      setJoinedEvents(prev => [...prev, selectedEvent.id]);
      
      // Add reward points
      if (updateJackPoints) {
        const transaction = await updateJackPoints(
          selectedEvent.reward, 
          `${selectedEvent.title} Etkinliğine Katılım Bonusu`, 
          'event'
        );
        
        if (transaction) {
          showCoinAnimation(selectedEvent.reward);
          // Update stats for this event
          setEvents(prev => 
            prev.map(event => event.id === selectedEvent.id 
              ? {
                ...event,
                stats: {
                  ...event.stats,
                  participating: event.stats.participating + 1
                }
              } 
              : event
            )
          );
        }
      }
      
      // Show success state
      setJoinSuccess(true);
      
      // Close after 2 seconds
      setTimeout(() => {
        setJoinModalOpen(false);
        setSelectedEvent(null);
        setUsername('');
        setJoinSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error joining event:', error);
      alert('Etkinliğe katılırken bir hata oluştu.');
      
      // Reset button state
      if (joinButton) {
        joinButton.innerHTML = 'Etkinliğe Katıl';
        joinButton.disabled = false;
      }
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
  
  // Format currency for display
  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR');
  };
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Calendar className="w-8 h-8 text-[#FF6B00] mr-2" />
            Etkinlikler
          </h1>
        </div>
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {events.map(event => (
            <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden group transform transition-all duration-300 hover:-translate-y-1">
              {/* Event Image with Gradient Overlay */}
              <div className="relative h-64 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${event.backgroundGradient} opacity-70 z-10`}></div>
                {event.image ? (
                  <Image 
                    src={event.image} 
                    alt={event.title} 
                    width={500} 
                    height={300} 
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-gray-500" />
                  </div>
                )}
                
                {/* Partner Logo */}
                <div className="absolute top-4 left-4 z-20 bg-[#FF6B00] p-1 rounded-md">
                  {event.partnerLogo ? (
                    <Image 
                      src={event.partnerLogo} 
                      alt={event.partnerName} 
                      width={100} 
                      height={40} 
                      className="h-8 w-auto"
                    />
                  ) : (
                    <span className="text-white text-xs font-bold px-2">{event.partnerName}</span>
                  )}
                </div>
                
                {/* Event Title */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                  <h3 className="text-white text-xl font-bold leading-tight mb-1">{event.title}</h3>
                  <p className="text-white text-sm opacity-80">{event.subtitle}</p>
                </div>
              </div>
              
              {/* Stats Bar */}
              <div className="grid grid-cols-4 divide-x divide-gray-700 text-center py-2 border-b border-gray-700">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">KATIL</span>
                  <span className="text-white font-bold">{event.stats.available}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">KATILIMCI</span>
                  <span className="text-white font-bold">{event.stats.participating}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">LİMİT</span>
                  <span className="text-white font-bold">{event.stats.limit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs">ÖDÜL</span>
                  <span className="text-white font-bold">{formatCurrency(event.stats.prizePool)}</span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="px-4 py-3 flex items-center">
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FF6B00]" 
                    style={{ width: `${(event.stats.participating / event.stats.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="px-4 py-3 flex justify-between">
                {joinedEvents.includes(event.id) ? (
                  <button className="w-full bg-green-800 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                    <Check className="w-4 h-4 mr-2" />
                    Etkinliğe Katıldınız
                  </button>
                ) : (
                  <button 
                    className="w-full bg-[#FF6B00] hover:bg-[#FF8533] text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => joinEvent(event.id, event.title, event.reward)}
                  >
                    Etkinliğe Katıl
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Floating Coin Animation */}
      <FloatingCoin 
        amount={coinAnimation.amount} 
        isVisible={coinAnimation.visible} 
        onAnimationEnd={() => setCoinAnimation({ ...coinAnimation, visible: false })} 
      />

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#111111] rounded-lg overflow-hidden w-full max-w-sm mx-4 relative">
            <button 
              onClick={() => {
                setShowEventDetails(false);
                setSelectedEvent(null);
              }}
              className="absolute top-2 right-2 text-white hover:text-gray-400 z-10"
            >
              <X size={16} />
            </button>
            
            {/* Header with Logo */}
            <div className="p-3">
              {selectedEvent.partnerLogo && (
                <div className="flex">
                  <Image 
                    src={selectedEvent.partnerLogo} 
                    alt={selectedEvent.partnerName} 
                    width={24} 
                    height={24} 
                    className="h-5 w-auto"
                  />
                </div>
              )}
              <h3 className="text-white font-bold text-base uppercase mt-1">{selectedEvent.partnerName} X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ</h3>
            </div>
            
            {/* Event Details */}
            <div className="px-3 pb-3">
              {/* Prize and Reward Info */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#111111] border border-gray-800 rounded p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Toplam Ödül</div>
                  <div className="text-white font-medium">{formatCurrency(selectedEvent.stats.prizePool)} TL</div>
                </div>
                <div className="bg-[#111111] border border-gray-800 rounded p-2 text-center">
                  <div className="text-xs text-gray-400 mb-1">Miktar Bankaroll</div>
                  <div className="text-white font-medium">{selectedEvent.minDeposit || 1000}</div>
                </div>
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#111111] border border-gray-800 rounded p-2">
                  <div className="flex items-center text-[#FF6B00] text-xs mb-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    Başlangıç Tarihi
                  </div>
                  <div className="text-white text-xs">{selectedEvent.beginDate || selectedEvent.date}</div>
                </div>
                <div className="bg-[#111111] border border-gray-800 rounded p-2">
                  <div className="flex items-center text-[#FF6B00] text-xs mb-1">
                    <Clock className="w-3 h-3 mr-1" />
                    Son Tarih
                  </div>
                  <div className="text-white text-xs">{selectedEvent.endDate || selectedEvent.date}</div>
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-3">
                <div className="font-medium text-white text-xs uppercase mb-2">{selectedEvent.depositText || `${selectedEvent.partnerName}'TEN 20 KİŞİYE 100.000₺ NAKİT`}</div>
                
                <p className="text-xs text-gray-300 mb-2">
                  16 Nisan 23:59'a kadar Min. 1000₺ yatırımınız olması gerekmektedir.
                </p>
                <p className="text-xs text-gray-300 mb-2">
                  Yatırım sonrası formu eksiksiz doldurmalısınız.
                </p>
                <p className="text-xs text-gray-300 mb-2">
                  Eklenen ödülü direkt çekebilir veya ana para gibi kullanabilirsiniz.
                </p>
                <p className="text-xs text-gray-300 mb-2">
                  Çekiliş Discord üzerinden canlı olarak yapılacaktır.
                </p>
                <p className="text-xs text-gray-300 mb-2">
                  Slotjack ofis özeldir.
                </p>
              </div>
              
              {/* Join Button */}
              <button
                onClick={handleProceedToJoin}
                className="w-full py-2 rounded bg-[#ff5e00] hover:bg-[#ff7e30] text-white font-medium flex items-center justify-center"
              >
                <Plus size={16} className="mr-1" />
                Katıl
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Event Modal */}
      {joinModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#111111] rounded-lg overflow-hidden w-full max-w-xs mx-4 relative">
            {!joinSuccess && (
              <button 
                onClick={() => {
                  setJoinModalOpen(false);
                  setSelectedEvent(null);
                  setUsername('');
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            )}
            
            {/* Header */}
            <div className="p-4 pb-2 text-center">
              {selectedEvent.partnerLogo && (
                <div className="flex justify-center mb-1">
                  <Image 
                    src={selectedEvent.partnerLogo} 
                    alt={selectedEvent.partnerName} 
                    width={24} 
                    height={24} 
                    className="h-5 w-auto"
                  />
                </div>
              )}
              <h3 className="text-white font-medium text-base uppercase">{selectedEvent.partnerName} X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ</h3>
            </div>
            
            {/* Form or Success */}
            {joinSuccess ? (
              <div className="px-4 py-8 text-center">
                <div className="bg-green-900 bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="text-green-500 w-8 h-8" />
                </div>
                <p className="text-green-400 font-medium">Kaydedildi!</p>
                <p className="text-gray-400 text-sm mt-1">Etkinliğe başarıyla katıldınız</p>
              </div>
            ) : (
              <div className="px-4 pt-2 pb-4">
                <p className="text-xs text-gray-400 mb-1">{selectedEvent.partnerName} Kullanıcı Adınız</p>
                <input
                  type="text"
                  placeholder="Kullanıcı Adınızı Yazınız"
                  className="w-full bg-[#222222] border border-gray-800 rounded px-3 py-2 mb-4 text-white text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
                
                <button
                  id="join-button"
                  onClick={handleJoinConfirm}
                  disabled={!username.trim()}
                  className={`w-full py-2 rounded flex items-center justify-center text-sm font-medium ${
                    username.trim() ? 'bg-[#FF6B00] hover:bg-[#FF8533] text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Plus size={16} className="mr-1" />
                  Etkinliğe Katıl
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </ClientLayout>
  );
} 