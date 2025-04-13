'use client';

import { useState } from 'react';
import { Users, Calendar, Clock, Trophy, Filter } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for tournaments
const tournamentsData = [
  {
    id: 1,
    title: 'Haftalık Büyük Turnuva',
    image: 'https://picsum.photos/id/1015/600/400',
    participants: 128,
    maxParticipants: 256,
    prize: '50,000 TL',
    startDate: '15 Nisan 2025',
    status: 'active',
    category: 'all',
  },
  {
    id: 2,
    title: 'Slot Oyunları Şampiyonası',
    image: 'https://picsum.photos/id/1016/600/400',
    participants: 64,
    maxParticipants: 128,
    prize: '25,000 TL',
    startDate: '20 Nisan 2025',
    status: 'upcoming',
    category: 'slots',
  },
  {
    id: 3,
    title: 'Poker Turnuvası',
    image: 'https://picsum.photos/id/1018/600/400',
    participants: 32,
    maxParticipants: 64,
    prize: '30,000 TL',
    startDate: '25 Nisan 2025',
    status: 'upcoming',
    category: 'poker',
  },
  {
    id: 4,
    title: 'Blackjack Yarışması',
    image: 'https://picsum.photos/id/1019/600/400',
    participants: 48,
    maxParticipants: 96,
    prize: '20,000 TL',
    startDate: '30 Nisan 2025',
    status: 'upcoming',
    category: 'blackjack',
  },
  {
    id: 5,
    title: 'Roulette Ustaları',
    image: 'https://picsum.photos/id/1020/600/400',
    participants: 24,
    maxParticipants: 48,
    prize: '15,000 TL',
    startDate: '5 Mayıs 2025',
    status: 'upcoming',
    category: 'roulette',
  },
  {
    id: 6,
    title: 'Baccarat Turnuvası',
    image: 'https://picsum.photos/id/1021/600/400',
    participants: 16,
    maxParticipants: 32,
    prize: '10,000 TL',
    startDate: '10 Mayıs 2025',
    status: 'upcoming',
    category: 'baccarat',
  },
];

// Filter options
const filterOptions = [
  { id: 'all', name: 'Tümü' },
  { id: 'slots', name: 'Slot Oyunları' },
  { id: 'poker', name: 'Poker' },
  { id: 'blackjack', name: 'Blackjack' },
  { id: 'roulette', name: 'Roulette' },
  { id: 'baccarat', name: 'Baccarat' },
];

export default function TournamentsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter tournaments based on selected category
  const filteredTournaments = tournamentsData.filter(
    (tournament) => selectedFilter === 'all' || tournament.category === selectedFilter
  );

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Turnuvalar" 
        description="En heyecan verici turnuvalara katılın ve ödüller kazanın" 
        icon={Users} 
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

      {/* Tournaments grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament) => (
          <div 
            key={tournament.id} 
            className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={tournament.image}
                alt={tournament.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  tournament.status === 'active' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-500 text-white'
                }`}>
                  {tournament.status === 'active' ? 'Aktif' : 'Yakında'}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{tournament.title}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-400">
                  <Users className="w-5 h-5 mr-2" />
                  <span>{tournament.participants} / {tournament.maxParticipants} Katılımcı</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Başlangıç: {tournament.startDate}</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <Trophy className="w-5 h-5 mr-2" />
                  <span>Ödül: {tournament.prize}</span>
                </div>
              </div>
              <button className="w-full bg-[#FF6B00] hover:bg-[#FF8533] text-white py-2 rounded-lg font-medium transition-colors">
                Katıl
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 