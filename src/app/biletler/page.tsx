'use client';

import { useState } from 'react';
import { Ticket, Calendar, MapPin, Users, Filter, Search } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for tickets
const ticketsData = [
  {
    id: 1,
    title: 'SLOTJACK Yaz Festivali - VIP Bilet',
    image: 'https://picsum.photos/id/1070/800/400',
    price: 999.99,
    category: 'festival',
    date: '15 Temmuz 2025',
    location: 'İstanbul, Türkiye',
    available: 50,
    total: 100,
    description: 'VIP bilet ile özel alan erişimi, ücretsiz içecekler ve özel etkinliklere katılım hakkı.',
  },
  {
    id: 2,
    title: 'Poker Turnuvası Finali - Standart Bilet',
    image: 'https://picsum.photos/id/1071/800/400',
    price: 299.99,
    category: 'turnuva',
    date: '22 Haziran 2025',
    location: 'Ankara, Türkiye',
    available: 150,
    total: 200,
    description: 'Turnuva finaline katılım hakkı ve temel hizmetler.',
  },
  {
    id: 3,
    title: 'Slot Oyunları Workshop - Öğrenci Bileti',
    image: 'https://picsum.photos/id/1072/800/400',
    price: 149.99,
    category: 'workshop',
    date: '10 Haziran 2025',
    location: 'İzmir, Türkiye',
    available: 30,
    total: 50,
    description: 'Öğrencilere özel indirimli workshop katılım bileti.',
  },
  {
    id: 4,
    title: 'Blackjack Şampiyonası - Premium Bilet',
    image: 'https://picsum.photos/id/1073/800/400',
    price: 499.99,
    category: 'turnuva',
    date: '5 Ağustos 2025',
    location: 'Antalya, Türkiye',
    available: 25,
    total: 50,
    description: 'Premium bilet ile özel masalar, VIP hizmet ve özel etkinliklere katılım.',
  },
  {
    id: 5,
    title: 'Oyun Tasarımı Konferansı - Standart Bilet',
    image: 'https://picsum.photos/id/1074/800/400',
    price: 199.99,
    category: 'konferans',
    date: '12 Eylül 2025',
    location: 'Bursa, Türkiye',
    available: 100,
    total: 200,
    description: 'Konferansa katılım hakkı ve temel materyaller.',
  },
  {
    id: 6,
    title: 'Roulette Yarışması - VIP Bilet',
    image: 'https://picsum.photos/id/1075/800/400',
    price: 399.99,
    category: 'turnuva',
    date: '30 Temmuz 2025',
    location: 'İstanbul, Türkiye',
    available: 20,
    total: 40,
    description: 'VIP bilet ile özel masalar, şampanya servisi ve özel etkinliklere katılım.',
  },
];

// Filter options
const filterOptions = [
  { id: 'all', name: 'Tümü' },
  { id: 'festival', name: 'Festival' },
  { id: 'turnuva', name: 'Turnuva' },
  { id: 'workshop', name: 'Workshop' },
  { id: 'konferans', name: 'Konferans' },
];

export default function TicketsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tickets based on selected category and search query
  const filteredTickets = ticketsData.filter(
    (ticket) => 
      (selectedFilter === 'all' || ticket.category === selectedFilter) &&
      (searchQuery === '' || 
       ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       ticket.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Biletler" 
        description="SLOTJACK etkinlikleri için bilet satın alın" 
        icon={Ticket} 
      />

      {/* Search and filter section */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Bilet ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1E1E1E] text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-400" />
            <h2 className="text-lg font-semibold mr-4">Filtrele</h2>
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
        </div>
      </div>

      {/* Tickets grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTickets.map((ticket) => (
          <div 
            key={ticket.id} 
            className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={ticket.image}
                alt={ticket.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B00] text-white">
                  {filterOptions.find(opt => opt.id === ticket.category)?.name}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{ticket.title}</h3>
              <p className="text-gray-400 mb-4">{ticket.description}</p>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{ticket.date}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{ticket.location}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{ticket.available} / {ticket.total} Bilet Kaldı</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-[#FF6B00]">{ticket.price.toFixed(2)} TL</span>
                <button 
                  className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Satın Al
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 