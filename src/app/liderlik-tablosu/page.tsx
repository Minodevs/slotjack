'use client';

import { useState } from 'react';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for the leaderboard
const leaderboardData = [
  { id: 1, name: 'Ahmet Yılmaz', points: 12500, rank: 1, avatar: 'https://picsum.photos/id/64/100/100', wins: 42 },
  { id: 2, name: 'Mehmet Demir', points: 11800, rank: 2, avatar: 'https://picsum.photos/id/65/100/100', wins: 38 },
  { id: 3, name: 'Ayşe Kaya', points: 11200, rank: 3, avatar: 'https://picsum.photos/id/66/100/100', wins: 35 },
  { id: 4, name: 'Fatma Şahin', points: 10500, rank: 4, avatar: 'https://picsum.photos/id/67/100/100', wins: 32 },
  { id: 5, name: 'Ali Öztürk', points: 9800, rank: 5, avatar: 'https://picsum.photos/id/68/100/100', wins: 30 },
  { id: 6, name: 'Zeynep Çelik', points: 9200, rank: 6, avatar: 'https://picsum.photos/id/69/100/100', wins: 28 },
  { id: 7, name: 'Mustafa Yıldız', points: 8900, rank: 7, avatar: 'https://picsum.photos/id/70/100/100', wins: 26 },
  { id: 8, name: 'Elif Arslan', points: 8500, rank: 8, avatar: 'https://picsum.photos/id/71/100/100', wins: 24 },
  { id: 9, name: 'Hasan Aydın', points: 8200, rank: 9, avatar: 'https://picsum.photos/id/72/100/100', wins: 22 },
  { id: 10, name: 'Selin Yılmaz', points: 8000, rank: 10, avatar: 'https://picsum.photos/id/73/100/100', wins: 20 },
];

// Time period options
const timePeriods = [
  { id: 'daily', name: 'Günlük' },
  { id: 'weekly', name: 'Haftalık' },
  { id: 'monthly', name: 'Aylık' },
  { id: 'allTime', name: 'Tüm Zamanlar' },
];

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');

  // Function to get the appropriate icon for the rank
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Liderlik Tablosu" 
        description="En iyi oyuncuları keşfedin ve rekabete katılın" 
        icon={Trophy} 
      />

      {/* Time period selector */}
      <div className="flex space-x-2 mb-6">
        {timePeriods.map((period) => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedPeriod === period.id
                ? 'bg-[#FF6B00] text-white'
                : 'bg-[#1E1E1E] text-gray-300 hover:bg-[#2A2A2A]'
            }`}
          >
            {period.name}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2A2A2A] text-left">
                <th className="py-4 px-6">Sıra</th>
                <th className="py-4 px-6">Oyuncu</th>
                <th className="py-4 px-6">Puan</th>
                <th className="py-4 px-6">Kazanılan Turnuva</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player) => (
                <tr 
                  key={player.id} 
                  className="border-t border-gray-700 hover:bg-[#2A2A2A] transition-colors"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      {getRankIcon(player.rank)}
                      <span className="ml-2 font-bold">{player.rank}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                        <Image
                          src={player.avatar}
                          alt={player.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-[#FF6B00]">{player.points.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span>{player.wins}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 