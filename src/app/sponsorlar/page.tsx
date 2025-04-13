'use client';

import { Gift, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/shared/PageHeader';
import Image from 'next/image';

// Mock data for sponsors
const sponsorsData = [
  {
    id: 1,
    name: 'TechCorp',
    logo: 'https://picsum.photos/id/1025/200/100',
    website: 'https://example.com',
    tier: 'platinum',
    description: 'Teknoloji dünyasının öncü şirketi',
  },
  {
    id: 2,
    name: 'GameMaster',
    logo: 'https://picsum.photos/id/1026/200/100',
    website: 'https://example.com',
    tier: 'platinum',
    description: 'Oyun dünyasının lider markası',
  },
  {
    id: 3,
    name: 'Digital Solutions',
    logo: 'https://picsum.photos/id/1027/200/100',
    website: 'https://example.com',
    tier: 'gold',
    description: 'Dijital çözümler sunan yenilikçi şirket',
  },
  {
    id: 4,
    name: 'Innovate Gaming',
    logo: 'https://picsum.photos/id/1028/200/100',
    website: 'https://example.com',
    tier: 'gold',
    description: 'Oyun endüstrisinde yenilikçi çözümler',
  },
  {
    id: 5,
    name: 'Future Tech',
    logo: 'https://picsum.photos/id/1029/200/100',
    website: 'https://example.com',
    tier: 'silver',
    description: 'Geleceğin teknolojilerini bugünden sunuyor',
  },
  {
    id: 6,
    name: 'Gaming World',
    logo: 'https://picsum.photos/id/1030/200/100',
    website: 'https://example.com',
    tier: 'silver',
    description: 'Oyun dünyasının kapılarını aralıyor',
  },
  {
    id: 7,
    name: 'Digital Entertainment',
    logo: 'https://picsum.photos/id/1031/200/100',
    website: 'https://example.com',
    tier: 'bronze',
    description: 'Dijital eğlence dünyasının yeni sesi',
  },
  {
    id: 8,
    name: 'Game Innovators',
    logo: 'https://picsum.photos/id/1032/200/100',
    website: 'https://example.com',
    tier: 'bronze',
    description: 'Oyun dünyasında yenilikçi çözümler',
  },
];

// Sponsor tiers with their respective styles
const sponsorTiers = [
  { id: 'platinum', name: 'Platin Sponsorlar', color: 'bg-gray-200 text-gray-800' },
  { id: 'gold', name: 'Altın Sponsorlar', color: 'bg-amber-100 text-amber-800' },
  { id: 'silver', name: 'Gümüş Sponsorlar', color: 'bg-gray-100 text-gray-700' },
  { id: 'bronze', name: 'Bronz Sponsorlar', color: 'bg-amber-50 text-amber-700' },
];

export default function SponsorsPage() {
  // Group sponsors by tier
  const sponsorsByTier = sponsorTiers.map(tier => ({
    ...tier,
    sponsors: sponsorsData.filter(sponsor => sponsor.tier === tier.id)
  }));

  return (
    <div className="max-w-[1440px] mx-auto">
      <PageHeader 
        title="Sponsorlar" 
        description="SLOTJACK'i destekleyen değerli sponsorlarımız" 
        icon={Gift} 
      />

      {/* Sponsor tiers */}
      {sponsorsByTier.map(tier => (
        <div key={tier.id} className="mb-12">
          <h2 className={`text-xl font-bold mb-6 px-4 py-2 rounded-lg inline-block ${tier.color}`}>
            {tier.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tier.sponsors.map(sponsor => (
              <div 
                key={sponsor.id} 
                className="bg-[#1E1E1E] rounded-xl overflow-hidden p-6 flex flex-col items-center hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full h-24 mb-4">
                  <Image
                    src={sponsor.logo}
                    alt={sponsor.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold mb-2">{sponsor.name}</h3>
                <p className="text-gray-400 text-center mb-4">{sponsor.description}</p>
                <a 
                  href={sponsor.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-[#FF6B00] hover:text-[#FF8533] transition-colors"
                >
                  <span className="mr-1">Web Sitesi</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Become a sponsor section */}
      <div className="bg-[#1E1E1E] rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Sponsor Olmak İster misiniz?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          SLOTJACK platformunda sponsor olarak yer almak ve binlerce oyuncuya ulaşmak için bizimle iletişime geçin.
        </p>
        <button className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-8 py-3 rounded-lg font-semibold transition-colors">
          İletişime Geç
        </button>
      </div>
    </div>
  );
} 