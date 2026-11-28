import type { ReportDraft } from '@/types/reports';

const draftKey = 'safeops:report-draft:v1';

export function saveReportDraft(draft: ReportDraft) {
  sessionStorage.setItem(draftKey, JSON.stringify(draft));
}

export function readReportDraft(): ReportDraft | null {
  const raw = sessionStorage.getItem(draftKey);
  if (!raw) return null;
  const draft: unknown = JSON.parse(raw);
  if (!draft || typeof draft !== 'object') return null;
  const value = draft as Record<string, unknown>;
  if (
    !['title', 'description', 'building', 'location'].every((key) => typeof value[key] === 'string')
  )
    return null;
  if (
    !['landmark', 'riverside', 'parking'].includes(String(value.building)) ||
    !['', 'FIRE', 'SECURITY', 'MEDICAL', 'INFRASTRUCTURE', 'OTHER'].includes(
      String(value.category),
    ) ||
    !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(String(value.priority))
  )
    return null;
  if (
    typeof value.latitude !== 'number' ||
    !Number.isFinite(value.latitude) ||
    Math.abs(value.latitude) > 90 ||
    typeof value.longitude !== 'number' ||
    !Number.isFinite(value.longitude) ||
    Math.abs(value.longitude) > 180
  )
    return null;
  return value as ReportDraft;
}
