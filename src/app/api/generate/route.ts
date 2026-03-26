import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, jobType, projectSize, materials, notes, optionalAddons } = body;

  const prompt = `You are a professional contractor estimator.

Write a clean, persuasive, homeowner-friendly proposal.

Customer Name: ${customerName}
Job Type: ${jobType}
Project Size: ${projectSize}
Materials: ${materials}
Notes: ${notes}
Optional Add-Ons: ${optionalAddons || "None"}

Output the proposal with EXACTLY these section headers (each on its own line, followed by a colon):

Project Summary:
(write the project summary here)

Scope of Work:
(write the scope of work here)

Materials and Labor:
(write materials and labor breakdown here)

Total Estimated Cost:
(write total estimated cost here)

Timeline:
(write the timeline here)

Optional Add-Ons:
(write optional add-ons here, or "None requested" if none)

Make it professional, clear, and easy to understand. Use dollar amounts for costs. Be specific and detailed.`;

  // Mock AI generation - replace with real AI API call (OpenAI, Anthropic, etc.)
  const proposal = generateMockProposal({
    customerName,
    jobType,
    projectSize,
    materials,
    notes,
    optionalAddons,
  });

  return NextResponse.json({ proposal });
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

  // Simulate realistic cost estimation
  const baseCost = Math.floor(Math.random() * 5000) + 3000;
  const laborCost = Math.floor(baseCost * 0.6);
  const materialCost = baseCost - laborCost;
  const totalCost = baseCost + Math.floor(Math.random() * 2000);

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
${materials ? materials.split(",").map((m: string) => `  - ${m.trim()}`).join("\n") : "  - Standard materials as required for the project"}

Labor:
  - Skilled labor and installation: $${laborCost.toLocaleString()}
  - Site preparation and cleanup: $${Math.floor(laborCost * 0.15).toLocaleString()}
  - Project management: $${Math.floor(laborCost * 0.1).toLocaleString()}

Material Costs: $${materialCost.toLocaleString()}

Total Estimated Cost:
$${totalCost.toLocaleString()}

This estimate includes all materials, labor, permits (if applicable), and cleanup. Payment terms: 50% deposit upon acceptance, 50% upon completion.

Timeline:
- Project Start: Within 1-2 weeks of proposal acceptance
- Estimated Duration: ${projectSize.toLowerCase().includes("large") ? "3-4 weeks" : projectSize.toLowerCase().includes("small") ? "3-5 days" : "1-2 weeks"}
- Final Walkthrough: Upon completion
- This timeline is weather-dependent for outdoor projects

Optional Add-Ons:
${optionalAddons ? optionalAddons.split(",").map((a: string) => `- ${a.trim()}: Contact us for pricing`).join("\n") : "No additional add-ons requested. Contact us if you'd like to discuss additional services."}`;
}
