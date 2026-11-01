import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Mail, 
  Lock, 
  AlertCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../services/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // If already authenticated as ADMIN, redirect straight to /admin
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your municipal email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Authenticate with the existing Spring Boot backend
      const data = await authApi.login({
        email: email.trim(),
        password,
      });

      // Step 2: Strictly verify that the authenticated account has the 'ADMIN' role
      if (data.role !== 'ADMIN') {
        // Clear any stored citizen session so non-admin is not logged in
        logout();
        setErrorMessage(
          `Access Denied: The account "${data.email}" is registered as a Citizen user and does not possess administrator privileges. Please sign in through the Citizen Portal.`
        );
        return;
      }

      // Step 3: Persist admin session in localStorage and update auth state
      const adminUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(adminUser));

      // Trigger full context sync by reloading or navigating
      window.location.href = '/admin';
    } catch (err) {
      console.error('Admin authentication failure:', err);
      setErrorMessage(
        err.message || 'Invalid administrator credentials. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-emerald-900/10">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex p-3 bg-emerald-900 text-emerald-100 rounded-2xl shadow-md mb-3 ring-4 ring-emerald-50">
            <ShieldCheck className="w-8 h-8 text-emerald-300" />
          </div>
          <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-2">
            Municipal Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Administrator Sign In
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-gray-500 leading-relaxed">
            Restricted access portal for authorized municipal staff to manage civic issues and update resolution statuses.
          </p>
        </div>

        {/* Informational Alert if logged in as standard Citizen */}
        {isAuthenticated && !isAdmin && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">Signed in as Citizen ({user?.name})</p>
              <p className="mt-0.5">
                Sign in below with an administrator account to access management tools, or return to the citizen workspace.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-700 flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Authentication Failed</p>
              <p className="text-xs mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@localfix.org"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-shadow"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-shadow"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-800 hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-700 disabled:opacity-60 transition-all shadow-md active:scale-[0.99] mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Administrator Privileges...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Sign In to Admin Portal</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-xl text-[11px] text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Administrative Security Policy
          </p>
          <p>
            Administrative actions, report updates, and logins are authenticated with Spring Security and HMAC-SHA256 tokens.
          </p>
        </div>

        {/* Link back to Citizen Login */}
        <div className="text-center pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            Looking for standard citizen reporting?{' '}
            <Link
              to="/login"
              className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2 inline-flex items-center gap-0.5"
            >
              <span>Citizen Sign In</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
