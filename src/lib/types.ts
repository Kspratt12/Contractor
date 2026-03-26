export interface Proposal {
  id: string;
  customerName: string;
  customerEmail: string;
  jobType: string;
  projectSize: string;
  materials: string;
  notes: string;
  optionalAddons: string;
  proposalText: string;
  status: "draft" | "sent" | "viewed" | "signed" | "invoiced";
  createdAt: string;
  sentAt?: string;
  viewedAt?: string;
  signedAt?: string;
  signatureData?: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  proposalId: string;
  customerName: string;
  customerEmail: string;
  jobType: string;
  totalAmount: number;
  status: "unpaid" | "paid";
  createdAt: string;
  dueDate: string;
  proposalText: string;
}
