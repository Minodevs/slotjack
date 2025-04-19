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
      <div className="absolute top-2 right-2 z-10">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      </div>
      
      {/* Logo */}
      <div className="relative w-full h-28 flex items-center justify-center p-4">
        <img 
          src={logo} 
          alt={name} 
          className="object-contain h-full max-w-full" 
        />
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col items-center justify-center flex-grow text-center">
        <p className="text-[#FF6B00] font-bold text-2xl mb-1">{primaryBonus}</p>
        <p className="text-white text-base mb-3">{secondaryBonus}</p>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center my-2 w-full">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-700 text-white text-sm px-3 py-1 rounded-md">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with button */}
      <div className="p-4 mt-auto w-full">
        <a 
          href={buttonLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#FF6B00] hover:bg-[#E05A00] text-white font-medium py-3 rounded-md w-full text-center block text-base"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

export function VIPSiteGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {children}
    </div>
  );
} 