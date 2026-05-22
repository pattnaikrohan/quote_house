import React, { useEffect } from 'react';
import './QuoteDetailDrawer.css';

export default function QuoteDetailDrawer({ quote, onClose, onOpenDocument }) {
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (quote) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [quote]);

  if (!quote) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  };

  const getFileIcon = (type) => {
    const ext = type.toLowerCase();
    if (ext === 'pdf') return <span className="d-file-badge df-pdf">PDF</span>;
    if (ext === 'xlsx' || ext === 'xls') return <span className="d-file-badge df-xlsx">XLS</span>;
    if (ext === 'docx' || ext === 'doc') return <span className="d-file-badge df-docx">DOC</span>;
    return <span className="d-file-badge df-other">{ext.toUpperCase()}</span>;
  };

  const getLifetimeProgress = () => {
    if (!quote.quoteDate || !quote.expiryDate) return null;
    const start = new Date(quote.quoteDate).getTime();
    const end = new Date(quote.expiryDate).getTime();
    const now = new Date().getTime();
    if (isNaN(start) || isNaN(end)) return null;
    if (end <= start) return null;
    const total = end - start;
    const elapsed = now - start;
    const pct = Math.min(Math.max((elapsed / total) * 100, 0), 100);
    const daysRemaining = Math.max(Math.ceil((end - now) / (1000 * 60 * 60 * 24)), 0);
    return { pct, daysRemaining };
  };

  const getTimelineSteps = () => {
    const steps = [
      { label: 'Created', sub: formatDate(quote.quoteDate), completed: true, active: false },
      { label: 'Effective', sub: formatDate(quote.effectiveDate), completed: false, active: false },
      { label: 'Active Status', sub: quote.status, completed: false, active: false }
    ];
    
    const now = new Date();
    const effDate = new Date(quote.effectiveDate);
    
    const statusUpper = quote.status?.toUpperCase();
    const isSettled = ['WON', 'LOST', 'EXPIRED'].includes(statusUpper);
    
    if ((!isNaN(effDate.getTime()) && now >= effDate) || isSettled) {
      steps[1].completed = true;
    } else {
      steps[1].active = true;
    }
    
    if (isSettled) {
      steps[1].completed = true;
      steps[2].completed = true;
      steps[2].active = true;
    } else if (statusUpper === 'ACTIVE') {
      steps[2].completed = true;
      steps[2].active = true;
    } else if (statusUpper === 'PENDING') {
      steps[2].active = true;
    }
    
    return steps;
  };

  const metaFields = [
    { label: 'Customer', value: quote.customer },
    { label: 'Customer Type', value: quote.custType },
    { label: 'Sales Rep', value: quote.rep },
    { label: 'Branch', value: quote.branch },
    { label: 'Direction', value: quote.direction },
    { label: 'Transport Mode', value: quote.mode },
    { label: 'Industry Vertical', value: quote.vertical || 'Other' },
    { label: 'Quote Date', value: formatDate(quote.quoteDate) },
    { label: 'Effective Date', value: formatDate(quote.effectiveDate) },
    { label: 'Expiry Date', value: formatDate(quote.expiryDate) }
  ];

  const steps = getTimelineSteps();
  const progress = getLifetimeProgress();

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-container" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title-area">
            <span className="drawer-qno">{quote.quoteNo}</span>
            <span className={`status-pill status-${quote.status?.toLowerCase()}`}>
              {quote.status}
            </span>
          </div>
          <button className="btn-drawer-close" onClick={onClose} aria-label="Close details">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="drawer-body">
          {/* Validity Lifetime Progress */}
          {progress && (
            <div className="drawer-section premium-card">
              <div className="drawer-lifetime-container">
                <div className="drawer-lifetime-header">
                  <span className="lifetime-label">Validity Expiration Progress</span>
                  <span className={`lifetime-remaining ${progress.daysRemaining <= 15 ? 'critical' : ''}`}>
                    {progress.daysRemaining > 0 ? `${progress.daysRemaining} days left` : 'Expired'}
                  </span>
                </div>
                <div className="lifetime-progress-track">
                  <div 
                    className={`lifetime-progress-bar ${progress.daysRemaining <= 15 ? 'critical' : ''}`} 
                    style={{ width: `${progress.pct}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Section */}
          <div className="drawer-section premium-card">
            <h4 className="section-title-premium">Lifecycle Progress</h4>
            <div className="timeline-container">
              {steps.map((step, idx) => (
                <div key={idx} className={`timeline-step ${step.completed ? 'completed' : ''} ${step.active ? 'active' : ''}`}>
                  <div className="timeline-node-wrap">
                    <div className="timeline-node">
                      {step.completed ? (
                        <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" strokeWidth="3" fill="none">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="node-dot"></span>
                      )}
                    </div>
                    {idx < steps.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <span className="timeline-step-label">{step.label}</span>
                    <span className="timeline-step-sub">{step.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="drawer-section premium-card">
            <h4 className="section-title-premium">Attached Files</h4>
            <div className="drawer-docs-list">
              {quote.docs?.map((doc, idx) => (
                <div key={doc.name} className="drawer-doc-row">
                  <div className="drawer-doc-info">
                    {getFileIcon(doc.type)}
                    <span className="drawer-doc-name" title={doc.name}>{doc.name}</span>
                  </div>
                  <button 
                    className="btn-doc-open"
                    onClick={() => onOpenDocument(quote.id, idx)}
                  >
                    Open
                    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* AI OCR Extraction Preview */}
          <div className="drawer-section premium-card">
            <h4 className="section-title-premium">AI Digitized Document OCR</h4>
            <div className="ocr-preview-container">
              <div className="ocr-scanner-glow"></div>
              <div className="ocr-header">
                <span className="ocr-badge"><span className="ocr-blink-dot"></span> COGNITIVE OCR LIVE</span>
                <span className="ocr-confidence">Confidence: 99.8%</span>
              </div>
              <div className="ocr-document-body">
                <div className="ocr-grid-line-h"></div>
                <div className="ocr-grid-line-v"></div>
                <div className="ocr-content-box">
                  <div className="ocr-meta-field" data-label="SYS_REF">
                    <span className="ocr-field-label">QUOTE_NO:</span>
                    <span className="ocr-field-val highlight">{quote.quoteNo}</span>
                  </div>
                  <div className="ocr-meta-field" data-label="CLIENT">
                    <span className="ocr-field-label">CUSTOMER:</span>
                    <span className="ocr-field-val">{quote.customer}</span>
                  </div>
                  <div className="ocr-meta-field" data-label="ROUTING">
                    <span className="ocr-field-label">ROUTING:</span>
                    <span className="ocr-field-val">{quote.branch} &rarr; {quote.direction} ({quote.mode})</span>
                  </div>
                  <div className="ocr-meta-field" data-label="DATES">
                    <span className="ocr-field-label">TIMELINES:</span>
                    <span className="ocr-field-val">EFF: {formatDate(quote.effectiveDate)} / EXP: {formatDate(quote.expiryDate)}</span>
                  </div>
                  <div className="ocr-meta-field" data-label="STATUS">
                    <span className="ocr-field-label">RECORDS_STATUS:</span>
                    <span className="ocr-field-val ocr-status">{quote.status}</span>
                  </div>
                </div>
                <div className="ocr-watermark">SECURE ENCRYPTED DOC</div>
              </div>
            </div>
          </div>

          {/* Metadata Grid Section */}
          <div className="drawer-section premium-card">
            <h4 className="section-title-premium">Details &amp; Routing</h4>
            <div className="drawer-meta-grid">
              {metaFields.map(f => (
                <div key={f.label} className="drawer-meta-row">
                  <span className="drawer-meta-label">{f.label}</span>
                  <span className="drawer-meta-value">{f.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="drawer-footer">
          <button className="btn-drawer-footer-close" onClick={onClose}>
            Close details
          </button>
        </div>
      </div>
    </div>
  );
}
