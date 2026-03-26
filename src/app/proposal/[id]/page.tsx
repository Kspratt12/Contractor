"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Proposal } from "@/lib/types";
import { getProposal, saveProposal } from "@/lib/storage";

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

export default function ProposalView() {
  const params = useParams();
  const id = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const p = getProposal(id);
    if (p) {
      // Mark as viewed if it was sent
      if (p.status === "sent") {
        const updated = { ...p, status: "viewed" as const, viewedAt: new Date().toISOString() };
        saveProposal(updated);
        setProposal(updated);
      } else {
        setProposal(p);
      }
      if (p.signatureData) {
        setSigned(true);
      }
    } else {
      setNotFound(true);
    }
  }, [id]);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    if (signing) {
      setTimeout(initCanvas, 50);
    }
  }, [signing, initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const endDraw = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = () => {
    if (!proposal || !canvasRef.current) return;
    const signatureData = canvasRef.current.toDataURL("image/png");

    // Check if canvas is blank
    const blank = document.createElement("canvas");
    blank.width = canvasRef.current.width;
    blank.height = canvasRef.current.height;
    if (signatureData === blank.toDataURL("image/png")) {
      alert("Please draw your signature before submitting.");
      return;
    }

    const updated: Proposal = {
      ...proposal,
      status: "signed",
      signedAt: new Date().toISOString(),
      signatureData,
    };
    saveProposal(updated);
    setProposal(updated);
    setSigned(true);
    setSigning(false);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Proposal Not Found</h2>
          <p className="text-slate-500 mb-6">This proposal link may be expired or invalid.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">
            Go to ProposalFlow
          </Link>
        </div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const sections = parseProposal(proposal.proposalText);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">ProposalFlow</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Project Proposal</h1>
          <p className="text-slate-500 mt-1">
            Prepared for {proposal.customerName} &middot;{" "}
            {new Date(proposal.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Proposal Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10 mb-6">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <div>
              <div className="text-sm text-slate-400 mb-1">Prepared For</div>
              <div className="text-lg font-semibold text-slate-900">{proposal.customerName}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-400 mb-1">{proposal.jobType}</div>
              <div className="text-sm font-medium text-slate-700">{proposal.projectSize}</div>
            </div>
          </div>

          <div className="space-y-7">
            {sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  {section.title}
                </h3>
                <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
                {i < sections.length - 1 && <hr className="mt-7 border-slate-100" />}
              </div>
            ))}
          </div>

          {/* Signature Section */}
          <div className="mt-10 pt-8 border-t-2 border-slate-200">
            {signed && proposal.signatureData ? (
              <div>
                <h3 className="text-sm font-semibold text-green-600 uppercase tracking-wide mb-3">
                  Customer Signature
                </h3>
                <div className="flex items-center gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <img
                      src={proposal.signatureData}
                      alt="Customer signature"
                      className="h-16 w-auto"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{proposal.customerName}</p>
                    <p className="text-sm text-slate-500">
                      Signed on {new Date(proposal.signedAt!).toLocaleDateString()} at{" "}
                      {new Date(proposal.signedAt!).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium text-sm">This proposal has been accepted and signed.</span>
                </div>
              </div>
            ) : signing ? (
              <div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">
                  Sign to Accept This Proposal
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  Draw your signature below to accept this proposal and its terms.
                </p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl overflow-hidden bg-white mb-3">
                  <canvas
                    ref={canvasRef}
                    className="w-full cursor-crosshair touch-none"
                    style={{ height: "150px" }}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={endDraw}
                    onMouseLeave={endDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={endDraw}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSign}
                    className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Submit Signature & Accept
                  </button>
                  <button
                    onClick={clearCanvas}
                    className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-600 font-medium rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setSigning(false)}
                    className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-600 font-medium rounded-xl border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-slate-500 mb-4">
                  Ready to move forward? Sign below to accept this proposal.
                </p>
                <button
                  onClick={() => setSigning(true)}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-xl transition-colors shadow-lg shadow-green-600/25 cursor-pointer"
                >
                  Accept & Sign Proposal
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          Powered by ProposalFlow &middot; Professional Contractor Proposals
        </p>
      </div>
    </div>
  );
}
