import React from 'react';
import { CheckCircle2, ShieldCheck, Clock, AlertTriangle, HelpCircle, XCircle } from 'lucide-react';

const STATUS_MAP = {
  ISSUER_CONFIRMED: {
    label: 'Issuer-Confirmed',
    icon: CheckCircle2,
    className: 'status-ISSUER_CONFIRMED',
    tooltip: 'Directly verified or issued by authenticated healthcare institution'
  },
  DIGITALLY_SIGNED_VALIDATED: {
    label: 'Digitally Signed — Signature Validated',
    icon: ShieldCheck,
    className: 'status-DIGITALLY_SIGNED_VALIDATED',
    tooltip: 'Cryptographic digital signature verified with issuer PKI'
  },
  PATIENT_UPLOADED_UNVERIFIED: {
    label: 'Patient-Uploaded — Not Yet Verified',
    icon: HelpCircle,
    className: 'status-PATIENT_UPLOADED_UNVERIFIED',
    tooltip: 'Uploaded by patient; awaiting independent institution validation'
  },
  VERIFICATION_PENDING: {
    label: 'Verification Pending',
    icon: Clock,
    className: 'status-VERIFICATION_PENDING',
    tooltip: 'Verification inquiry dispatched to issuing facility'
  },
  DISCREPANCY_FOUND: {
    label: 'Discrepancy Found',
    icon: AlertTriangle,
    className: 'status-DISCREPANCY_FOUND',
    tooltip: 'Conflicting values or inconsistency identified'
  },
  UNABLE_TO_VERIFY: {
    label: 'Unable to Verify',
    icon: XCircle,
    className: 'status-UNABLE_TO_VERIFY',
    tooltip: 'Issuer uncontactable or no verifiable evidence available (Not necessarily fraudulent)'
  }
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_MAP[status] || STATUS_MAP.PATIENT_UPLOADED_UNVERIFIED;
  const Icon = config.icon;

  return (
    <span className={`status-badge ${config.className}`} title={config.tooltip}>
      <Icon size={13} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
