import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/layout/Navigation";
import ChatWidget from "@/components/layout/ChatWidget";
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SLOTJACK - Online Casino & Gaming Platform",
  description: "SLOTJACK is a premier online casino and gaming platform offering slots, poker, blackjack, and more.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-[#121212] text-white min-h-screen`}>
        <AuthProvider>
          <div className="flex min-h-screen">
            {/* Left Sidebar - 60px width */}
            <aside className="w-[60px] bg-[#1E1E1E] fixed left-0 top-0 h-full">
              <Navigation />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-[60px] mr-[300px]">
              {/* Top Header */}
              <header className="h-16 bg-[#1E1E1E] fixed top-0 right-0 left-[60px] flex items-center justify-between px-6 z-10">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-[#FF6B00]">SLOTJACK</h1>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="bg-[#FF6B00] hover:bg-[#FF8533] text-white px-4 py-2 rounded-md">
                    Giriş Yap
                  </button>
                </div>
              </header>

              {/* Page Content */}
              <div className="pt-16 px-6">
                {children}
              </div>
            </main>

            {/* Chat Sidebar - 300px width */}
            <aside className="w-[300px] bg-[#1E1E1E] fixed right-0 top-0 h-full">
              <ChatWidget />
            </aside>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
