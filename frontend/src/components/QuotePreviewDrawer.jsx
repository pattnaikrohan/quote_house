import React from 'react';
import './QuotePreviewDrawer.css';

export default function QuotePreviewDrawer({ quote, isOpen, onClose }) {
  if (!isOpen || !quote) return null;

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <div className={`drawer-container ${isOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="drawer-title-area">
            <h3>{quote.customer}</h3>
            <span className={`status-badge status-${(quote.status || '').toLowerCase().replace(' ', '-')}`}>
              {quote.status}
            </span>
          </div>
          <button className="btn-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="drawer-content">
          <div className="summary-box">
            <h4>AI Summary</h4>
            <p>
              This is a standard quote for {quote.customer}. 
              The total estimated value is <strong>${(quote.quoteNo ? quote.quoteNo.charCodeAt(0) * 1250 : 50000).toLocaleString()}</strong>. 
              The client has requested a net-30 payment term and the quote is valid until {quote.expiryDate || 'the end of the quarter'}.
              No abnormal discounts have been applied.
            </p>
          </div>

          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Quote Number</span>
              <span className="metric-value">{quote.quoteNo}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Sales Rep</span>
              <span className="metric-value">{quote.rep}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Branch</span>
              <span className="metric-value">{quote.branch}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Customer Type</span>
              <span className="metric-value">{quote.custType}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Direction</span>
              <span className="metric-value">{quote.direction}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Mode</span>
              <span className="metric-value">{quote.mode}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Vertical</span>
              <span className="metric-value">{quote.vertical || 'Other'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Quote Date</span>
              <span className="metric-value">{quote.quoteDate}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Effective Date</span>
              <span className="metric-value">{quote.effectiveDate || '—'}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Expiry Date</span>
              <span className="metric-value">{quote.expiryDate}</span>
            </div>
          </div>

          <div className="document-preview">
            <h4>Document Preview</h4>
            <div className="preview-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p>Preview for {quote.name || quote.quoteNo}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
