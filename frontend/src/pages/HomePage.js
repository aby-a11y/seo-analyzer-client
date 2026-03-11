import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, Sparkles, TrendingUp, Target, FileText, Zap, ArrowRight, History, User, Mail, Phone, X } from 'lucide-react';


const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [normalizedUrl, setNormalizedUrl] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });
  const [modalErrors, setModalErrors] = useState({});



  // ✨ NEW: Normalize URL function
  const normalizeUrl = (inputUrl) => {
    let normalized = inputUrl.trim();
    
    // Remove leading/trailing spaces
    normalized = normalized.trim();
    
    // If URL doesn't have protocol, add https://
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = 'https://' + normalized;
    }
    
    // If URL doesn't have www., add it (optional - you can remove this if not needed)
    // This ensures consistency: example.com → https://www.example.com
    try {
      const urlObj = new URL(normalized);
      if (!urlObj.hostname.startsWith('www.') && !urlObj.hostname.match(/^localhost/i)) {
        urlObj.hostname = 'www.' + urlObj.hostname;
      }
      normalized = urlObj.toString();
    } catch (e) {
      // If URL parsing fails, return as-is
      return normalized;
    }
    
    return normalized;
  };

 const handleAnalyze = async (e) => {
  e.preventDefault();
  setError('');

  const norm = normalizeUrl(url);

  try {
    new URL(norm);
  } catch {
    setError('Please enter a valid website URL (e.g., example.com or https://example.com)');
    return;
  }

  setNormalizedUrl(norm);
  setShowModal(true);
};

const handleModalSubmit = async () => {
  const errors = {};

  if (!userInfo.name.trim()) errors.name = 'Name is required';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!userInfo.email.trim()) errors.email = 'Email is required';
  else if (!emailRegex.test(userInfo.email)) errors.email = 'Valid email chahiye';

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!userInfo.phone.trim()) errors.phone = 'Phone required';
  else if (!phoneRegex.test(userInfo.phone)) errors.phone = '10-digit valid number do';

  if (Object.keys(errors).length > 0) {
    setModalErrors(errors);
    return;
  }

  setShowModal(false);
  setLoading(true);

  try {
    const response = await axios.post(`${API}/seo/analyze`, {
      url: normalizedUrl,
      user_details: {
        name: userInfo.name.trim(),
        email: userInfo.email.trim(),
        phone: userInfo.phone.trim(),
      },
    });
    navigate(`/report/${response.data.id}`);
  } catch (err) {
    setError(err.response?.data?.detail || 'Failed to analyze website.');
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-indigo-600" />
              <span className="text-2xl font-bold gradient-text">Pixel Global</span>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              data-testid="history-nav-button"
            >
              <History className="w-5 h-5" />
              <span>History</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            AI-Powered <span className="gradient-text">SEO Analysis</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get instant, comprehensive SEO audits powered by advanced AI. 
            Identify issues, discover opportunities, and dominate search rankings.
          </p>

          {/* URL Input Form */}
          <div className="max-w-3xl mx-auto" data-testid="url-input-form">
            <form onSubmit={handleAnalyze} className="relative">
              <div className="flex items-center bg-white rounded-2xl shadow-xl border-2 border-transparent focus-within:border-indigo-500 transition-all">
                <Search className="w-6 h-6 text-gray-400 ml-6" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL (e.g., example.com or pixelglobal.com)"
                  className="flex-1 px-4 py-5 text-lg outline-none rounded-l-2xl"
                  disabled={loading}
                  data-testid="url-input"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !url}
                  className="px-8 py-5 bg-indigo-600 text-white font-semibold rounded-r-2xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  data-testid="analyze-button"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>Analyze</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700" data-testid="error-message">
                {error}
              </div>
            )}
            {/* ✨ NEW: Helper text */}
            <p className="mt-3 text-sm text-gray-500">
              💡 Just enter the domain name - we'll handle the rest! (e.g., pixelglobal.com)
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Comprehensive Analysis"
            description="Deep dive into title tags, meta descriptions, heading structure, and technical SEO signals."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Keyword Strategy"
            description="Get primary and long-tail keyword recommendations with intent classification."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Content Recommendations"
            description="Receive SEO-optimized content ideas and ideal page structures."
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="Competitor Insights"
            description="Understand content gaps and opportunities to outperform competitors."
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            title="AI-Powered"
            description="Leveraging GPT-4o-mini for expert-level SEO consulting and analysis."
          />
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="30-Day Action Plan"
            description="Get a clear, prioritized roadmap for maximum impact with minimal effort."
          />
        </div>
      </div>
      {/* User Info Modal */}
{showModal && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Your Details</h3>
          <p className="text-sm text-gray-500 mt-1">Analysis ke liye info fill karo</p>
        </div>
        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-indigo-600" />
        </div>
      </div>
      <div className="bg-indigo-50 rounded-xl px-4 py-3 mb-6">
        <p className="text-xs text-indigo-500 font-medium uppercase mb-1">Analyzing</p>
        <p className="text-sm text-indigo-800 font-semibold truncate">{normalizedUrl}</p>
      </div>
      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={userInfo.name}
            onChange={(e) => { setUserInfo({...userInfo, name: e.target.value}); setModalErrors({...modalErrors, name: ''}); }}
            placeholder="Apna naam likho"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none ${modalErrors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`} />
        </div>
        {modalErrors.name && <p className="text-red-500 text-xs mt-1">⚠ {modalErrors.name}</p>}
      </div>
      {/* Email */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" value={userInfo.email}
            onChange={(e) => { setUserInfo({...userInfo, email: e.target.value}); setModalErrors({...modalErrors, email: ''}); }}
            placeholder="Email address"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none ${modalErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`} />
        </div>
        {modalErrors.email && <p className="text-red-500 text-xs mt-1">⚠ {modalErrors.email}</p>}
      </div>
      {/* Phone */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="tel" value={userInfo.phone} maxLength={10}
            onChange={(e) => { setUserInfo({...userInfo, phone: e.target.value}); setModalErrors({...modalErrors, phone: ''}); }}
            placeholder="10-digit number"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none ${modalErrors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-indigo-500'}`} />
        </div>
        {modalErrors.phone && <p className="text-red-500 text-xs mt-1">⚠ {modalErrors.phone}</p>}
      </div>
      {/* Buttons */}
      <div className="flex gap-3">
        <button onClick={() => { setShowModal(false); setModalErrors({}); }}
          className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-medium flex items-center justify-center gap-2">
          <X className="w-4 h-4" /> Cancel
        </button>
        <button onClick={handleModalSubmit}
          className="flex-1 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold flex items-center justify-center gap-2">
          Start Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
)}


      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" data-testid="loading-overlay">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Analyzing Your Website</h3>
            <p className="text-gray-600">Our AI is performing a comprehensive SEO audit...</p>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
    <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default HomePage;
