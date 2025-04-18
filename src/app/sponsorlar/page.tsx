'use client';

import { useState, useEffect } from 'react';
import { Gift, ExternalLink, Star } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import Image from 'next/image';
import { getSponsors, Sponsor } from '@/services/SponsorsService';

export default function SponsorsPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'vip'>('all');
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load sponsors from the service
    const loadSponsors = () => {
      try {
        const sponsorData = getSponsors();
        // Only show active sponsors (not soft-deleted)
        const activeSponsors = sponsorData.filter(sponsor => 
          sponsor.isActive !== false // Show if isActive is true or undefined
        );
        setSponsors(activeSponsors);
      } catch (error) {
        console.error('Error loading sponsors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSponsors();
  }, []);
  
  // Separate featured sponsors from regular sponsors
  const featuredSponsors = sponsors.filter(sponsor => sponsor.featured);
  const regularSponsors = sponsors.filter(sponsor => !sponsor.featured);
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold flex items-center">
            <Gift className="w-8 h-8 text-[#FF6B00] mr-2" />
            SLOTJACK İN TERCİHİ
          </h1>
        </div>
        
        {/* Featured Sponsors Section */}
        {featuredSponsors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">VIP Siteler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {featuredSponsors.map(sponsor => (
                <div 
                  key={sponsor.id} 
                  className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-[#FF6B00] transition-colors"
                >
                  <div className="p-4 flex flex-col items-center justify-center h-full">
                    <div className="absolute top-2 right-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    </div>
                    
                    {/* Sponsor Logo */}
                    <div className="w-full h-20 relative mb-4 flex items-center justify-center">
                      <Image 
                        src={sponsor.logo} 
                        alt={sponsor.name} 
                        width={150}
                        height={80}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    
                    {/* Bonus Information */}
                    <div className="text-center mb-4">
                      <p className="text-[#FF6B00] font-bold text-xl">{sponsor.bonuses[0].text}</p>
                      <p className="text-gray-300 text-sm">{sponsor.bonuses[1].text}</p>
                    </div>
                    
                    {/* Tags */}
                    {sponsor.tags && sponsor.tags.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {sponsor.tags.map((tag, index) => (
                          <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Action Button */}
                    <a 
                      href={sponsor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#FF6B00] hover:bg-[#E05A00] text-white text-sm font-medium px-6 py-2 rounded w-full text-center"
                    >
                      {sponsor.buttonText}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Regular Sponsors Section */}
        {regularSponsors.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">Önerilen Siteler</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {regularSponsors.map(sponsor => (
                <div 
                  key={sponsor.id} 
                  className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-[#FF6B00] transition-colors"
                >
                  <div className="p-4 flex flex-col items-center justify-center h-full">
                    {/* Sponsor Logo */}
                    <div className="w-full h-20 relative mb-4 flex items-center justify-center">
                      <Image 
                        src={sponsor.logo} 
                        alt={sponsor.name} 
                        width={150}
                        height={80}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    
                    {/* Bonus Information */}
                    <div className="text-center mb-4">
                      <p className="text-[#FF6B00] font-bold text-xl">{sponsor.bonuses[0].text}</p>
                      <p className="text-gray-300 text-sm">{sponsor.bonuses[1].text}</p>
                    </div>
                    
                    {/* Action Button */}
                    <a 
                      href={sponsor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-[#FF6B00] hover:bg-[#E05A00] text-white text-sm font-medium px-6 py-2 rounded w-full text-center"
                    >
                      {sponsor.buttonText}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* No sponsors message */}
        {sponsors.length === 0 && !loading && (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-400">Henüz sponsor bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 