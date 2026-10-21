import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  Send, 
  ArrowLeft, 
  MapPin, 
  Tag, 
  AlignLeft, 
  Type, 
  Info,
  ExternalLink
} from 'lucide-react';
import { useReports } from '../context/ReportsContext';
import { CATEGORIES } from '../data/sampleReports';

export default function ReportIssue() {
  const navigate = useNavigate();
  const { addReport } = useReports();

  // Form input state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    description: '',
    priority: 'Medium',
  });

  // Validation errors state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Submission result state
  const [submittedReport, setSubmittedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available categories excluding 'All'
  const reportCategories = CATEGORIES.filter((c) => c !== 'All');

  // Validate fields
  const validate = (data) => {
    const newErrors = {};

    if (!data.title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (data.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!data.category) {
      newErrors.category = 'Please select an issue category.';
    }

    if (!data.location.trim()) {
      newErrors.location = 'Location or landmark is required.';
    } else if (data.location.trim().length < 4) {
      newErrors.location = 'Please provide a more descriptive location.';
    }

    if (!data.description.trim()) {
      newErrors.description = 'Please describe the problem.';
    } else if (data.description.trim().length < 15) {
      newErrors.description = 'Description should be at least 15 characters to help field teams.';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time error clearance if field was touched
    if (touched[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const validationErrors = validate(formData);
    if (validationErrors[name]) {
      setErrors((prev) => ({ ...prev, [name]: validationErrors[name] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      title: true,
      category: true,
      location: true,
      description: true,
    });

    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return; // Prevent submission if invalid
    }

    setIsSubmitting(true);

    // Simulate brief client-side processing
    setTimeout(() => {
      const created = addReport(formData);
      setSubmittedReport(created);
      setIsSubmitting(false);

      // Reset form
      setFormData({
        title: '',
        category: '',
        location: '',
        description: '',
        priority: 'Medium',
      });
      setTouched({});
      setErrors({});
    }, 400);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Browse Reports</span>
        </Link>
      </div>

      {/* Confirmation Banner upon successful submission */}
      {submittedReport ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5 animate-in fade-in duration-300">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-emerald-950">
                Report Submitted Successfully!
              </h2>
              <p className="text-sm text-emerald-800 leading-relaxed">
                Thank you for helping improve our neighborhood. Your report has been registered under ticket identifier{' '}
                <span className="font-mono font-bold text-emerald-900 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                  {submittedReport.id}
                </span>.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-emerald-100 text-xs text-gray-600 space-y-1.5">
            <p><strong className="text-gray-900">Title:</strong> {submittedReport.title}</p>
            <p><strong className="text-gray-900">Category:</strong> {submittedReport.category}</p>
            <p><strong className="text-gray-900">Location:</strong> {submittedReport.location}</p>
            <p><strong className="text-gray-900">Status:</strong> Pending Review</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/reports/${submittedReport.id}`}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <span>View Report Details</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/reports"
              className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Browse All Reports</span>
            </Link>
            <button
              type="button"
              onClick={() => setSubmittedReport(null)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-medium underline underline-offset-2 ml-auto"
            >
              Submit Another Report
            </button>
          </div>
        </div>
      ) : (
        /* The Report Form */
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-800 to-emerald-750 text-white p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Report a Civic Issue
            </h1>
            <p className="text-sm text-emerald-100 mt-1 max-w-xl">
              Fill in the details below to report a problem. Accurate details and landmarks help municipal crews respond faster.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-6">
            {/* Notice Box about Sample State */}
            <div className="flex items-start gap-3 p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Phase 1 Demonstration:</strong> This submission updates your local application state and browser storage. In Phase 6, this form will send HTTP requests to our Spring Boot backend and persist directly into MySQL.
              </p>
            </div>

            {/* Issue Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-1">
                Report Title <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g., Large pothole in front of community clinic"
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? "title-error" : undefined}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                    errors.title
                      ? 'border-red-400 bg-red-50/50 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                />
              </div>
              {errors.title && (
                <p id="title-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Category and Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-gray-800 mb-1">
                  Category <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? "category-error" : undefined}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors bg-white ${
                    errors.category
                      ? 'border-red-400 bg-red-50/50 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                  }`}
                >
                  <option value="">Select a category...</option>
                  {reportCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p id="category-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-semibold text-gray-800 mb-1">
                  Estimated Severity <span className="text-gray-400 font-normal text-xs">(optional)</span>
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 bg-white focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Low">Low — Minor inconvenience</option>
                  <option value="Medium">Medium — Needs repair soon</option>
                  <option value="High">High — Immediate hazard / danger</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-semibold text-gray-800 mb-1">
                Location &amp; Landmark <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g., 5th Avenue & Elm St, near City Bank ATM"
                aria-invalid={!!errors.location}
                aria-describedby={errors.location ? "location-error" : undefined}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                  errors.location
                    ? 'border-red-400 bg-red-50/50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
              {errors.location && (
                <p id="location-error" className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1">
                Detailed Description <span className="text-red-500" aria-hidden="true">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe the problem, when you first noticed it, and any safety hazards..."
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? "description-error" : undefined}
                className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors ${
                  errors.description
                    ? 'border-red-400 bg-red-50/50 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description ? (
                  <p id="description-error" className="text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errors.description}
                  </p>
                ) : (
                  <span className="text-xs text-gray-400">Minimum 15 characters</span>
                )}
                <span className="text-xs text-gray-400 font-mono">
                  {formData.description.length} chars
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all active:scale-[0.99]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting report...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Issue Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
