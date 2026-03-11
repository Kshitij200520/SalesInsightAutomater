
import FileUpload from './components/FileUpload';
import './index.css';

function App() {
  return (
    <div className="app-container">
      <div className="header">
        <h1>Sales Insight Automator</h1>
        <p>Upload your sales dataset, secure AI insights, and mail the executive summary instantly.</p>
      </div>
      <FileUpload />
    </div>
  );
}

export default App;
