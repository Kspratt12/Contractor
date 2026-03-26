"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { Template } from "@/lib/types";
import { getTemplates, saveTemplate, deleteTemplate, generateId } from "@/lib/storage";

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", jobType: "", projectSize: "", materials: "", notes: "", optionalAddons: "" });

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleSave = () => {
    const template: Template = {
      id: generateId(),
      ...form,
      createdAt: new Date().toISOString(),
    };
    saveTemplate(template);
    setTemplates(getTemplates());
    setForm({ name: "", jobType: "", projectSize: "", materials: "", notes: "", optionalAddons: "" });
    setShowAdd(false);
  };

  const handleUse = (template: Template) => {
    const params = new URLSearchParams({
      templateId: template.id,
      jobType: template.jobType,
      projectSize: template.projectSize,
      materials: template.materials,
      notes: template.notes,
      optionalAddons: template.optionalAddons,
    });
    router.push(`/generate?${params.toString()}`);
  };

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    setTemplates(getTemplates());
  };

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Templates</h1>
            <p className="text-sm text-slate-500 mt-1">Save your common job types for faster proposals</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer">
            + New Template
          </button>
        </div>

        {showAdd && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">New Template</h3>
            <div className="space-y-3 mb-4">
              <input type="text" placeholder="Template Name (e.g. 'Roof Replacement - Architectural Shingles') *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Job Type *" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" placeholder="Default Project Size" value={form.projectSize} onChange={(e) => setForm({ ...form, projectSize: e.target.value })} className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <textarea placeholder="Default Materials (comma separated)" value={form.materials} onChange={(e) => setForm({ ...form, materials: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <textarea placeholder="Default Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <textarea placeholder="Default Add-Ons (comma separated)" value={form.optionalAddons} onChange={(e) => setForm({ ...form, optionalAddons: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={!form.name || !form.jobType} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-lg cursor-pointer">Save Template</button>
              <button onClick={() => setShowAdd(false)} className="px-5 py-2 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-lg border border-slate-200 cursor-pointer">Cancel</button>
            </div>
          </div>
        )}

        {templates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            </div>
            <h3 className="font-semibold text-slate-700 mb-2">No templates yet</h3>
            <p className="text-sm text-slate-500">Save your common job types to generate proposals faster.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-900 mb-1">{t.name}</h3>
                <p className="text-sm text-slate-500 mb-3">{t.jobType} &middot; {t.projectSize || "Any size"}</p>
                {t.materials && <p className="text-xs text-slate-400 mb-3 truncate">Materials: {t.materials}</p>}
                <div className="flex gap-2">
                  <button onClick={() => handleUse(t)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg cursor-pointer">Use Template</button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 text-slate-400 hover:text-red-500 cursor-pointer">
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
