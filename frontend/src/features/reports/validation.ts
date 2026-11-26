import type { ReportDraft, ReportFormErrors } from '@/types/reports';

export function validateReportDraft(values: ReportDraft): ReportFormErrors {
  const errors: ReportFormErrors = {};
  if (values.title.trim().length < 5) errors.title = 'Tiêu đề cần ít nhất 5 ký tự.';
  else if (values.title.trim().length > 200) errors.title = 'Tiêu đề tối đa 200 ký tự.';
  if (values.description.trim().length < 10)
    errors.description = 'Vui lòng mô tả sự cố ít nhất 10 ký tự.';
  else if (values.description.length > 3000) errors.description = 'Mô tả tối đa 3000 ký tự.';
  if (!values.location.trim()) errors.location = 'Vui lòng nhập vị trí chi tiết.';
  else if (values.location.length > 300) errors.location = 'Vị trí tối đa 300 ký tự.';
  return errors;
}
