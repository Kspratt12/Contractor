"use client";

import { useState, useRef } from "react";
import jsPDF from "jspdf";

interface ProposalSection {
  title: string;
  content: string;
}

function parseProposal(text: string): ProposalSection[] {
  const sectionHeaders = [
    "Project Summary",
    "Scope of Work",
    "Materials and Labor",
    "Total Estimated Cost",
    "Timeline",
    "Optional Add-Ons",
  ];

  const sections: ProposalSection[] = [];

  for (let i = 0; i < sectionHeaders.length; i++) {
    const header = sectionHeaders[i];
    const nextHeader = sectionHeaders[i + 1];

    const startPattern = new RegExp(`${header}:\\s*\\n?`, "i");
    const startMatch = text.match(startPattern);

    if (startMatch && startMatch.index !== undefined) {
      const contentStart = startMatch.index + startMatch[0].length;
      let contentEnd = text.length;

      if (nextHeader) {
        const endPattern = new RegExp(`\\n${nextHeader}:`, "i");
        const endMatch = text.slice(contentStart).match(endPattern);
        if (endMatch && endMatch.index !== undefined) {
          contentEnd = contentStart + endMatch.index;
        }
      }

      sections.push({
        title: header,
        content: text.slice(contentStart, contentEnd).trim(),
      });
    }
  }

  return sections;
}

export default function Home() {
  const [form, setForm] = useState({
    customerName: "",
    jobType: "",
    projectSize: "",
    materials: "",
    notes: "",
    optionalAddons: "",
  });
  const [proposal, setProposal] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.customerName || !form.jobType || !form.projectSize) return;

    setLoading(true);
    setProposal("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setProposal(data.proposal);

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setProposal("Error generating proposal. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const sections = parseProposal(proposal);
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ProposalFlow", margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Prepared for: ${form.customerName}`, margin, y);
    y += 5;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 3;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.setTextColor(30, 30, 30);

    for (const section of sections) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(section.title, margin, y);
      y += 7;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(section.content, maxWidth);
      for (const line of lines) {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(line, margin, y);
        y += 5;
      }

      y += 8;
    }

    doc.save(`proposal-${form.customerName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  const sections = proposal ? parseProposal(proposal) : [];
  const isFormValid = form.customerName && form.jobType && form.projectSize;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">ProposalFlow</h1>
              <p className="text-sm text-slate-500">AI-Powered Contractor Proposals</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 h-fit">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">
              Project Details
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  placeholder="Kitchen Renovation, Deck Build, Bathroom Remodel..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project Size <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="projectSize"
                  value={form.projectSize}
                  onChange={handleChange}
                  placeholder="Small, Medium, Large, 500 sq ft, etc."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Materials
                </label>
                <textarea
                  name="materials"
                  value={form.materials}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Hardwood flooring, granite countertops, stainless steel fixtures..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any special requirements, access details, or preferences..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Optional Add-Ons
                </label>
                <textarea
                  name="optionalAddons"
                  value={form.optionalAddons}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Extended warranty, premium finish upgrade, expedited timeline..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !isFormValid}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-lg cursor-pointer"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating Proposal...
                  </span>
                ) : (
                  "Generate Proposal"
                )}
              </button>
            </div>
          </div>

          {/* Right Side - Output */}
          <div ref={outputRef}>
            {!proposal && !loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Your Proposal Will Appear Here
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Fill in the project details and click &quot;Generate Proposal&quot; to create a professional contractor proposal.
                </p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                  Generating Your Proposal...
                </h3>
                <p className="text-slate-500">This will only take a moment.</p>
              </div>
            )}

            {proposal && !loading && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Generated Proposal
                    </h2>
                    <span className="text-xs text-slate-400">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {sections.map((section, i) => (
                      <div key={i}>
                        <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                          {section.title}
                        </h3>
                        <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                          {section.content}
                        </div>
                        {i < sections.length - 1 && (
                          <hr className="mt-6 border-slate-100" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-3.5 px-6 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Text
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
