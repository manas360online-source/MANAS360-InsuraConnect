
export enum ClaimStatus {
  DRAFT = 'Draft',
  PENDING_SUBMISSION = 'Pending Submission',
  SUBMITTED = 'Submitted',
  UNDER_REVIEW = 'Under Review',
  APPROVED = 'Approved',
  PARTIALLY_APPROVED = 'Partially Approved',
  DENIED = 'Denied',
  APPEALED = 'Appealed',
  PAID = 'Paid',
  ERROR = 'Error'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired',
  INACTIVE = 'inactive'
}

export interface InsuranceCompany {
  id: string;
  name: string;
  code: string;
  logoUrl?: string;
  mentalHealthCovered: boolean;
  maxSessionsPerYear?: number;
  typicalCopayAmount?: number;
  typicalCoveragePercent: number;
  avgProcessingDays: number;
  supportsRealtimeVerification: boolean;
  commissionTier: 1 | 2 | 3 | 4; // 1=10%, 2=12%, 3=15%, 4=18% as per PDF
}

export interface AffiliateTransaction {
  id: string;
  partnerId: string;
  customerEmail: string;
  segment: AffiliateSegment;
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  commissionPercent: number;
  commissionAmount: number;
  transactionDate: string;
  variant: 'A' | 'B'; // For A/B testing tracking per PDF
}

export interface PolicyHistoryEntry {
  id: string;
  timestamp: string;
  event: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
}

export interface InsurancePolicy {
  id: string;
  patientId: string;
  insuranceCompanyId: string;
  policyNumber: string;
  memberId?: string;
  groupNumber?: string;
  policyHolderName: string;
  relationship: 'self' | 'spouse' | 'parent' | 'child';
  policyHolderDob?: string;
  startDate: string;
  endDate?: string;
  verificationStatus: VerificationStatus;
  sessionsRemaining?: number;
  maxSessionsPerYear?: number;
  copayAmount: number;
  coveragePercent: number;
  deductibleAmount: number;
  deductibleRemaining: number;
  requiresPreAuth: boolean;
  preAuthObtained: boolean;
  preAuthNumber?: string;
  history: PolicyHistoryEntry[];
}

export interface InsuranceClaim {
  id: string;
  sessionId: string;
  claimNumber: string;
  externalClaimId?: string;
  serviceDate: string;
  serviceType: string;
  diagnosisCode: string;
  procedureCode: string;
  billedAmount: number;
  approvedAmount?: number;
  copayAmount?: number;
  insurancePayment?: number;
  status: ClaimStatus;
  denialReason?: string;
  denialCode?: string;
  submittedAt?: string;
  updatedAt: string;
  appealFiled: boolean;
  appealNotes?: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'policy' | 'claim' | 'verification' | 'system' | 'sync';
  details: string;
  status: 'success' | 'info' | 'warning';
}

export type AffiliateSegment = 'individual' | 'therapist' | 'corporate' | 'education' | 'healthcare' | 'defense' | 'hni';

export interface AffiliateDiscount {
  segment: AffiliateSegment;
  discount_percent: number;
  free_sessions: number;
  free_service: string;
  product: string;
  original_price: number;
  discounted_price: number;
  description: string;
}

export interface AffiliateVerificationRecord {
  id: string;
  timestamp: string;
  partnerId: string;
  partnerName: string;
  segment: AffiliateSegment;
  policyNumber: string;
  patientEmail: string;
  status: 'VERIFIED';
}

/**
 * Interface for synchronization history entries used in the Partner Portal.
 */
export interface SyncHistoryEntry {
  id: string;
  date: string;
  type: 'Scheduled' | 'Manual';
  records: number;
  changes: number;
  status: 'Success' | 'Partial' | 'Failed';
}
