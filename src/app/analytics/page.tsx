"use client";

import { useState, useEffect } from "react";
import AppShell from "@/components/AppShell";
import { Analytics } from "@/lib/types";
import { getAnalytics } from "@/lib/storage";

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  viewed: "Viewed",
  signed: "Signed",
  invoiced: "Invoiced",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-200",
  sent: "bg-blue-400",
  viewed: "bg-amber-400",
  signed: "bg-green-400",
  invoiced: "bg-purple-400",
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    setAnalytics(getAnalytics());
  }, []);

  if (!analytics) return <AppShell><div className="p-8"><p className="text-slate-500">Loading...</p></div></AppShell>;

  const maxPipelineValue = Math.max(...analytics.pipeline.map((p) => p.value), 1);
  const maxJobTypeCount = Math.max(...analytics.byJobType.map((j) => j.count), 1);

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Analytics</h1>
        <p className="text-sm text-slate-500 mb-8">Track your proposal performance and revenue</p>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Total Proposals</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{analytics.totalProposals}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Close Rate</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{analytics.closeRate.toFixed(0)}%</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Avg Days to Close</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{analytics.avgDaysToClose.toFixed(1)}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">${analytics.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pipeline */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Revenue Pipeline</h3>
            {analytics.pipeline.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet. Create some proposals to see your pipeline.</p>
            ) : (
              <div className="space-y-3">
                {analytics.pipeline.map((p) => (
                  <div key={p.status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{STATUS_LABELS[p.status] || p.status} ({p.count})</span>
                      <span className="font-medium text-slate-900">${p.value.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${STATUS_COLORS[p.status] || "bg-slate-300"}`}
                        style={{ width: `${(p.value / maxPipelineValue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Job Type */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Performance by Job Type</h3>
            {analytics.byJobType.length === 0 ? (
              <p className="text-sm text-slate-400">No data yet.</p>
            ) : (
              <div className="space-y-4">
                {analytics.byJobType.map((j) => (
                  <div key={j.jobType}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-slate-900">{j.jobType}</span>
                      <span className="text-slate-500">{j.closed}/{j.count} closed ({j.count > 0 ? ((j.closed / j.count) * 100).toFixed(0) : 0}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div className="h-2.5 rounded-full bg-blue-500" style={{ width: `${(j.count / maxJobTypeCount) * 100}%` }} />
                    </div>
                    {j.revenue > 0 && <p className="text-xs text-slate-400 mt-0.5">Revenue: ${j.revenue.toLocaleString()}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Monthly Breakdown</h3>
          {analytics.byMonth.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 pr-4 text-slate-500 font-medium">Month</th>
                    <th className="text-right py-2 px-4 text-slate-500 font-medium">Proposals</th>
                    <th className="text-right py-2 px-4 text-slate-500 font-medium">Signed</th>
                    <th className="text-right py-2 px-4 text-slate-500 font-medium">Close Rate</th>
                    <th className="text-right py-2 pl-4 text-slate-500 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.byMonth.map((m) => (
                    <tr key={m.month} className="border-b border-slate-50">
                      <td className="py-2.5 pr-4 font-medium text-slate-900">{m.month}</td>
                      <td className="py-2.5 px-4 text-right text-slate-700">{m.proposals}</td>
                      <td className="py-2.5 px-4 text-right text-green-600 font-medium">{m.signed}</td>
                      <td className="py-2.5 px-4 text-right text-slate-700">{m.proposals > 0 ? ((m.signed / m.proposals) * 100).toFixed(0) : 0}%</td>
                      <td className="py-2.5 pl-4 text-right font-medium text-slate-900">${m.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
