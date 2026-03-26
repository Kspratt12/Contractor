import { Proposal, Invoice, Customer, Template, FollowUp, CrewMember, BrandSettings, Payment, Analytics } from "./types";

const PROPOSALS_KEY = "proposalflow_proposals";
const INVOICES_KEY = "proposalflow_invoices";
const CUSTOMERS_KEY = "proposalflow_customers";
const TEMPLATES_KEY = "proposalflow_templates";
const FOLLOWUPS_KEY = "proposalflow_followups";
const CREW_KEY = "proposalflow_crew";
const BRAND_KEY = "proposalflow_brand";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// --- Proposals ---
export function getProposals(): Proposal[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PROPOSALS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getProposal(id: string): Proposal | undefined {
  return getProposals().find((p) => p.id === id);
}

export function saveProposal(proposal: Proposal): void {
  const proposals = getProposals();
  const index = proposals.findIndex((p) => p.id === proposal.id);
  if (index >= 0) {
    proposals[index] = proposal;
  } else {
    proposals.unshift(proposal);
  }
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
}

export function deleteProposal(id: string): void {
  const proposals = getProposals().filter((p) => p.id !== id);
  localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
}

// --- Invoices ---
export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(INVOICES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getInvoice(id: string): Invoice | undefined {
  return getInvoices().find((i) => i.id === id);
}

export function saveInvoice(invoice: Invoice): void {
  const invoices = getInvoices();
  const index = invoices.findIndex((i) => i.id === invoice.id);
  if (index >= 0) {
    invoices[index] = invoice;
  } else {
    invoices.unshift(invoice);
  }
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function addPayment(invoiceId: string, payment: Payment): void {
  const invoice = getInvoice(invoiceId);
  if (!invoice) return;
  invoice.payments.push(payment);
  invoice.amountPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0);
  if (invoice.amountPaid >= invoice.totalAmount) {
    invoice.status = "paid";
  } else if (invoice.amountPaid > 0) {
    invoice.status = "partial";
  }
  saveInvoice(invoice);
}

// --- Customers ---
export function getCustomers(): Customer[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CUSTOMERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id);
}

export function saveCustomer(customer: Customer): void {
  const customers = getCustomers();
  const index = customers.findIndex((c) => c.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.unshift(customer);
  }
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function deleteCustomer(id: string): void {
  const customers = getCustomers().filter((c) => c.id !== id);
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
}

export function findOrCreateCustomer(name: string, email: string, phone: string, address: string): Customer {
  const customers = getCustomers();
  const existing = customers.find(
    (c) => c.email === email && email !== "" || c.name.toLowerCase() === name.toLowerCase()
  );
  if (existing) {
    if (phone && !existing.phone) existing.phone = phone;
    if (address && !existing.address) existing.address = address;
    saveCustomer(existing);
    return existing;
  }
  const newCustomer: Customer = {
    id: generateId(),
    name,
    email,
    phone,
    address,
    tags: ["lead"],
    notes: "",
    createdAt: new Date().toISOString(),
    proposalIds: [],
  };
  saveCustomer(newCustomer);
  return newCustomer;
}

// --- Templates ---
export function getTemplates(): Template[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(TEMPLATES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getTemplate(id: string): Template | undefined {
  return getTemplates().find((t) => t.id === id);
}

export function saveTemplate(template: Template): void {
  const templates = getTemplates();
  const index = templates.findIndex((t) => t.id === template.id);
  if (index >= 0) {
    templates[index] = template;
  } else {
    templates.unshift(template);
  }
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

export function deleteTemplate(id: string): void {
  const templates = getTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
}

// --- Follow-ups ---
export function getFollowUps(): FollowUp[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(FOLLOWUPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveFollowUp(followUp: FollowUp): void {
  const followUps = getFollowUps();
  const index = followUps.findIndex((f) => f.id === followUp.id);
  if (index >= 0) {
    followUps[index] = followUp;
  } else {
    followUps.unshift(followUp);
  }
  localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(followUps));
}

export function createAutoFollowUp(proposal: Proposal): void {
  const scheduledFor = new Date();
  scheduledFor.setDate(scheduledFor.getDate() + 2);

  const followUp: FollowUp = {
    id: generateId(),
    proposalId: proposal.id,
    customerId: proposal.customerId,
    customerName: proposal.customerName,
    customerEmail: proposal.customerEmail,
    type: "auto",
    message: `Hi ${proposal.customerName.split(" ")[0]}, just checking in on the ${proposal.jobType} proposal I sent over. Happy to answer any questions or adjust anything. Let me know!`,
    scheduledFor: scheduledFor.toISOString(),
    status: "pending",
  };
  saveFollowUp(followUp);
}

// --- Crew ---
export function getCrew(): CrewMember[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CREW_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveCrewMember(member: CrewMember): void {
  const crew = getCrew();
  const index = crew.findIndex((c) => c.id === member.id);
  if (index >= 0) {
    crew[index] = member;
  } else {
    crew.push(member);
  }
  localStorage.setItem(CREW_KEY, JSON.stringify(crew));
}

export function deleteCrewMember(id: string): void {
  const crew = getCrew().filter((c) => c.id !== id);
  localStorage.setItem(CREW_KEY, JSON.stringify(crew));
}

// --- Brand Settings ---
export function getBrandSettings(): BrandSettings {
  if (typeof window === "undefined") {
    return { companyName: "ProposalFlow", primaryColor: "#2563eb", accentColor: "#1e40af", phone: "", email: "", address: "", website: "", licenseNumber: "" };
  }
  const data = localStorage.getItem(BRAND_KEY);
  return data
    ? JSON.parse(data)
    : { companyName: "ProposalFlow", primaryColor: "#2563eb", accentColor: "#1e40af", phone: "", email: "", address: "", website: "", licenseNumber: "" };
}

export function saveBrandSettings(settings: BrandSettings): void {
  localStorage.setItem(BRAND_KEY, JSON.stringify(settings));
}

// --- Analytics ---
export function getAnalytics(): Analytics {
  const proposals = getProposals();
  const invoices = getInvoices();

  const signed = proposals.filter((p) => p.status === "signed" || p.status === "invoiced");
  const totalRevenue = invoices.reduce((sum, i) => sum + i.amountPaid, 0);

  const closeRate = proposals.length > 0 ? (signed.length / proposals.length) * 100 : 0;

  const avgDaysToClose =
    signed.length > 0
      ? signed.reduce((sum, p) => {
          const created = new Date(p.createdAt).getTime();
          const closedAt = new Date(p.signedAt || p.createdAt).getTime();
          return sum + (closedAt - created) / (1000 * 60 * 60 * 24);
        }, 0) / signed.length
      : 0;

  // By job type
  const jobTypeMap = new Map<string, { count: number; closed: number; revenue: number }>();
  for (const p of proposals) {
    const existing = jobTypeMap.get(p.jobType) || { count: 0, closed: 0, revenue: 0 };
    existing.count++;
    if (p.status === "signed" || p.status === "invoiced") {
      existing.closed++;
      const inv = invoices.find((i) => i.proposalId === p.id);
      if (inv) existing.revenue += inv.totalAmount;
    }
    jobTypeMap.set(p.jobType, existing);
  }
  const byJobType = Array.from(jobTypeMap.entries()).map(([jobType, data]) => ({ jobType, ...data }));

  // By month
  const monthMap = new Map<string, { proposals: number; signed: number; revenue: number }>();
  for (const p of proposals) {
    const month = new Date(p.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short" });
    const existing = monthMap.get(month) || { proposals: 0, signed: 0, revenue: 0 };
    existing.proposals++;
    if (p.status === "signed" || p.status === "invoiced") {
      existing.signed++;
      const inv = invoices.find((i) => i.proposalId === p.id);
      if (inv) existing.revenue += inv.totalAmount;
    }
    monthMap.set(month, existing);
  }
  const byMonth = Array.from(monthMap.entries()).map(([month, data]) => ({ month, ...data }));

  // Pipeline
  const statusMap = new Map<string, { count: number; value: number }>();
  for (const p of proposals) {
    const existing = statusMap.get(p.status) || { count: 0, value: 0 };
    existing.count++;
    const cost = extractTotalCost(p.proposalText);
    existing.value += cost;
    statusMap.set(p.status, existing);
  }
  const pipeline = Array.from(statusMap.entries()).map(([status, data]) => ({ status, ...data }));

  return {
    totalProposals: proposals.length,
    totalRevenue,
    closeRate,
    avgDaysToClose,
    byJobType,
    byMonth,
    pipeline,
  };
}

// --- Helpers ---
export function extractTotalCost(proposalText: string): number {
  const match = proposalText.match(/Total Estimated Cost:\s*\$?([\d,]+)/i);
  if (match) {
    return parseInt(match[1].replace(/,/g, ""), 10);
  }
  return 0;
}
