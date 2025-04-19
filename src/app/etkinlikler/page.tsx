'use client';

import { useState, useEffect } from 'react';
import { Calendar, Tag, MapPin, Users, Clock, Bookmark, Trash2, Coins, X, Plus, Check } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import GridCard, { 
  GridCardContainer, 
  GridCardContent, 
  GridCardFooter, 
  GridCardImage, 
  GridCardTitle, 
  GridCardDescription 
} from '@/components/GridCard';
import { useRouter } from 'next/navigation';

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
    partnerLogo: '/etkinlikimg/sportsbet.png',
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
    partnerLogo: '/etkinlikimg/isiabet.png',
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
    partnerLogo: '/etkinlikimg/gambi.png',
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
    partnerLogo: '/etkinlikimg/efesbet.png',
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
    partnerLogo: '/etkinlikimg/zlat.png',
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
    partnerLogo: '/etkinlikimg/betnano.png',
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

// Add a countdown timer component
function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);
  
  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };
    
    setTimeLeft(calculateTimeLeft());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);
  
  if (isExpired) {
    return (
      <div className="w-full">
        <div className="bg-gray-900/70 text-white py-2 px-4 rounded-md text-center">
          Etkinlik tarihi sona erdi.
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.days}</div>
        <div className="text-xs text-gray-400">GÜN</div>
      </div>
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.hours}</div>
        <div className="text-xs text-gray-400">SAAT</div>
      </div>
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.minutes}</div>
        <div className="text-xs text-gray-400">DAKİKA</div>
      </div>
      <div className="text-center">
        <div className="text-lg md:text-xl font-bold">{timeLeft.seconds}</div>
        <div className="text-xs text-gray-400">SANİYE</div>
      </div>
    </div>
  );
}

// Define categories for filtering
const categories = [
  { id: '', name: 'Tümü' },
  { id: 'Nakit Etkinlik', name: 'Nakit Etkinlikler' },
  { id: 'Freespin', name: 'Freespin' },
  { id: 'Özel Etkinlik', name: 'Özel Etkinlikler' },
  { id: 'Kayıt Etkinlik', name: 'Kayıt Etkinlikleri' }
];

