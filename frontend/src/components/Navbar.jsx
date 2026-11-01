import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  Home as HomeIcon,
  ShieldCheck,
  FileText,
  LogIn,
  LogOut,
  User,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation links configured dynamically based on auth & role
  const navLinks = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/reports', label: 'Browse Reports', icon: Layers },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...(isAuthenticated ? [{ to: '/my-reports', label: 'My Reports', icon: FileText }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, badge: 'ADMIN' }] : []),
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/reports');
  };

  const getNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-emerald-700 text-white shadow-sm'
        : 'text-emerald-100 hover:bg-emerald-600/70 hover:text-white'
    }`;

  const getMobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium transition-colors ${
      isActive
        ? 'bg-emerald-700 text-white'
        : 'text-emerald-100 hover:bg-emerald-600 hover:text-white'
    }`;

  return (
    <nav className="bg-emerald-800 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-white rounded-lg p-1"
          >
            <span className="p-1.5 bg-emerald-600 rounded-lg shadow-inner">
              <MapPin className="w-5 h-5 text-emerald-100" />
            </span>
            <span>Local<span className="text-emerald-300">Fix</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={getNavLinkClass}>
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded ml-1">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* User Auth Section & CTA on Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                {/* User Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-900/60 border border-emerald-700 rounded-xl text-xs">
                  <div className="w-6 h-6 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-emerald-200">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white leading-tight max-w-[120px] truncate">
                      {user?.name}
                    </span>
                    <span className="text-[10px] text-emerald-300 uppercase font-bold">
                      {user?.role === 'ADMIN' ? 'Admin' : 'Citizen'}
                    </span>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-200 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-emerald-700/60 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-sm">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-emerald-100 hover:text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700/60 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-emerald-900 bg-emerald-200 hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Report Issue CTA */}
            <Link
              to="/report-issue"
              className="inline-flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report Issue</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/report-issue"
              className="p-1.5 bg-white text-emerald-800 rounded-lg text-xs font-semibold shadow-sm"
              title="Report Issue"
            >
              <PlusCircle className="w-5 h-5 text-emerald-600" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-emerald-200 hover:text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-emerald-700 bg-emerald-900 px-4 pt-3 pb-5 space-y-3" id="mobile-menu">
          {/* User profile section if logged in */}
          {isAuthenticated ? (
            <div className="flex items-center justify-between pb-3 border-b border-emerald-700/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-sm">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-emerald-300">{user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs text-emerald-200 hover:text-white bg-emerald-700/50 px-2.5 py-1.5 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-emerald-700/70">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium bg-emerald-700/60 text-white"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold bg-emerald-200 text-emerald-900"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </Link>
            </div>
          )}

          {/* Links */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={getMobileNavLinkClass}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[10px] uppercase font-bold bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded ml-1">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
