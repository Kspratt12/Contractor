"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Proposal } from "@/lib/types";
import { getProposals, deleteProposal, saveProposal } from "@/lib/storage";

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  viewed: { label: "Viewed", color: "bg-amber-100 text-amber-700" },
  signed: { label: "Signed", color: "bg-green-100 text-green-700" },
  invoiced: { label: "Invoiced", color: "bg-purple-100 text-purple-700" },
};

export default function Dashboard() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string>("");

  useEffect(() => {
    setProposals(getProposals());
  }, []);

  const filtered =
    filter === "all" ? proposals : proposals.filter((p) => p.status === filter);

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "draft").length,
    sent: proposals.filter((p) => p.status === "sent").length,
    signed: proposals.filter((p) => p.status === "signed").length,
    needsFollowUp: proposals.filter((p) => {
      if (p.status !== "sent") return false;
      const sent = new Date(p.sentAt || p.createdAt);
      const now = new Date();
      const daysSince = (now.getTime() - sent.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince >= 2;
    }).length,
  };

  const handleDelete = (id: string) => {
    deleteProposal(id);
    setProposals(getProposals());
  };

  const handleMarkSent = (proposal: Proposal) => {
    const updated = { ...proposal, status: "sent" as const, sentAt: new Date().toISOString() };
    saveProposal(updated);
    setProposals(getProposals());
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/proposal/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const daysSince = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Proposals", value: stats.total, color: "text-slate-900" },
            { label: "Drafts", value: stats.draft, color: "text-slate-600" },
            { label: "Sent / Awaiting", value: stats.sent, color: "text-blue-600" },
            { label: "Signed", value: stats.signed, color: "text-green-600" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color} mt-1`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Follow-up Alert */}
        {stats.needsFollowUp > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-800">
                {stats.needsFollowUp} proposal{stats.needsFollowUp > 1 ? "s" : ""} need follow-up
              </p>
              <p className="text-sm text-amber-700 mt-0.5">
                These proposals were sent 2+ days ago with no response. Consider following up with the customer.
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { key: "all", label: "All" },
            { key: "draft", label: "Drafts" },
            { key: "sent", label: "Sent" },
            { key: "viewed", label: "Viewed" },
            { key: "signed", label: "Signed" },
            { key: "invoiced", label: "Invoiced" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                filter === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Proposal List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No proposals yet</h3>
            <p className="text-slate-500 mb-6">Create your first proposal and start closing more jobs.</p>
            <Link
              href="/generate"
              className="inline-flex px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Create Proposal
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((proposal) => {
              const needsFollowUp =
                proposal.status === "sent" &&
                daysSince(proposal.sentAt || proposal.createdAt) >= 2;

              return (
                <div
                  key={proposal.id}
                  className={`bg-white rounded-xl border p-5 transition-all ${
                    needsFollowUp
                      ? "border-amber-300 shadow-sm shadow-amber-100"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {proposal.customerName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_CONFIG[proposal.status].color
                          }`}
                        >
                          {STATUS_CONFIG[proposal.status].label}
                        </span>
                        {needsFollowUp && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Follow Up
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {proposal.jobType} &middot; {proposal.projectSize} &middot;{" "}
                        {new Date(proposal.createdAt).toLocaleDateString()}
                        {proposal.sentAt && (
                          <span>
                            {" "}&middot; Sent {daysSince(proposal.sentAt)}d ago
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {proposal.status === "draft" && (
                        <button
                          onClick={() => handleMarkSent(proposal)}
                          className="px-3.5 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Mark Sent
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyLink(proposal.id)}
                        className="px-3.5 py-2 text-sm font-medium bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                      >
                        {copiedId === proposal.id ? "Copied!" : "Copy Link"}
                      </button>

                      <Link
                        href={`/proposal/${proposal.id}`}
                        className="px-3.5 py-2 text-sm font-medium bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 transition-colors"
                      >
                        View
                      </Link>

                      {(proposal.status === "signed" && !proposal.invoiceId) && (
                        <Link
                          href={`/invoice/${proposal.id}`}
                          className="px-3.5 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                          Create Invoice
                        </Link>
                      )}

                      {proposal.invoiceId && (
                        <Link
                          href={`/invoice/${proposal.id}`}
                          className="px-3.5 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                        >
                          View Invoice
                        </Link>
                      )}

                      <button
                        onClick={() => handleDelete(proposal.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
