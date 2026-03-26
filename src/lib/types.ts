export interface Proposal {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
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
  templateId?: string;
  photos: Photo[];
  scheduledDate?: string;
  scheduledEndDate?: string;
  assignedCrew?: string[];
}

export interface Invoice {
  id: string;
  proposalId: string;
  customerName: string;
  customerEmail: string;
  jobType: string;
  totalAmount: number;
  depositAmount: number;
  amountPaid: number;
  status: "unpaid" | "partial" | "paid";
  createdAt: string;
  dueDate: string;
  proposalText: string;
  payments: Payment[];
  stripePaymentLink?: string;
}

export interface Payment {
  id: string;
  amount: number;
  method: "stripe" | "cash" | "check" | "other";
  date: string;
  note?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  tags: string[];
  notes: string;
  createdAt: string;
  proposalIds: string[];
}

export interface Template {
  id: string;
  name: string;
  jobType: string;
  projectSize: string;
  materials: string;
  notes: string;
  optionalAddons: string;
  createdAt: string;
}

export interface Photo {
  id: string;
  dataUrl: string;
  caption: string;
  stage: "before" | "during" | "after";
  createdAt: string;
}

export interface FollowUp {
  id: string;
  proposalId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  type: "auto" | "manual";
  message: string;
  scheduledFor: string;
  sentAt?: string;
  status: "pending" | "sent" | "cancelled";
}

export interface CrewMember {
  id: string;
  name: string;
  role: "owner" | "manager" | "foreman" | "crew";
  email: string;
  phone: string;
  color: string;
}

export interface BrandSettings {
  companyName: string;
  logo?: string;
  primaryColor: string;
  accentColor: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  licenseNumber: string;
}

export interface Analytics {
  totalProposals: number;
  totalRevenue: number;
  closeRate: number;
  avgDaysToClose: number;
  byJobType: { jobType: string; count: number; closed: number; revenue: number }[];
  byMonth: { month: string; proposals: number; signed: number; revenue: number }[];
  pipeline: { status: string; count: number; value: number }[];
}
