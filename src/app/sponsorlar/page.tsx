'use client';

import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { getSponsors, Sponsor } from '@/services/SponsorsService';
import { VIPSiteCard, SiteCardsGrid } from '@/components/VIPSiteCard';
import Image from 'next/image';

export default function SponsorsPage() {
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
        <div className="w-full flex items-center justify-center min-h-[500px] bg-gray-900">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-base text-gray-300">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="bg-gray-900 min-h-screen pb-10">
        {/* Global sponsors section (from screenshot) */}
        <div className="px-4 pt-8 pb-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* First global sponsor */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-6 flex flex-col items-center">
                  <div className="mb-4">
                    <img 
                      src="/sponsored parts/sportsbet.io.png" 
                      alt="Sportsbet.io" 
                      className="h-10 object-contain" 
                    />
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-[#FF6B00] text-lg font-medium">GLOBAL</span>{' '}
                    <span className="text-white text-lg font-medium">ANA SPONSOR</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-gray-800 rounded p-4 text-center">
                      <div className="text-yellow-500 font-bold text-xl mb-1">%100</div>
                      <div className="text-gray-300 text-sm leading-tight">
                        HOŞ GELDİN CASİNO BONUSU
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-4 text-center">
                      <div className="text-white font-bold text-xl mb-1">LİMİTSİZ</div>
                      <div className="text-gray-300 text-sm leading-tight">
                        KAT KURALSIZ ÇEKİM İMKANI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Second global sponsor */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
                <div className="p-6 flex flex-col items-center">
                  <div className="mb-4">
                    <img 
                      src="/sponsored parts/mistycasino.png" 
                      alt="Misty Casino" 
                      className="h-10 object-contain" 
                    />
                  </div>
                  <div className="text-center mb-4">
                    <span className="text-[#FF6B00] text-lg font-medium">GLOBAL</span>{' '}
                    <span className="text-white text-lg font-medium">SPONSOR</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-gray-800 rounded p-4 text-center">
                      <div className="text-yellow-500 font-bold text-xl mb-1">%200</div>
                      <div className="text-gray-300 text-sm leading-tight">
                        İLK YATIRIM BONUSU
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded p-4 text-center">
                      <div className="text-white font-bold text-xl mb-1">LİMİTSİZ</div>
                      <div className="text-gray-300 text-sm leading-tight">
                        KAT KURALSIZ ÇEKİM İMKANI
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Slotjack section */}
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">SLOTJACK'İN TERCİHİ</h2>
          
          {/* VIP Siteler Grid */}
          <div className="relative pb-10">
            <SiteCardsGrid>
              {featuredSponsors.map(sponsor => {
                // Find any specific tags to display
                const extraTags = [];
                
                // Some examples based on your screenshots
                if (sponsor.name === "Zlot") {
                  extraTags.push({text: "%30 VIP Kayıp Bonusu"});
                } else if (sponsor.name === "ESBet") {
                  extraTags.push({text: "Sınırsız Çekim İmkanı"});
                  extraTags.push({text: "slotjack25", className: "bg-gray-800 text-yellow-500"});
                }
                
                return (
                  <VIPSiteCard
                    key={sponsor.id}
                    logo={sponsor.logo}
                    name={sponsor.name}
                    primaryBonus={sponsor.bonuses[0].text}
                    secondaryBonus={sponsor.bonuses[1].text}
                    tags={sponsor.tags}
                    buttonText="Kayıt Ol"
                    buttonLink={sponsor.website}
                    extraTags={extraTags}
                  />
                );
              })}
            </SiteCardsGrid>
          </div>
          
          {/* Regular Sponsors Section (if needed) */}
          {regularSponsors.length > 0 && (
            <div className="mt-12">
              <SiteCardsGrid>
                {regularSponsors.map(sponsor => (
                  <VIPSiteCard
                    key={sponsor.id}
                    logo={sponsor.logo}
                    name={sponsor.name}
                    primaryBonus={sponsor.bonuses[0].text}
                    secondaryBonus={sponsor.bonuses[1].text}
                    tags={sponsor.tags}
                    buttonText="Kayıt Ol"
                    buttonLink={sponsor.website}
                  />
                ))}
              </SiteCardsGrid>
            </div>
          )}
          
          {/* No sponsors message */}
          {sponsors.length === 0 && !loading && (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-400">Henüz sponsor bulunmamaktadır.</p>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 