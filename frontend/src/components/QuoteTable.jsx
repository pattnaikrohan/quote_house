import React from 'react';
import './QuoteTable.css';

export default function QuoteTable({ 
  quotes, 
  isLoading, 
  sortCol, 
  sortDir, 
  onSortChange,
  onRowClick,
  totalCount
}) {

  const sortableCols = [
    { label: 'File / Quote No', id: 'quoteNo' },
    { label: 'Customer', id: 'customer' },
    { label: 'Rep', id: null },
    { label: 'Branch', id: null },
    { label: 'Direction', id: null },
    { label: 'Mode', id: null },
    { label: 'Quote Date', id: 'quoteDate' },
    { label: 'Expiry', id: 'expiryDate' },
    { label: 'Status', id: null }
  ];

  const handleHeaderClick = (colId) => {
    if (!colId) return; // Column is not sortable
    if (sortCol === colId) {
      // Toggle direction
      onSortChange(colId, sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column
      onSortChange(colId, 'desc');
    }
  };

  const getFileIcon = (type) => {
    const ext = type.toLowerCase();
    let colorClass = 'f-other';
    let iconSvg = null;

    if (ext === 'pdf') {
      colorClass = 'f-pdf';
      iconSvg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    } else if (ext === 'xlsx' || ext === 'xls') {
      colorClass = 'f-xlsx';
      iconSvg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <path d="M8 13h4v4H8z" />
          <line x1="16" y1="13" x2="14" y2="13" />
        </svg>
      );
    } else if (ext === 'docx' || ext === 'doc') {
      colorClass = 'f-docx';
      iconSvg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
        </svg>
      );
    }

    return (
      <div className={`file-badge-premium ${colorClass}`}>
        {iconSvg}
        <span className="file-ext-label">{ext.toUpperCase()}</span>
      </div>
    );
  };

  const getRepColor = (name) => {
    if (!name) return '#cbd5e1';
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 55%, 45%)`;
  };

  const getRepInitials = (name) => {
    if (!name) return '—';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const abbreviateRep = (name) => {
    if (!name) return '—';
    const parts = name.split(' ');
    return parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : name;
  };

  const getModeIcon = (mode) => {
    const m = mode?.toLowerCase();
    let svg = null;
    if (m === 'air') {
      svg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 1 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L14 19v-5.5L21 16z" />
        </svg>
      );
    } else if (m === 'sea') {
      svg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 21h20M19.3 14.8C20.8 13.5 22 11.7 22 10c0-4.4-4.5-8-10-8S2 5.6 2 10c0 1.7.9 3.5 2.7 4.8L2 21h20" />
        </svg>
      );
    } else if (m === 'road') {
      svg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    } else if (m === 'rail') {
      svg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="14" rx="2" />
          <path d="M4 11h16M12 3v8M8 17l-3 4M16 17l3 4" />
        </svg>
      );
    } else {
      svg = (
        <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    }
    return (
      <span className={`mode-badge-premium mode-${m}`}>
        {svg}
        <span>{mode}</span>
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  // Render skeleton rows for loading state
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, idx) => (
      <tr key={`skeleton-${idx}`} className="row-skeleton">
        <td>
          <div className="skeleton-file-cell">
            <div className="shimmer skeleton-icon"></div>
            <div className="skeleton-file-meta">
              <div className="shimmer skeleton-line w-60"></div>
              <div className="shimmer skeleton-line w-40 mt-1"></div>
            </div>
          </div>
        </td>
        <td><div className="shimmer skeleton-line w-80"></div></td>
        <td><div className="shimmer skeleton-line w-50"></div></td>
        <td><div className="shimmer skeleton-line w-40"></div></td>
        <td><div className="shimmer skeleton-line w-40"></div></td>
        <td><div className="shimmer skeleton-line w-30"></div></td>
        <td><div className="shimmer skeleton-line w-50"></div></td>
        <td><div className="shimmer skeleton-line w-50"></div></td>
        <td><div className="shimmer skeleton-badge"></div></td>
      </tr>
    ));
  };

  return (
    <div className="table-section">
      <div className="table-results-info">
        <span className="results-count-text">
          Showing <strong>{quotes.length}</strong> of <strong>{totalCount}</strong> quotes
        </span>
      </div>
      
      <div className="table-wrapper">
        <table className="quote-table">
          <thead>
            <tr>
              {sortableCols.map(col => {
                const isSortable = col.id !== null;
                const isSorted = sortCol === col.id;
                return (
                  <th 
                    key={col.label} 
                    className={isSortable ? 'sortable' : ''}
                    onClick={() => handleHeaderClick(col.id)}
                  >
                    <div className="header-cell-content">
                      {col.label}
                      {isSortable && (
                        <span className={`sort-arrow-indicator ${isSorted ? `sorted ${sortDir}` : ''}`}>
                          <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="3" fill="none">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody>
            {isLoading ? (
              renderSkeletons()
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={9} className="no-results-cell">
                  <div className="no-results-content">
                    <div className="no-results-icon">
                      <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                    <h3>No Quotes Found</h3>
                    <p>We couldn't find any quotes matching your current filter selections. Try clearing some filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              quotes.map((q, idx) => {
                const primaryDoc = q.docs?.[0] || { type: 'pdf', name: 'Quote' };
                const hasMultiDocs = q.docs?.length > 1;
                return (
                  <tr 
                    key={q.id} 
                    onClick={() => onRowClick(q)} 
                    style={{ animationDelay: `${Math.min(idx * 15, 180)}ms` }}
                    className="quote-row"
                  >
                    <td>
                      <div className="file-cell">
                        <div className="file-icon-badge-wrap">
                          {getFileIcon(primaryDoc.type)}
                          {hasMultiDocs && (
                            <span className="multi-docs-badge" title={`${q.docs.length} formats available`}>
                              {q.docs.length}
                            </span>
                          )}
                        </div>
                        <div className="file-details">
                          <span className="file-name-span" title={q.name}>{q.name}</span>
                          <span className="quote-number-span">{q.quoteNo}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td title={q.customer}>
                      <span className="customer-span">{q.customer}</span>
                    </td>
                    
                    <td>
                      <div className="rep-cell">
                        <div 
                          className="rep-avatar" 
                          style={{ backgroundColor: getRepColor(q.rep) }}
                        >
                          {getRepInitials(q.rep)}
                        </div>
                        <span className="rep-name-text" title={q.rep}>
                          {abbreviateRep(q.rep)}
                        </span>
                      </div>
                    </td>
                    
                    <td>{q.branch}</td>
                    
                    <td>{q.direction}</td>
                    
                    <td>
                      {getModeIcon(q.mode)}
                    </td>
                    
                    <td>{formatDate(q.quoteDate)}</td>
                    
                    <td>{formatDate(q.expiryDate)}</td>
                    
                    <td>
                      <span className={`status-pill status-${q.status?.toLowerCase()}`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
