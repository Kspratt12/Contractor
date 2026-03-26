"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { FollowUp } from "@/lib/types";
import { getFollowUps, saveFollowUp, getProposals, generateId, createAutoFollowUp } from "@/lib/storage";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [filter, setFilter] = useState<"pending" | "sent" | "all">("pending");
  const [showCompose, setShowCompose] = useState(false);
  const [composeForm, setComposeForm] = useState({ proposalId: "", message: "" });

  useEffect(() => {
    // Auto-generate follow-ups for sent proposals without one
    const proposals = getProposals();
    const existingFollowUps = getFollowUps();
    const followUpProposalIds = new Set(existingFollowUps.map((f) => f.proposalId));

    for (const p of proposals) {
      if (p.status === "sent" && !followUpProposalIds.has(p.id)) {
        const sentDate = new Date(p.sentAt || p.createdAt);
        const daysSince = (Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince >= 2) {
          createAutoFollowUp(p);
        }
      }
    }

    setFollowUps(getFollowUps());
  }, []);

  const filtered = filter === "all" ? followUps : followUps.filter((f) => f.status === filter);

  const handleMarkSent = (id: string) => {
    const fu = followUps.find((f) => f.id === id);
    if (!fu) return;
    const updated = { ...fu, status: "sent" as const, sentAt: new Date().toISOString() };
    saveFollowUp(updated);
    setFollowUps(getFollowUps());
  };

  const handleCancel = (id: string) => {
    const fu = followUps.find((f) => f.id === id);
    if (!fu) return;
    const updated = { ...fu, status: "cancelled" as const };
    saveFollowUp(updated);
    setFollowUps(getFollowUps());
  };

  const proposals = getProposals().filter((p) => p.status === "sent" || p.status === "viewed");

  const handleCompose = () => {
    const proposal = proposals.find((p) => p.id === composeForm.proposalId);
    if (!proposal) return;
    const fu: FollowUp = {
      id: generateId(),
      proposalId: proposal.id,
      customerId: proposal.customerId,
      customerName: proposal.customerName,
      customerEmail: proposal.customerEmail,
      type: "manual",
      message: composeForm.message,
      scheduledFor: new Date().toISOString(),
      status: "pending",
    };
    saveFollowUp(fu);
    setFollowUps(getFollowUps());
    setShowCompose(false);
    setComposeForm({ proposalId: "", message: "" });
  };

  const pendingCount = followUps.filter((f) => f.status === "pending").length;

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Follow-Ups</h1>
            <p className="text-sm text-slate-500 mt-1">{pendingCount} pending follow-ups</p>
          </div>
          <button onClick={() => setShowCompose(!showCompose)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            + New Follow-Up
          </button>
        </div>

        {showCompose && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Compose Follow-Up</h3>
            <div className="space-y-3 mb-4">
              <select value={composeForm.proposalId} onChange={(e) => {
                const p = proposals.find((pr) => pr.id === e.target.value);
                setComposeForm({
                  proposalId: e.target.value,
                  message: p ? `Hi ${p.customerName.split(" ")[0]}, just checking in on the ${p.jobType} proposal I sent over. Happy to answer any questions or make adjustments. Let me know!` : "",
                });
              }} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select a proposal...</option>
                {proposals.map((p) => (
                  <option key={p.id} value={p.id}>{p.customerName} - {p.jobType}</option>
                ))}
              </select>
              <textarea value={composeForm.message} onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })} rows={4} placeholder="Follow-up message..." className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleCompose} disabled={!composeForm.proposalId || !composeForm.message} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg cursor-pointer">Create Follow-Up</button>
              <button onClick={() => setShowCompose(false)} className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg border border-slate-200 cursor-pointer">Cancel</button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(["pending", "sent", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${filter === f ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {f === "pending" ? `Pending (${followUps.filter((fu) => fu.status === "pending").length})` : f === "sent" ? "Sent" : "All"}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No follow-ups {filter !== "all" ? `with status "${filter}"` : "yet"}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((fu) => (
              <div key={fu.id} className={`bg-white rounded-xl border p-5 ${fu.status === "pending" ? "border-amber-200" : "border-slate-200"}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{fu.customerName}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        fu.status === "pending" ? "bg-amber-100 text-amber-700" :
                        fu.status === "sent" ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {fu.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${fu.type === "auto" ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"}`}>
                        {fu.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{fu.message}</p>
                    <p className="text-xs text-slate-400">
                      {fu.customerEmail && `${fu.customerEmail} \u00B7 `}
                      Scheduled: {new Date(fu.scheduledFor).toLocaleDateString()}
                      {fu.sentAt && ` \u00B7 Sent: ${new Date(fu.sentAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {fu.status === "pending" && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleMarkSent(fu.id)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg cursor-pointer">Mark Sent</button>
                      <button onClick={() => handleCancel(fu.id)} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-500 text-xs font-medium rounded-lg border border-slate-200 cursor-pointer">Cancel</button>
                      <Link href={`/proposal/${fu.proposalId}`} className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-500 text-xs font-medium rounded-lg border border-slate-200">View</Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
