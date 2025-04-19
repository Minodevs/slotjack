import React from 'react';
import { Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VIPSiteCardProps {
  logo: string;
  name: string;
  primaryBonus: string;
  secondaryBonus: string;
  tags?: string[];
  buttonText?: string;
  buttonLink: string;
  extraTags?: Array<{text: string, className?: string}>;
}

export function VIPSiteCard({
  logo,
  name,
  primaryBonus,
  secondaryBonus,
  tags = [],
  buttonText = "Üye Ol",
  buttonLink,
  extraTags = []
}: VIPSiteCardProps) {
  return (
    <div className="relative w-full h-full">
      {/* Crown icon */}
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-10">
        <div className="rounded-full bg-yellow-500 p-2 w-10 h-10 flex items-center justify-center">
          <Crown className="w-6 h-6 text-black" />
        </div>
      </div>
      
      <div className="pt-5 flex flex-col bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-lg h-full">        
        {/* Logo */}
        <div className="w-full h-24 flex items-center justify-center mb-4">
          <img 
            src={logo} 
            alt={name} 
            className="object-contain max-h-12 max-w-[80%]" 
          />
        </div>
        
        {/* Main Bonus */}
        <div className="px-3 text-center">
          <h3 className="text-yellow-500 font-bold text-xl mb-1">{primaryBonus}</h3>
          <p className="text-white text-base mb-3">{secondaryBonus}</p>
        </div>
        
        {/* Tags/Additional Info */}
        <div className="flex flex-col gap-2 mx-3 mb-3">
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap justify-center">
              {tags.map((tag, index) => (
                <span key={index} className="bg-gray-800 text-white text-sm px-3 py-1 rounded mx-1 my-1">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Extra Tags (like slotjack25 or specific bonus info) */}
          {extraTags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              {extraTags.map((tag, index) => (
                <span key={index} 
                  className={cn("bg-gray-800 text-white text-sm px-3 py-1 rounded", 
                  tag.className)}>
                  {tag.text}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Stats or Secondary Info (if needed) */}
        <div className="mt-auto">
          {buttonText && (
            <a 
              href={buttonLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#FF6B00] text-white font-medium py-2 block w-full text-center"
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function SiteCardsGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
      {children}
    </div>
  );
} 