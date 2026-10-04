export type CivicCategory =
  | 'Waterlogging'
  | 'Drainage'
  | 'Drainage & Sanitation'
  | 'Water Supply'
  | 'Waste'
  | 'Road'
  | 'Roads & Infrastructure'
  | 'Streetlight'
  | 'Street Lights'
  | 'Public Washroom'
  | 'Sanitation / Hygiene'
  | 'Public Infrastructure'
  | 'Public Safety'
  | 'Other';

export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ComplaintStatus =
  | 'Draft'
  | 'Pending Offline Sync'
  | 'New'
  | 'Reported'
  | 'AI Analysis'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Overdue'
  | 'Escalated'
  | 'Reopened'
  | 'Closed';

export type FactorRating = 'High' | 'Medium' | 'Low';

export interface SmartPriorityAnalysis {
  priority: PriorityLevel;
  safetyRisk: FactorRating;
  safetyRiskDetails: string;
  peopleAffected: FactorRating;
  peopleAffectedDetails: string;
  duration: string;
  durationLevel: FactorRating;
  publicHealthImpact: FactorRating;
  publicHealthImpactDetails: string;
  relatedComplaints: number;
  recurrenceLevel: FactorRating;
  locationSensitivity: FactorRating;
  locationSensitivityDetails: string;
  aiRecommendation: string;
  score: number;
  calculatedAt?: string;
  determinationPrinciple: string;
}

export interface PriorityFactors {
  severity: string;
  safetyRisk?: FactorRating;
  safetyRiskDetails?: string;
  peopleAffected: string;
  duration: string;
  recurrence: string;
  publicHealthImpact: string;
  safetyImpact: string;
  relatedComplaintsCount?: number;
  locationSensitivity?: FactorRating;
  locationSensitivityDetails?: string;
  aiRecommendation?: string;
  scoreBreakdown?: { factor: string; rating: 'High' | 'Medium' | 'Low'; notes: string }[];
}

export interface TimelineEvent {
  id: string;
  step: string;
  title: string;
  timestamp: string;
  actor: string;
  notes?: string;
  state: 'completed' | 'current' | 'pending' | 'overdue' | 'escalated';
}

export interface EscalationRecord {
  isEscalated: boolean;
  escalationDate?: string;
  overdueDuration?: string;
  originalOfficer: string;
  assignedDepartment: string;
  deadlineSLA: string;
  reason: string;
  higherAuthorityName: string;
  higherAuthorityDesignation: string;
  directiveIssued?: string;
  actionHistory: {
    date: string;
    action: string;
    actor: string;
    notes: string;
  }[];
}

export interface CitizenVerificationRecord {
  status: 'pending_resolution' | 'pending_verification' | 'confirmed_resolved' | 'reopened';
  verifiedAt?: string;
  citizenName?: string;
  feedbackNotes?: string;
  photoProofUrl?: string;
  reopenReason?: string;
}

export interface CivicComplaint {
  id: string;
  title: string;
  description: string;
  photoUrl?: string;
  audioNote?: {
    duration: string;
    transcript: string;
  };
  category: CivicCategory;
  specificProblem: string;
  impact: string;
  location: {
    address: string;
    landmark: string;
    ward: string;
    city: string;
    lat: number;
    lng: number;
  };
  isDraft: boolean;
  capturedAt: string;
  reportedAt?: string;
  priority: PriorityLevel;
  priorityFactors: PriorityFactors;
  smartPriority?: SmartPriorityAnalysis;
  hotspotId?: string;
  hotspotName?: string;
  department: string;
  officerName: string;
  officerContact: string;
  slaDays: number;
  targetResolutionDate: string;
  status: ComplaintStatus;
  isOfflineSynced?: boolean;
  timelineEvents: TimelineEvent[];
  escalation?: EscalationRecord;
  citizenVerification?: CitizenVerificationRecord;
  possibleRootCause?: string;
  upvotes?: number;
  citizenInfo?: {
    name: string;
    contact?: string;
    submittedFrom?: string;
  };
}

export interface CivicHotspot {
  id: string;
  name: string;
  locality: string;
  city: string;
  possibleIssue: string;
  possibleRootCause: string; // Must strictly say "Possible Root Cause"
  relatedReportIds: string[];
  priority: PriorityLevel;
  department: string;
  status: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radiusMeters: number;
  detectedAt: string;
  notes: string;
}

export type AppView =
  | 'home'
  | 'capture'
  | 'drafts'
  | 'my-complaints'
  | 'nearby-map'
  | 'complaint-detail'
  | 'authority'
  | 'higher-authority'
  | 'future-scope'
  | 'pipeline-demo';

export type UserRole = 'citizen' | 'authority';

