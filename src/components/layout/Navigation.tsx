'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Trophy,
  Gift,
  Calendar,
  ShoppingBag,
  Ticket,
  MessageSquare,
  LogOut,
  User,
  Shield,
} from 'lucide-react';
import { UserRank } from '@/app/page';

const navigationItems = [
  { name: 'Ana Sayfa', href: '/', icon: Home },
  { name: 'Liderlik Tablosu', href: '/liderlik-tablosu', icon: Trophy },
  { name: 'Sponsorlar', href: '/sponsorlar', icon: Gift },
  { name: 'Etkinlikler', href: '/etkinlikler', icon: Calendar },
  { name: 'Market', href: '/market', icon: ShoppingBag },
  { name: 'Biletler', href: '/biletler', icon: Ticket },
  { name: 'Sizden Gelenler', href: '/sizden-gelenler', icon: MessageSquare },
];

export default function Navigation() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed left-0 top-0 h-full w-60 bg-gray-900 border-r border-gray-800 z-50 overflow-y-auto">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#FF6B00]">SLOTJACK</span>
          </Link>
        </div>

        <div className="flex-1 px-2 py-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#FF6B00] text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              );
            })}
            
            {/* Admin Panel Link */}
            {user?.rank === UserRank.ADMIN && (
              <li>
                <Link
                  href="/admin"
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    pathname === '/admin'
                      ? 'bg-[#FF6B00] text-white'
                      : 'text-green-500 hover:bg-gray-800 hover:text-green-400'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin Panel</span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="p-4 border-t border-gray-800">
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-800">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-400">{user.email}</span>
              </div>
              <Link
                href="/profil"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                <span>Profil</span>
              </Link>
              <button
                onClick={() => {
                  signOut().then(() => {
                    // Force page refresh to ensure clean logout state
                    window.location.href = '/';
                  });
                }}
                className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Çıkış Yap</span>
              </button>
            </div>
          ) : (
            <Link
              href="/giris"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Giriş Yap</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
} 