'use client';

import { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { getSponsors, Sponsor } from '@/services/SponsorsService';
import { VIPSiteCard, VIPSiteCardMobile, SiteCardsGrid } from '@/components/VIPSiteCard';
import Image from 'next/image';

// Define the tag type to match what's used in VIPSiteCard
type ExtraTag = {text: string, className?: string};

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
        {/* Slotjack section */}
        <div className="max-w-7xl mx-auto px-4 pt-8">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">SLOTJACK'İN TERCİHİ</h2>
          
          {/* Desktop View - Original */}
          <div className="relative pb-10 hidden md:block">
            <SiteCardsGrid>
              {featuredSponsors.map(sponsor => {
                // Find any specific tags to display
                const extraTags: ExtraTag[] = [];
                
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
          
          {/* Mobile View - New Stacked Layout */}
          <div className="relative pb-8 md:hidden">
            <div className="flex flex-col">
              {featuredSponsors.map(sponsor => {
                // Find any specific tags to display
                const extraTags: ExtraTag[] = [];
                
                // Prepare appropriate tags for each sponsor
                if (sponsor.name === "Zlot") {
                  extraTags.push({text: "%30 VIP"});
                  extraTags.push({text: "Kayıp Bonusu"});
                } else if (sponsor.name === "ESBet") {
                  extraTags.push({text: "slotjack25", className: "text-yellow-500"});
                  extraTags.push({text: "Sınırsız Çekim İmkanı"});
                } else if (sponsor.name === "Sterlinbet") {
                  extraTags.push({text: "Sınırsız Çekim"});
                } else if (sponsor.name === "Etoro") {
                  extraTags.push({text: "Kayıplarınıza Günlük"});
                  extraTags.push({text: "%15 Geri Ödeme"});
                } else if (sponsor.name === "Bullbahis") {
                  extraTags.push({text: "slotjack25"});
                } else if (sponsor.name === "Risebet") {
                  extraTags.push({text: "%100"});
                }
                
                return (
                  <VIPSiteCardMobile
                    key={`mobile-${sponsor.id}`}
                    logo={sponsor.logo}
                    name={sponsor.name}
                    primaryBonus={sponsor.bonuses[0].text}
                    secondaryBonus={sponsor.bonuses[1].text}
                    buttonText="Kayıt Ol"
                    buttonLink={sponsor.website}
                    extraTags={extraTags}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Regular Sponsors Section - Desktop Only */}
          {regularSponsors.length > 0 && (
            <div className="mt-12 hidden md:block">
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
          
          {/* Regular Sponsors Section - Mobile Only */}
          {regularSponsors.length > 0 && (
            <div className="mt-8 md:hidden">
              <div className="flex flex-col">
                {regularSponsors.map(sponsor => {
                  const extraTags: ExtraTag[] = [];
                  // Add any special tags for regular sponsors if needed
                  
                  return (
                    <VIPSiteCardMobile
                      key={`mobile-reg-${sponsor.id}`}
                      logo={sponsor.logo}
                      name={sponsor.name}
                      primaryBonus={sponsor.bonuses[0].text}
                      secondaryBonus={sponsor.bonuses[1].text}
                      buttonText="Kayıt Ol"
                      buttonLink={sponsor.website}
                      extraTags={extraTags}
                      tags={sponsor.tags}
                    />
                  );
                })}
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
      </div>
    </ClientLayout>
  );
} 