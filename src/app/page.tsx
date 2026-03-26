import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">ProposalFlow</span>
          </div>
          <Link
            href="/generate"
            className="hidden sm:inline-flex px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Try It Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Used by 2,400+ contractors
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Create a professional proposal{" "}
            <span className="text-blue-600">in under 60 seconds</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Turn job details into a clean, customer-ready proposal &mdash; without wasting hours writing estimates. Just fill in the basics and hit generate.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/generate"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25"
            >
              Generate a Sample Proposal
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-4 text-slate-600 hover:text-slate-900 text-lg font-medium transition-colors"
            >
              See How It Works &darr;
            </a>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Win more jobs. Waste less time.
          </h2>
          <p className="text-center text-slate-500 mb-14 max-w-xl mx-auto">
            Your proposals should be closing deals &mdash; not eating up your evenings.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: "Close Jobs Faster",
                desc: "Send a polished proposal the same day you walk the job. Beat your competition to the punch.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                title: "Look Professional",
                desc: "Homeowners trust contractors who present clean, detailed estimates. Stand out from handwritten quotes.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                ),
                title: "Stop Writing Estimates",
                desc: "No more staring at a blank page. Enter the job details and your proposal writes itself.",
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                ),
                title: "Send Instantly",
                desc: "Download as a PDF and email or text it to your customer on the spot. No delays.",
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {benefit.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Three steps. That&apos;s it.
          </h2>
          <p className="text-center text-slate-500 mb-16 max-w-lg mx-auto">
            No training. No complicated setup. If you can fill out a form, you can create a proposal.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: "1",
                title: "Enter Job Details",
                desc: "Customer name, job type, materials, project size. The stuff you already know from the walkthrough.",
              },
              {
                step: "2",
                title: "Generate Proposal",
                desc: "Hit one button. Your proposal is written with a full scope of work, cost breakdown, and timeline.",
              },
              {
                step: "3",
                title: "Download & Send",
                desc: "Download as a clean PDF. Text it, email it, or hand it to the homeowner right there on the spot.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Proposal Preview */}
      <section className="py-16 sm:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Here&apos;s what your customers will see
          </h2>
          <p className="text-center text-slate-500 mb-12 max-w-lg mx-auto">
            A real example &mdash; generated in seconds from a simple roofing job walkthrough.
          </p>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10 max-w-3xl mx-auto">
            {/* Proposal header */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
              <div>
                <div className="text-sm text-slate-400 mb-1">Proposal For</div>
                <div className="text-lg font-semibold text-slate-900">Robert & Linda Martinez</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-400 mb-1">Date</div>
                <div className="text-sm font-medium text-slate-700">March 26, 2026</div>
              </div>
            </div>

            <div className="space-y-7">
              <div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Project Summary</h3>
                <p className="text-slate-700 leading-relaxed">
                  We are pleased to present this proposal for a complete roof replacement at your residence. The existing asphalt shingle roof will be fully removed and replaced with new GAF Timberline HDZ architectural shingles, including new underlayment, flashing, and ridge vents. All work will be performed by our licensed and insured crew.
                </p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Scope of Work</h3>
                <ul className="text-slate-700 leading-relaxed space-y-1.5">
                  <li>- Remove existing roofing material down to the deck</li>
                  <li>- Inspect and repair any damaged decking</li>
                  <li>- Install synthetic underlayment across entire roof</li>
                  <li>- Install GAF Timberline HDZ shingles (Charcoal)</li>
                  <li>- Replace all flashing, drip edge, and pipe boots</li>
                  <li>- Install new ridge vent for proper attic ventilation</li>
                  <li>- Full cleanup with magnetic nail sweep of property</li>
                </ul>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Materials and Labor</h3>
                <div className="text-slate-700 leading-relaxed space-y-1">
                  <p>GAF Timberline HDZ Shingles (28 squares): <span className="font-medium">$4,480</span></p>
                  <p>Synthetic Underlayment: <span className="font-medium">$620</span></p>
                  <p>Flashing, Drip Edge, Pipe Boots: <span className="font-medium">$380</span></p>
                  <p>Ridge Vent System: <span className="font-medium">$290</span></p>
                  <p>Skilled Labor &amp; Installation: <span className="font-medium">$5,800</span></p>
                  <p>Debris Removal &amp; Dumpster: <span className="font-medium">$450</span></p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Total Estimated Cost</h3>
                <p className="text-3xl font-bold text-slate-900">$12,020</p>
                <p className="text-sm text-slate-500 mt-1">Payment: 50% deposit upon acceptance, 50% upon completion.</p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Timeline</h3>
                <p className="text-slate-700 leading-relaxed">
                  Project start within 5-7 business days of signed agreement. Estimated completion: 2-3 days, weather permitting. Final walkthrough upon completion.
                </p>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">Optional Add-Ons</h3>
                <ul className="text-slate-700 leading-relaxed space-y-1.5">
                  <li>- Gutter replacement (seamless aluminum): <span className="font-medium">$1,800</span></li>
                  <li>- Skylight installation (Velux 22&quot;x46&quot;): <span className="font-medium">$1,200</span></li>
                  <li>- Extended 25-year workmanship warranty: <span className="font-medium">$350</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-slate-400">This entire proposal was generated in under 60 seconds.</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Simple pricing. No surprises.
          </h2>
          <p className="text-slate-500 mb-12 max-w-md mx-auto">
            One plan. Unlimited proposals. Cancel anytime.
          </p>

          <div className="bg-white rounded-2xl shadow-lg border-2 border-blue-600 p-8 sm:p-10 max-w-md mx-auto">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-3">Pro Plan</div>
            <div className="flex items-baseline justify-center gap-1 mb-2">
              <span className="text-5xl font-extrabold text-slate-900">$197</span>
              <span className="text-slate-500 text-lg">/month</span>
            </div>
            <p className="text-slate-500 mb-8">Everything you need to close more jobs.</p>

            <ul className="text-left space-y-3 mb-10">
              {[
                "Unlimited proposals",
                "PDF download & export",
                "Custom job types & materials",
                "Professional formatting",
                "Copy & send in seconds",
                "No contracts &mdash; cancel anytime",
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-slate-700" dangerouslySetInnerHTML={{ __html: feature }} />
                </li>
              ))}
            </ul>

            <Link
              href="/generate"
              className="block w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-colors text-center shadow-lg shadow-blue-600/25"
            >
              Start Free Trial
            </Link>
            <p className="text-xs text-slate-400 mt-3">7-day free trial. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 bg-slate-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Stop losing jobs to slow proposals
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            The contractor who sends a clean estimate first usually wins the job. Make sure that&apos;s you.
          </p>
          <Link
            href="/generate"
            className="inline-flex px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/30"
          >
            Start Free Trial
          </Link>
          <p className="text-sm text-slate-500 mt-4">No credit card. No setup. Ready in 60 seconds.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-700">ProposalFlow</span>
          </div>
          <p className="text-sm text-slate-400">&copy; 2026 ProposalFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
