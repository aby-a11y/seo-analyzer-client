
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, ExternalLink, AlertTriangle, CheckCircle, Info,
  TrendingUp, Target, Users, FileText, Calendar, Copy, Check,
  Sparkles, Link2, Image as ImageIcon, Share2, Shield
} from 'lucide-react';
import ResponsivePreview from '../components/ResponsivePreview';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ReportPage = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState('');
  const [expandedIssue, setExpandedIssue] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`${API}/seo/reports/${reportId}`);
      setReport(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load report');
      setLoading(false);
    }
  };

  const copyToClipboard = (text, section) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return <AlertTriangle className="w-5 h-5" />;
      case 'medium': return <Info className="w-5 h-5" />;
      case 'low': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };
const downloadPDF = async () => {
    const reportElement = document.getElementById('pdf-report-content');
    
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    const pageHeight = pdf.internal.pageSize.getHeight();
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`SEO-Report-${report.url?.replace(/https?:\/\//, '').replace(/\//g, '-')}.pdf`);
  };
 
  if (loading) {
     
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Report not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">


      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 transition-colors"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold gradient-text">Pixel global Reports</span>
              {/* PDF Button */}
  <button
    onClick={downloadPDF}
    className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 
               text-white rounded-lg hover:bg-indigo-700 transition-colors 
               text-sm font-medium shadow-md"
  >
    <Share2 className="w-4 h-4" />
    <span>Download PDF</span>
  </button>

            </div>
          </div>
        </div>
      </div>

      <div id = "pdf-report-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Website Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="website-overview">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">SEO Report</h1>
                {report.seo_score && (
                  <div className={`px-4 py-2 rounded-full font-bold text-2xl ${report.seo_score >= 80 ? 'bg-green-100 text-green-800' :
                      report.seo_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`} data-testid="seo-score">
                    {report.seo_score}/100
                  </div>
                )}
              </div>
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 text-lg"
              >
                <span>{report.url}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <p className="text-gray-500 mt-2">
                Analyzed on {new Date(report.analyzed_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {report.user_name && (
  <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-4">
    <p className="text-xs font-semibold text-indigo-500 uppercase mb-2">Analyzed For</p>
    <div className="flex gap-6 text-sm text-gray-700 flex-wrap">
      <span>👤 <b>{report.user_name}</b></span>
      <span>✉️ {report.user_email}</span>
      <span>📞 {report.user_phone}</span>
    </div>
  </div>
)}

            </div>
          </div>

          {report.analysis_summary && (
            <div className="bg-indigo-50 border-l-4 border-indigo-600 p-6 rounded-r-lg">
              <p className="text-gray-800 leading-relaxed">{report.analysis_summary}</p>
            </div>
          )}
        </div>
        {/* 4.1 SEO Issues - COLLAPSIBLE */}
{report.seo_issues && report.seo_issues.length > 0 && (
  <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="seo-issues-section">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
        <AlertTriangle className="w-6 h-6 text-red-500" />
        <span>SEO Issues Detected</span>
      </h3>
      <span className="text-gray-600 font-medium">
        {report.seo_issues.length} issue{report.seo_issues.length !== 1 ? 's' : ''}
      </span>
    </div>
    
    <div className="space-y-3">
      {report.seo_issues.map((issue, index) => (
        <div 
          key={index} 
          className={`accordion-item border rounded-lg overflow-hidden ${
            expandedIssue === index ? 'expanded border-indigo-500' : 'border-gray-200'
          }`}
        >
          {/* CLICKABLE HEADER */}
          <button
            onClick={() => setExpandedIssue(expandedIssue === index ? null : index)}
            className="accordion-button w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center space-x-3 flex-1">
              <div className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1 ${getPriorityColor(issue.priority)}`}>
                {getPriorityIcon(issue.priority)}
                <span>{issue.priority}</span>
              </div>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {issue.category}
              </span>
              <h4 className="text-base font-semibold text-gray-900">{issue.issue}</h4>
            </div>
            {/* PLUS/MINUS ICON */}
            <div className={`accordion-icon text-gray-400 text-2xl font-bold ml-4 ${expandedIssue === index ? 'rotated' : ''}`}>
              {expandedIssue === index ? '−' : '+'}
            </div>
          </button>
          
          {/* COLLAPSIBLE CONTENT */}
          <div className={`accordion-content ${expandedIssue === index ? 'expanded' : ''}`}>
            {expandedIssue === index && (
              <div className="accordion-details px-4 pb-4">
                <div className="bg-gray-50 p-4 rounded-lg border-t border-gray-200">
                  {/* FIX SECTION - FORMATTED WITH BULLETS */}
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-indigo-600 mb-2 flex items-center space-x-2">
                      <span>🔧</span>
                      <span>How to Fix:</span>
                    </p>
                    <div className="bg-white p-4 rounded-lg border-l-4 border-indigo-600">
                      <div className="space-y-3">
                        {issue.recommendation.split(/\\\\n|\\n|\n/).filter(part => part.trim()).map((part, idx) => {
                          const trimmed = part.trim();
                          const colonIndex = trimmed.indexOf(':');
                          
                          // Check if it's a label line (CURRENT:, TARGET:, EXAMPLE:, IMPACT:)
                          if (colonIndex > 0 && colonIndex < 30 && /^[A-Z\s]+:/.test(trimmed)) {
                            const label = trimmed.substring(0, colonIndex);
                            const value = trimmed.substring(colonIndex + 1).trim();
                            
                            return (
                              <div key={idx} className="flex items-start space-x-3">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex-shrink-0 mt-0.5">
                                  •
                                </span>
                                <div className="flex-1">
                                  <span className="font-bold text-gray-900 text-sm">{label}:</span>
                                  <span className="text-gray-700 text-sm ml-1.5">{value}</span>
                                </div>
                              </div>
                            );
                          }
                          
                          // Regular line
                          return (
                            <div key={idx} className="flex items-start space-x-3">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex-shrink-0 mt-0.5">
                                •
                              </span>
                              <p className="text-sm text-gray-700 leading-relaxed flex-1">{trimmed}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* PRIORITY IMPACT - ENHANCED */}
                  <div className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 ${
                    issue.priority === 'High' 
                      ? 'bg-red-50 border-red-500' 
                      : issue.priority === 'Medium' 
                        ? 'bg-yellow-50 border-yellow-500' 
                        : 'bg-blue-50 border-blue-500'
                  }`}>
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      issue.priority === 'High' 
                        ? 'bg-red-100' 
                        : issue.priority === 'Medium' 
                          ? 'bg-yellow-100' 
                          : 'bg-blue-100'
                    }`}>
                      {issue.priority === 'High' ? '🔥' : issue.priority === 'Medium' ? '⚠️' : '✓'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 mb-1">Priority Impact</p>
                      <p className={`text-xs leading-relaxed ${
                        issue.priority === 'High' 
                          ? 'text-red-800' 
                          : issue.priority === 'Medium' 
                            ? 'text-yellow-800' 
                            : 'text-blue-800'
                      }`}>
                        {issue.priority === 'High' 
                          ? 'Critical - Fix immediately for maximum SEO benefit and ranking improvement' 
                          : issue.priority === 'Medium' 
                            ? 'Important - Address within 1-2 weeks to prevent ranking decline' 
                            : 'Minor - Fix when possible to optimize overall performance'}
                      </p>
                    </div>
                  </div>
              </div>
            </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
  
)}

        {/* ========== SECTION 1: BASIC SEO ========== */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <FileText className="w-7 h-7 text-indigo-600" />
            <span>📊Basic SEO</span>
          </h2>

          {/* Grid for Title, Meta, Word Count, Images */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Title Tag Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-indigo-500 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-700 font-semibold">Title Tag</p>
                {report.title && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${report.title.length >= 50 && report.title.length <= 60
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : report.title.length >= 45 && report.title.length <= 70
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                    {report.title.length >= 50 && report.title.length <= 60
                      ? '✓ Optimal'
                      : report.title.length >= 45 && report.title.length <= 70
                        ? '⚠ Fair'
                        : '✗ Fix'}
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2" title={report.title}>
                {report.title || 'Missing Title'}
              </p>
              {report.title && (
                <p className="text-xs text-gray-600 font-medium">
                  {report.title.length} characters • Target: 50-60
                </p>
              )}
            </div>

            {/* Meta Description Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-purple-500 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-700 font-semibold">Meta Description</p>
                {report.meta_description && (
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${report.meta_description.length >= 150 && report.meta_description.length <= 160
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : report.meta_description.length >= 120 && report.meta_description.length <= 180
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-red-100 text-red-800 border border-red-300'
                    }`}>
                    {report.meta_description.length >= 150 && report.meta_description.length <= 160
                      ? '✓ Optimal'
                      : report.meta_description.length >= 120 && report.meta_description.length <= 180
                        ? '⚠ Fair'
                        : '✗ Fix'}
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2" title={report.meta_description}>
                {report.meta_description || 'Missing Meta'}
              </p>
              {report.meta_description && (
                <p className="text-xs text-gray-600 font-medium">
                  {report.meta_description.length} characters • Target: 150-160
                </p>
              )}
            </div>
         
          {/* Word Count Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-700 font-semibold">Content Length</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${report.word_count >= 1000 && report.word_count <= 2500
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : report.word_count >= 500 && report.word_count < 1000
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : report.word_count >= 2501 && report.word_count <= 3000
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                {report.word_count >= 1000 && report.word_count <= 2500
                  ? '✓ Good'
                  : report.word_count >= 500 || (report.word_count >= 2501 && report.word_count <= 3000)
                    ? '⚠ Fair'
                    : '✗ Thin'}
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {report.word_count.toLocaleString()}
            </p>
            <p className="text-xs text-gray-600 font-medium">words • Target: 1000-2500</p>
          </div>

          {/* Image Alt Tags Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border-l-4 border-green-500 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-700 font-semibold">Image Alt Tags</p>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${(report.images_without_alt ?? 0) === 0
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : (report.images_without_alt ?? 0) <= 3
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                {(report.images_without_alt ?? 0) === 0
                  ? '✓ Perfect'
                  : (report.images_without_alt ?? 0) <= 3
                    ? '⚠ Minor'
                    : '✗ Issue'}
              </span>
            </div>
            <div className="flex items-baseline space-x-2 mb-1">
              <p className="text-3xl font-bold text-gray-900">{report.total_images ?? 0}</p>
              <p className="text-sm text-gray-600 font-medium">images</p>
            </div>
            <p className={`text-xs font-semibold ${(report.images_without_alt ?? 0) === 0 ? 'text-green-600' : 'text-red-600'
              }`}>
              {(report.images_without_alt ?? 0) === 0
                ? '✓ All have alt text'
                : `${report.images_without_alt} missing alt text`}
            </p>
          </div>
        </div>

        {/* H1 Highlight - NEW */}
        {report.h1_tags && report.h1_tags.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border-l-4 border-indigo-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">H1 Header Tag</p>
              {report.h1_tags.length > 1 && (
                <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-300">
                  ⚠️ {report.h1_tags.length} H1s (Should be 1)
                </span>
              )}
              {report.h1_tags.length === 1 && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-300">
                  ✓ Perfect
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{report.h1_tags[0]}</p>
          </div>
        )}
                {/* H2-H6 Heading Structure - COLLAPSIBLE */}
        <div className="mt-6">
          <p className="text-lg font-semibold text-gray-900 mb-4">Heading Hierarchy (H2-H6)</p>

          {/* H2 Tags - COLLAPSIBLE */}
          {report.h2_tags && report.h2_tags.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setExpandedSection(expandedSection === 'h2' ? null : 'h2')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-lg border border-indigo-200 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-indigo-900">H2 Tags</span>
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-bold">
                    {report.h2_tags.length}
                  </span>
                </div>
                <div className={`text-2xl font-bold text-indigo-600 transition-transform ${expandedSection === 'h2' ? 'rotate-45' : ''}`}>
                  +
                </div>
              </button>
              
              {expandedSection === 'h2' && (
                <div className="mt-3 space-y-2 animate-slideDown">
                  {report.h2_tags.map((h2, idx) => (
                    <div key={idx} className="text-base font-semibold text-gray-800 bg-gray-50 p-3 rounded pl-4 border-l-4 border-indigo-500">
                      {h2}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* H3 Tags - COLLAPSIBLE */}
          {report.h3_tags && report.h3_tags.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setExpandedSection(expandedSection === 'h3' ? null : 'h3')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-lg border border-purple-200 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-purple-900">H3 Tags</span>
                  <span className="px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold">
                    {report.h3_tags.length}
                  </span>
                </div>
                <div className={`text-2xl font-bold text-purple-600 transition-transform ${expandedSection === 'h3' ? 'rotate-45' : ''}`}>
                  +
                </div>
              </button>
              
              {expandedSection === 'h3' && (
                <div className="mt-3 space-y-2 animate-slideDown">
                  {report.h3_tags.map((h3, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded pl-6 border-l-4 border-purple-500">
                      {h3}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* H4 Tags - COLLAPSIBLE */}
          {report.h4_tags && report.h4_tags.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setExpandedSection(expandedSection === 'h4' ? null : 'h4')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-blue-900">H4 Tags</span>
                  <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                    {report.h4_tags.length}
                  </span>
                </div>
                <div className={`text-2xl font-bold text-blue-600 transition-transform ${expandedSection === 'h4' ? 'rotate-45' : ''}`}>
                  +
                </div>
              </button>
              
              {expandedSection === 'h4' && (
                <div className="mt-3 space-y-2 animate-slideDown">
                  {report.h4_tags.map((h4, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded pl-8 border-l-4 border-blue-500">
                      {h4}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* H5 Tags - COLLAPSIBLE */}
          {report.h5_tags && report.h5_tags.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setExpandedSection(expandedSection === 'h5' ? null : 'h5')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-lg border border-green-200 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-green-900">H5 Tags</span>
                  <span className="px-3 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                    {report.h5_tags.length}
                  </span>
                </div>
                <div className={`text-2xl font-bold text-green-600 transition-transform ${expandedSection === 'h5' ? 'rotate-45' : ''}`}>
                  +
                </div>
              </button>
              
              {expandedSection === 'h5' && (
                <div className="mt-3 space-y-2 animate-slideDown">
                  {report.h5_tags.map((h5, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded pl-10 border-l-4 border-green-500">
                      {h5}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* H6 Tags - COLLAPSIBLE */}
          {report.h6_tags && report.h6_tags.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => setExpandedSection(expandedSection === 'h6' ? null : 'h6')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 rounded-lg border border-yellow-200 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-yellow-900">H6 Tags</span>
                  <span className="px-3 py-1 bg-yellow-600 text-white rounded-full text-xs font-bold">
                    {report.h6_tags.length}
                  </span>
                </div>
                <div className={`text-2xl font-bold text-yellow-600 transition-transform ${expandedSection === 'h6' ? 'rotate-45' : ''}`}>
                  +
                </div>
              </button>
              
              {expandedSection === 'h6' && (
                <div className="mt-3 space-y-2 animate-slideDown">
                  {report.h6_tags.map((h6, idx) => (
                    <div key={idx} className="text-sm text-gray-700 bg-gray-50 p-3 rounded pl-12 border-l-4 border-yellow-500">
                      {h6}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      {/* ========== SECTION 2: TECHNICAL SEO (ADVANCED) ========== */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="technical-seo-section">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
          <CheckCircle className="w-7 h-7 text-indigo-600" />
          <span>🔧Technical SEO (Advanced)</span>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Canonical URL */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-2 font-medium">Canonical Tag</p>
            <div className="flex items-center space-x-2 mb-2">
              {report.canonical_url ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Present</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700">Missing</span>
                </>
              )}
            </div>
            {report.canonical_url && (
              <p className="text-xs text-gray-600 break-all mt-2 bg-white p-2 rounded">
                {report.canonical_url}
              </p>
            )}
            {!report.canonical_url && (
              <p className="text-xs text-gray-600 mt-2">
                Add canonical tag to avoid duplicate content issues
              </p>
            )}
            {/* Canonical Issues */}
            {Array.isArray(report.canonical_issues) && report.canonical_issues.length > 0 && (
              <div className="mt-3 text-xs text-red-700 bg-red-50 p-2 rounded space-y-1">
                {report.canonical_issues.slice(0, 3).map((issue, idx) => (
                  <div key={idx} className="flex items-start space-x-1">
                    <span>•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SSL Certificate */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-green-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-2 font-medium">SSL Certificate</p>
            <div className="flex items-center space-x-2 mb-2">
              {report.ssl_enabled ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Enabled</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-bold text-red-700">Disabled</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {(report.technical_seo?.ssl_enabled ?? report.ssl_enabled) ? 'Secure HTTPS connection ✓' : 'HTTP only - migrate to HTTPS'}
            </p>
          </div>

          {/* Robots.txt */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-purple-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-2 font-medium">Robots.txt</p>
            <div className="flex items-center space-x-2 mb-2">
              {report.robots_txt_found ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Found</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-700">Not Found</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {report.robots_txt_found ? 'Crawl instructions present' : 'Add robots.txt for better indexing'}
            </p>
          </div>
          {/* Sitemap */}
          <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-600 mb-2 font-medium">XML Sitemap</p>
            <div className="flex items-center space-x-2 mb-2">
              {report.sitemap_found ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-bold text-green-700">Found</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="font-bold text-yellow-700">Not Found</span>
                </>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {report.sitemap_found ? 'Sitemap.xml accessible' : 'Create sitemap.xml for better crawling'}
            </p>
          </div>

 {/* LLM.txt */}
<div className="bg-gray-50 p-5 rounded-lg border-l-4 border-teal-500 hover:shadow-md transition-shadow">
  <p className="text-sm text-gray-600 mb-2 font-medium">LLM.txt</p>
  <div className="flex items-center space-x-2 mb-2">
    {report.technical_seo?.llm_txt_found ? (
      <>
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="font-bold text-green-700">Found</span>
      </>
    ) : (
      <>
        <AlertTriangle className="w-5 h-5 text-yellow-600" />
        <span className="font-bold text-yellow-700">Not Found</span>
      </>
    )}
  </div>
  <p className="text-xs text-gray-600 mt-2">
    {report.technical_seo?.llm_txt_found
      ? '✅ AI-friendly content guide present'
      : 'Add /llm.txt to help AI models understand your site'}
  </p>
</div>
         
          

          {/* Schema Markup - NEW */}
          {report.schema_analysis && (
            <div className="bg-gray-50 p-5 rounded-lg border-l-4 border-orange-500 hover:shadow-md transition-shadow">
              <p className="text-sm text-gray-600 mb-2 font-medium">Schema Markup</p>
              <div className="flex items-center space-x-2 mb-2">
                {report.schema_analysis.has_schema ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">Present</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-bold text-yellow-700">Missing</span>
                  </>
                )}
              </div>
              {report.schema_analysis.schema_types && report.schema_analysis.schema_types.length > 0 ? (
                <p className="text-xs text-gray-600 mt-2">
                  Types: {report.schema_analysis.schema_types.join(', ')}
                </p>
              ) : (
                <p className="text-xs text-gray-600 mt-2">
                  Add structured data for rich snippets
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Noindex Warning - Conditional */}
      {report.technical_seo?.noindex && (
        <div className="bg-red-50 rounded-2xl shadow-lg p-8 border-2 border-red-300 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3 mb-6">
            <Shield className="w-7 h-7 text-red-600" />
            <span>⚠️ Noindex Warning</span>
          </h2>
          <div className="bg-white rounded-xl p-6 border border-red-200">
            <p className="text-xs text-gray-600 mb-2">META ROBOTS STATUS</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 font-semibold">Noindex Detected</span>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="font-bold text-red-700">⚠️ NOINDEXED!</span>
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3">
              ⚠️ This page is blocked from search engines! Meta robots directive: <strong>{report.technical_seo.robots_directive || 'noindex'}</strong>
            </p>
          </div>
        </div>
      )}
      {/* ========== END SECTION 2: TECHNICAL SEO ========== */}
      {/* ========== SECTION 3: KEYWORDS & BACKLINKS ========== */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <Target className="w-8 h-8 text-indigo-600" />
          <span>🔗Keywords & Backlinks</span>
        </h2>
        <p className="text-gray-600 mb-6">Keyword strategy, internal structure, and external link profile</p>
      </div>

      {/* 3.1 Keyword Strategy */}
      {report.keyword_strategy && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="keyword-strategy-section">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Keyword Strategy</h3>
            <button
              onClick={() => copyToClipboard(
                `Primary: ${report.keyword_strategy.primary_keyword}\n\nLong-tail:\n${report.keyword_strategy.long_tail_keywords.join('\n')}`,
                'keywords'
              )}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {copiedSection === 'keywords' ? (
                <><Check className="w-4 h-4 text-green-600" /> <span className="text-sm">Copied!</span></>
              ) : (
                <><Copy className="w-4 h-4" /> <span className="text-sm">Copy</span></>
              )}
            </button>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-2 font-medium">Primary Keyword</p>
            <p className="text-2xl font-bold text-gray-900">{report.keyword_strategy.primary_keyword}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-4 font-medium">Long-tail Keywords</p>
            <div className="grid md:grid-cols-2 gap-3">
              {report.keyword_strategy.long_tail_keywords.map((keyword, index) => (
                <div key={index} className="flex items-start space-x-3 bg-gray-50 p-4 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{keyword}</p>
                    {report.keyword_strategy.keyword_intent[keyword] && (
                      <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-1 inline-block">
                        {report.keyword_strategy.keyword_intent[keyword]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* 3.2 Internal Linking Analysis */}
      {report.linking_analysis && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="internal-linking-section">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <Link2 className="w-6 h-6 text-indigo-600" />
            <span>Internal Linking Analysis</span>
          </h3>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 rounded-lg border-l-4 border-indigo-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Total Links</p>
              <p className="text-3xl font-bold text-indigo-900">{report.linking_analysis.total_links ?? 0}</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Internal Links</p>
              <p className="text-3xl font-bold text-green-900">{report.linking_analysis.internal_count ?? 0}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">External Links</p>
              <p className="text-3xl font-bold text-blue-900">{report.linking_analysis.external_count ?? 0}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Internal Ratio</p>
              <p className="text-3xl font-bold text-purple-900">{report.linking_analysis.internal_ratio ?? 0}%</p>
              <p className="text-xs text-gray-600 mt-1">Target: 70-80%</p>
            </div>
          </div>

          {/* Linking Issues/Recommendations */}
          {Array.isArray(report.linking_analysis.recommendations) && report.linking_analysis.recommendations.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-yellow-900 mb-2">Recommendations:</p>
              <ul className="space-y-1">
                {report.linking_analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-yellow-800 flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Metrics */}
          {(report.linking_analysis.nofollow_internal_count > 0 || report.linking_analysis.empty_anchor_count > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {report.linking_analysis.nofollow_internal_count > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-700 mb-1">Nofollow Internal Links</p>
                  <p className="text-2xl font-bold text-red-700">{report.linking_analysis.nofollow_internal_count}</p>
                  <p className="text-xs text-red-600 mt-1">Should be 0 for better SEO</p>
                </div>
              )}

              {report.linking_analysis.empty_anchor_count > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-gray-700 mb-1">Empty Anchor Text</p>
                  <p className="text-2xl font-bold text-red-700">{report.linking_analysis.empty_anchor_count}</p>
                  <p className="text-xs text-red-600 mt-1">Add descriptive anchor text</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* 3.3 Backlinks & External Links Analysis */}
      {report.backlink_analysis && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="backlink-analysis-section">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <ExternalLink className="w-6 h-6 text-indigo-600" />
            <span>Backlinks & External Links</span>
          </h3>

          {/* Main Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">External Links</p>
              <p className="text-3xl font-bold text-blue-900">{report.backlink_analysis.total_external_links ?? 0}</p>
              <p className="text-xs text-gray-600 mt-1">Outbound links</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Dofollow Links</p>
              <p className="text-3xl font-bold text-green-900">{report.backlink_analysis.dofollow_count ?? 0}</p>
              <p className="text-xs text-gray-600 mt-1">Link equity passing</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Unique Domains</p>
              <p className="text-3xl font-bold text-yellow-900">{report.backlink_analysis.unique_domains ?? 0}</p>
              <p className="text-xs text-gray-600 mt-1">Domain diversity</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Link Quality</p>
              <p className="text-3xl font-bold text-purple-900">{report.backlink_analysis.link_quality_score ?? 0}/100</p>
              <p className="text-xs text-gray-600 mt-1">Algorithm score</p>
            </div>
          </div>

          {/* Top Linked Domains Table */}
          {Array.isArray(report.backlink_analysis.top_linked_domains) && report.backlink_analysis.top_linked_domains.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-indigo-600" />
                <span>Top Linked Domains (Referrer Potential)</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Domain</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Links</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Authority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.backlink_analysis.top_linked_domains.slice(0, 10).map((domain, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-sm text-gray-900 font-medium">{domain.domain}</td>
                        <td className="p-3 text-sm text-gray-700">{domain.link_count}</td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${domain.estimated_authority.includes('High') ? 'bg-green-100 text-green-800' :
                              domain.estimated_authority.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {domain.estimated_authority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Referrer Strategy & Recommendations */}
          {Array.isArray(report.backlink_analysis.recommendations) && report.backlink_analysis.recommendations.length > 0 && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-indigo-900 mb-2 flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Referrer Strategy & Recommendations</span>
              </p>
              <ul className="space-y-1">
                {report.backlink_analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-indigo-800 flex items-start space-x-2">
                    <span className="mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Additional Link Metrics */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-1 font-medium">Nofollow Links</p>
              <p className="text-2xl font-bold text-gray-900">{report.backlink_analysis.nofollow_count ?? 0}</p>
              <p className="text-xs text-gray-600 mt-1">No link equity transfer</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 mb-1 font-medium">Dofollow Ratio</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.backlink_analysis.total_external_links > 0
                  ? Math.round((report.backlink_analysis.dofollow_count / report.backlink_analysis.total_external_links) * 100)
                  : 0}%
              </p>
              <p className="text-xs text-gray-600 mt-1">Target: 60-80%</p>
            </div>
          </div>
        </div>
      )}
      {/* ========== END SECTION 3: KEYWORDS & BACKLINKS ========== */}

      {/* ========== SECTION 4: RECOMMENDATIONS & ACTION PLAN ========== */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <span>📈Recommendations</span>
        </h2>
        <p className="text-gray-600 mb-6">Priority-based improvements and strategic guidance</p>
      </div>
      </div>



      {/* 4.2 Competitor Analysis */}
      {report.competitor_analysis && Object.keys(report.competitor_analysis).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="competitor-analysis-section">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>Competitive Landscape</span>
          </h3>

          {report.competitor_analysis.assumed_competitors && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">Likely Competitors</p>
              <div className="flex flex-wrap gap-2">
                {report.competitor_analysis.assumed_competitors.map((competitor, index) => (
                  <span key={index} className="px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full font-medium">
                    {competitor}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {report.competitor_analysis.content_gaps && report.competitor_analysis.content_gaps.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Content Gaps</p>
                <ul className="space-y-2">
                  {report.competitor_analysis.content_gaps.map((gap, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <span className="text-red-500 mt-1">•</span>
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        
            {report.competitor_analysis.opportunities && report.competitor_analysis.opportunities.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-3">Opportunities</p>
                <ul className="space-y-2">
                  {report.competitor_analysis.opportunities.map((opp, index) => (
                    <li key={index} className="flex items-start space-x-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

          {/* 4.3 Content Recommendations - COLLAPSIBLE */}
{report.content_recommendations && report.content_recommendations.length > 0 && (
  <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="content-recommendations-section">
    <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
      <FileText className="w-6 h-6 text-indigo-600" />
      <span>Content Recommendations</span>
    </h3>
    <div className="space-y-3">
      {report.content_recommendations.map((rec, index) => (
        <div 
          key={index} 
          className={`accordion-item border rounded-lg overflow-hidden ${
            expandedSection === `content-${index}` ? 'expanded border-indigo-500' : 'border-gray-200'
          }`}
        >
          {/* CLICKABLE HEADER */}
          <button
            onClick={() => setExpandedSection(expandedSection === `content-${index}` ? null : `content-${index}`)}
            className="accordion-button w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                {rec.page_type}
              </span>
              <h4 className="text-lg font-bold text-gray-900">{rec.topic}</h4>
            </div>
            <div className={`accordion-icon text-gray-400 text-2xl ${expandedSection === `content-${index}` ? 'rotated' : ''}`}>
              {expandedSection === `content-${index}` ? '−' : '+'}
            </div>
          </button>

          {/* COLLAPSIBLE DETAILS */}
          <div className={`accordion-content ${expandedSection === `content-${index}` ? 'expanded' : ''}`}>
            {expandedSection === `content-${index}` && (
              <div className="accordion-details px-4 pb-4">
                <div className="bg-gray-50 p-4 rounded-lg border-t border-gray-200">
                  {/* KEYWORDS */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">🎯 Target Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.target_keywords.map((kw, kwIndex) => (
                        <span key={kwIndex} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-300">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* STRUCTURE */}
                  {rec.structure && (
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-3">📝 Suggested Structure</p>
                      <div className="bg-white p-4 rounded-lg space-y-3 border border-gray-200">
                        {rec.structure.h1 && rec.structure.h1.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">H1</p>
                            {rec.structure.h1.map((h, hIndex) => (
                              <p key={hIndex} className="text-gray-900 font-semibold">{h}</p>
                            ))}
                          </div>
                        )}
                        {rec.structure.h2 && rec.structure.h2.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">H2</p>
                            {rec.structure.h2.map((h, hIndex) => (
                              <p key={hIndex} className="text-gray-800 pl-4">{h}</p>
                            ))}
                          </div>
                        )}
                        {rec.structure.h3 && rec.structure.h3.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 font-medium mb-1">H3</p>
                            {rec.structure.h3.map((h, hIndex) => (
                              <p key={hIndex} className="text-gray-700 pl-8 text-sm">{h}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}


      {/* ========== SECTION 5: ADVANCED ANALYTICS ========== */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-2">
          <TrendingUp className="w-8 h-8 text-indigo-600" />
          <span>📊Advanced Analytics</span>
        </h2>
        <p className="text-gray-600 mb-6">Deep content analysis: readability, keywords, and performance metrics</p>
      </div>

      {/* 5.1 Readability Analysis */}
      {report.readability_analysis && Object.keys(report.readability_analysis).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="readability-section">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>📖 Readability Analysis</span>
          </h3>

          {/* Main Metrics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Flesch Reading Ease */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Flesch Reading Ease</p>
              <p className="text-3xl font-bold text-blue-900">
                {report.readability_analysis.flesch_reading_ease || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Target: 60-70 (Standard)</p>
            </div>

            {/* Grade Level */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Reading Grade</p>
              <p className="text-lg font-bold text-purple-900">
                {report.readability_analysis.readability_grade || 'N/A'}
              </p>
            </div>

            {/* Reading Time */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Reading Time</p>
              <p className="text-3xl font-bold text-green-900">
                {report.readability_analysis.reading_time_minutes || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">minutes</p>
            </div>

            {/* Difficulty Level */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-5 rounded-lg border-l-4 border-yellow-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Difficulty</p>
              <p className="text-2xl font-bold text-yellow-900 capitalize">
                {report.readability_analysis.difficulty_level || 'N/A'}
              </p>
            </div>
          </div>

          {/* Readability Score Interpretation */}
          <div className={`p-4 rounded-lg border-l-4 ${
            (report.readability_analysis.flesch_reading_ease || 0) >= 60 && 
            (report.readability_analysis.flesch_reading_ease || 0) <= 70
              ? 'bg-green-50 border-green-500'
              : (report.readability_analysis.flesch_reading_ease || 0) >= 50
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-red-50 border-red-500'
          }`}>
            <p className="text-sm font-semibold text-gray-800 mb-2">
              {(report.readability_analysis.flesch_reading_ease || 0) >= 60 && 
               (report.readability_analysis.flesch_reading_ease || 0) <= 70
                ? '✅ Optimal Readability'
                : (report.readability_analysis.flesch_reading_ease || 0) >= 50
                  ? '⚠️ Moderate Readability'
                  : '❌ Difficult to Read'}
            </p>
            <p className="text-xs text-gray-700">
              {(report.readability_analysis.flesch_reading_ease || 0) >= 60
                ? 'Content is easy to read and understand for general audience'
                : 'Consider simplifying sentences and using shorter words for better readability'}
            </p>
          </div>
        </div>
      )}

      {/* 5.2 Keyword Density Analysis */}
      {report.keyword_density_analysis && Object.keys(report.keyword_density_analysis).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="keyword-density-section">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <Target className="w-6 h-6 text-indigo-600" />
            <span>🔍 Keyword Density Analysis</span>
          </h3>

          {/* Summary Metrics */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-indigo-500">
              <p className="text-sm text-gray-600 mb-1">Total Words</p>
              <p className="text-2xl font-bold text-gray-900">
                {(report.keyword_density_analysis.total_words || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 mb-1">Unique Words</p>
              <p className="text-2xl font-bold text-gray-900">
                {(report.keyword_density_analysis.unique_words || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Lexical Diversity</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.keyword_density_analysis.lexical_diversity || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {report.keyword_density_analysis.lexical_diversity_grade || 'N/A'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-sm text-gray-600 mb-1">Stuffing Risk</p>
              <p className={`text-lg font-bold ${
                report.keyword_density_analysis.keyword_stuffing_risk ? 'text-red-700' : 'text-green-700'
              }`}>
                {report.keyword_density_analysis.keyword_stuffing_risk ? '⚠️ YES' : '✅ NO'}
              </p>
            </div>
          </div>

          {/* Top Keywords Table */}
          {Array.isArray(report.keyword_density_analysis.top_keywords) && 
           report.keyword_density_analysis.top_keywords.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Top Keywords</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Keyword</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Count</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Density</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">In Title</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">In Meta</th>
                      <th className="text-left p-3 text-sm font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.keyword_density_analysis.top_keywords.slice(0, 10).map((kw, idx) => (
                      <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium text-gray-900">{kw.keyword}</td>
                        <td className="p-3 text-sm text-gray-700">{kw.count}</td>
                        <td className="p-3 text-sm text-gray-700">{kw.density_percent}%</td>
                        <td className="p-3 text-sm">
                          {kw.in_title ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {kw.in_meta_description ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            kw.status === '✅ Good' ? 'bg-green-100 text-green-800' :
                            kw.status === '⚠️ Overused' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {kw.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Top Phrases */}
          {Array.isArray(report.keyword_density_analysis.top_phrases) && 
           report.keyword_density_analysis.top_phrases.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Top 2-Word Phrases</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {report.keyword_density_analysis.top_phrases.slice(0, 8).map((phrase, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="font-medium text-gray-900">"{phrase.phrase}"</p>
                    <p className="text-sm text-gray-600">
                      {phrase.count} times • {phrase.density_percent}% density
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {Array.isArray(report.keyword_density_analysis.recommendations) && 
           report.keyword_density_analysis.recommendations.length > 0 && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
              <p className="text-sm font-semibold text-indigo-900 mb-2">📋 Recommendations:</p>
              <ul className="space-y-1">
                {report.keyword_density_analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-indigo-800 flex items-start space-x-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 5.3 Page Speed & Performance */}
      {report.page_speed_analysis && Object.keys(report.page_speed_analysis).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="page-speed-section">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <span>⚡ Page Speed & Performance</span>
          </h3>

          {/* Performance Score - Highlighted */}
          <div className={`p-6 rounded-xl mb-6 border-2 ${
            (report.page_speed_analysis.performance_score || 0) >= 80
              ? 'bg-green-50 border-green-500'
              : (report.page_speed_analysis.performance_score || 0) >= 60
                ? 'bg-yellow-50 border-yellow-500'
                : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Overall Performance Score</p>
                <p className="text-4xl font-bold text-gray-900">
                  {report.page_speed_analysis.performance_score || 0}/100
                </p>
                <p className="text-lg font-semibold text-gray-700 mt-1">
                  {report.page_speed_analysis.performance_grade || 'N/A'}
                </p>
              </div>
              <div className="text-6xl">
                {(report.page_speed_analysis.performance_score || 0) >= 80 ? '🚀' :
                 (report.page_speed_analysis.performance_score || 0) >= 60 ? '⚡' : '🐌'}
              </div>
            </div>
          </div>

          {/* Timing Metrics */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Load Time</p>
              <p className="text-3xl font-bold text-blue-900">
                {report.page_speed_analysis.total_load_time_seconds || 0}s
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {report.page_speed_analysis.load_time_grade || 'Target: <2s'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Page Size</p>
              <p className="text-3xl font-bold text-purple-900">
                {report.page_speed_analysis.page_size_mb || 0}MB
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {report.page_speed_analysis.size_grade || 'Target: <3MB'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
              <p className="text-sm text-gray-700 mb-1 font-medium">Total Resources</p>
              <p className="text-3xl font-bold text-green-900">
                {report.page_speed_analysis.total_resources || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">JS, CSS, Images</p>
            </div>
          </div>

          {/* Resource Breakdown */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">JavaScript Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.page_speed_analysis.external_scripts_count || 0}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">CSS Files</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.page_speed_analysis.external_css_count || 0}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Images</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.page_speed_analysis.images_count || 0}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Blocking Scripts</p>
              <p className={`text-2xl font-bold ${
                (report.page_speed_analysis.render_blocking_scripts || 0) > 3 ? 'text-red-700' : 'text-green-700'
              }`}>
                {report.page_speed_analysis.render_blocking_scripts || 0}
              </p>
            </div>
          </div>

          {/* Optimization Status */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-l-4 ${
              report.page_speed_analysis.compression_enabled
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <p className="text-sm text-gray-700 mb-1 font-medium">Text Compression</p>
              <div className="flex items-center space-x-2">
                {report.page_speed_analysis.compression_enabled ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">✅ Enabled</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-700">❌ Disabled</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {report.page_speed_analysis.compression_type || 'None'}
              </p>
            </div>

            <div className={`p-4 rounded-lg border-l-4 ${
              report.page_speed_analysis.caching_enabled
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <p className="text-sm text-gray-700 mb-1 font-medium">Browser Caching</p>
              <div className="flex items-center space-x-2">
                {report.page_speed_analysis.caching_enabled ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">✅ Configured</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-700">❌ Not Set</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Performance Issues */}
          {Array.isArray(report.page_speed_analysis.issues) && 
           report.page_speed_analysis.issues.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
              <p className="text-sm font-semibold text-red-900 mb-2">⚠️ Performance Issues:</p>
              <ul className="space-y-1">
                {report.page_speed_analysis.issues.map((issue, idx) => (
                  <li key={idx} className="text-sm text-red-800 flex items-start space-x-2">
                    <span>•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {Array.isArray(report.page_speed_analysis.recommendations) && 
           report.page_speed_analysis.recommendations.length > 0 && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
              <p className="text-sm font-semibold text-indigo-900 mb-2">🚀 Speed Recommendations:</p>
              <ul className="space-y-1">
                {report.page_speed_analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-indigo-800 flex items-start space-x-2">
                    <span>•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ========== END SECTION 5: ADVANCED ANALYTICS ========== */}

      {/* ========== RESPONSIVE DEVICE PREVIEW ========== */}

      {report.responsive_preview &&
      Object.keys(report.responsive_preview).length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <ResponsivePreview screenshots={report.responsive_preview} />
          </div>
          )}



      {/* 4.4 30-Day Action Plan */}
      {report.action_plan_30_days && report.action_plan_30_days.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8" data-testid="action-plan-section">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2 mb-6">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>Action Plan</span>
          </h3>
          <div className="space-y-4">
            {report.action_plan_30_days.map((item, index) => (
              <div key={index} className="border-l-4 border-indigo-600 bg-gradient-to-r from-indigo-50 to-white p-6 rounded-r-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-lg font-bold text-gray-900">{item.week || `Week ${index + 1}`}</h4>
                  {item.priority && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                      {item.priority} Priority
                    </span>
                  )}
                </div>
                <p className="text-gray-800 mb-2 leading-relaxed">{item.action}</p>
                {item.expected_impact && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Expected Impact:</span> {item.expected_impact}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ========== END SECTION 4: RECOMMENDATIONS & ACTION PLAN ========== */}




    </div>
  </div>

  );
};  

export default ReportPage;