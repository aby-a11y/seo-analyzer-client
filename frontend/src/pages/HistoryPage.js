import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ExternalLink, Trash2, FileText, Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HistoryPage = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/seo/reports`);
      setReports(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setLoading(false);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    setDeletingId(reportId);
    try {
      await axios.delete(`${API}/seo/reports/${reportId}`);
      setReports(reports.filter(r => r.id !== reportId));
    } catch (err) {
      console.error('Failed to delete report:', err);
      alert('Failed to delete report');
    }
    setDeletingId(null);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              data-testid="back-to-home-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold gradient-text">Pixel global Reports</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analysis History</h1>
          <p className="text-gray-600">View and manage your previous SEO reports</p>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
            <p className="text-gray-600 mb-6">Start analyzing websites to see your reports here</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Analyze Your First Website
            </button>
          </div>
        ) : (
          <div className="grid gap-6" data-testid="reports-list">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <a
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-semibold text-gray-900 hover:text-indigo-600 flex items-center space-x-2"
                      >
                        <span>{report.url}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      {report.seo_score && (
                        <div className={`px-3 py-1 rounded-full font-bold text-sm ${getScoreColor(report.seo_score)}`}>
                          Score: {report.seo_score}/100
                        </div>
                      )}
                    </div>

                    <p className="text-gray-500 text-sm mb-4">
                      Analyzed on {new Date(report.analyzed_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {report.user_name && (
                      <div className="flex gap-4 text-sm text-gray-600 mb-3">
                        <span>👤 {report.user_name}</span>
                         <span>✉️ {report.user_email}</span>
                          <span>📞 {report.user_phone}</span>
                          </div>
                          )}

                    {report.analysis_summary && (
                      <p className="text-gray-700 mb-4 line-clamp-2">{report.analysis_summary}</p>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {report.seo_issues && (
                        <span className="flex items-center space-x-1">
                          <span className="font-medium">{report.seo_issues.length}</span>
                          <span>issue{report.seo_issues.length !== 1 ? 's' : ''} found</span>
                        </span>
                      )}
                      {report.word_count > 0 && (
                        <span>• {report.word_count.toLocaleString()} words</span>
                      )}
                      {report.h1_tags && report.h1_tags.length > 0 && (
                        <span>• {report.h1_tags.length} H1 tag{report.h1_tags.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => navigate(`/report/${report.id}`)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      data-testid={`view-report-${report.id}`}
                    >
                      View Report
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      disabled={deletingId === report.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      data-testid={`delete-report-${report.id}`}
                    >
                      {deletingId === report.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
