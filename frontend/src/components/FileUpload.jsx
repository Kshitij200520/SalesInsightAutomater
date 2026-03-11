import { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Mail, CheckCircle, AlertCircle, Loader, BrainCircuit, Send } from 'lucide-react';
import { analyzeSalesData } from '../api';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [message, setMessage] = useState('');
  const [summary, setSummary] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
        setStatus('error');
        setMessage('Invalid file type. Please upload a .csv or .xlsx file.');
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) {
        setStatus('error');
        setMessage('File is too large. Maximum size is 5MB.');
        return;
      }

      setFile(selectedFile);
      setStatus('idle');
      setMessage('');
      setSummary('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !email) {
      setStatus('error');
      setMessage('Please provide both a file and an email address.');
      return;
    }

    setStatus('uploading');
    setSummary('');
    
    // Transition to processing state after upload begins
    setTimeout(() => {
      setStatus(prev => (prev === 'uploading' ? 'processing' : prev));
    }, 1000);

    try {
      const response = await analyzeSalesData(file, email);
      setStatus('success');
      setMessage(response.emailStatus);
      setSummary(response.summary || '');
      setFile(null);
      setEmail('');
    } catch (err) {
      setStatus('error');
      if (err.message === 'Failed to fetch') {
        setMessage('Failed to connect to the backend. Please ensure VITE_API_URL is correctly set in your environment variables.');
      } else {
        setMessage(err.message || 'An error occurred during processing.');
      }
    }
  };

  return (
    <div className="upload-container">
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="email">Recipient Email</label>
          <div className="input-wrapper">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              id="email"
              placeholder="executive@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'uploading' || status === 'processing'}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Sales Data (.csv, .xlsx)</label>
          <div className={`file-drop-area ${file ? 'active' : ''}`}>
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              onChange={handleFileChange}
              disabled={status === 'uploading' || status === 'processing'}
            />
            <div className="file-message">
              {file ? <FileSpreadsheet size={40} color="#6366f1" /> : <UploadCloud size={40} />}
              {file ? (
                <span className="file-name">{file.name}</span>
              ) : (
                <span>Drag &amp; drop or click to upload CSV/Excel (Max 5MB)</span>
              )}
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          className="btn-submit" 
          disabled={status === 'uploading' || status === 'processing' || !file || !email}
        >
          {status === 'uploading' ? (
            <><Loader className="spinner" size={18} /> Uploading...</>
          ) : status === 'processing' ? (
            <><Loader className="spinner" size={18} /> Processing AI Summary...</>
          ) : (
            <><Send size={16} /> Generate &amp; Send Report</>
          )}
        </button>
      </form>

      {status === 'success' && (
        <div className="status-message success">
          <div className="status-header"><CheckCircle size={18} /> <strong>Success!</strong> <span className="email-status">{message}</span></div>
        </div>
      )}

      {status === 'error' && (
        <div className="status-message error">
          <div className="status-header"><AlertCircle size={18} /> <strong>Error</strong></div>
          <div>{message}</div>
        </div>
      )}

      {summary && (
        <div className="summary-panel">
          <div className="summary-header">
            <BrainCircuit size={20} />
            <span>AI Executive Summary</span>
          </div>
          <div className="summary-body">
            {summary.split('\n').map((line, i) => (
              line.trim() ? <p key={i}>{line}</p> : null
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
