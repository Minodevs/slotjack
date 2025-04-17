'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Eye, 
  Trash2, 
  Search, 
  Calendar, 
  Filter, 
  X, 
  Download,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { WinSubmission, getSubmissions, deleteSubmission } from '@/services/SubmissionsService';
import { UserRank } from '@/app/page';
import { v4 as uuidv4 } from 'uuid';

export default function AdminWinSubmissionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<WinSubmission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<WinSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSponsor, setFilterSponsor] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [uniqueSponsors, setUniqueSponsors] = useState<string[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<WinSubmission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentSubmission, setCurrentSubmission] = useState<WinSubmission | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin, if not redirect to home
    if (user && user.rank !== UserRank.ADMIN) {
      router.push('/');
      return;
    }

    const loadSubmissions = async () => {
      setLoading(true);
      try {
        const data = await getSubmissions();
        setSubmissions(data);
        
        // Extract unique sponsors for filter dropdown
        const sponsors = Array.from(new Set(data.map(s => s.sponsor))).filter(Boolean);
        setUniqueSponsors(sponsors);
        
        setFilteredSubmissions(data);
      } catch (error) {
        console.error('Error loading submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.rank === UserRank.ADMIN) {
      loadSubmissions();
    }

    // Set up event listener for real-time updates
    const handleSubmissionUpdated = () => {
      loadSubmissions();
    };

    window.addEventListener('submission-updated', handleSubmissionUpdated);
    return () => {
      window.removeEventListener('submission-updated', handleSubmissionUpdated);
    };
  }, [user, router]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    if (submissions.length === 0) return;

    let results = [...submissions];

    // Apply search term filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        s => 
          s.userName.toLowerCase().includes(term) ||
          s.gameName.toLowerCase().includes(term) ||
          s.sponsor.toLowerCase().includes(term)
      );
    }

    // Apply sponsor filter
    if (filterSponsor) {
      results = results.filter(s => s.sponsor === filterSponsor);
    }

    // Apply date range filter
    if (filterDateFrom) {
      const fromDate = new Date(filterDateFrom);
      results = results.filter(s => {
        const submissionDate = new Date(s.timestamp);
        return submissionDate >= fromDate;
      });
    }

    if (filterDateTo) {
      const toDate = new Date(filterDateTo);
      // Set time to end of day
      toDate.setHours(23, 59, 59, 999);
      results = results.filter(s => {
        const submissionDate = new Date(s.timestamp);
        return submissionDate <= toDate;
      });
    }

    setFilteredSubmissions(results);
  }, [searchTerm, filterSponsor, filterDateFrom, filterDateTo, submissions]);

  const handleViewSubmission = (submission: WinSubmission) => {
    setSelectedSubmission(submission);
  };

  const handleDeleteSubmission = async (id: string) => {
    if (window.confirm('Bu paylaşımı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      setIsDeleting(true);
      try {
        await deleteSubmission(id);
        
        // Update local state
        const updatedSubmissions = submissions.filter(s => s.id !== id);
        setSubmissions(updatedSubmissions);
        setFilteredSubmissions(filteredSubmissions.filter(s => s.id !== id));
        
        if (selectedSubmission?.id === id) {
          setSelectedSubmission(null);
        }
      } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Silme işlemi sırasında bir hata oluştu.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterSponsor('');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const data = await getSubmissions();
      setSubmissions(data);
      
      // Re-apply current filters
      let results = [...data];
      
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        results = results.filter(
          s => 
            s.userName.toLowerCase().includes(term) ||
            s.gameName.toLowerCase().includes(term) ||
            s.sponsor.toLowerCase().includes(term)
        );
      }
      
      if (filterSponsor) {
        results = results.filter(s => s.sponsor === filterSponsor);
      }
      
      if (filterDateFrom) {
        const fromDate = new Date(filterDateFrom);
        results = results.filter(s => {
          const submissionDate = new Date(s.timestamp);
          return submissionDate >= fromDate;
        });
      }
      
      if (filterDateTo) {
        const toDate = new Date(filterDateTo);
        toDate.setHours(23, 59, 59, 999);
        results = results.filter(s => {
          const submissionDate = new Date(s.timestamp);
          return submissionDate <= toDate;
        });
      }
      
      setFilteredSubmissions(results);
    } catch (error) {
      console.error('Error refreshing data:', error);
      alert('Veriler güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }
    
    // Create CSV content
    const headers = ['Kullanıcı', 'Oyun Adı', 'Bahis', 'Kazanç', 'Sponsor', 'Tarih'];
    const rows = filteredSubmissions.map(s => [
      s.userName,
      s.gameName,
      s.bet.toString(),
      s.winAmount.toString(),
      s.sponsor,
      s.date
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kazanclar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddSubmission = () => {
    setModalMode('add');
    setCurrentSubmission({
      id: uuidv4(),
      playerName: '',
      gameName: '',
      date: formatDateForInput(new Date()),
      amount: 0,
      currency: 'TL',
      sponsor: '',
      description: '',
      userId: '',
      status: 'pending',
      timestamp: Date.now(),
      imageUrl: '',
    });
    setIsModalOpen(true);
  };

  if (!user) {
    return null; // Don't render anything while checking auth
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="mr-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">Kullanıcı Kazançları Yönetimi</h1>
            <button 
              onClick={refreshData}
              className="ml-auto p-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {/* Filters */}
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Kullanıcı, oyun adı veya sponsor ara..."
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <select
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={filterSponsor}
                  onChange={(e) => setFilterSponsor(e.target.value)}
                >
                  <option value="">Tüm Sponsorlar</option>
                  {uniqueSponsors.map((sponsor) => (
                    <option key={sponsor} value={sponsor}>
                      {sponsor}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  className="bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearFilters}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded flex items-center"
                >
                  <X className="w-4 h-4 mr-1" />
                  Temizle
                </button>
                <button
                  onClick={exportToCSV}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded flex items-center"
                  disabled={filteredSubmissions.length === 0}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Dışa Aktar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Submissions list */}
          <div className="w-full lg:w-2/3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              {loading && submissions.length === 0 ? (
                <div className="p-10 flex items-center justify-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                    <p className="text-gray-400">Veriler yükleniyor...</p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-700">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Kullanıcı
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Oyun
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Bahis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Kazanç
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Tarih
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          İşlemler
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredSubmissions.length > 0 ? (
                        filteredSubmissions.map((submission) => (
                          <tr 
                            key={submission.id} 
                            className={`hover:bg-gray-700/50 cursor-pointer ${
                              selectedSubmission?.id === submission.id ? 'bg-blue-900/30' : ''
                            }`}
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                                  {submission.userName.charAt(0)}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-white">{submission.userName}</div>
                                  <div className="text-xs text-gray-400">ID: {submission.userId.substring(0, 8)}...</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {submission.gameName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {submission.bet.toFixed(2)} ₺
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-medium">
                              {submission.winAmount.toLocaleString()} ₺
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {submission.date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewSubmission(submission);
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSubmission(submission.id);
                                  }}
                                  className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors"
                                  disabled={isDeleting}
                                >
                                  {isDeleting && selectedSubmission?.id === submission.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                            {searchTerm || filterSponsor || filterDateFrom || filterDateTo ? (
                              <>
                                <Filter className="w-6 h-6 mx-auto mb-2" />
                                Filtrelenmiş sonuç bulunamadı. Filtrelerinizi değiştirin veya temizleyin.
                              </>
                            ) : (
                              'Henüz paylaşım bulunmamaktadır.'
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            {/* Pagination placeholder - can be implemented if needed */}
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-400">
                Toplam: {filteredSubmissions.length} kayıt
              </div>
            </div>
          </div>
          
          {/* Detail view */}
          <div className="w-full lg:w-1/3">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              {selectedSubmission ? (
                <div>
                  <div className="relative aspect-video bg-black">
                    {selectedSubmission.imageUrl ? (
                      <img
                        src={selectedSubmission.imageUrl}
                        alt={`${selectedSubmission.userName}'in kazancı`}
                        className="w-full h-full object-contain"
                      />
                    ) : selectedSubmission.link && selectedSubmission.link.includes('youtube.com') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${selectedSubmission.link.split('v=')[1]}`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400">Görüntü yok</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <h2 className="text-xl font-bold mb-2">{selectedSubmission.gameName}</h2>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-lg font-medium text-white">
                          {selectedSubmission.userName.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-white">{selectedSubmission.userName}</p>
                          <p className="text-xs text-gray-400">{selectedSubmission.date}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-xs text-gray-400">Bahis</p>
                        <p className="font-medium text-white">{selectedSubmission.bet.toFixed(2)} ₺</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-xs text-gray-400">Kazanç</p>
                        <p className="font-medium text-green-400">{selectedSubmission.winAmount.toLocaleString()} ₺</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded mb-4">
                      <p className="text-xs text-gray-400">Sponsor</p>
                      <div className="flex items-center mt-1">
                        {selectedSubmission.sponsorLogo && (
                          <img src={selectedSubmission.sponsorLogo} alt={selectedSubmission.sponsor} className="h-5 mr-2" />
                        )}
                        <p className="font-medium text-white">{selectedSubmission.sponsor}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gray-700 p-3 rounded mb-4">
                      <p className="text-xs text-gray-400">Kullanıcı ID</p>
                      <p className="font-medium text-white break-all">{selectedSubmission.userId}</p>
                    </div>
                    
                    {(selectedSubmission.link || selectedSubmission.imageUrl) && (
                      <div className="bg-gray-700 p-3 rounded">
                        <p className="text-xs text-gray-400">Bağlantılar</p>
                        {selectedSubmission.link && (
                          <a 
                            href={selectedSubmission.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                          >
                            <Eye className="w-4 h-4 mr-1" /> Video Link
                          </a>
                        )}
                        {selectedSubmission.imageUrl && (
                          <a 
                            href={selectedSubmission.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-400 hover:text-blue-300 mt-1"
                          >
                            <Eye className="w-4 h-4 mr-1" /> Görüntü Link
                          </a>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-6">
                      <button
                        onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                        className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Siliniyor...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-5 h-5 mr-2" />
                            Bu Paylaşımı Sil
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Detayları Görüntüle</h3>
                  <p className="text-gray-400">
                    Detaylarını görüntülemek için bir kazanç paylaşımı seçin.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SubmissionDetails = ({ submission }: { submission: WinSubmission }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <h3 className="text-xl font-semibold mb-3">Kazanç Detayları</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p><span className="font-semibold">Oyuncu:</span> {submission.playerName}</p>
          <p><span className="font-semibold">Oyun:</span> {submission.gameName}</p>
          <p><span className="font-semibold">Tarih:</span> {formatDate(submission.date)}</p>
          <p><span className="font-semibold">Sponsor:</span> {submission.sponsor}</p>
          <p><span className="font-semibold">Tutar:</span> {submission.amount} {submission.currency}</p>
          <p><span className="font-semibold">Kullanıcı ID:</span> {submission.userId}</p>
          <p><span className="font-semibold">Durum:</span> {getStatusLabel(submission.status)}</p>
        </div>
        <div>
          <p><span className="font-semibold">Açıklama:</span></p>
          <p className="break-words">{submission.description}</p>
          
          {submission.imageUrl && (
            <div className="mt-4">
              <p><span className="font-semibold">Görsel:</span></p>
              <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-w-md">
                <a href={submission.imageUrl} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={submission.imageUrl} 
                    alt="Kazanç kanıtı" 
                    className="w-full h-auto object-contain max-h-64"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = '/images/placeholder.png'; // Fallback image
                      target.alt = 'Görsel yüklenemedi';
                    }}
                  />
                </a>
                <div className="p-2 text-sm text-center">
                  <a 
                    href={submission.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Görseli yeni sekmede aç
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 