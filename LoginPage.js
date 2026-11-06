import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import { Sparkles, Lock, User, Loader2 } from 'lucide-react';
import { setToken, isLoggedIn } from '@/lib/auth';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isLoggedIn()) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/auth/login`, { username, password });
      setToken(res.data.token, res.data.expires_at);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 429) setError('Too many attempts. Please try again in a few minutes.');
      else if (status === 503) setError('Login is not configured on the server yet.');
      else if (status === 401) setError('Incorrect username or password.');
      else setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <span className="text-2xl font-bold gradient-text">Pixel Global</span>
        </div>
        <p className="text-center text-gray-500 mb-8">Sign in to access SEO reports</p>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="username"
                type="text"
                autoFocus
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter username"
                data-testid="login-username"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Enter admin password"
                data-testid="login-password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600" data-testid="login-error">{error}</p>}

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            data-testid="login-submit"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
