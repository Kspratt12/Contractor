"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { Proposal } from "@/lib/types";
import { getProposals, saveProposal, getCrew } from "@/lib/storage";

export default function SchedulePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [crew, setCrew] = useState<{ id: string; name: string; color: string }[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [scheduling, setScheduling] = useState<string | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ startDate: "", endDate: "", crew: [] as string[] });

  useEffect(() => {
    const all = getProposals();
    setProposals(all.filter((p) => p.status === "signed" || p.status === "invoiced" || p.scheduledDate));
    setCrew(getCrew().map((c) => ({ id: c.id, name: c.name, color: c.color })));
  }, []);

  const getWeekDates = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDates = getWeekDates();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return proposals.filter((p) => {
      if (!p.scheduledDate) return false;
      const start = p.scheduledDate.split("T")[0];
      const end = p.scheduledEndDate ? p.scheduledEndDate.split("T")[0] : start;
      return dateStr >= start && dateStr <= end;
    });
  };

  const handleSchedule = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;
    const updated = {
      ...proposal,
      scheduledDate: scheduleForm.startDate,
      scheduledEndDate: scheduleForm.endDate || scheduleForm.startDate,
      assignedCrew: scheduleForm.crew,
    };
    saveProposal(updated);
    setProposals(getProposals().filter((p) => p.status === "signed" || p.status === "invoiced" || p.scheduledDate));
    setScheduling(null);
    setScheduleForm({ startDate: "", endDate: "", crew: [] });
  };

  const unscheduled = proposals.filter((p) => !p.scheduledDate);

  return (
    <AppShell>
      <div className="p-4 sm:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
            <p className="text-sm text-slate-500 mt-1">Plan and schedule your jobs</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(weekOffset - 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setWeekOffset(0)} className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">Today</button>
            <button onClick={() => setWeekOffset(weekOffset + 1)} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Calendar */}
          <div className="flex-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-slate-100">
                {weekDates.map((date, i) => {
                  const isToday = date.toDateString() === new Date().toDateString();
                  return (
                    <div key={i} className={`p-3 text-center border-r border-slate-100 last:border-r-0 ${isToday ? "bg-blue-50" : ""}`}>
                      <p className="text-xs text-slate-400">{dayNames[i]}</p>
                      <p className={`text-lg font-semibold ${isToday ? "text-blue-600" : "text-slate-900"}`}>{date.getDate()}</p>
                    </div>
                  );
                })}
              </div>
              <div className="grid grid-cols-7 min-h-[300px]">
                {weekDates.map((date, i) => {
                  const jobs = getJobsForDate(date);
                  return (
                    <div key={i} className="border-r border-slate-100 last:border-r-0 p-1.5 space-y-1">
                      {jobs.map((job) => (
                        <Link
                          key={job.id}
                          href={`/proposal/${job.id}`}
                          className="block p-1.5 rounded-md bg-blue-100 text-blue-800 text-xs font-medium truncate hover:bg-blue-200 transition-colors"
                        >
                          {job.customerName} - {job.jobType}
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unscheduled Jobs */}
          <div className="lg:w-72 shrink-0">
            <h3 className="font-semibold text-slate-900 mb-3">Needs Scheduling ({unscheduled.length})</h3>
            {unscheduled.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
                <p className="text-sm text-slate-500">All jobs scheduled!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {unscheduled.map((p) => (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-3">
                    <p className="font-medium text-sm text-slate-900 truncate">{p.customerName}</p>
                    <p className="text-xs text-slate-500 mb-2">{p.jobType} &middot; {p.projectSize}</p>
                    {scheduling === p.id ? (
                      <div className="space-y-2">
                        <input type="date" value={scheduleForm.startDate} onChange={(e) => setScheduleForm({ ...scheduleForm, startDate: e.target.value })} className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs text-slate-900" />
                        <input type="date" value={scheduleForm.endDate} onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })} className="w-full px-2 py-1.5 rounded border border-slate-300 text-xs text-slate-900" placeholder="End date" />
                        {crew.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {crew.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  const arr = scheduleForm.crew.includes(c.id)
                                    ? scheduleForm.crew.filter((id) => id !== c.id)
                                    : [...scheduleForm.crew, c.id];
                                  setScheduleForm({ ...scheduleForm, crew: arr });
                                }}
                                className={`px-2 py-0.5 rounded text-xs cursor-pointer ${scheduleForm.crew.includes(c.id) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}
                              >
                                {c.name}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-1">
                          <button onClick={() => handleSchedule(p.id)} disabled={!scheduleForm.startDate} className="flex-1 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded cursor-pointer disabled:bg-slate-300">Schedule</button>
                          <button onClick={() => setScheduling(null)} className="py-1.5 px-2 bg-white text-slate-500 text-xs rounded border border-slate-200 cursor-pointer">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setScheduling(p.id)} className="w-full py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium rounded-lg cursor-pointer">
                        Schedule Job
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
