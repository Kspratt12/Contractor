"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import jsPDF from "jspdf";
import { Proposal, Invoice } from "@/lib/types";
import {
  getProposal,
  saveProposal,
  getInvoice,
  saveInvoice,
  extractTotalCost,
  generateId,
} from "@/lib/storage";

export default function InvoicePage() {
  const params = useParams();
  const proposalId = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const p = getProposal(proposalId);
    if (!p) {
      setNotFound(true);
      return;
    }
    setProposal(p);

    // Load existing invoice or create one
    if (p.invoiceId) {
      const existing = getInvoice(p.invoiceId);
      if (existing) {
        setInvoice(existing);
        return;
      }
    }

    // Create new invoice
    const totalAmount = extractTotalCost(p.proposalText);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const newInvoice: Invoice = {
      id: generateId(),
      proposalId: p.id,
      customerName: p.customerName,
      customerEmail: p.customerEmail,
      jobType: p.jobType,
      totalAmount,
      status: "unpaid",
      createdAt: new Date().toISOString(),
      dueDate: dueDate.toISOString(),
      proposalText: p.proposalText,
    };

    saveInvoice(newInvoice);
    const updatedProposal = { ...p, status: "invoiced" as const, invoiceId: newInvoice.id };
    saveProposal(updatedProposal);
    setProposal(updatedProposal);
    setInvoice(newInvoice);
  }, [proposalId]);

  const handleMarkPaid = () => {
    if (!invoice) return;
    const updated = { ...invoice, status: "paid" as const };
    saveInvoice(updated);
    setInvoice(updated);
  };

  const handleDownloadInvoicePDF = () => {
    if (!invoice || !proposal) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let y = 20;

    // INVOICE header
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("INVOICE", margin, y);

    // Invoice number on right
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(`Invoice #: INV-${invoice.id.toUpperCase().slice(0, 8)}`, pageWidth - margin, y, { align: "right" });
    y += 7;
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, pageWidth - margin, y, { align: "right" });
    y += 5;
    doc.text(`Due: ${new Date(invoice.dueDate).toLocaleDateString()}`, pageWidth - margin, y, { align: "right" });
    y += 5;

    // Status
    if (invoice.status === "paid") {
      doc.setTextColor(22, 163, 74);
      doc.setFont("helvetica", "bold");
      doc.text("PAID", pageWidth - margin, y, { align: "right" });
    } else {
      doc.setTextColor(220, 38, 38);
      doc.setFont("helvetica", "bold");
      doc.text("UNPAID", pageWidth - margin, y, { align: "right" });
    }
    y += 3;

    // From
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    y += 5;
    doc.text("ProposalFlow", margin, y);
    y += 10;

    // Bill To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("BILL TO", margin, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    doc.text(proposal.customerName, margin, y);
    y += 5;
    if (proposal.customerEmail) {
      doc.text(proposal.customerEmail, margin, y);
      y += 5;
    }
    y += 5;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Line items header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("Description", margin, y);
    doc.text("Amount", pageWidth - margin, y, { align: "right" });
    y += 3;
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // Line item
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "normal");
    const desc = `${proposal.jobType} - ${proposal.projectSize}`;
    const descLines = doc.splitTextToSize(desc, maxWidth - 40);
    for (const line of descLines) {
      doc.text(line, margin, y);
      y += 5;
    }
    doc.setFont("helvetica", "bold");
    doc.text(`$${invoice.totalAmount.toLocaleString()}`, pageWidth - margin, y - 5, { align: "right" });
    y += 5;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Total Due:", margin, y);
    doc.text(`$${invoice.totalAmount.toLocaleString()}`, pageWidth - margin, y, { align: "right" });
    y += 10;

    // Payment terms
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Payment Terms: 50% deposit upon acceptance, 50% upon completion.", margin, y);
    y += 5;
    doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, margin, y);

    // Signature if signed
    if (proposal.signatureData) {
      y += 15;
      doc.setTextColor(30, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Customer Signature:", margin, y);
      y += 5;
      doc.addImage(proposal.signatureData, "PNG", margin, y, 60, 25);
      y += 28;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Signed by ${proposal.customerName} on ${new Date(proposal.signedAt!).toLocaleDateString()}`,
        margin,
        y
      );
    }

    doc.save(`invoice-${invoice.id.slice(0, 8)}-${proposal.customerName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Proposal Not Found</h2>
          <p className="text-slate-500 mb-6">Cannot create an invoice for a proposal that doesn&apos;t exist.</p>
          <Link href="/dashboard" className="text-blue-600 font-medium hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!invoice || !proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Invoice Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10 mb-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">INVOICE</h1>
              <p className="text-sm text-slate-500">
                #INV-{invoice.id.toUpperCase().slice(0, 8)}
              </p>
            </div>
            <div className="text-left sm:text-right mt-4 sm:mt-0">
              <p className="text-sm text-slate-500">
                Date: {new Date(invoice.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-slate-500">
                Due: {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                  invoice.status === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {invoice.status === "paid" ? "PAID" : "UNPAID"}
              </span>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Bill To</p>
            <p className="text-lg font-semibold text-slate-900">{proposal.customerName}</p>
            {proposal.customerEmail && (
              <p className="text-sm text-slate-500">{proposal.customerEmail}</p>
            )}
          </div>

          {/* Line Items */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-8">
            <div className="bg-slate-50 px-5 py-3 flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <span>Description</span>
              <span>Amount</span>
            </div>
            <div className="px-5 py-4 flex justify-between items-start border-t border-slate-100">
              <div>
                <p className="font-medium text-slate-900">{proposal.jobType}</p>
                <p className="text-sm text-slate-500">{proposal.projectSize}</p>
              </div>
              <p className="font-semibold text-slate-900">
                ${invoice.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-50 px-5 py-4 flex justify-between items-center border-t border-slate-200">
              <span className="text-lg font-bold text-slate-900">Total Due</span>
              <span className="text-2xl font-bold text-slate-900">
                ${invoice.totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Terms */}
          <p className="text-sm text-slate-500 mb-2">
            <span className="font-medium">Payment Terms:</span> 50% deposit upon acceptance, 50% upon completion.
          </p>

          {/* Signature */}
          {proposal.signatureData && (
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Customer Signature
              </p>
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
                  <img src={proposal.signatureData} alt="Signature" className="h-12 w-auto" />
                </div>
                <p className="text-sm text-slate-500">
                  Signed by {proposal.customerName} on{" "}
                  {new Date(proposal.signedAt!).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadInvoicePDF}
            className="flex-1 py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Invoice PDF
          </button>
          {invoice.status === "unpaid" && (
            <button
              onClick={handleMarkPaid}
              className="flex-1 py-3.5 px-6 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Mark as Paid
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
