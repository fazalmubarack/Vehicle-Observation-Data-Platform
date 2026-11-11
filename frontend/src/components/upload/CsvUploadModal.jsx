import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import datasetService from '../../services/datasetService';
import Alert from '../common/Alert';

export const CsvUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [previewRows, setPreviewRows] = useState([]);
  const [previewHeaders, setPreviewHeaders] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const resetState = () => {
    setFile(null);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setUploadProgress(0);
    setIsUploading(false);
    setError(null);
    setValidationErrors([]);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    if (isUploading) return;
    resetState();
    onClose();
  };

  const processFile = (selectedFile) => {
    setError(null);
    setValidationErrors([]);
    setPreviewRows([]);

    if (!selectedFile) return;

    // Check extension
    const isCsv =
      selectedFile.name.toLowerCase().endsWith('.csv') ||
      selectedFile.type === 'text/csv' ||
      selectedFile.type === 'application/vnd.ms-excel';

    if (!isCsv) {
      setError('Invalid file type. Please select a valid CSV (.csv) file.');
      return;
    }

    // Check size limit: 25 MB
    const maxSize = 25 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File size exceeds the 25MB maximum limit.');
      return;
    }

    setFile(selectedFile);

    // Parse preview of the first 5 data rows
    Papa.parse(selectedFile, {
      preview: 6, // 1 header row + 5 data rows
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta && results.meta.fields) {
          setPreviewHeaders(results.meta.fields);
          setPreviewRows(results.data);
        }
      },
      error: (err) => {
        console.warn('Preview parse warning:', err.message);
      },
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setValidationErrors([]);

    try {
      const response = await datasetService.uploadDataset(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      if (response.success) {
        resetState();
        onSuccess(response.dataset);
      }
    } catch (err) {
      setIsUploading(false);
      const apiMsg = err.response?.data?.message || err.message || 'File upload failed.';
      setError(apiMsg);
      if (err.response?.data?.validationErrors) {
        setValidationErrors(err.response.data.validationErrors);
      }
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <div className="modal-icon-bg">
              <UploadCloud size={20} color="#2563eb" />
            </div>
            <div>
              <h3 className="modal-title">Upload Observation Dataset</h3>
              <p className="modal-subtitle">
                Select or drop a CSV file with vehicle observations
              </p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isUploading}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit}>
          <div className="modal-body">
            {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

            {validationErrors.length > 0 && (
              <div className="validation-errors-box">
                <span className="validation-errors-title">
                  Validation Details ({validationErrors.length} errors found):
                </span>
                <ul className="validation-errors-list">
                  {validationErrors.slice(0, 5).map((errItem, idx) => (
                    <li key={idx}>{errItem}</li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li>...and {validationErrors.length - 5} additional row errors.</li>
                  )}
                </ul>
              </div>
            )}

            {!file ? (
              <div
                className={`upload-dropzone ${isDragging ? 'dropzone-active' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,text/csv"
                  className="visually-hidden"
                />
                <div className="dropzone-icon-wrap">
                  <UploadCloud size={36} color="#64748b" />
                </div>
                <div className="dropzone-text">
                  <span className="dropzone-prompt">Click to select CSV</span> or drag & drop here
                </div>
                <div className="dropzone-hint">
                  Expected schema: <code>time</code>, <code>vehicle_class</code>, <code>x(px)</code>, <code>y(px)</code> (Max 25MB)
                </div>
              </div>
            ) : (
              <div className="file-selected-card">
                <div className="file-info-header">
                  <div className="file-meta">
                    <FileText size={24} color="#2563eb" />
                    <div>
                      <div className="file-name">{file.name}</div>
                      <div className="file-size">
                        {(file.size / 1024).toFixed(1)} KB &bull; Ready for ingestion
                      </div>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      className="btn-text-danger"
                      onClick={() => setFile(null)}
                    >
                      Change file
                    </button>
                  )}
                </div>

                {/* CSV Preview */}
                {previewRows.length > 0 && (
                  <div className="csv-preview-section">
                    <div className="csv-preview-title">
                      <span>Preview (first {previewRows.length} rows)</span>
                      <span className="badge badge-default">Columns: {previewHeaders.join(', ')}</span>
                    </div>
                    <div className="table-responsive preview-table-container">
                      <table className="data-table preview-table">
                        <thead>
                          <tr>
                            {previewHeaders.map((col, idx) => (
                              <th key={idx}>{col}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {previewHeaders.map((col, cIdx) => (
                                <td key={cIdx}>{row[col] ?? ''}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Progress bar */}
                {isUploading && (
                  <div className="upload-progress-wrap">
                    <div className="progress-info">
                      <span>Uploading & validating records...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <UploadCloud size={16} />
                  <span>Upload & Ingest</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CsvUploadModal;

