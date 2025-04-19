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
    <div className="flex flex-col bg-gray-800 border border-gray-700 rounded-lg overflow-hidden hover:border-[#FF6B00] transition-colors">
      {/* VIP Star */}
      <div className="absolute top-2 right-2 z-10">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
      </div>
      
      {/* Logo */}
      <div className="relative w-full h-24 flex items-center justify-center">
        <img 
          src={logo} 
          alt={name} 
          className="object-contain h-full max-w-full p-2" 
        />
      </div>
      
      {/* Content */}
      <div className="p-3 flex flex-col items-center justify-center flex-grow">
        <div className="text-center mb-4">
          <p className="text-[#FF6B00] font-bold text-xl">{primaryBonus}</p>
          <p className="text-gray-300 text-sm">{secondaryBonus}</p>
        </div>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-3">
            {tags.map((tag, index) => (
              <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer with button */}
      <div className="p-3 border-t border-gray-700 w-full">
        <a 
          href={buttonLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-[#FF6B00] hover:bg-[#E05A00] text-white font-medium py-2 rounded w-full text-center block"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}

export function VIPSiteGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {children}
    </div>
  );
} 