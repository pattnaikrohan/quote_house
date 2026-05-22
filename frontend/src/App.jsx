import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KPIStats from './components/KPIStats';
import DashboardAnalytics from './components/DashboardAnalytics';
import CognitiveCopilot from './components/CognitiveCopilot';
import KanbanBoard from './components/KanbanBoard';
import FilterPanel from './components/FilterPanel';
import QuoteTable from './components/QuoteTable';
import QuotePreviewDrawer from './components/QuotePreviewDrawer';
import UploadModal from './components/UploadModal';
import Toast from './components/Toast';

const DEFAULT_FILTERS = {
  q: '',
  customer: '',
  branch: '',
  rep: '',
  direction: '',
  mode: '',
  vertical: '',
  custType: '',
  status: '',
  quoteFrom: '',
  quoteTo: '',
  expiryFrom: '',
  expiryTo: ''
};

export default function App() {
  const [quotes, setQuotes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortCol, setSortCol] = useState('quoteDate');
  const [sortDir, setSortDir] = useState('desc');
  const [filterOptions, setFilterOptions] = useState({});
  
  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  
  // Mock Auth Profile
  const [currentUser, setCurrentUser] = useState({
    name: 'Sarah Williams',
    role: 'Sales Representative',
    avatar: 'SW'
  });

  // Fetch quotes with filters and sorting applied
  const fetchQuotes = async (isInitial = false) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Add filters to query parameters (only if they are not empty)
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      
      params.append('sort_col', sortCol);
      params.append('sort_dir', sortDir);
      
      const response = await fetch(`/api/quotes?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch quotes');
      const data = await response.json();
      
      setQuotes(data);
      
      // Save the baseline total count from the unfiltered initial load
      if (isInitial) {
        setTotalCount(data.length);
      }
    } catch (error) {
      console.error(error);
      showToast('Error loading quotes from database', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dropdown list options dynamically from backend
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/quotes/filters');
      if (!response.ok) throw new Error('Failed to fetch filter options');
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error(error);
    }
  };

  // Re-fetch quotes whenever filters, sorting, or currentUser changes
  useEffect(() => {
    // We treat the first load as initial to lock the totalCount
    const isInitial = totalCount === 0 && Object.values(filters).every(v => v === '');
    fetchQuotes(isInitial);
  }, [filters, sortCol, sortDir]);

  // Load dropdown selections and baseline data on startup
  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSortCol('quoteDate');
    setSortDir('desc');
    showToast('Filters cleared successfully', 'success');
  };

  const handleSortChange = (colId, dir) => {
    setSortCol(colId);
    setSortDir(dir);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleOpenDocument = (quoteId, docIdx) => {
    // Open direct API document url in a new browser tab
    const url = `/api/quotes/${quoteId}/open/${docIdx}`;
    window.open(url, '_blank');
    showToast('Opening secure document link...');
  };

  const handleUploadSubmit = async (formData, callback) => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/quotes/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Upload failed');
      }

      const result = await response.json();
      showToast(`Quote ${result.quoteNo} uploaded successfully!`, 'success');
      
      // Update local baseline count and lists
      setTotalCount(prev => prev + 1);
      fetchQuotes();
      fetchFilterOptions();
      
      callback(); // reset and close modal
    } catch (error) {
      console.error(error);
      showToast(error.message || 'Error uploading quote file', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="app-container">
      <Header 
        onUploadClick={() => setIsUploadOpen(true)} 
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
      
      <main className="main-content">
        <KPIStats quotes={quotes} />
        
        <DashboardAnalytics />
        
        <FilterPanel 
          filters={filters} 
          onFilterChange={handleFilterChange} 
          onClearFilters={handleClearFilters}
          filterOptions={filterOptions}
        />
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px', gap: '8px' }}>
          <button 
            style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)', background: viewMode === 'table' ? 'var(--primary)' : '#fff', color: viewMode === 'table' ? '#fff' : 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            onClick={() => setViewMode('table')}
          >
            List View
          </button>
          <button 
            style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border)', background: viewMode === 'kanban' ? 'var(--primary)' : '#fff', color: viewMode === 'kanban' ? '#fff' : 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            onClick={() => setViewMode('kanban')}
          >
            Board View
          </button>
        </div>

        {viewMode === 'table' ? (
          <QuoteTable 
            quotes={quotes} 
            isLoading={isLoading} 
            sortCol={sortCol} 
            sortDir={sortDir} 
            onSortChange={handleSortChange}
            onRowClick={setSelectedQuote}
            totalCount={totalCount}
          />
        ) : (
          <KanbanBoard 
            quotes={quotes} 
            onCardClick={setSelectedQuote} 
          />
        )}
      </main>

      <QuotePreviewDrawer 
        quote={selectedQuote} 
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
      />

      <UploadModal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadSubmit}
        isUploading={isUploading}
      />

      <CognitiveCopilot />

      <Toast 
        toast={toast} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
}
