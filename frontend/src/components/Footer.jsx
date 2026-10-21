import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Heart, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-emerald-600 rounded">
                <MapPin className="w-5 h-5 text-white" />
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                Local<span className="text-emerald-400">Fix</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Empowering citizens to report neighborhood issues—from potholes and broken streetlights to water leaks—and track real progress toward resolution.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Phase 1 Prototype &bull; React + Vite &bull; MySQL-Ready Architecture</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
              Navigation
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/reports" className="hover:text-emerald-400 transition-colors">
                  Browse Reports
                </Link>
              </li>
              <li>
                <Link to="/report-issue" className="hover:text-emerald-400 transition-colors">
                  Report an Issue
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Community Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Category Guide */}
          <div>
            <h3 className="text-xs font-semibold text-gray-200 uppercase tracking-wider mb-3">
              Report Categories
            </h3>
            <ul className="space-y-1.5 text-sm text-gray-400">
              <li>Roads &amp; Potholes</li>
              <li>Garbage &amp; Waste</li>
              <li>Streetlights &amp; Power</li>
              <li>Water Leaks &amp; Drainage</li>
              <li>Public Infrastructure</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-2">
          <p>&copy; {new Date().getFullYear()} LocalFix Platform. Built for civic empowerment and full-stack learning.</p>
          <p className="flex items-center gap-1">
            Designed with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for cleaner communities.
          </p>
        </div>
      </div>
    </footer>
  );
}
