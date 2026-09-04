export interface Asset {
  id: string;
  url: string;
  altText: string;
  width: number | null;
  height: number | null;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  uploader?: { name: string };
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  industry: string;
  service: "Automation" | "Web Development" | "Brand & Graphic Design";
  description: string;
  tags: string[];
  photoId: string;
  photo: Asset;
  caseStudy: Record<string, unknown>;
  isFeatured: boolean;
  featuredOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubService {
  id: string;
  categoryId: string;
  slug: string;
  icon: string;
  name: string;
  description: string;
  howWeWork: string[];
  whatYouGet: string[];
  platforms: string[];
  order: number;
}

export interface ServiceCategory {
  id: string;
  slug: string;
  serviceName: string;
  overviewIcon: string;
  gooeyId: string;
  overview: { heading: string; body: string };
  mobileSummary: {
    description: string;
    howWeWork: string[];
    whatYouGet: string[];
    platforms: string[];
  };
  subServices: SubService[];
}

export interface Review {
  id: string;
  displayId: string;
  name: string;
  location: string;
  service: "Automation" | "Web Development" | "Graphic Design";
  text: string;
  order: number;
  isFeatured: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  photoId: string | null;
  photo: Asset | null;
  order: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

export interface ContactSubmission {
  id: string;
  formId: "question" | "consultation" | "start";
  status: "new" | "read" | "handled";
  fields: Record<string, string>;
  emailedAt: string | null;
  emailError: string | null;
  createdAt: string;
}

export interface InternalProject {
  id: string;
  name: string;
  note: string | null;
  serviceType: "Automation" | "Web Development" | "Brand & Graphic Design";
  googleDriveLink: string;
  status: "active" | "archived" | "completed";
  uploader?: { name: string };
  createdAt: string;
}

export type Partner = "Waseem Farooq" | "Akbar Khan" | "Abdul Ahad";
export type LedgerActor = Partner | "Nexoryn";
export type LedgerType = "invested" | "earned" | "personal_withdraw" | "debt_paid";

/** Only "approved" rows count toward any figure on the Finance page. A
 *  debt payment starts "pending" until the other side decides on it. */
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Investment {
  id: string;
  amount: string;
  date: string;
  description: string;
  type: LedgerType;
  enteredBy: string;
  actionBy: LedgerActor;
  paidTo: LedgerActor | null;
  approvalStatus: ApprovalStatus;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
  createdAt: string;
}

/** An Investment as returned by the /finance/requests endpoint, which adds
 *  who may decide it and whether that includes the caller. */
export interface DebtRequest extends Omit<Investment, "amount"> {
  amount: number;
  eligibleApprovers: string[];
  canDecide: boolean;
}

export interface DebtRequests {
  /** The caller's own ledger identity. */
  you: string;
  /** Pending, waiting on the caller to decide. */
  incoming: DebtRequest[];
  /** Pending, raised by the caller and waiting on someone else. */
  outgoing: DebtRequest[];
  /** Already approved or rejected, either direction. */
  history: DebtRequest[];
}

export interface AdminAccount {
  id: string;
  email: string;
  name: string;
  partnerName: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Transfer {
  actor: string;
  amount: number;
}

export interface PartnerFinance {
  actor: Partner;
  invested: number;
  paidToPeers: number;
  receivedFromPeers: number;
  effectiveInvested: number;
  fairShare: number;
  investmentBalance: number;
  profitShare: number;
  withdrawn: number;
  repaidToCompany: number;
  withdrawalDebt: number;
  netPosition: number;
  owesToPartners: Transfer[];
  owedByPartners: Transfer[];
  totalOwedToPartners: number;
  totalOwedByPartners: number;
}

export interface FinanceDashboardData {
  company: {
    totalInvested: number;
    totalEarned: number;
    totalWithdrawn: number;
    totalRepaidToCompany: number;
    cashPosition: number;
    fairSharePerPartner: number;
  };
  partners: PartnerFinance[];
  settlements: { from: Partner; to: Partner; amount: number }[];
  you: PartnerFinance | null;
}

export interface AdminUser {
  id: string;
  email: string;
  /** Editable display name — safe to change, cosmetic only. */
  name: string;
  /** Stable ledger identity (one of PARTNERS, or null for a non-partner
   *  account). This, not `name`, is what Finance and debt approvals key on. */
  partnerName: string | null;
  role: string;
}
