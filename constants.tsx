
import { InsuranceCompany, ClaimStatus, InsuranceClaim, VerificationStatus, InsurancePolicy, AffiliateDiscount } from './types';

export const INSURANCE_COMPANIES: InsuranceCompany[] = [
  { id: 'c1', name: 'Bajaj Allianz General Insurance', code: 'BAJAJ_ALLIANZ', mentalHealthCovered: true, typicalCoveragePercent: 80, typicalCopayAmount: 500, avgProcessingDays: 5, supportsRealtimeVerification: true, commissionTier: 3 },
  { id: 'c2', name: 'HDFC ERGO Health Insurance', code: 'HDFC_ERGO', mentalHealthCovered: true, typicalCoveragePercent: 75, typicalCopayAmount: 750, avgProcessingDays: 4, supportsRealtimeVerification: true, commissionTier: 2 },
  { id: 'c3', name: 'Star Health Insurance', code: 'STAR_HEALTH', mentalHealthCovered: true, typicalCoveragePercent: 70, typicalCopayAmount: 900, avgProcessingDays: 7, supportsRealtimeVerification: false, commissionTier: 1 },
  { id: 'c4', name: 'Aditya Birla Health Insurance', code: 'ADITYA_BIRLA', mentalHealthCovered: true, typicalCoveragePercent: 75, typicalCopayAmount: 700, avgProcessingDays: 5, supportsRealtimeVerification: true, commissionTier: 2 },
  { id: 'c5', name: 'Niva Bupa Health Insurance', code: 'NIVA_BUPA', mentalHealthCovered: true, typicalCoveragePercent: 80, typicalCopayAmount: 500, avgProcessingDays: 4, supportsRealtimeVerification: true, commissionTier: 3 },
  { id: 'c6', name: 'Care Health Insurance', code: 'CARE_HEALTH', mentalHealthCovered: true, typicalCoveragePercent: 80, typicalCopayAmount: 600, avgProcessingDays: 6, supportsRealtimeVerification: true, commissionTier: 3 },
  { id: 'c7', name: 'ManipalCigna Health Insurance', code: 'MANIPAL_CIGNA', mentalHealthCovered: true, typicalCoveragePercent: 75, typicalCopayAmount: 650, avgProcessingDays: 3, supportsRealtimeVerification: true, commissionTier: 2 },
  { id: 'c8', name: 'Galaxy Health Insurance', code: 'GALAXY_HEALTH', mentalHealthCovered: true, typicalCoveragePercent: 70, typicalCopayAmount: 800, avgProcessingDays: 5, supportsRealtimeVerification: true, commissionTier: 1 },
  { id: 'c9', name: 'ICICI Lombard General Insurance', code: 'ICICI_LOMBARD', mentalHealthCovered: true, typicalCoveragePercent: 80, typicalCopayAmount: 550, avgProcessingDays: 4, supportsRealtimeVerification: true, commissionTier: 4 },
  { id: 'c10', name: 'Narayana Health Insurance', code: 'NARAYANA_HEALTH', mentalHealthCovered: true, typicalCoveragePercent: 85, typicalCopayAmount: 400, avgProcessingDays: 2, supportsRealtimeVerification: true, commissionTier: 4 },
];

export const PARTNER_IMAGES: Record<string, string> = {
  'c1': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&h=200&auto=format&fit=crop', // Architecture
  'c2': 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&h=200&auto=format&fit=crop', // Office
  'c3': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=400&h=200&auto=format&fit=crop', // Workshop
  'c4': 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=400&h=200&auto=format&fit=crop', // Team
  'c5': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&h=200&auto=format&fit=crop', // Building
  'c6': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/58/Care_Health_Insurance_logo.svg/600px-Care_Health_Insurance_logo.svg.png', // Official Care Health Logo
  'c7': 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=400&h=200&auto=format&fit=crop', // Workplace
  'c8': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&h=200&auto=format&fit=crop', // Storefront
  'c9': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&h=200&auto=format&fit=crop', // Skyscrapers
  'c10': 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?q=80&w=400&h=200&auto=format&fit=crop', // Minimalist
};

