'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '@/types/user';
import Image from 'next/image';
import { 
  ChevronLeft, Plus, Search, 
  Calendar, X, Edit, Trash2, Save, 
  MapPin, Clock, Users, Tag, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ClientLayout from '../../../components/ClientLayout';

// Event interface matching the user-facing page
interface Event {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  date: Date;
  endDate: Date;
  location: string;
  category: string;
  description: string;
  partnerId: string;
  partnerName: string;
  partnerLogo: string;
  backgroundGradient: string;
  featured: boolean;
  capacity: number;
  ticketsAvailable: boolean;
  stats: {
    available: number;
    participating: number;
    limit: number;
    prizePool: number;
  }
}

// Event category options
const eventCategories = [
  { value: 'nakit', label: 'Nakit Etkinlik' },
  { value: 'freespin', label: 'Freespin Etkinliği' },
  { value: 'bonus', label: 'Bonus Etkinliği' },
  { value: 'ozel', label: 'Özel Etkinlik' },
  { value: 'kayit', label: 'Kayıt Etkinliği' }
];

// Background gradient options
const gradientOptions = [
  { value: 'from-green-500 to-blue-500', label: 'Yeşil - Mavi' },
  { value: 'from-pink-500 to-purple-500', label: 'Pembe - Mor' },
  { value: 'from-green-400 to-teal-500', label: 'Yeşil - Turkuaz' },
  { value: 'from-blue-400 to-cyan-300', label: 'Mavi - Cam Göbeği' },
  { value: 'from-rose-400 to-red-500', label: 'Gül - Kırmızı' },
  { value: 'from-amber-500 to-orange-500', label: 'Amber - Turuncu' },
  { value: 'from-indigo-500 to-purple-500', label: 'İndigo - Mor' },
  { value: 'from-yellow-400 to-orange-500', label: 'Sarı - Turuncu' },
];

// Partner options
const partnerOptions = [
  { id: 'sportsbet', name: 'Sportsbet.io', logo: '/partner-logos/sportsbet.png' },
  { id: 'isisbet', name: 'IsIsBet', logo: '/partner-logos/isisbet.png' },
  { id: 'gambi', name: 'GAMBİ', logo: '/partner-logos/gambi.png' },
  { id: 'efesbet', name: 'Efesbet', logo: '/partner-logos/efesbet.png' },
  { id: 'zlot', name: 'Zlot', logo: '/partner-logos/zlot.png' },
  { id: 'betnano', name: 'Betnano', logo: '/partner-logos/betnano.png' },
];

// Local storage key for events
const EVENTS_STORAGE_KEY = 'slotjack_events';

// Sample events for demonstration
const demoEvents: Event[] = [
  { 
    id: '1', 
    title: 'SPORTSBET.IO X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ', 
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/sportsbet-event.jpg',
    date: new Date('2023-08-15T14:00:00'),
    endDate: new Date('2023-08-15T20:00:00'),
    location: 'Online',
    description: 'Sportsbet.io ile ortak nakit etkinliğimize katılın ve büyük ödülleri kazanma şansı yakalayın.',
    category: 'nakit',
    backgroundGradient: 'from-green-500 to-blue-500',
    partnerId: 'sportsbet',
    partnerName: 'Sportsbet.io',
    partnerLogo: '/partner-logos/sportsbet.png',
    featured: true,
    capacity: 500,
    ticketsAvailable: true,
    stats: {
      available: 11,
      participating: 28,
      limit: 20,
      prizePool: 99999
    }
  },
  { 
    id: '2', 
    title: 'ISISBET X SLOTJACK ÖZEL NAKİT ETKİNLİĞİ', 
    subtitle: 'Özel Nakit Etkinliği',
    image: '/images/events/isisbet-event.jpg',
    date: new Date('2023-08-16T16:00:00'),
    endDate: new Date('2023-08-16T18:30:00'),
    location: 'Online',
    description: 'IsIsBet ile özel nakit etkinliği. Katılın ve büyük ödüller kazanma fırsatını kaçırmayın.',
    category: 'nakit',
    backgroundGradient: 'from-pink-500 to-purple-500',
    partnerId: 'isisbet',
    partnerName: 'IsIsBet',
    partnerLogo: '/partner-logos/isisbet.png',
    featured: true,
    capacity: 300,
    ticketsAvailable: false,
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 99999
    }
  },
  { 
    id: '3', 
    title: 'GAMBİ X SLOTJACK ÖZEL FS ETKİNLİĞİ', 
    subtitle: 'Özel Freespin Etkinliği',
    image: '/images/events/gambi-event.jpg',
    date: new Date('2023-08-17T11:00:00'),
    endDate: new Date('2023-08-17T12:30:00'),
    location: 'Online',
    description: 'GAMBİ ile freespin etkinliğimize katılın. İlk oynayanlar için özel bonuslar.',
    category: 'freespin',
    backgroundGradient: 'from-green-400 to-teal-500',
    partnerId: 'gambi',
    partnerName: 'GAMBİ',
    partnerLogo: '/partner-logos/gambi.png',
    featured: false,
    capacity: 150,
    ticketsAvailable: true,
    stats: {
      available: 0,
      participating: 0,
      limit: 0,
      prizePool: 99999
    }
  },
];

