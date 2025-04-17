'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, BarChart2, Trophy, Gift, Calendar, ShoppingBag, Ticket, MessageSquare, LogOut, Coins, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { UserRank } from '@/types/user';
import LivestreamBanner from './LivestreamBanner';
import { useSiteSettings } from './SiteSettingsProvider';
import LiveChat from './LiveChat';
import Navigation from './layout/Navigation';

function HeaderContent() {
  const { user, signOut, navigate } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      
      // Clear all possible storage locations
      const keysToRemove = [
        'slotjack_user',
        'slotjack_browser_id',
        'slotjack_last_login'
      ];
      
      // Clear localStorage
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.error(`Error removing ${key} from localStorage:`, e);
        }
      });
      
      // Clear sessionStorage
      keysToRemove.forEach(key => {
        try {
          sessionStorage.removeItem(key);
        } catch (e) {
          console.error(`Error removing ${key} from sessionStorage:`, e);
        }
      });
      
      // Clear auth cookie
      document.cookie = 'slotjack_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Use a small timeout to ensure state updates have time to process
      setTimeout(() => {
        // Force hard navigation on logout for complete page refresh
        window.location.href = '/giris?logged_out=true';
      }, 300);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
      // Even if there's an error, still try to redirect
      window.location.href = '/giris?error=true';
    }
  };
  
  // Direct navigation helper that bypasses Next.js router
  const directNavigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <header className="bg-[#1A1A1A] py-4 px-6 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center">
        <button onClick={() => directNavigate('/')} className="text-2xl font-bold" style={{ color: settings.primaryColor }}>
          {settings.siteName}
        </button>
      </div>
      <div>
        {user ? (
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 px-3 py-2 rounded-lg flex items-center">
              <Coins className="w-4 h-4 mr-2" style={{ color: settings.primaryColor }} />
              <span className="font-medium">{user.jackPoints} JackPoints</span>
            </div>
            <button 
              onClick={() => directNavigate('/profil')}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {user.name || user.email}
            </button>
            <button 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:brightness-110 transition-all"
              style={{ backgroundColor: settings.primaryColor, opacity: isLoggingOut ? 0.7 : 1 }}
            >
              {isLoggingOut ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Çıkış...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button onClick={() => directNavigate('/kayit')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors">
              Kayıt Ol
            </button>
            <button onClick={() => directNavigate('/giris')} className="text-white px-4 py-2 rounded-lg font-semibold transition-colors" style={{ backgroundColor: settings.primaryColor }}>
              Giriş Yap
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default function ClientLayout({
  children,
  showLivestream = true
}: {
  children: React.ReactNode;
  showLivestream?: boolean;
}) {
  const { user, loading, navigate } = useAuth();
  const { settings } = useSiteSettings();
  const [isMounted, setIsMounted] = useState(false);
  const [activeRoute, setActiveRoute] = useState('/');
  const [isNavigating, setIsNavigating] = useState(false);
  const [stableRender, setStableRender] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
    
    // Add a safety timeout to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout triggered - resetting loading state');
        // Force reset loading state if it's been too long
        // syncUserData();
      }
    }, 5000); // 5 second safety timeout
    
    // Set initial active route
    if (typeof window !== 'undefined') {
      setActiveRoute(window.location.pathname);
      
      // No longer needed with JWT authentication
      // syncUserData();
      
      // No longer needed with JWT authentication
      // setTimeout(() => {
      //   if (typeof auth.shareCookiesForCrossBrowserAccess === 'function') {
      //     console.log('Sharing cookies from ClientLayout');
      //     auth.shareCookiesForCrossBrowserAccess();
      //   }
      // }, 100);
      
      // Look for any credentials in cookies as a fallback recovery method
      if (!user && !loading) {
        try {
          console.log('No user found, checking for JWT token...');
          
          // Check for JWT token in localStorage
          const token = localStorage.getItem('slotjack_auth_token');
          if (token) {
            console.log('Found JWT token, attempting to restore session');
            // The auth context will handle the rest during initialization
          }
        } catch (e) {
          console.error('Error checking for auth data:', e);
        }
      }
    }
    
    return () => {
      clearTimeout(safetyTimer);
    };
  }, []);
  
  // Add stabilization effect to prevent flickering
  useEffect(() => {
    if (isMounted) {
      // Short delay to ensure fonts and styles are properly loaded
      const timer = setTimeout(() => {
        setStableRender(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMounted]);
  
  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (path === activeRoute) return;
    
    setIsNavigating(true);
    setActiveRoute(path);
    
    setTimeout(() => {
      navigate(path);
      setTimeout(() => {
        setIsNavigating(false);
      }, 300);
    }, 100);
  };
  
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-lg">Yükleniyor...</p>
        </div>
      </div>
    );
  }
  
  const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <div className="relative group">
      <a 
        href={href}
        className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-[#1E1E2E] transition-colors ${
          activeRoute === href ? 'bg-[#1E1E2E]' : ''
        }`}
        onClick={(e) => handleNavigation(href, e)}
        style={activeRoute === href ? { color: settings.primaryColor } : {}}
      >
        {children}
      </a>
      
      {/* Direct navigation fallback that appears on hover */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a 
          href={href} 
          className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          title="Alternatif Geçiş"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
            <path d="M15 3h6v6M21 3l-9 9M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Add GPU acceleration to prevent text flickering */}
      <style jsx global>{`
        * {
          -webkit-font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }
        /* Fix flickering text in Webkit/Chrome browsers */
        .main-content {
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      `}</style>
      
      <Navigation />
      
      <HeaderContent />
      
      {/* Livestream banner */}
      {showLivestream && <LivestreamBanner />}
      
      <div className="flex-grow flex">
        {/* Remove duplicate sidebar */}
        <main className={`flex-grow main-content pl-60 ${stableRender ? 'opacity-100' : 'opacity-98'} transition-opacity duration-150`}>
          {isNavigating ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center">
                <div className="inline-block w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mb-4" style={{ borderColor: settings.primaryColor, borderTopColor: 'transparent' }}></div>
                <p className="text-lg">Yükleniyor...</p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-[#121212] py-4 px-6 text-center text-gray-400 text-sm">
        {settings.footerText}
      </footer>
      
      {/* Live Chat */}
      <LiveChat />
    </div>
  );
} 