'use client';

import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for events
const eventsData = [
  {
    id: 1,
    title: 'SLOTJACK Yaz Festivali',
    image: 'https://picsum.photos/id/1035/600/400',
    date: '15 Temmuz 2025',
    time: '14:00 - 22:00',
    location: 'İstanbul, Türkiye',
    attendees: 250,
    maxAttendees: 500,
    category: 'festival',
    description: 'Türkiye\'nin en büyük oyun festivali SLOTJACK Yaz Festivali ile geri dönüyor!',
  },
  {
    id: 2,
    title: 'Poker Turnuvası Finali',
    image: 'https://picsum.photos/id/1036/600/400',
    date: '22 Haziran 2025',
    time: '19:00 - 23:00',
    location: 'Ankara, Türkiye',
    attendees: 100,
    maxAttendees: 200,
    category: 'tournament',
    description: 'Yılın en büyük poker turnuvasının finali!',
  },
  {
    id: 3,
    title: 'Slot Oyunları Workshop',
    image: 'https://picsum.photos/id/1037/600/400',
    date: '10 Haziran 2025',
    time: '13:00 - 17:00',
    location: 'İzmir, Türkiye',
    attendees: 50,
    maxAttendees: 100,
    category: 'workshop',
    description: 'Slot oyunları stratejileri ve ipuçları hakkında kapsamlı bir workshop.',
  },
  {
    id: 4,
    title: 'Blackjack Şampiyonası',
    image: 'https://picsum.photos/id/1038/600/400',
    date: '5 Ağustos 2025',
    time: '15:00 - 21:00',
    location: 'Antalya, Türkiye',
    attendees: 75,
    maxAttendees: 150,
    category: 'tournament',
    description: 'Blackjack ustaları için özel turnuva!',
  },
  {
    id: 5,
    title: 'Oyun Tasarımı Konferansı',
    image: 'https://picsum.photos/id/1039/600/400',
    date: '12 Eylül 2025',
    time: '10:00 - 18:00',
    location: 'Bursa, Türkiye',
    attendees: 200,
    maxAttendees: 300,
    category: 'conference',
    description: 'Oyun tasarımı ve geliştirme hakkında kapsamlı bir konferans.',
  },
  {
    id: 6,
    title: 'Roulette Yarışması',
    image: 'https://picsum.photos/id/1040/600/400',
    date: '30 Temmuz 2025',
    time: '20:00 - 00:00',
    location: 'İstanbul, Türkiye',
    attendees: 60,
    maxAttendees: 120,
    category: 'tournament',
    description: 'Roulette ustaları için özel yarışma!',
  },
];

// Filter options
const filterOptions = [
  { id: 'all', name: 'Tümü' },
  { id: 'festival', name: 'Festival' },
  { id: 'tournament', name: 'Turnuva' },
  { id: 'workshop', name: 'Workshop' },
  { id: 'conference', name: 'Konferans' },
];

// Calendar months
const months = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export default function EventsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Filter events based on selected category
  const filteredEvents = eventsData.filter(
    (event) => selectedFilter === 'all' || event.category === selectedFilter
  );

  // Function to get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);
  
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-24 bg-[#1E1E1E] rounded-lg"></div>);
  }
  
  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    // Check if there are events on this day
    const dayEvents = filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth && 
             eventDate.getFullYear() === currentYear;
    });
    
    calendarDays.push(
      <div key={`day-${day}`} className="h-24 bg-[#1E1E1E] rounded-lg p-2">
        <div className="font-bold mb-1">{day}</div>
        {dayEvents.map(event => (
          <div 
            key={event.id} 
            className="text-xs bg-[#FF6B00] text-white p-1 rounded mb-1 truncate"
            title={event.title}
          >
            {event.title}
          </div>
        ))}
      </div>
    );
  }

  // Function to change month
  const changeMonth = (increment: number) => {
    let newMonth = currentMonth + increment;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Etkinlikler" 
        description="Yaklaşan etkinlikler ve turnuvalar" 
        icon={Calendar} 
      />

      {/* Filter options */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-gray-400" />
          <h2 className="text-lg font-semibold">Filtrele</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedFilter(option.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedFilter === option.id
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#2A2A2A]'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar section */}
        <div className="lg:col-span-2">
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{months[currentMonth]} {currentYear}</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={() => changeMonth(-1)}
                  className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => changeMonth(1)}
                  className="p-2 rounded-lg bg-[#2A2A2A] hover:bg-[#3A3A3A] transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
                <div key={day} className="text-center font-medium text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {calendarDays}
            </div>
          </div>
        </div>

        {/* Upcoming events section */}
        <div>
          <h2 className="text-xl font-bold mb-4">Yaklaşan Etkinlikler</h2>
          <div className="space-y-4">
            {filteredEvents
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .slice(0, 5)
              .map(event => (
                <div 
                  key={event.id} 
                  className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-32">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{event.title}</h3>
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{event.attendees} / {event.maxAttendees} Katılımcı</span>
                      </div>
                    </div>
                    <button className="w-full mt-4 bg-[#FF6B00] hover:bg-[#FF8533] text-white py-2 rounded-lg font-medium transition-colors">
                      Katıl
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
} 