'use client';

import { useState } from 'react';
import { Image as ImageIcon, Filter, Camera, Upload, Heart, MessageCircle, Share2 } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for user submissions
const userSubmissions = [
  {
    id: 1,
    title: 'İlk Büyük Kazancım',
    image: 'https://picsum.photos/id/1080/800/600',
    category: 'kazanç',
    author: 'Ahmet Yılmaz',
    date: '15 Nisan 2025',
    likes: 125,
    comments: 23,
    description: 'SLOTJACK\'te ilk büyük kazancımı elde ettim! Harika bir deneyimdi.',
  },
  {
    id: 2,
    title: 'Turnuva Zaferi',
    image: 'https://picsum.photos/id/1081/800/600',
    category: 'turnuva',
    author: 'Mehmet Demir',
    date: '12 Nisan 2025',
    likes: 98,
    comments: 15,
    description: 'Poker turnuvasında birinci oldum. Tüm SLOTJACK ekibine teşekkürler!',
  },
  {
    id: 3,
    title: 'Yeni Strateji',
    image: 'https://picsum.photos/id/1082/800/600',
    category: 'strateji',
    author: 'Ayşe Kaya',
    date: '10 Nisan 2025',
    likes: 215,
    comments: 45,
    description: 'Geliştirdiğim yeni slot stratejisi ile kazançlarım arttı. Sizlerle paylaşmak istedim.',
  },
  {
    id: 4,
    title: 'Festival Anıları',
    image: 'https://picsum.photos/id/1083/800/600',
    category: 'etkinlik',
    author: 'Fatma Şahin',
    date: '8 Nisan 2025',
    likes: 175,
    comments: 32,
    description: 'SLOTJACK Festivali\'nde harika anılar biriktirdik. Herkesi bekleriz!',
  },
  {
    id: 5,
    title: 'Yeni Oyun Deneyimi',
    image: 'https://picsum.photos/id/1084/800/600',
    category: 'oyun',
    author: 'Ali Öztürk',
    date: '5 Nisan 2025',
    likes: 89,
    comments: 12,
    description: 'Platforma eklenen yeni oyunları denedim. Kesinlikle tavsiye ederim!',
  },
  {
    id: 6,
    title: 'Arkadaş Grubu',
    image: 'https://picsum.photos/id/1085/800/600',
    category: 'topluluk',
    author: 'Zeynep Çelik',
    date: '3 Nisan 2025',
    likes: 145,
    comments: 28,
    description: 'SLOTJACK sayesinde harika bir arkadaş grubu edindik. Her hafta buluşuyoruz!',
  },
];

// Filter options
const filterOptions = [
  { id: 'all', name: 'Tümü' },
  { id: 'kazanç', name: 'Kazançlar' },
  { id: 'turnuva', name: 'Turnuvalar' },
  { id: 'strateji', name: 'Stratejiler' },
  { id: 'etkinlik', name: 'Etkinlikler' },
  { id: 'oyun', name: 'Oyunlar' },
  { id: 'topluluk', name: 'Topluluk' },
];

export default function UserSubmissionsPage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  // Filter submissions based on selected category
  const filteredSubmissions = userSubmissions.filter(
    (submission) => selectedFilter === 'all' || submission.category === selectedFilter
  );

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Sizden Gelenler" 
        description="SLOTJACK topluluğunun paylaştığı deneyimler ve anılar" 
        icon={ImageIcon} 
      />

      {/* Filter options */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="w-5 h-5 mr-2 text-gray-400" />
            <h2 className="text-lg font-semibold">Filtrele</h2>
          </div>
          <button
            onClick={() => setShowSubmissionForm(true)}
            className="flex items-center bg-[#FF6B00] hover:bg-[#FF8533] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Camera className="w-5 h-5 mr-2" />
            Paylaş
          </button>
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

      {/* Submission form modal */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E1E] rounded-xl p-6 max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">Deneyimini Paylaş</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Başlık</label>
                <input
                  type="text"
                  className="w-full bg-[#2A2A2A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                  placeholder="Başlık girin..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kategori</label>
                <select className="w-full bg-[#2A2A2A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B00]">
                  {filterOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  className="w-full bg-[#2A2A2A] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] h-32"
                  placeholder="Deneyimini anlat..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Fotoğraf</label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-400">Fotoğraf yüklemek için tıklayın veya sürükleyin</p>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowSubmissionForm(false)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#FF6B00] text-white hover:bg-[#FF8533] transition-colors"
                >
                  Paylaş
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubmissions.map((submission) => (
          <div 
            key={submission.id} 
            className="bg-[#1E1E1E] rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={submission.image}
                alt={submission.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FF6B00] text-white">
                  {filterOptions.find(opt => opt.id === submission.category)?.name}
                </span>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{submission.title}</h3>
              <p className="text-gray-400 mb-4">{submission.description}</p>
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center">
                  <span>{submission.author}</span>
                </div>
                <span>{submission.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center text-gray-400 hover:text-[#FF6B00] transition-colors">
                    <Heart className="w-5 h-5 mr-1" />
                    <span>{submission.likes}</span>
                  </button>
                  <button className="flex items-center text-gray-400 hover:text-[#FF6B00] transition-colors">
                    <MessageCircle className="w-5 h-5 mr-1" />
                    <span>{submission.comments}</span>
                  </button>
                </div>
                <button className="text-gray-400 hover:text-[#FF6B00] transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 