export default function EventsPage() {
  const router = useRouter();
  const { user, updateJackPoints } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<string[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningEvent, setJoiningEvent] = useState<{ id: string; title: string; reward: number } | null>(null);
  const [showCoinAnim, setShowCoinAnim] = useState(false);
  const [coinAmount, setCoinAmount] = useState(0);
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  
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
    setShowCoinAnim(true);
    setCoinAmount(amount);
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
    setShowJoinModal(true);
  };

  // Handle final event join after confirmation
  const handleJoinConfirm = async () => {
    if (!joiningEvent) return;
    
    // Call the existing joinEvent function
    joinEvent(joiningEvent.id, joiningEvent.title, joiningEvent.reward);
    
    // Close modal
    setShowJoinModal(false);
    setJoiningEvent(null);
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
  
  // Handle clicking on an event card to show details
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };
  
  // Handler for the join event button
  const handleJoinEvent = (eventId: string, eventTitle: string, reward: number) => {
    // set joining event data for the confirmation modal
    setJoiningEvent({ id: eventId, title: eventTitle, reward });
    setShowJoinModal(true);
  };
  
  // Filter events based on selected category
  const filteredEvents = events.filter(event => 
    selectedCategory === '' || event.category === selectedCategory
  );
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Calendar className="mr-2 text-[#FF6B00]" /> Etkinlikler
        </h1>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedCategory === category.id
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Events Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-t-2 border-b-2 border-[#FF6B00] rounded-full animate-spin"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <GridCardContainer>
            {filteredEvents.map((event) => (
              <GridCard 
                key={event.id} 
                onClick={() => handleEventClick(event)}
                className="cursor-pointer"
              >
                {/* Event Image */}
                <div className="relative h-32 w-full">
                  <Image
                    src={event.image || '/placeholder-icon.svg'}
                    alt={event.title}
                    fill
                    style={{
                      objectFit: 'cover',
                    }}
                    className={`rounded-t-lg ${event.image ? '' : 'p-5 bg-gray-700'}`}
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black opacity-70"></div>
                  
                  {/* Sponsor Logo */}
                  {event.partnerLogo && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                      <Image
                        src={event.partnerLogo}
                        alt={event.partnerName || 'Sponsor'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    </div>
                  )}
                </div>
                
                {/* Event Content */}
                <GridCardContent>
                  <GridCardTitle className="mb-2">{event.title}</GridCardTitle>
                  
                  <div className="flex items-center text-xs text-gray-400 mb-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    <span>{event.date}</span>
                  </div>
                  
                  <div className="flex items-center text-xs text-gray-400">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>{event.location}</span>
                  </div>
                  
                  {event.depositText && (
                    <div className="mt-2 text-xs text-center font-medium text-amber-500">
                      {event.depositText}
                    </div>
                  )}
                </GridCardContent>
                
                {/* Event Footer */}
                <GridCardFooter className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-xs font-medium text-white">{event.reward}</span>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (joinedEvents.includes(event.id)) {
                        // Already joined
                        return;
                      }
                      handleJoinEvent(event.id, event.title, event.reward);
                    }}
                    className={`text-xs px-3 py-1 rounded font-medium ${
                      joinedEvents.includes(event.id)
                        ? 'bg-green-600 text-white'
                        : 'bg-[#FF6B00] hover:bg-[#E05A00] text-white'
                    }`}
                  >
                    {joinedEvents.includes(event.id) ? 'Katıldınız' : 'Katıl'}
                  </button>
                </GridCardFooter>
              </GridCard>
            ))}
          </GridCardContainer>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Etkinlik Bulunamadı</h3>
            <p className="text-gray-400">Bu kategoride şu anda aktif etkinlik bulunmamaktadır.</p>
          </div>
        )}
        
        {/* Floating Coin Animation */}
        <FloatingCoin 
          amount={coinAmount}
          isVisible={showCoinAnim}
          onAnimationEnd={() => setShowCoinAnim(false)}
        />
        
        {/* Join Confirmation Modal */}
        {showJoinModal && joiningEvent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-white mb-4">Etkinliğe Katıl</h3>
              <p className="text-gray-300 mb-6">
                <strong>{joiningEvent.title}</strong> etkinliğine katılmak istediğinize emin misiniz?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                >
                  İptal
                </button>
                <button
                  onClick={handleJoinConfirm}
                  className="px-4 py-2 bg-[#FF6B00] hover:bg-[#E05A00] text-white rounded-md"
                >
                  Katıl
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg max-w-md w-full p-6 relative">
              <button 
                onClick={() => setShowEventDetails(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h3 className="text-xl font-bold text-white mb-4">{selectedEvent.title}</h3>
              
              <div className="relative h-40 w-full mb-4">
                <Image
                  src={selectedEvent.image || '/placeholder-icon.svg'}
                  alt={selectedEvent.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-lg"
                />
              </div>
              
              <div className="mb-4">
                <p className="text-gray-300 mb-4">{selectedEvent.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-[#FF6B00] mr-2 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Tarih</p>
                      <p className="text-gray-400 text-sm">{selectedEvent.date} {selectedEvent.time}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-[#FF6B00] mr-2 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Konum</p>
                      <p className="text-gray-400 text-sm">{selectedEvent.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Coins className="w-5 h-5 text-[#FF6B00] mr-2 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Ödül</p>
                      <p className="text-gray-400 text-sm">{selectedEvent.reward} puan</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowEventDetails(false);
                  if (!joinedEvents.includes(selectedEvent.id)) {
                    handleJoinEvent(selectedEvent.id, selectedEvent.title, selectedEvent.reward);
                  }
                }}
                className={`w-full py-2 rounded-md text-white font-medium ${
                  joinedEvents.includes(selectedEvent.id)
                    ? 'bg-green-600'
                    : 'bg-[#FF6B00] hover:bg-[#E05A00]'
                }`}
              >
                {joinedEvents.includes(selectedEvent.id) ? 'Katıldınız' : 'Katıl'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 