"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Customer } from "@/lib/types";
import { getCustomers, saveCustomer, deleteCustomer, generateId, getProposals } from "@/lib/storage";

const TAG_COLORS: Record<string, string> = {
  lead: "bg-blue-100 text-blue-700",
  quoted: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  "past client": "bg-slate-100 text-slate-600",
  vip: "bg-purple-100 text-purple-700",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", tags: "lead", notes: "" });

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const filtered = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesTag = tagFilter === "all" || c.tags.includes(tagFilter);
    return matchesSearch && matchesTag;
  });

  const proposals = getProposals();

  const handleAdd = () => {
    const customer: Customer = {
      id: generateId(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      tags: [form.tags],
      notes: form.notes,
      createdAt: new Date().toISOString(),
      proposalIds: [],
    };
    saveCustomer(customer);
    setCustomers(getCustomers());
    setForm({ name: "", email: "", phone: "", address: "", tags: "lead", notes: "" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    deleteCustomer(id);
    setCustomers(getCustomers());
  };

  const getProposalCount = (customerId: string) => {
    return proposals.filter((p) => p.customerId === customerId).length;
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
            <p className="text-sm text-slate-500 mt-1">{customers.length} total customers</p>
          </div>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            + Add Customer
          </button>
        </div>

        {/* Add Customer Form */}
        {showAdd && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">New Customer</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Full Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="tel" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="lead">Lead</option>
                <option value="quoted">Quoted</option>
                <option value="active">Active</option>
                <option value="past client">Past Client</option>
                <option value="vip">VIP</option>
              </select>
              <input type="text" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={!form.name} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">Save Customer</button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg border border-slate-200 cursor-pointer">Cancel</button>
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 overflow-x-auto">
            {["all", "lead", "quoted", "active", "past client", "vip"].map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer ${
                  tagFilter === tag ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {tag === "all" ? "All" : tag.charAt(0).toUpperCase() + tag.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Customer List */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-slate-500">No customers found. Add your first customer above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((customer) => (
              <div key={customer.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link href={`/customers/${customer.id}`} className="font-semibold text-slate-900 hover:text-blue-600 truncate">
                      {customer.name}
                    </Link>
                    {customer.tags.map((tag) => (
                      <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${TAG_COLORS[tag] || "bg-slate-100 text-slate-600"}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">
                    {[customer.email, customer.phone, customer.address].filter(Boolean).join(" \u00B7 ")}
                    {getProposalCount(customer.id) > 0 && ` \u00B7 ${getProposalCount(customer.id)} proposal${getProposalCount(customer.id) > 1 ? "s" : ""}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/customers/${customer.id}`} className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200">
                    View
                  </Link>
                  <button onClick={() => handleDelete(customer.id)} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
