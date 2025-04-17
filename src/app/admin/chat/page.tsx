'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserRank } from '../../page';
import { 
  ChevronLeft, MessageSquare, Trash, User, Ban, Shield, 
  AlertTriangle, Search, Filter, Save, X, Plus
} from 'lucide-react';
import ClientLayout from '../../../components/ClientLayout';
import { toast } from 'react-hot-toast';

// Chat message interface
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userRank: UserRank;
  text: string;
  timestamp: number;
}

// Active user interface
interface ActiveUser {
  id: string;
  name: string;
  isActive: boolean;
  lastSeen: number;
  isSystemGenerated: boolean;
  rank: UserRank;
}

// Banned user interface
interface BannedUser {
  id: string;
  email: string;
  name: string;
  reason: string;
  timestamp: number;
  bannedBy: string;
}

// Banned word interface
interface BannedWord {
  id: string;
  word: string;
  replacement: string;
  timestamp: number;
  addedBy: string;
}

// Local storage keys
const CHAT_MESSAGES_KEY = 'slotjack_chat_messages';
const ACTIVE_USERS_KEY = 'slotjack_active_users';
const BANNED_USERS_KEY = 'slotjack_banned_users';
const BANNED_WORDS_KEY = 'slotjack_banned_words';

export default function AdminChatPage() {
  const router = useRouter();
  const authContext = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'users' | 'banned' | 'words'>('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);
  const [newBannedWord, setNewBannedWord] = useState({ word: '', replacement: '' });
  const [isAddingWord, setIsAddingWord] = useState(false);
  
  if (!authContext) {
    throw new Error('AuthContext is undefined');
  }
  
  const { user } = authContext;
  
  // Check if user is admin and load data
  useEffect(() => {
    if (!loading && (!user || user.rank !== UserRank.ADMIN)) {
      router.push('/');
      return;
    }
    
    if (user && user.rank === UserRank.ADMIN) {
      loadData();
      setLoading(false);
    }
  }, [user, loading, router]);
  
  // Load data from localStorage
  const loadData = () => {
    try {
      // Load chat messages
      const storedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
      if (storedMessages) {
        setMessages(JSON.parse(storedMessages));
      }
      
      // Load active users
      const storedUsers = localStorage.getItem(ACTIVE_USERS_KEY);
      if (storedUsers) {
        setActiveUsers(JSON.parse(storedUsers));
      }
      
      // Load banned users
      const storedBannedUsers = localStorage.getItem(BANNED_USERS_KEY);
      if (storedBannedUsers) {
        setBannedUsers(JSON.parse(storedBannedUsers));
      }
      
      // Load banned words
      const storedBannedWords = localStorage.getItem(BANNED_WORDS_KEY);
      if (storedBannedWords) {
        setBannedWords(JSON.parse(storedBannedWords));
      } else {
        // Create some initial banned words if none exist
        const initialBannedWords: BannedWord[] = [
          { id: '1', word: 'kumar', replacement: '***', timestamp: Date.now(), addedBy: 'Admin' },
          { id: '2', word: 'bahis', replacement: '***', timestamp: Date.now(), addedBy: 'Admin' },
        ];
        localStorage.setItem(BANNED_WORDS_KEY, JSON.stringify(initialBannedWords));
        setBannedWords(initialBannedWords);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };
  
  // Delete chat message
  const deleteMessage = (messageId: string) => {
    try {
      const updatedMessages = messages.filter(msg => msg.id !== messageId);
      setMessages(updatedMessages);
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(updatedMessages));
      toast.success('Mesaj silindi');
    } catch (err) {
      console.error('Error deleting message:', err);
      toast.error('Mesaj silinirken bir hata oluştu');
    }
  };
  
  // Ban user
  const banUser = (userId: string, userName: string) => {
    if (!user) return;
    
    try {
      const reason = window.prompt(`${userName} kullanıcısını yasaklama nedeni:`);
      if (!reason) return;
      
      const newBannedUser: BannedUser = {
        id: userId,
        email: userName.includes('@') ? userName : `${userName}@example.com`,
        name: userName,
        reason,
        timestamp: Date.now(),
        bannedBy: user.name || user.email
      };
      
      const updatedBannedUsers = [...bannedUsers, newBannedUser];
      setBannedUsers(updatedBannedUsers);
      localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(updatedBannedUsers));
      
      // Remove user from active users
      const updatedActiveUsers = activeUsers.filter(u => u.id !== userId);
      setActiveUsers(updatedActiveUsers);
      localStorage.setItem(ACTIVE_USERS_KEY, JSON.stringify(updatedActiveUsers));
      
      toast.success(`${userName} kullanıcısı yasaklandı`);
    } catch (err) {
      console.error('Error banning user:', err);
      toast.error('Kullanıcı yasaklanırken bir hata oluştu');
    }
  };
  
  // Unban user
  const unbanUser = (userId: string) => {
    try {
      const updatedBannedUsers = bannedUsers.filter(u => u.id !== userId);
      setBannedUsers(updatedBannedUsers);
      localStorage.setItem(BANNED_USERS_KEY, JSON.stringify(updatedBannedUsers));
      toast.success('Kullanıcı yasağı kaldırıldı');
    } catch (err) {
      console.error('Error unbanning user:', err);
      toast.error('Kullanıcı yasağı kaldırılırken bir hata oluştu');
    }
  };
  
  // Add banned word
  const addBannedWord = () => {
    if (!user || !newBannedWord.word.trim()) return;
    
    try {
      const newBannedWordItem: BannedWord = {
        id: Date.now().toString(),
        word: newBannedWord.word.trim().toLowerCase(),
        replacement: newBannedWord.replacement || '***',
        timestamp: Date.now(),
        addedBy: user.name || user.email
      };
      
      const updatedBannedWords = [...bannedWords, newBannedWordItem];
      setBannedWords(updatedBannedWords);
      localStorage.setItem(BANNED_WORDS_KEY, JSON.stringify(updatedBannedWords));
      
      setNewBannedWord({ word: '', replacement: '' });
      setIsAddingWord(false);
      toast.success('Yasaklı kelime eklendi');
    } catch (err) {
      console.error('Error adding banned word:', err);
      toast.error('Yasaklı kelime eklenirken bir hata oluştu');
    }
  };
  
  // Delete banned word
  const deleteBannedWord = (wordId: string) => {
    try {
      const updatedBannedWords = bannedWords.filter(w => w.id !== wordId);
      setBannedWords(updatedBannedWords);
      localStorage.setItem(BANNED_WORDS_KEY, JSON.stringify(updatedBannedWords));
      toast.success('Yasaklı kelime silindi');
    } catch (err) {
      console.error('Error deleting banned word:', err);
      toast.error('Yasaklı kelime silinirken bir hata oluştu');
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Filter messages based on search query
  const filteredMessages = messages.filter(msg => 
    msg.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.text.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter active users based on search query
  const filteredActiveUsers = activeUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter banned users based on search query
  const filteredBannedUsers = bannedUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter banned words based on search query
  const filteredBannedWords = bannedWords.filter(word => 
    word.word.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mb-4 mx-auto"></div>
            <p className="text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
  
  return (
    <ClientLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/admin" className="flex items-center text-blue-400 hover:text-blue-300 mb-2">
              <ChevronLeft className="w-5 h-5 mr-1" /> Admin Paneline Dön
            </Link>
            <h1 className="text-3xl font-bold text-white">Sohbet Moderasyonu</h1>
            <p className="text-gray-400">Sohbet mesajlarını, kullanıcıları ve yasaklı kelimeleri yönetin</p>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex space-x-4 mb-4">
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'messages' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              <span>Mesajlar</span>
              <span className="ml-2 bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded-full">{messages.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <User className="w-5 h-5 mr-2" />
              <span>Aktif Kullanıcılar</span>
              <span className="ml-2 bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded-full">{activeUsers.filter(u => u.isActive).length}</span>
            </button>
            <button
              onClick={() => setActiveTab('banned')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'banned' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Ban className="w-5 h-5 mr-2" />
              <span>Yasaklı Kullanıcılar</span>
              <span className="ml-2 bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded-full">{bannedUsers.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('words')}
              className={`px-4 py-2 rounded-lg flex items-center ${
                activeTab === 'words' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              <span>Yasaklı Kelimeler</span>
              <span className="ml-2 bg-gray-600 text-white text-xs px-1.5 py-0.5 rounded-full">{bannedWords.length}</span>
            </button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-700 text-white w-full pl-10 pr-4 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={activeTab === 'messages' ? "Mesajlarda ara..." : activeTab === 'users' ? "Kullanıcılarda ara..." : activeTab === 'banned' ? "Yasaklı kullanıcılarda ara..." : "Yasaklı kelimelerde ara..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {activeTab === 'messages' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mesaj</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarih</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Mesaj bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map(message => (
                      <tr key={message.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-medium">{message.userName.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{message.userName}</div>
                              <div className="text-sm text-gray-400">
                                {message.userRank === UserRank.ADMIN && <span className="flex items-center text-red-400"><Shield className="w-3 h-3 mr-1" /> Admin</span>}
                                {message.userRank === UserRank.VIP && <span className="text-yellow-400">VIP</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300 whitespace-pre-wrap max-w-md break-words">{message.text}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(message.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => deleteMessage(message.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Mesajı Sil"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => banUser(message.userId, message.userName)}
                              className="text-orange-400 hover:text-orange-300"
                              title="Kullanıcıyı Yasakla"
                            >
                              <Ban className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Durum</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Son Görülme</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredActiveUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Kullanıcı bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filteredActiveUsers.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-gray-400">
                                {user.rank === UserRank.ADMIN && <span className="flex items-center text-red-400"><Shield className="w-3 h-3 mr-1" /> Admin</span>}
                                {user.rank === UserRank.VIP && <span className="text-yellow-400">VIP</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.isActive ? 'Aktif' : 'Çevrimdışı'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(user.lastSeen)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => banUser(user.id, user.name)}
                            className="text-orange-400 hover:text-orange-300"
                            title="Kullanıcıyı Yasakla"
                          >
                            <Ban className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'banned' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kullanıcı</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sebep</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Yasaklayan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarih</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {filteredBannedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                        Yasaklı kullanıcı bulunamadı
                      </td>
                    </tr>
                  ) : (
                    filteredBannedUsers.map(user => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                              <span className="text-sm font-medium">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">{user.name}</div>
                              <div className="text-sm text-gray-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-300">{user.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {user.bannedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {formatDate(user.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => unbanUser(user.id)}
                            className="text-green-400 hover:text-green-300"
                            title="Yasağı Kaldır"
                          >
                            <span className="flex items-center">
                              <Ban className="w-5 h-5 mr-1" />
                              <X className="w-3 h-3 -ml-4 mt-3" />
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'words' && (
            <div>
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium">Yasaklı Kelimeler</h3>
                <button
                  onClick={() => setIsAddingWord(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Kelime Ekle
                </button>
              </div>
              
              {isAddingWord && (
                <div className="p-4 border-b border-gray-700 bg-gray-750">
                  <h4 className="text-md font-medium mb-3">Yeni Yasaklı Kelime</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Kelime
                      </label>
                      <input
                        type="text"
                        className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newBannedWord.word}
                        onChange={(e) => setNewBannedWord({ ...newBannedWord, word: e.target.value })}
                        placeholder="Yasaklanacak kelime"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Değiştirileceği Metin (Boş bırakılırsa ***)
                      </label>
                      <input
                        type="text"
                        className="bg-gray-700 text-white w-full px-3 py-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={newBannedWord.replacement}
                        onChange={(e) => setNewBannedWord({ ...newBannedWord, replacement: e.target.value })}
                        placeholder="***"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsAddingWord(false)}
                      className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded-md"
                    >
                      İptal
                    </button>
                    <button
                      onClick={addBannedWord}
                      disabled={!newBannedWord.word.trim()}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ekle
                    </button>
                  </div>
                </div>
              )}
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kelime</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Değiştirilen</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ekleyen</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarih</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {filteredBannedWords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          Yasaklı kelime bulunamadı
                        </td>
                      </tr>
                    ) : (
                      filteredBannedWords.map(word => (
                        <tr key={word.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400 font-medium">
                            {word.word}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {word.replacement}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {word.addedBy}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {formatDate(word.timestamp)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => deleteBannedWord(word.id)}
                              className="text-red-400 hover:text-red-300"
                              title="Kelimeyi Sil"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
} 