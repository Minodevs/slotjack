'use client';

import { useState, useEffect } from 'react';
import { Gift, ExternalLink, Star } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { getSponsors, Sponsor } from '@/services/SponsorsService';
import { VIPSiteCard, VIPSiteGrid } from '@/components/VIPSiteCard';

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
        <div className="w-full flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <div className="inline-block w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="w-full px-3 py-3 sm:px-4 sm:py-4">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center">
            <Gift className="w-6 h-6 sm:w-7 sm:h-7 text-[#FF6B00] mr-2" />
            SLOTJACK İN TERCİHİ
          </h1>
          <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">En iyi bahis siteleri ve bonusları</p>
        </div>
        
        {/* Featured Sponsors Section */}
        {featuredSponsors.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">
              VIP Siteler
            </h2>
            <VIPSiteGrid>
              {featuredSponsors.map(sponsor => (
                <VIPSiteCard
                  key={sponsor.id}
                  logo={sponsor.logo}
                  name={sponsor.name}
                  primaryBonus={sponsor.bonuses[0].text}
                  secondaryBonus={sponsor.bonuses[1].text}
                  tags={sponsor.tags}
                  buttonText={sponsor.buttonText}
                  buttonLink={sponsor.website}
                />
              ))}
            </VIPSiteGrid>
          </div>
        )}
        
        {/* Regular Sponsors Section */}
        {regularSponsors.length > 0 && (
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Önerilen Siteler</h2>
            <VIPSiteGrid>
              {regularSponsors.map(sponsor => (
                <VIPSiteCard
                  key={sponsor.id}
                  logo={sponsor.logo}
                  name={sponsor.name}
                  primaryBonus={sponsor.bonuses[0].text}
                  secondaryBonus={sponsor.bonuses[1].text}
                  tags={sponsor.tags}
                  buttonText={sponsor.buttonText}
                  buttonLink={sponsor.website}
                />
              ))}
            </VIPSiteGrid>
          </div>
        )}
        
        {/* No sponsors message */}
        {sponsors.length === 0 && !loading && (
          <div className="bg-gray-800 rounded-lg p-6 sm:p-8 text-center">
            <p className="text-gray-400 text-sm sm:text-base">Henüz sponsor bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
} 