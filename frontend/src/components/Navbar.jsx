import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { 
  MapPin, 
  Menu, 
  X, 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  Home as HomeIcon 
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/reports', label: 'Browse Reports', icon: Layers },
    { to: '/report-issue', label: 'Report an Issue', icon: PlusCircle },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

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
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink key={link.to} to={link.to} className={getNavLinkClass}>
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Call-to-Action on Desktop */}
          <div className="hidden md:block">
            <Link
              to="/report-issue"
              className="inline-flex items-center gap-1.5 bg-white text-emerald-800 hover:bg-emerald-50 px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Report Issue</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
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
        <div className="md:hidden border-t border-emerald-700 bg-emerald-850 px-4 pt-2 pb-4 space-y-1" id="mobile-menu">
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
              </NavLink>
            );
          })}
        </div>
      )}
    </nav>
  );
}
