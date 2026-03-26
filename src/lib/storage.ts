import { Proposal, Invoice } from "./types";

const PROPOSALS_KEY = "proposalflow_proposals";
const INVOICES_KEY = "proposalflow_invoices";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Proposals
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

// Invoices
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

// Extract total cost from proposal text
export function extractTotalCost(proposalText: string): number {
  const match = proposalText.match(/Total Estimated Cost:\s*\$?([\d,]+)/i);
  if (match) {
    return parseInt(match[1].replace(/,/g, ""), 10);
  }
  return 0;
}
