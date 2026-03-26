import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, jobType, projectSize, materials, notes, optionalAddons, companyName } = body;

  const prompt = `You are a professional contractor estimator working for ${companyName || "a licensed contracting company"}.

Write a clean, persuasive, homeowner-friendly proposal.

Customer Name: ${customerName}
Job Type: ${jobType}
Project Size: ${projectSize}
Materials: ${materials || "Standard materials"}
Notes: ${notes || "None"}
Optional Add-Ons: ${optionalAddons || "None"}

Output the proposal with EXACTLY these section headers (each on its own line, followed by a colon):

Project Summary:
(write a warm, professional 2-3 sentence summary addressing the customer by name)

Scope of Work:
(write detailed bullet points of every step involved, be specific to the job type)

Materials and Labor:
(write itemized breakdown with realistic dollar amounts based on current market rates for this job type and size - include material line items and labor line items separately, then show subtotals)

Total Estimated Cost:
(write the total as a single dollar amount on the first line, then a breakdown line showing Materials + Labor = Total, then payment terms)

Timeline:
(write realistic timeline with start date, duration, milestones, and completion)

Optional Add-Ons:
(if add-ons were provided, list each with a realistic price estimate. If none, write "No additional add-ons requested.")

IMPORTANT:
- All dollar amounts must be realistic for the job type and project size
- Material + Labor subtotals MUST add up exactly to the Total
- Be specific to the trade (use correct terminology for ${jobType})
- Keep it professional but conversational — this goes directly to a homeowner
- Do NOT use markdown formatting, just plain text with dashes for bullet points`;

  // Try real AI first, fall back to mock
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const proposal = data.content[0]?.text;
        if (proposal) {
          return NextResponse.json({ proposal, ai: true });
        }
      }
    } catch {
      // Fall through to mock
    }
  }

  // Mock fallback
  const proposal = generateMockProposal({
    customerName,
    jobType,
    projectSize,
    materials,
    notes,
    optionalAddons,
  });

  return NextResponse.json({ proposal, ai: false });
}

interface ProposalInput {
  customerName: string;
  jobType: string;
  projectSize: string;
  materials: string;
  notes: string;
  optionalAddons: string;
}

function generateMockProposal(input: ProposalInput): string {
  const { customerName, jobType, projectSize, materials, notes, optionalAddons } = input;

  const sizeLower = projectSize.toLowerCase();
  const sizeMultiplier = sizeLower.includes("large") ? 2.5
    : sizeLower.includes("small") ? 0.7
    : 1.0;

  const laborInstallation = Math.floor(3200 * sizeMultiplier);
  const sitePrep = Math.floor(480 * sizeMultiplier);
  const projectMgmt = Math.floor(320 * sizeMultiplier);
  const materialCost = Math.floor(2400 * sizeMultiplier);
  const totalLabor = laborInstallation + sitePrep + projectMgmt;
  const totalCost = totalLabor + materialCost;

  const materialsList = materials
    ? materials.split(",").map((m: string) => `  - ${m.trim()}`).join("\n")
    : "  - Standard materials as required for the project";

  const duration = sizeLower.includes("large") ? "3-4 weeks"
    : sizeLower.includes("small") ? "3-5 days"
    : "1-2 weeks";

  return `Project Summary:
We are pleased to present this proposal for ${customerName} regarding a ${jobType} project. This ${projectSize} scope project will be completed with high-quality craftsmanship and attention to detail, ensuring lasting results that exceed your expectations.

Scope of Work:
- Complete ${jobType} services for the specified ${projectSize} area
- Site preparation and cleanup included
- ${notes ? `Special considerations: ${notes}` : "Standard project execution with quality materials"}
- All work performed by licensed and insured professionals
- Final walkthrough and quality inspection upon completion
- Post-project cleanup and debris removal

Materials and Labor:
Materials:
${materialsList}

Material Costs: $${materialCost.toLocaleString()}

Labor:
  - Skilled labor and installation: $${laborInstallation.toLocaleString()}
  - Site preparation and cleanup: $${sitePrep.toLocaleString()}
  - Project management: $${projectMgmt.toLocaleString()}

Labor Subtotal: $${totalLabor.toLocaleString()}

Total Estimated Cost:
$${totalCost.toLocaleString()}

Breakdown: Materials ($${materialCost.toLocaleString()}) + Labor ($${totalLabor.toLocaleString()}) = $${totalCost.toLocaleString()}

This estimate includes all materials, labor, permits (if applicable), and cleanup. Payment terms: 50% deposit upon acceptance, 50% upon completion.

Timeline:
- Project Start: Within 1-2 weeks of proposal acceptance
- Estimated Duration: ${duration}
- Final Walkthrough: Upon completion
- This timeline is weather-dependent for outdoor projects

Optional Add-Ons:
${optionalAddons ? optionalAddons.split(",").map((a: string) => `- ${a.trim()}: Contact us for pricing`).join("\n") : "No additional add-ons requested. Contact us if you'd like to discuss additional services."}`;
}
