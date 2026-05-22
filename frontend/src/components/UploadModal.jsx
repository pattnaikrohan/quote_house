import React, { useState, useRef } from 'react';
import './UploadModal.css';

const INITIAL_FORM = {
  quoteNo: '',
  customer: '',
  custType: '',
  status: '',
  branch: '',
  rep: '',
  direction: '',
  mode: '',
  vertical: '',
  quoteDate: '',
  effectiveDate: '',
  expiryDate: ''
};

export default function UploadModal({ isOpen, onClose, onUpload, isUploading }) {
  if (!isOpen) return null;

  const [form, setForm] = useState(INITIAL_FORM);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Dropzone Events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  };

  const handleFileSelect = (e) => {
    const f = e.target.files[0];
    if (f) validateAndSetFile(f);
  };

  const validateAndSetFile = (selectedFile) => {
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'xlsx', 'xls', 'docx', 'doc'];
    
    if (!allowed.includes(ext)) {
      setErrors(prev => ({ ...prev, file: 'Unsupported format. Choose PDF, Excel or Word.' }));
      setFile(null);
      return;
    }

    if (selectedFile.size > 50 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, file: 'File exceeds the 50 MB limit.' }));
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: null }));
    
    // Auto-fill some fields based on the filename if possible, for premium UX!
    // Example filename: QT-2025-00102_customer.pdf
    const nameWithoutExt = selectedFile.name.split('.')[0];
    const parts = nameWithoutExt.split('_');
    if (parts[0].startsWith('QT-')) {
      handleInputChange('quoteNo', parts[0]);
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate file
    if (!file) {
      newErrors.file = 'A quote document is required.';
    }

    // Validate mandatory fields
    const mandatory = ['quoteNo', 'customer', 'custType', 'status', 'branch', 'rep', 'direction', 'mode', 'quoteDate', 'expiryDate'];
    mandatory.forEach(field => {
      if (!form[field].trim()) {
        newErrors[field] = 'Required';
      }
    });

    // Validate dates: expiry must be after quote date
    if (form.quoteDate && form.expiryDate) {
      const qd = new Date(form.quoteDate);
      const ed = new Date(form.expiryDate);
      if (ed < qd) {
        newErrors.expiryDate = 'Expiry must be after Quote Date';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll modal body to top to see file errors
      const body = document.querySelector('.modal-body');
      if (body) body.scrollTop = 0;
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(form).forEach(([key, val]) => {
      formData.append(key, val);
    });

    onUpload(formData, () => {
      // Success callback
      setForm(INITIAL_FORM);
      setFile(null);
      setErrors({});
      onClose();
    });
  };

  const getFileIconClass = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'badge-pdf';
    if (ext === 'xlsx' || ext === 'xls') return 'badge-xlsx';
    if (ext === 'docx' || ext === 'doc') return 'badge-docx';
    return 'badge-other';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2>Upload Sales Quote</h2>
            <p>Fill in metadata and attach the document. Fields marked <span className="star">*</span> are mandatory.</p>
          </div>
          <button className="btn-modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form-element">
          <div className="modal-body">
            
            {/* File Section */}
            <div className="form-section">
              <h4 className="form-section-title">Quote Document</h4>
              
              {!file ? (
                <div 
                  className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="dropzone-icon">
                    <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="1.5" fill="none">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <span className="dropzone-text">Drop file here or click to browse</span>
                  <span className="dropzone-sub">Supports PDF, Excel (.xlsx), Word (.docx) · Max 50MB</span>
                </div>
              ) : (
                <div className="file-chip-wrap">
                  <div className="file-chip-info">
                    <span className={`file-type-badge ${getFileIconClass(file.name)}`}>
                      {file.name.split('.').pop().toUpperCase()}
                    </span>
                    <span className="file-chip-name">{file.name}</span>
                    <span className="file-chip-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                  <button type="button" className="btn-remove-file" onClick={removeFile} title="Remove file">
                    ✕
                  </button>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept=".pdf,.xlsx,.xls,.docx,.doc" 
                style={{ display: 'none' }}
              />
              {errors.file && <span className="field-error-text mt-1">{errors.file}</span>}
            </div>

            {/* Quote Identity */}
            <div className="form-section">
              <h4 className="form-section-title">Quote Identity</h4>
              <div className="form-grid-2">
                <div className={`form-field ${errors.quoteNo ? 'error' : ''}`}>
                  <label className="field-label">Quote Number <span className="star">*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. QT-2025-00102"
                    value={form.quoteNo}
                    onChange={(e) => handleInputChange('quoteNo', e.target.value)}
                  />
                  {errors.quoteNo && <span className="field-error-text">{errors.quoteNo}</span>}
                </div>

                <div className={`form-field ${errors.customer ? 'error' : ''}`}>
                  <label className="field-label">Customer <span className="star">*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Company name"
                    value={form.customer}
                    onChange={(e) => handleInputChange('customer', e.target.value)}
                  />
                  {errors.customer && <span className="field-error-text">{errors.customer}</span>}
                </div>

                <div className={`form-field ${errors.custType ? 'error' : ''}`}>
                  <label className="field-label">Customer Type <span className="star">*</span></label>
                  <select 
                    className="form-select"
                    value={form.custType}
                    onChange={(e) => handleInputChange('custType', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="New">New</option>
                    <option value="Existing">Existing</option>
                  </select>
                  {errors.custType && <span className="field-error-text">{errors.custType}</span>}
                </div>

                <div className={`form-field ${errors.status ? 'error' : ''}`}>
                  <label className="field-label">Status <span className="star">*</span></label>
                  <select 
                    className="form-select"
                    value={form.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Expired">Expired</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                  </select>
                  {errors.status && <span className="field-error-text">{errors.status}</span>}
                </div>
              </div>
            </div>

            {/* Routing & Classification */}
            <div className="form-section">
              <h4 className="form-section-title">Routing &amp; Classification</h4>
              <div className="form-grid-2">
                <div className={`form-field ${errors.branch ? 'error' : ''}`}>
                  <label className="field-label">Branch <span className="star">*</span></label>
                  <select 
                    className="form-select"
                    value={form.branch}
                    onChange={(e) => handleInputChange('branch', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Melbourne">Melbourne</option>
                    <option value="Sydney">Sydney</option>
                    <option value="Brisbane">Brisbane</option>
                    <option value="Perth">Perth</option>
                    <option value="Adelaide">Adelaide</option>
                  </select>
                  {errors.branch && <span className="field-error-text">{errors.branch}</span>}
                </div>

                <div className={`form-field ${errors.rep ? 'error' : ''}`}>
                  <label className="field-label">Sales Rep <span className="star">*</span></label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Full name"
                    value={form.rep}
                    onChange={(e) => handleInputChange('rep', e.target.value)}
                  />
                  {errors.rep && <span className="field-error-text">{errors.rep}</span>}
                </div>

                <div className={`form-field ${errors.direction ? 'error' : ''}`}>
                  <label className="field-label">Direction <span className="star">*</span></label>
                  <select 
                    className="form-select"
                    value={form.direction}
                    onChange={(e) => handleInputChange('direction', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Import">Import</option>
                    <option value="Export">Export</option>
                    <option value="Domestic">Domestic</option>
                    <option value="Cross-trade">Cross-trade</option>
                  </select>
                  {errors.direction && <span className="field-error-text">{errors.direction}</span>}
                </div>

                <div className={`form-field ${errors.mode ? 'error' : ''}`}>
                  <label className="field-label">Mode <span className="star">*</span></label>
                  <select 
                    className="form-select"
                    value={form.mode}
                    onChange={(e) => handleInputChange('mode', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Air">Air</option>
                    <option value="Sea">Sea</option>
                    <option value="Road">Road</option>
                    <option value="Rail">Rail</option>
                    <option value="Multi">Multi</option>
                  </select>
                  {errors.mode && <span className="field-error-text">{errors.mode}</span>}
                </div>

                <div className="form-field full-width">
                  <label className="field-label">Vertical <span className="tag-optional">Optional</span></label>
                  <select 
                    className="form-select"
                    value={form.vertical}
                    onChange={(e) => handleInputChange('vertical', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Retail">Retail</option>
                    <option value="FMCG">FMCG</option>
                    <option value="Pharma">Pharma</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Technology">Technology</option>
                    <option value="Mining">Mining</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="form-section">
              <h4 className="form-section-title">Dates</h4>
              <div className="form-grid-3">
                <div className={`form-field ${errors.quoteDate ? 'error' : ''}`}>
                  <label className="field-label">Quote Date <span className="star">*</span></label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={form.quoteDate}
                    onChange={(e) => handleInputChange('quoteDate', e.target.value)}
                  />
                  {errors.quoteDate && <span className="field-error-text">{errors.quoteDate}</span>}
                </div>

                <div className="form-field">
                  <label className="field-label">Effective <span className="tag-optional">Optional</span></label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={form.effectiveDate}
                    onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                  />
                </div>

                <div className={`form-field ${errors.expiryDate ? 'error' : ''}`}>
                  <label className="field-label">Expiry Date <span className="star">*</span></label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={form.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  />
                  {errors.expiryDate && <span className="field-error-text">{errors.expiryDate}</span>}
                </div>
              </div>
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" className="btn-modal-cancel" onClick={onClose} disabled={isUploading}>
              Cancel
            </button>
            <button type="submit" className="btn-modal-submit" disabled={isUploading}>
              {isUploading ? (
                <>
                  <span className="spinner"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Upload quote
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
