export type EstateType = 'residential' | 'office' | 'estate' | 'other';

export interface Estate {
  id: string;
  name: string;
  type: EstateType;
  totalAreaSqm?: number;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  estateId: string;
  name: string;
  buildingCode?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Zone {
  id: string;
  locationId: string;
  name: string;
  floorOrLevel?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

// Dynamic Project Category Item
export interface CategoryItem {
  id: string;
  key: string;
  name: string;
  description?: string;
  colorTag?: string;
  isActive: boolean;
  createdAt: string;
}

// Dynamic Priority Tier Item
export interface PriorityItem {
  id: string;
  key: string;
  name: string;
  level: number; // 1 (lowest) to 4 (VIP urgent)
  colorTag?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

// Dynamic Trade Specialty Entity (Fully Manageable & Non-Hardcoded)
export interface TradeSpecialtyItem {
  id: string;
  key: string;
  name: string;
  category?: 'Finishes' | 'Structure' | 'MEP' | 'Grounds' | 'General' | string;
  description?: string;
  colorTag?: string;
  isActive: boolean;
  createdAt: string;
}

export type TradeSpecialty = string;

export interface Employee {
  id: string;
  externalPwaId: string;
  fullName: string;
  tradeSpecialty: string; // References TradeSpecialtyItem.key or id
  avatarUrl?: string; // Worker photo/avatar
  isDeployable: boolean;
  isActive: boolean;
  currentProjectId?: string | null;
  phoneRestrictedAcknowledged: boolean; // Confirms worker phone restriction protocol
  createdAt: string;
}

export type ProjectCategory = string;
export type ProjectStatus = 'active' | 'paused' | 'awaiting_feedback' | 'stale' | 'completed';
export type PriorityLevel = string;

export interface Project {
  id: string;
  zoneId: string;
  title: string;
  category: ProjectCategory;
  status: ProjectStatus;
  progressPercentage: number;
  currentStageSummary: string;
  priority: PriorityLevel;
  targetStartDate?: string;
  targetCompletionDate?: string;
  lastProgressUpdatedAt: string; // ISO string
  createdAt: string;
  assignedCrewCount?: number;
}

export interface ManpowerAllocation {
  id: string;
  projectId: string;
  employeeId: string;
  assignedDate: string;
  isLead?: boolean;
}

export interface ProjectNote {
  id: string;
  projectId: string;
  noteType: 'vip_instruction' | 'site_feedback' | 'daily_log' | 'delay_warning';
  authorName: string;
  content: string;
  createdAt: string;
}

export type ProposalStatus = 'draft' | 'ready_for_vip' | 'submitted' | 'feedback_received' | 'approved' | 'stale';

export interface ProposalOption {
  id: string;
  proposalId: string;
  optionNumber: number; // 1, 2, 3
  title: string;
  materialsInStock: boolean;
  estimatedTimelineDays: number;
  estimatedManpower: number;
  designPegsReference: string;
  physicalSamplesReady: boolean;
  pros: string;
  cons: string;
  isClientSelected?: boolean;
}

export interface Proposal {
  id: string;
  projectId: string;
  title: string;
  status: ProposalStatus;
  options: ProposalOption[];
  submittedToVipAt?: string;
  followUpDueAt?: string;
  feedbackNotes?: string;
  createdAt: string;
}

export interface QualityGateItem {
  id: string;
  title: string;
  description: string;
  isMandatory: boolean;
  order: number;
  iconName?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChecklistSubmission {
  id: string;
  projectId: string;
  checklistType: 'daily_report' | 'proposal_submission';
  stockVerified?: boolean;
  manpowerAssigned?: boolean;
  timelineConfirmed?: boolean;
  multipleOptionsPresent?: boolean;
  designPegsIncluded?: boolean;
  samplesReferenced?: boolean;
  prosConsCompleted?: boolean;
  checkedItemIds?: string[];
  isFullyCompliant: boolean;
  checkedByName: string;
  submittedAt: string;
}

export interface FilterState {
  searchQuery: string;
  estateId?: string;
  category?: string;
  status?: string;
  sortBy: 'lastUpdated' | 'progress' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

// User & Role Management
export type UserRole = 'admin' | 'supervisor' | 'lead' | 'vip_representative' | 'inspector';

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  department?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// Snapshot & System Backup Management
export interface SnapshotRecordSummary {
  estatesCount: number;
  locationsCount: number;
  zonesCount: number;
  projectsCount: number;
  employeesCount: number;
  proposalsCount: number;
  notesCount: number;
  categoriesCount: number;
  prioritiesCount: number;
  tradesCount: number;
  gatesCount: number;
  usersCount: number;
}

export interface Snapshot {
  id: string;
  label: string;
  notes?: string;
  createdAt: string; // ISO date string
  sizeBytes: number;
  recordsSummary: SnapshotRecordSummary;
  encryptedPayload: string; // Serialized encrypted or structured snapshot string
}

