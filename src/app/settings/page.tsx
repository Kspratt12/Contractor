"use client";

import { useState, useEffect, useRef } from "react";
import AppShell from "@/components/AppShell";
import { CrewMember, BrandSettings } from "@/lib/types";
import { getCrew, saveCrewMember, deleteCrewMember, getBrandSettings, saveBrandSettings, generateId } from "@/lib/storage";

const CREW_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

export default function SettingsPage() {
  const [tab, setTab] = useState<"brand" | "crew" | "payments">("brand");
  const [brand, setBrand] = useState<BrandSettings>(getBrandSettings());
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [showAddCrew, setShowAddCrew] = useState(false);
  const [crewForm, setCrewForm] = useState({ name: "", role: "crew" as CrewMember["role"], email: "", phone: "" });
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCrew(getCrew());
    setBrand(getBrandSettings());
  }, []);

  const handleSaveBrand = () => {
    saveBrandSettings(brand);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBrand({ ...brand, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleAddCrew = () => {
    const member: CrewMember = {
      id: generateId(),
      ...crewForm,
      color: CREW_COLORS[crew.length % CREW_COLORS.length],
    };
    saveCrewMember(member);
    setCrew(getCrew());
    setCrewForm({ name: "", role: "crew", email: "", phone: "" });
    setShowAddCrew(false);
  };

  const handleDeleteCrew = (id: string) => {
    deleteCrewMember(id);
    setCrew(getCrew());
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Settings</h1>
        <p className="text-sm text-slate-500 mb-8">Manage your brand, team, and payment settings</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["brand", "crew", "payments"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer ${tab === t ? "bg-blue-600 text-white" : "bg-white text-slate-600 border border-slate-200"}`}>
              {t === "brand" ? "Branding" : t === "crew" ? "Team / Crew" : "Payments"}
            </button>
          ))}
        </div>

        {/* Brand Settings */}
        {tab === "brand" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Company Branding</h3>
            <p className="text-sm text-slate-500 mb-6">This information appears on your proposals, invoices, and customer-facing pages.</p>

            <div className="space-y-4">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Company Logo</label>
                <div className="flex items-center gap-4">
                  {brand.logo ? (
                    <div className="w-20 h-20 rounded-xl border border-slate-200 overflow-hidden bg-white flex items-center justify-center p-2">
                      <img src={brand.logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <button onClick={() => logoInputRef.current?.click()} className="px-4 py-2 text-sm font-medium bg-white hover:bg-slate-50 text-slate-600 rounded-lg border border-slate-200 cursor-pointer">Upload Logo</button>
                    <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                    {brand.logo && <button onClick={() => setBrand({ ...brand, logo: undefined })} className="ml-2 text-xs text-red-500 hover:text-red-600 cursor-pointer">Remove</button>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input type="text" value={brand.companyName} onChange={(e) => setBrand({ ...brand, companyName: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">License Number</label>
                  <input type="text" value={brand.licenseNumber} onChange={(e) => setBrand({ ...brand, licenseNumber: e.target.value })} placeholder="#123456" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="tel" value={brand.phone} onChange={(e) => setBrand({ ...brand, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={brand.email} onChange={(e) => setBrand({ ...brand, email: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" value={brand.address} onChange={(e) => setBrand({ ...brand, address: e.target.value })} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                  <input type="url" value={brand.website} onChange={(e) => setBrand({ ...brand, website: e.target.value })} placeholder="https://" className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand.primaryColor} onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                    <input type="text" value={brand.primaryColor} onChange={(e) => setBrand({ ...brand, primaryColor: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={brand.accentColor} onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                    <input type="text" value={brand.accentColor} onChange={(e) => setBrand({ ...brand, accentColor: e.target.value })} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 font-mono" />
                  </div>
                </div>
              </div>

              <button onClick={handleSaveBrand} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
                {saved ? "Saved!" : "Save Branding"}
              </button>
            </div>
          </div>
        )}

        {/* Crew */}
        {tab === "crew" && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Team Members</h3>
                <button onClick={() => setShowAddCrew(!showAddCrew)} className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer">+ Add Member</button>
              </div>

              {showAddCrew && (
                <div className="border border-slate-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <input type="text" placeholder="Name *" value={crewForm.name} onChange={(e) => setCrewForm({ ...crewForm, name: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <select value={crewForm.role} onChange={(e) => setCrewForm({ ...crewForm, role: e.target.value as CrewMember["role"] })} className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="owner">Owner</option>
                      <option value="manager">Manager</option>
                      <option value="foreman">Foreman</option>
                      <option value="crew">Crew</option>
                    </select>
                    <input type="email" placeholder="Email" value={crewForm.email} onChange={(e) => setCrewForm({ ...crewForm, email: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="tel" placeholder="Phone" value={crewForm.phone} onChange={(e) => setCrewForm({ ...crewForm, phone: e.target.value })} className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleAddCrew} disabled={!crewForm.name} className="px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg disabled:bg-slate-300 cursor-pointer">Add</button>
                    <button onClick={() => setShowAddCrew(false)} className="px-4 py-1.5 text-slate-500 text-sm rounded-lg border border-slate-200 cursor-pointer">Cancel</button>
                  </div>
                </div>
              )}

              {crew.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-6">No team members added yet.</p>
              ) : (
                <div className="space-y-2">
                  {crew.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m.color }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{m.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{m.role}{m.email ? ` \u00B7 ${m.email}` : ""}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteCrew(m.id)} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payments */}
        {tab === "payments" && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Payment Processing</h3>
            <p className="text-sm text-slate-500 mb-6">Accept deposits and payments from customers online.</p>

            <div className="border border-slate-200 rounded-xl p-6 text-center bg-slate-50">
              <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="font-semibold text-slate-900 mb-1">Connect Stripe</h4>
              <p className="text-sm text-slate-500 mb-4">Accept credit card payments, deposits, and final payments directly from your invoices.</p>
              <button className="px-6 py-2.5 bg-[#635bff] hover:bg-[#5851db] text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
                Connect with Stripe
              </button>
              <p className="text-xs text-slate-400 mt-3">You&apos;ll be redirected to Stripe to complete setup.</p>
            </div>

            <div className="mt-6 space-y-3">
              <h4 className="font-medium text-slate-700 text-sm">Manual Payment Recording</h4>
              <p className="text-sm text-slate-500">You can always record cash, check, and other payments manually on any invoice — no Stripe required.</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
