export type UserRole =
  | 'super_admin'
  | 'technova_admin'
  | 'plant_manager'
  | 'fabrication_manager'
  | 'shop_supervisor'
  | 'plant_engineer'
  | 'technician'
  | 'accounts_finance'
  | 'maintenance_coordinator';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  assignedShops: string[];
  department?: string;
  phone?: string;
  designation?: string;
  status: 'active' | 'inactive';
  photoURL?: string;
  createdAt?: string;
}

export interface Shop {
  id: string;
  code: string;
  name: string;
  area: string;
  active: boolean;
  supervisorName: string;
  targetTAT: number; // in days (e.g. 1.5 days)
  openWorkOrdersCount?: number;
}

export type AssetCondition = 'excellent' | 'good' | 'needs_repair' | 'critical_damage' | 'quarantined_unsafe';
export type OperationalStatus = 'active' | 'under_maintenance' | 'out_of_service' | 'scrapped';
export type SafetyStatus = 'safe' | 'pending_inspection' | 'unsafe_locked';

export interface Asset {
  id: string;
  qrCode: string;
  trolleyNumber: string;
  name: string;
  category: string;
  trolleyType: string;
  shopCode: string;
  location: string;
  partNumber: string;
  dimensions?: string;
  loadCapacityKg?: number;
  condition: AssetCondition;
  operationalStatus: OperationalStatus;
  safetyStatus: SafetyStatus;
  lastMaintenanceDate?: string;
  nextMaintenanceDueDate?: string;
  maintenanceQuarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  assignedSupervisor?: string;
  notes?: string;
}

export type WorkOrderPriority = 'Normal' | 'High' | 'Urgent' | 'Critical';

export type WorkOrderStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Awaiting PE Approval'
  | 'Approved'
  | 'Rejected'
  | 'Assigned'
  | 'Scheduled'
  | 'In Progress'
  | 'On Hold'
  | 'Awaiting Material'
  | 'Awaiting Inspection'
  | 'Rework Required'
  | 'Completed'
  | 'Closed'
  | 'Cancelled';

export type ActivityType =
  | 'Fabrication'
  | 'Welding'
  | 'Painting'
  | 'Cleaning'
  | 'Locking'
  | 'Resting'
  | 'Repair'
  | 'Modification'
  | 'General Maintenance';

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  shopCode: string;
  shopName: string;
  location: string;
  requesterUid: string;
  requesterName: string;
  assetId?: string;
  trolleyNumber?: string;
  trolleyType?: string;
  partNumber?: string;
  jobDescription: string;
  activityType: ActivityType;
  quantity: number;
  unit: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  estimatedCost: number;
  actualCost?: number;
  rateCardCode?: string;
  requiredDate: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  closedAt?: string;
  turnaroundDays?: number;
  assignedTechnicianUids: string[];
  assignedTechnicianNames: string[];
  peRequired: boolean;
  peApproved?: boolean;
  peApprovalNotes?: string;
  peApprovedBy?: string;
  peApprovedAt?: string;
  qualityInspectionPassed?: boolean;
  qualityInspectorName?: string;
  qualityRemarks?: string;
  reworkCount?: number;
  beforePhotoUrls: string[];
  duringPhotoUrls: string[];
  afterPhotoUrls: string[];
  safetyHazardsReported?: string;
  supervisorVerified?: boolean;
  supervisorName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrderLog {
  id: string;
  workOrderId: string;
  action: string;
  statusFrom?: string;
  statusTo?: string;
  remarks: string;
  performedByUid: string;
  performedByName: string;
  performedByRole: string;
  timestamp: string;
}

export interface RateCardItem {
  id: string;
  activityName: string;
  code: string;
  category: string;
  rate: number; // in INR ₹
  unit: string;
  description: string;
  benchmarkExternalVendorRate?: number; // e.g. 2,800 vs Technova 1,900
  effectiveDate: string;
  active: boolean;
}

export interface PreventiveMaintenanceSchedule {
  id: string;
  assetId: string;
  trolleyNumber: string;
  shopCode: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  scheduledDate: string;
  completedDate?: string;
  assignedTeam: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  checklist: {
    item: string;
    status: 'pass' | 'fail' | 'na';
    notes?: string;
  }[];
  technicianRemarks?: string;
  verifiedBySupervisor?: string;
  conditionPostPM?: 'excellent' | 'good' | 'rework_needed';
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
}

export interface ManpowerRecord {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  primarySkill: string;
  certifications: string[];
  assignedShop: string;
  currentShift: 'Shift A (Morning)' | 'Shift B (Evening)' | 'Shift C (Night)' | 'General';
  attendanceStatus: 'Present' | 'On Leave' | 'Overtime' | 'Absent';
  activeWorkOrders: number;
  safetyInducted: boolean;
  contactNumber: string;
  productivityScore?: number;
}

export interface MHEEquipment {
  id: string;
  equipmentCode: string;
  name: string;
  type: 'Forklift' | 'Tow Truck' | 'Hand Pallet Truck (HPT)';
  model: string;
  capacityTons: number;
  shopCode: string;
  currentStatus: 'Operational' | 'Under Service' | 'Breakdown' | 'Decommissioned';
  lastServiceDate?: string;
  nextServiceDueDate?: string;
  downtimeHours: number;
  totalRepairs: number;
  assignedOperator?: string;
  lastBreakdownReason?: string;
}

export interface SafetyIncident {
  id: string;
  incidentNumber: string;
  shopCode: string;
  location: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical Unsafe';
  description: string;
  affectedAssetId?: string;
  actionTaken: string;
  status: 'Open' | 'Investigating' | 'Corrective Action' | 'Resolved & Cleared';
  reportedBy: string;
  reportedAt: string;
  clearedAt?: string;
  ppeComplianceObserved?: boolean;
}

export interface AppNotification {
  id: string;
  recipientUid?: string;
  targetRole?: UserRole;
  title: string;
  message: string;
  type: 'work_order' | 'sla_breach' | 'pe_approval' | 'pm_due' | 'safety_lockout' | 'billing';
  link?: string;
  read: boolean;
  createdAt: string;
  priority?: 'normal' | 'high' | 'critical';
}

export interface AuditLog {
  id: string;
  entityType: 'work_order' | 'asset' | 'pm' | 'rate_card' | 'manpower' | 'safety' | 'mhe';
  entityId: string;
  action: string;
  performedByUid: string;
  performedByName: string;
  performedByRole: string;
  details: string;
  timestamp: string;
}
