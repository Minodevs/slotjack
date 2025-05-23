'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Shield, Award, Star, Trophy, Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import ClientLayout from '@/components/ClientLayout';
import { UserRank, UserAward, AwardType } from '@/types/user';
import AwardModal from './AwardModal';
import { toast } from 'react-hot-toast';

interface PageProps {
  params: {
    userId: string;
  };
}

export default function UserAwardsPage({ params }: PageProps) {
  const router = useRouter();
  const { userId } = params;
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [awards, setAwards] = useState<UserAward[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editAward, setEditAward] = useState<UserAward | null>(null);
  
  useEffect(() => {
    // Check if user is admin
    if (!authContext?.user) {
      router.push('/login');
      return;
    }

    if (authContext.user.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserData(data.user);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, router, authContext]);

  useEffect(() => {
    if (!authContext?.user || authContext.user.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    // Simulate loading awards from storage/API
    const loadAwards = () => {
      try {
        // In a real app, fetch from API: 
        // const response = await fetch(`/api/users/${userId}/awards`);
        // const data = await response.json();
        
        // For now, get from localStorage if any exist
        const storedAwards = localStorage.getItem(`user_${userId}_awards`);
        
        if (storedAwards) {
          setAwards(JSON.parse(storedAwards));
        } else {
          // Sample data if none exists
          const sampleAwards: UserAward[] = [
            {
              id: '1',
              userId: userId,
              type: 'achievement',
              title: 'İlk Katılım',
              description: 'Platformumuza ilk katılımınız',
              icon: 'star',
              color: '#FFD700', // Gold
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '2',
              userId: userId,
              type: 'medal',
              title: 'Etkinlik Katılımcısı',
              description: '5 etkinliğe katıldınız',
              icon: 'trophy',
              color: '#C0C0C0', // Silver
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
              id: '3',
              userId: userId,
              type: 'trophy',
              title: 'VIP Statüsü',
              description: '1000 puan biriktirdiniz',
              icon: 'award',
              color: '#CD7F32', // Bronze
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            },
          ];
          
          setAwards(sampleAwards);
          localStorage.setItem(`user_${userId}_awards`, JSON.stringify(sampleAwards));
        }
      } catch (error) {
        console.error('Error loading awards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAwards();
  }, [authContext, router, userId]);

  const handleAddAward = () => {
    setEditAward(null);
    setIsModalOpen(true);
  };

  const handleEditAward = (award: UserAward) => {
    setEditAward(award);
    setIsModalOpen(true);
  };

  const handleDeleteAward = (awardId: string) => {
    if (confirm('Bu ödülü silmek istediğinizden emin misiniz?')) {
      const updatedAwards = awards.filter(award => award.id !== awardId);
      setAwards(updatedAwards);
      localStorage.setItem(`user_${userId}_awards`, JSON.stringify(updatedAwards));
      toast.success('Ödül başarıyla silindi');
    }
  };

  const handleSaveAward = (award: UserAward) => {
    const isEdit = Boolean(award.id);
    const updatedAwards = isEdit
      ? awards.map(a => a.id === award.id ? award : a)
      : [...awards, { ...award, id: Date.now().toString() }];
    
    setAwards(updatedAwards);
    
    try {
      localStorage.setItem(`user_${userId}_awards`, JSON.stringify(updatedAwards));
      toast.success(isEdit ? 'Ödül güncellendi!' : 'Yeni ödül eklendi!');
    } catch (error) {
      console.error('Failed to save awards:', error);
      toast.error('Ödül kaydedilemedi!');
    }
    
    setIsModalOpen(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star className="h-8 w-8" />;
      case 'trophy':
        return <Trophy className="h-8 w-8" />;
      case 'award':
      default:
        return <Award className="h-8 w-8" />;
    }
  };

  const getTypeLabel = (type: AwardType) => {
    switch (type) {
      case 'achievement':
        return 'Başarı';
      case 'medal':
        return 'Madalya';
      case 'trophy':
        return 'Ödül';
      default:
        return 'Ödül';
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white">Loading user data...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="bg-red-900/50 border border-red-800 text-white p-4 rounded max-w-md">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p>{error}</p>
            <button 
              onClick={() => router.back()}
              className="mt-4 bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded"
            >
              Go Back
            </button>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-900 pt-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">User Awards Management</h1>
            <button
              onClick={() => router.back()}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
            >
              Back
            </button>
          </div>
          
          {userData && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Username</p>
                  <p className="text-white font-medium">{userData.username}</p>
                </div>
                <div>
                  <p className="text-gray-400">User ID</p>
                  <p className="text-white font-mono text-sm">{userData.id}</p>
                </div>
                <div>
                  <p className="text-gray-400">JackPoints</p>
                  <p className="text-yellow-500 font-bold">{userData.jackPoints || 0}</p>
                </div>
                <div>
                  <p className="text-gray-400">Rank</p>
                  <p className="text-white font-medium">{userData.rank}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Awards History</h2>
            
            <div className="bg-gray-750 border border-gray-700 rounded-lg p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Award size={24} className="text-orange-500 mr-2" />
                  <h2 className="text-lg font-semibold">Kullanıcı ID: {userId}</h2>
                </div>
                
                <button 
                  onClick={handleAddAward}
                  className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  <Plus size={16} className="mr-1.5" />
                  <span>Ödül Ekle</span>
                </button>
              </div>
              
              {awards.length === 0 ? (
                <div className="text-center py-8 bg-gray-800/50 rounded-lg">
                  <Award size={48} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 mb-2">Bu kullanıcı için ödül kaydı bulunmamaktadır.</p>
                  <p className="text-sm text-gray-500">Kullanıcıya yeni bir ödül eklemek için yukarıdaki "Ödül Ekle" butonunu kullanabilirsiniz.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {awards.map((award) => (
                    <div 
                      key={award.id} 
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow relative group"
                    >
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditAward(award)}
                          className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-400 hover:text-white"
                          title="Düzenle"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteAward(award.id)}
                          className="p-1.5 bg-gray-700 hover:bg-red-700 rounded-md text-gray-400 hover:text-white"
                          title="Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between mb-3">
                        <div 
                          className="p-3 rounded-full" 
                          style={{ backgroundColor: `${award.color}20` }} // 20% opacity of the color
                        >
                          <div style={{ color: award.color }}>
                            {getIconComponent(award.icon)}
                          </div>
                        </div>
                        <div className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-300 font-medium">
                          {getTypeLabel(award.type)}
                        </div>
                      </div>
                      
                      <h3 className="text-white font-bold text-lg mb-1">{award.title}</h3>
                      <p className="text-gray-400 text-sm mb-3">{award.description}</p>
                      
                      <div className="flex items-center text-gray-500 text-xs mt-auto">
                        <Calendar size={12} className="mr-1" />
                        <span>{formatDate(award.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-6 text-gray-400 text-sm">
                <p>Toplam ödül sayısı: <span className="text-white font-medium">{awards.length}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <AwardModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAward}
        userId={userId}
        editAward={editAward}
      />
    </ClientLayout>
  );
} 