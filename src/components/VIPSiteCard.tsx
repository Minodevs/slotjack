import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VIPSiteCardProps {
  logo: string;
  name: string;
  primaryBonus: string;
  secondaryBonus: string;
  tags?: string[];
  buttonText: string;
  buttonLink: string;
}

export function VIPSiteCard({
  logo,
  name,
  primaryBonus,
  secondaryBonus,
  tags = [],
  buttonText,
  buttonLink
}: VIPSiteCardProps) {
  return (
    <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-xl overflow-hidden hover:border-[#FF6B00] transition-colors relative h-full">
      {/* VIP Star */}
      <div className="absolute top-3 right-3 z-10 sm:top-2 sm:right-2">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      </div>
      
      {/* Logo */}
      <div className="relative w-full h-24 sm:h-28 flex items-center justify-center p-3 sm:p-4 bg-gray-900">
        <img 
          src={logo} 
          alt={name} 
          className="object-contain h-full max-w-full" 
          style={{ maxHeight: "70px" }}
        />
      </div>
      
      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col items-center justify-center flex-grow text-center">
        <p className="text-[#FF6B00] font-bold text-xl sm:text-2xl mb-1">{primaryBonus}</p>
        <p className="text-white text-sm sm:text-base mb-2 sm:mb-3">{secondaryBonus}</p>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center my-2 w-full">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-700 text-white text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with button */}
      <div className="px-3 py-3 sm:p-4 mt-auto w-full">
        <a 
          href={buttonLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#FF6B00] hover:bg-[#E05A00] active:bg-[#CC5200] text-white font-medium py-2.5 sm:py-3 rounded-md w-full text-center block text-sm sm:text-base transition-colors"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

export function VIPSiteGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {children}
    </div>
  );
} 