export default function AdminEventsPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  
  // Form state for adding/editing event
  const [eventFormData, setEventFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    endDate: '',
    location: '',
    description: '',
    category: '',
    backgroundGradient: '',
    partnerId: '',
    partnerName: '',
    partnerLogo: '',
    image: '',
    featured: false,
    capacity: 0,
    ticketsAvailable: false,
    availableStats: 0,
    participatingStats: 0,
    limitStats: 0,
    prizePoolStats: 0
  });
  
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
  
  // Load events from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading) {
      try {
        const storedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
        if (storedEvents) {
          // Need to convert date strings back to Date objects
          const parsedEvents = JSON.parse(storedEvents).map((event: any) => {
            try {
              return {
                ...event,
                date: new Date(event.date),
                endDate: new Date(event.endDate)
              };
            } catch (error) {
              console.error('Error converting date for event:', event.id, error);
              // Provide default dates if conversion fails
              return {
                ...event,
                date: new Date(),
                endDate: new Date()
              };
            }
          });
          setEvents(parsedEvents);
        } else {
          // Initialize localStorage with demo events
          localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(
            demoEvents.map(event => ({
              ...event,
              date: event.date.toISOString(),
              endDate: event.endDate.toISOString()
            }))
          ));
          setEvents(demoEvents);
        }
      } catch (error) {
        console.error('Error loading events from localStorage:', error);
        setEvents(demoEvents);
      }
    }
  }, [loading]);
  
  // Save events to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined' && !loading && events.length > 0) {
      try {
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(
          events.map(event => ({
            ...event,
            date: event.date instanceof Date ? event.date.toISOString() : event.date,
            endDate: event.endDate instanceof Date ? event.endDate.toISOString() : event.endDate
          }))
        ));
      } catch (error) {
        console.error('Error saving events to localStorage:', error);
      }
    }
  }, [events, loading]);
  
  // Filter events based on search
  const filteredEvents = events.filter(event =>
    searchQuery === '' ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Format date for display
  const formatEventDate = (date: Date) => {
    try {
      return format(date, 'dd MMMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  // Format input field date
  const formatInputDate = (date: Date) => {
    try {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error('Error formatting input date:', error);
      return '';
    }
  };
  
  // Format time for display
  const formatTimeOnly = (date: Date) => {
    try {
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '--:--';
    }
  };
  
  // Get category label from value
  const getCategoryLabel = (categoryValue: string) => {
    const category = eventCategories.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  // Get partner info from id
  const getPartnerInfo = (partnerId: string) => {
    const partner = partnerOptions.find(p => p.id === partnerId);
    return partner || { id: partnerId, name: partnerId, logo: '' };
  };
  
  // Open modal for adding new event
  const handleAddEvent = () => {
    setEditingEventId(null);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setEventFormData({
      title: '',
      subtitle: '',
      date: formatInputDate(tomorrow),
      endDate: formatInputDate(new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000)), // +2 hours
      location: 'Online',
      description: '',
      category: '',
      backgroundGradient: 'from-green-500 to-blue-500',
      partnerId: '',
      partnerName: '',
      partnerLogo: '',
      image: '',
      featured: true,
      capacity: 100,
      ticketsAvailable: true,
      availableStats: 0,
      participatingStats: 0,
      limitStats: 20,
      prizePoolStats: 99999
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing event
  const handleEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setEventFormData({
      title: event.title,
      subtitle: event.subtitle || '',
      date: formatInputDate(event.date),
      endDate: formatInputDate(event.endDate),
      location: event.location,
      description: event.description,
      category: event.category,
      backgroundGradient: event.backgroundGradient || 'from-green-500 to-blue-500',
      partnerId: event.partnerId || '',
      partnerName: event.partnerName || '',
      partnerLogo: event.partnerLogo || '',
      image: event.image || '',
      featured: event.featured,
      capacity: event.capacity,
      ticketsAvailable: event.ticketsAvailable,
      availableStats: event.stats?.available || 0,
      participatingStats: event.stats?.participating || 0,
      limitStats: event.stats?.limit || 0,
      prizePoolStats: event.stats?.prizePool || 99999
    });
    setIsModalOpen(true);
  };
  
  // Handle delete event
  const handleDeleteEvent = (id: string) => {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      setEvents(prev => prev.filter(event => event.id !== id));
      
      // Also manually trigger storage event for real-time updates in other tabs
      if (typeof window !== 'undefined') {
        const updatedEvents = events.filter(event => event.id !== id);
        localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(
          updatedEvents.map(event => ({
            ...event,
            date: event.date instanceof Date ? event.date.toISOString() : event.date,
            endDate: event.endDate instanceof Date ? event.endDate.toISOString() : event.endDate
          }))
        ));
        
        try {
          const event = new StorageEvent('storage', {
            key: EVENTS_STORAGE_KEY,
            newValue: JSON.stringify(updatedEvents),
            storageArea: localStorage
          });
          window.dispatchEvent(event);
        } catch (error) {
          console.error('Error dispatching storage event:', error);
        }
      }
    }
  };
  
  // Form submission for add/edit event
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    try {
      const startDate = new Date(eventFormData.date);
      const endDate = new Date(eventFormData.endDate);
      
      // Check if dates are valid
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        alert('Lütfen geçerli tarih ve saat giriniz.');
        return;
      }
      
      // Check if end date is after start date
      if (endDate <= startDate) {
        alert('Bitiş tarihi başlangıç tarihinden sonra olmalıdır.');
        return;
      }
      
      const newEvent: Event = {
        id: editingEventId || crypto.randomUUID(), // Use existing ID or generate a new one
        title: eventFormData.title,
        subtitle: eventFormData.subtitle,
        image: eventFormData.image,
        date: startDate,
        endDate: endDate,
        location: eventFormData.location,
        description: eventFormData.description,
        category: eventFormData.category,
        backgroundGradient: eventFormData.backgroundGradient,
        partnerId: eventFormData.partnerId,
        partnerName: eventFormData.partnerName || getPartnerInfo(eventFormData.partnerId).name,
        partnerLogo: eventFormData.partnerLogo || getPartnerInfo(eventFormData.partnerId).logo,
        featured: eventFormData.featured,
        capacity: eventFormData.capacity,
        ticketsAvailable: eventFormData.ticketsAvailable,
        stats: {
          available: eventFormData.availableStats,
          participating: eventFormData.participatingStats,
          limit: eventFormData.limitStats,
          prizePool: eventFormData.prizePoolStats
        }
      };
      
      if (editingEventId) {
        // Update existing event
        setEvents(prev => prev.map(event => event.id === editingEventId ? newEvent : event));
      } else {
        // Add new event
        setEvents(prev => [...prev, newEvent]);
      }
      
      setIsModalOpen(false);
      setEditingEventId(null);
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Etkinlik oluşturulurken bir hata oluştu. Lütfen tüm alanları kontrol edin.');
    }
  };
  
  // Handle input changes for the event form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEventFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'partnerId') {
      const partner = getPartnerInfo(value);
      setEventFormData(prev => ({ 
        ...prev, 
        [name]: value,
        partnerName: partner.name,
        partnerLogo: partner.logo
      }));
    } else {
      setEventFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEventFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
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
            <h1 className="text-3xl font-bold text-white">Etkinlik Yönetimi</h1>
            <p className="text-gray-400">Etkinlikleri ekle, düzenle veya sil</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Etkinlik ara..."
                className="bg-gray-700 text-white px-4 py-2 pl-10 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <button
              onClick={handleAddEvent}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Yeni Etkinlik
            </button>
          </div>
        </div>
        
        {/* Events List */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors flex flex-col">
                <div className="p-4 bg-gray-750 flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${
                      event.category === 'tournament' ? 'bg-red-400' :
                      event.category === 'panel' ? 'bg-blue-400' :
                      event.category === 'competition' ? 'bg-yellow-400' :
                      event.category === 'meetup' ? 'bg-green-400' :
                      event.category === 'concert' ? 'bg-purple-400' : 'bg-indigo-400'
                    }`}></span>
                    <span className="text-gray-300 text-sm font-medium">{getCategoryLabel(event.category)}</span>
                  </div>
                  
                  {event.featured && (
                    <span className="bg-blue-500 text-xs text-white px-2 py-0.5 rounded">Öne Çıkan</span>
                  )}
                </div>
                
                <div className="flex flex-col md:flex-row flex-grow">
                  {/* Event Image */}
                  <div className="w-full md:w-1/3 h-48 md:h-auto relative bg-gray-750">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Calendar className="w-16 h-16 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Event Details */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                    
                    <div className="space-y-2 mb-4 text-sm flex-grow">
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{formatEventDate(event.date)}</span>
                      </div>
                      
                      <div className="flex items-start">
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">
                          {formatTimeOnly(event.date)} - {formatTimeOnly(event.endDate)}
                        </span>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">{event.location}</span>
                      </div>
                      
                      <div className="flex items-start">
                        <Users className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-300">Kapasite: {event.capacity} kişi</span>
                      </div>
                      
                      {!event.ticketsAvailable && (
                        <div className="flex items-start text-amber-400">
                          <AlertCircle className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                          <span>Bilet satışı kapalı</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="flex justify-end space-x-2 mt-auto">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 bg-blue-500 rounded hover:bg-blue-600 text-white flex items-center"
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-1.5 bg-red-500 rounded hover:bg-red-600 text-white flex items-center"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span>Sil</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-white font-medium mb-1">Henüz etkinlik bulunmuyor</p>
            <p className="text-gray-400 text-sm mb-4">Yeni etkinlik ekleyerek başlayabilirsiniz.</p>
            <button
              onClick={handleAddEvent}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Yeni Etkinlik Ekle
            </button>
          </div>
        )}
        
        {/* Add/Edit Event Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl my-8">
              <div className="p-4 bg-gray-700 flex justify-between items-center rounded-t-lg">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  {editingEventId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik Ekle'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded hover:bg-gray-600"
                >
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>
              
              <form onSubmit={handleFormSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-1">Etkinlik Adı</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.title}
                      onChange={handleInputChange}
                      name="title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Başlangıç Tarihi ve Saati</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.date}
                      onChange={handleInputChange}
                      name="date"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Bitiş Tarihi ve Saati</label>
                    <input
                      type="datetime-local"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.endDate}
                      onChange={handleInputChange}
                      name="endDate"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Konum</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.location}
                      onChange={handleInputChange}
                      name="location"
                      required
                      placeholder="Örn: Ana Sahne, Panel Salonu, etc."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Kategori</label>
                    <select
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.category}
                      onChange={handleInputChange}
                      name="category"
                      required
                    >
                      <option value="">Kategori Seçin</option>
                      {eventCategories.map(category => (
                        <option key={category.value} value={category.value}>{category.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-1">Kapasite</label>
                    <input
                      type="number"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={eventFormData.capacity}
                      onChange={handleNumberChange}
                      name="capacity"
                      required
                      min="1"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-white mb-2">Etkinlik Görseli URL</label>
                    <input
                      type="text"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="image"
                      value={eventFormData.image}
                      onChange={handleInputChange}
                      placeholder="/images/events/etkinlik.jpg"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 text-sm font-medium mb-1">Etkinlik Açıklaması</label>
                    <textarea
                      className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                      value={eventFormData.description}
                      onChange={handleInputChange}
                      name="description"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <input
                        type="checkbox"
                        id="featured"
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                        checked={eventFormData.featured}
                        onChange={handleInputChange}
                        name="featured"
                      />
                      <label htmlFor="featured" className="ml-2 text-sm text-gray-300">
                        Ana sayfada öne çıkar
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="ticketsAvailable"
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
                        checked={eventFormData.ticketsAvailable}
                        onChange={handleInputChange}
                        name="ticketsAvailable"
                      />
                      <label htmlFor="ticketsAvailable" className="ml-2 text-sm text-gray-300">
                        Bilet satışı açık
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    {editingEventId ? 'Güncelle' : 'Kaydet'}
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