export const SEGMENT_DISCOUNTS: Record<string, AffiliateDiscount> = {
  individual: {
    segment: 'individual',
    discount_percent: 20,
    free_sessions: 1,
    free_service: "1 free therapy session (₹1,500 value)",
    product: "10-session therapy package",
    original_price: 15000,
    discounted_price: 12000,
    description: "Unlock prioritized mental wellness support. Personalized care for individuals."
  },
  therapist: {
    segment: 'therapist',
    discount_percent: 15,
    free_sessions: 0,
    free_service: "1 free CE credit course (₹10,000 value)",
    product: "Annual practice management subscription",
    original_price: 50000,
    discounted_price: 42500,
    description: "Empowering mental health professionals with advanced digital tools."
  },
  corporate: {
    segment: 'corporate',
    discount_percent: 15,
    free_sessions: 0,
    free_service: "1 free group wellness session/year (₹50,000 value)",
    product: "Corporate wellness program (per employee/month)",
    original_price: 30,
    discounted_price: 25.50,
    description: "Scalable mental health benefits for your entire workforce."
  },
  education: {
    segment: 'education',
    discount_percent: 20,
    free_sessions: 0,
    free_service: "1 free campus mental health awareness day (₹1L value)",
    product: "Campus mental health program (per student/month)",
    original_price: 15,
    discounted_price: 12,
    description: "Student-centric wellness initiatives for modern educational institutions."
  },
  healthcare: {
    segment: 'healthcare',
    discount_percent: 20,
    free_sessions: 0,
    free_service: "1 free trauma/compassion fatigue workshop/quarter (₹75K value)",
    product: "Healthcare worker wellness program (per employee/month)",
    original_price: 35,
    discounted_price: 28,
    description: "Supporting those who support others. Specialized care for medical staff."
  },
  defense: {
    segment: 'defense',
    discount_percent: 25,
    free_sessions: 0,
    free_service: "1 free peer support group session/quarter (₹25K value)",
    product: "Defense/Police PTSD support (per person/month)",
    original_price: 25,
    discounted_price: 18.75,
    description: "Dedicated PTSD and resilience support for defense and police personnel."
  },
  hni: {
    segment: 'hni',
    discount_percent: 10,
    free_sessions: 0,
    free_service: "₹50,000 wellness retreat voucher (Ananda, Vana, SwaSwara)",
    product: "Premium tier - 10 sessions with top 1% therapists",
    original_price: 50000,
    discounted_price: 45000,
    description: "Exclusive concierge mental health services with global experts."
  }
};

/**
 * Mock policy data used for initial application state.
 */
export const MOCK_POLICIES: InsurancePolicy[] = [
  {
    id: 'p1',
    patientId: 'u1',
    insuranceCompanyId: 'c1',
    policyNumber: 'BAJ-992211',
    memberId: 'MBR-101',
    policyHolderName: 'John Doe',
    relationship: 'self',
    startDate: '2024-01-01',
    verificationStatus: VerificationStatus.VERIFIED,
    sessionsRemaining: 10,
    maxSessionsPerYear: 12,
    copayAmount: 500,
    coveragePercent: 80,
    deductibleAmount: 5000,
    deductibleRemaining: 2500,
    requiresPreAuth: true,
    preAuthObtained: true,
    history: [
      { id: 'h1', timestamp: new Date().toISOString(), event: 'Policy Verified', field: 'verificationStatus', oldValue: 'pending', newValue: 'verified' }
    ]
  },
  {
    id: 'p2',
    patientId: 'u1',
    insuranceCompanyId: 'c2',
    policyNumber: 'HDFC-881122',
    memberId: 'MBR-202',
    policyHolderName: 'John Doe',
    relationship: 'self',
    startDate: '2024-02-15',
    verificationStatus: VerificationStatus.PENDING,
    sessionsRemaining: 12,
    maxSessionsPerYear: 15,
    copayAmount: 750,
    coveragePercent: 75,
    deductibleAmount: 3000,
    deductibleRemaining: 3000,
    requiresPreAuth: false,
    preAuthObtained: false,
    history: []
  }
];

/**
 * Mock claim data used for initial application state.
 */
export const MOCK_CLAIMS: InsuranceClaim[] = [
  {
    id: 'clm1',
    sessionId: 's1',
    claimNumber: 'MANAS360-CLM-2024-1001',
    serviceDate: '2024-01-10',
    serviceType: 'psychotherapy',
    diagnosisCode: 'F41.1',
    procedureCode: '90834',
    billedAmount: 3000,
    approvedAmount: 2400,
    copayAmount: 600,
    insurancePayment: 2400,
    status: ClaimStatus.PAID,
    updatedAt: '2024-01-15',
    appealFiled: false
  },
  {
    id: 'clm2',
    sessionId: 's2',
    claimNumber: 'MANAS360-CLM-2024-1002',
    serviceDate: '2024-01-20',
    serviceType: 'psychotherapy',
    diagnosisCode: 'F32.9',
    procedureCode: '90834',
    billedAmount: 3000,
    status: ClaimStatus.DENIED,
    denialReason: 'Duplicate claim or frequency limit exceeded',
    updatedAt: '2024-01-25',
    appealFiled: false
  },
  {
    id: 'clm3',
    sessionId: 's3',
    claimNumber: 'MANAS360-CLM-2024-1003',
    serviceDate: '2024-02-01',
    serviceType: 'psychotherapy',
    diagnosisCode: 'F41.1',
    procedureCode: '90834',
    billedAmount: 3000,
    status: ClaimStatus.UNDER_REVIEW,
    updatedAt: '2024-02-02',
    appealFiled: false
  }
];
