import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Layers, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  Sparkles, 
  ArrowRight,
  Shield,
  Trash2,
  Lightbulb,
  Droplets,
  Construction
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import ReportCard from '../components/ReportCard';

export default function Home() {
  const { reports } = useReports();

  // Pick top 3 most recent reports for the homepage preview
  const recentReports = reports.slice(0, 3);

  // Calculate live counts from state
  const totalCount = reports.length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;
  const inProgressCount = reports.filter((r) => r.status === 'IN_PROGRESS').length;

  const categories = [
    { name: 'Roads & Potholes', icon: Construction, color: 'text-amber-600 bg-amber-50' },
    { name: 'Garbage & Waste', icon: Trash2, color: 'text-emerald-600 bg-emerald-50' },
    { name: 'Streetlights & Poles', icon: Lightbulb, color: 'text-yellow-600 bg-yellow-50' },
    { name: 'Water & Leaks', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-800 to-emerald-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-medium backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Civic Problem Reporting Made Transparent &amp; Simple</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fixing Our Neighborhoods, <span className="text-emerald-300">Together.</span>
          </h1>

          <p className="text-lg sm:text-xl text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Spot a pothole, broken streetlight, or overflowing dumpster? Report civic issues in your area, follow real-time progress, and hold public services accountable.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/report-issue"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-emerald-900" />
              <span>Report an Issue</span>
            </Link>
            <Link
              to="/reports"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-700/80 hover:bg-emerald-700 text-white font-semibold px-6 py-3.5 rounded-xl border border-emerald-500/40 transition-colors"
            >
              <Layers className="w-5 h-5" />
              <span>Browse Existing Reports</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-3 max-w-xl mx-auto gap-4 border-t border-emerald-700/50 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-white">{totalCount}</div>
              <div className="text-xs text-emerald-200 font-medium mt-1">Total Reports</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-300">{inProgressCount}</div>
              <div className="text-xs text-emerald-200 font-medium mt-1">In Progress</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300">{resolvedCount}</div>
              <div className="text-xs text-emerald-200 font-medium mt-1">Resolved</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Simple 3-Step Process</h2>
          <p className="text-3xl font-extrabold text-gray-900">How LocalFix Works</p>
          <p className="text-gray-600 text-sm mt-2">
            Taking action to improve your street or park takes less than two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              1
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Submit an Issue</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Describe the problem, choose a category (such as roads, water, or lighting), and enter the landmark or street location.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow text-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              2
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Review &amp; Dispatch</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Municipal teams review the ticket, assign priority, and dispatch field crews to repair the problem.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow transition-shadow text-center">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center mx-auto mb-4 font-bold text-lg">
              3
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">Track to Resolution</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Citizens track progress in real-time until the ticket status is updated to Resolved, ensuring full transparency.
            </p>
          </div>
        </div>
      </section>

      {/* Common Categories Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">What Can You Report?</h2>
              <p className="text-sm text-gray-600">LocalFix covers primary civic maintenance categories.</p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              Filter by Category <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div key={cat.name} className="bg-white p-4 rounded-xl border border-gray-200/70 shadow-sm flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${cat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recent Community Reports Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Live Feed</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">Recent Community Reports</p>
            <p className="text-sm text-gray-500 mt-1">Issues recently submitted by neighbors in your area.</p>
          </div>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 group"
          >
            <span>View All Reports ({totalCount})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentReports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </section>
    </div>
  );
}
