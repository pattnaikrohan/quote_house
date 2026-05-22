import React, { useState } from 'react';
import './FilterPanel.css';

export default function FilterPanel({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  filterOptions 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Count active filters (ignoring empty strings)
  const activeCount = Object.entries(filters).filter(([key, val]) => {
    if (key === 'q') return false; // Don't count search text as advanced filter
    return val !== '';
  }).length;

  const handleInputChange = (key, value) => {
    onFilterChange(key, value);
  };

  return (
    <div className="filter-panel">
      <div className="search-row">
        <div className="search-input-wrap">
          <svg className="search-icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search quote number, customer, or file name..." 
            value={filters.q}
            onChange={(e) => handleInputChange('q', e.target.value)}
          />
          {filters.q && (
            <button className="btn-search-clear" onClick={() => handleInputChange('q', '')}>
              ✕
            </button>
          )}
        </div>
        
        <button 
          className={`btn-toggle-advanced ${showAdvanced || activeCount > 0 ? 'active' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          Filters
          {activeCount > 0 && <span className="active-badge">{activeCount}</span>}
        </button>

        <button className="btn-clear-all" onClick={onClearFilters}>
          Clear all
        </button>
      </div>

      <div className={`advanced-filters ${showAdvanced ? 'expanded' : ''}`}>
        <div className="filters-grid">
          <div className="filter-group">
            <label className="filter-label">Customer</label>
            <select 
              className="filter-select" 
              value={filters.customer} 
              onChange={(e) => handleInputChange('customer', e.target.value)}
            >
              <option value="">All Customers</option>
              {filterOptions.customers?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Branch</label>
            <select 
              className="filter-select" 
              value={filters.branch} 
              onChange={(e) => handleInputChange('branch', e.target.value)}
            >
              <option value="">All Branches</option>
              {filterOptions.branches?.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sales Rep</label>
            <select 
              className="filter-select" 
              value={filters.rep} 
              onChange={(e) => handleInputChange('rep', e.target.value)}
            >
              <option value="">All Reps</option>
              {filterOptions.reps?.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Direction</label>
            <select 
              className="filter-select" 
              value={filters.direction} 
              onChange={(e) => handleInputChange('direction', e.target.value)}
            >
              <option value="">All Directions</option>
              {filterOptions.directions?.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Mode</label>
            <select 
              className="filter-select" 
              value={filters.mode} 
              onChange={(e) => handleInputChange('mode', e.target.value)}
            >
              <option value="">All Modes</option>
              {filterOptions.modes?.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Vertical</label>
            <select 
              className="filter-select" 
              value={filters.vertical} 
              onChange={(e) => handleInputChange('vertical', e.target.value)}
            >
              <option value="">All Verticals</option>
              {filterOptions.verticals?.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Customer Type</label>
            <select 
              className="filter-select" 
              value={filters.custType} 
              onChange={(e) => handleInputChange('custType', e.target.value)}
            >
              <option value="">All Types</option>
              {filterOptions.custTypes?.map(ct => <option key={ct} value={ct}>{ct}</option>)}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select 
              className="filter-select" 
              value={filters.status} 
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {filterOptions.statuses?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="dates-row">
          <div className="date-group">
            <label className="filter-label">Quote Date From</label>
            <input 
              type="date" 
              className="date-input" 
              value={filters.quoteFrom}
              onChange={(e) => handleInputChange('quoteFrom', e.target.value)}
            />
          </div>
          <div className="date-group">
            <label className="filter-label">Quote Date To</label>
            <input 
              type="date" 
              className="date-input" 
              value={filters.quoteTo}
              onChange={(e) => handleInputChange('quoteTo', e.target.value)}
            />
          </div>
          <div className="date-group">
            <label className="filter-label">Expiry Date From</label>
            <input 
              type="date" 
              className="date-input" 
              value={filters.expiryFrom}
              onChange={(e) => handleInputChange('expiryFrom', e.target.value)}
            />
          </div>
          <div className="date-group">
            <label className="filter-label">Expiry Date To</label>
            <input 
              type="date" 
              className="date-input" 
              value={filters.expiryTo}
              onChange={(e) => handleInputChange('expiryTo', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Render active filter pills */}
      {(() => {
        const activeFilters = Object.entries(filters)
          .filter(([key, val]) => key !== 'q' && val !== '')
          .map(([key, val]) => {
            let label = key;
            if (key === 'custType') label = 'Cust Type';
            else if (key === 'quoteFrom') label = 'Quote From';
            else if (key === 'quoteTo') label = 'Quote To';
            else if (key === 'expiryFrom') label = 'Expiry From';
            else if (key === 'expiryTo') label = 'Expiry To';
            else label = key.charAt(0).toUpperCase() + key.slice(1);
            return { key, label, value: val };
          });

        if (activeFilters.length === 0) return null;

        return (
          <div className="active-filters-row">
            <span className="active-filters-label">Active filters:</span>
            <div className="active-pills-list">
              {activeFilters.map(f => (
                <div key={f.key} className="filter-pill">
                  <span className="pill-name">{f.label}:</span>
                  <span className="pill-value">{f.value}</span>
                  <button 
                    className="btn-clear-pill" 
                    onClick={() => handleInputChange(f.key, '')}
                    title={`Clear ${f.label}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button className="btn-clear-all-pills" onClick={onClearFilters}>
                Clear all
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
