"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Customer, Proposal } from "@/lib/types";
import { getCustomer, saveCustomer, getProposals } from "@/lib/storage";

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", notes: "" });

  useEffect(() => {
    const c = getCustomer(id);
    if (c) {
      setCustomer(c);
      setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, notes: c.notes });
      const allProposals = getProposals();
      setProposals(allProposals.filter((p) => p.customerId === id));
    }
  }, [id]);

  const handleSave = () => {
    if (!customer) return;
    const updated = { ...customer, ...form };
    saveCustomer(updated);
    setCustomer(updated);
    setEditing(false);
  };

  const handleTagToggle = (tag: string) => {
    if (!customer) return;
    const tags = customer.tags.includes(tag)
      ? customer.tags.filter((t) => t !== tag)
      : [...customer.tags, tag];
    const updated = { ...customer, tags };
    saveCustomer(updated);
    setCustomer(updated);
  };

  if (!customer) {
    return (
      <AppShell>
        <div className="p-8 text-center">
          <p className="text-slate-500">Customer not found.</p>
          <Link href="/customers" className="text-blue-600 text-sm mt-2 inline-block">Back to Customers</Link>
        </div>
      </AppShell>
    );
  }

  const totalValue = proposals.reduce((sum, p) => {
    const match = p.proposalText.match(/Total Estimated Cost:\s*\$?([\d,]+)/i);
    return sum + (match ? parseInt(match[1].replace(/,/g, ""), 10) : 0);
  }, 0);

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <Link href="/customers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back to Customers
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{customer.name}</h1>
              <p className="text-sm text-slate-500 mt-1">
                Customer since {new Date(customer.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={() => setEditing(!editing)} className="px-4 py-2 text-sm font-medium bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 cursor-pointer">
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Address" className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Notes" rows={2} className="sm:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg cursor-pointer">Save</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-slate-400">Email:</span> <span className="text-slate-700">{customer.email || "—"}</span></div>
              <div><span className="text-slate-400">Phone:</span> <span className="text-slate-700">{customer.phone || "—"}</span></div>
              <div><span className="text-slate-400">Address:</span> <span className="text-slate-700">{customer.address || "—"}</span></div>
              <div><span className="text-slate-400">Notes:</span> <span className="text-slate-700">{customer.notes || "—"}</span></div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
            {["lead", "quoted", "active", "past client", "vip"].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                  customer.tags.includes(tag) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{proposals.length}</p>
            <p className="text-xs text-slate-500">Proposals</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{proposals.filter((p) => p.status === "signed" || p.status === "invoiced").length}</p>
            <p className="text-xs text-slate-500">Signed</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">${totalValue.toLocaleString()}</p>
            <p className="text-xs text-slate-500">Total Value</p>
          </div>
        </div>

        {/* Proposals */}
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Proposals</h2>
        {proposals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <p className="text-slate-500 mb-3">No proposals yet for this customer.</p>
            <Link href="/generate" className="text-blue-600 font-medium text-sm">Create Proposal</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {proposals.map((p) => (
              <Link key={p.id} href={`/proposal/${p.id}`} className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{p.jobType}</p>
                    <p className="text-xs text-slate-500">{p.projectSize} &middot; {new Date(p.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    p.status === "signed" ? "bg-green-100 text-green-700" :
                    p.status === "sent" ? "bg-blue-100 text-blue-700" :
                    p.status === "invoiced" ? "bg-purple-100 text-purple-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {p.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
