import Image from "next/image";
import { Facebook, Twitter, Instagram, Youtube, Twitch } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Hero Section */}
      <section className="relative h-[400px] rounded-xl overflow-hidden mb-8">
        <Image
          src="https://picsum.photos/1200/400"
          alt="Hero Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to SLOTJACK</h1>
            <p className="text-xl mb-8">Your Ultimate Gaming Destination</p>
            <button className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-8 py-3 rounded-lg text-lg font-semibold">
              Şimdi Giriş Yap
            </button>
          </div>
        </div>
      </section>

      {/* Social Media Grid */}
      <section className="grid grid-cols-5 gap-4">
        {[
          { name: 'Facebook', icon: Facebook, color: '#1877F2' },
          { name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
          { name: 'Instagram', icon: Instagram, color: '#E4405F' },
          { name: 'Youtube', icon: Youtube, color: '#FF0000' },
          { name: 'Twitch', icon: Twitch, color: '#9146FF' },
        ].map((social) => {
          const Icon = social.icon;
          return (
            <div
              key={social.name}
              className="bg-[#1E1E1E] p-6 rounded-xl flex flex-col items-center justify-center space-y-4 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
            >
              <Icon className="w-12 h-12" style={{ color: social.color }} />
              <span className="text-lg font-semibold">{social.name}</span>
            </div>
          );
        })}
      </section>
    </div>
  );
}
