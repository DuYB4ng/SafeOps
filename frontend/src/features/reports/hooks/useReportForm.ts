'use client';

import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import type { GeoPoint, ReportDraft, ReportFormErrors } from '@/types/reports';
import { readReportDraft, saveReportDraft } from '@/services/report-draft.service';
import { locateReporter } from '@/services/geolocation.service';
import { campusBuildings } from '../fixtures';
import { validateReportDraft } from '../validation';

export function useReportForm(initialUrgency?: string) {
  const [values, setValues] = useState<ReportDraft>({
    title: '',
    description: '',
    category: '',
    priority: initialUrgency === 'CRITICAL' ? 'CRITICAL' : 'LOW',
    building: 'landmark',
    location: '',
    latitude: 10.7625,
    longitude: 106.66,
  });
  const [errors, setErrors] = useState<ReportFormErrors>({});
  const [reviewOpen, setReviewOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Vị trí trên sơ đồ đang là vị trí mẫu.');
  const [result, setResult] = useState('');

  function update<K extends keyof ReportDraft>(field: K, value: ReportDraft[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setResult('');
  }
  function selectBuilding(id: string, point?: GeoPoint) {
    const building = campusBuildings.find((item) => item.id === id);
    if (!building) return;
    setValues((current) => ({
      ...current,
      building: id,
      latitude: point?.latitude ?? building.latitude,
      longitude: point?.longitude ?? building.longitude,
    }));
    setGpsMessage('Đã chọn vị trí mẫu trên sơ đồ khuôn viên.');
    setResult('');
  }
  async function locate() {
    setLocating(true);
    setGpsMessage('Đang yêu cầu vị trí từ trình duyệt...');
    try {
      const point = await locateReporter();
      setValues((current) => ({ ...current, ...point }));
      setGpsMessage('Đã lấy tọa độ GPS của thiết bị. Sơ đồ nền vẫn là minh họa.');
    } catch (cause) {
      setGpsMessage(cause instanceof Error ? cause.message : 'Chưa lấy được vị trí.');
    } finally {
      setLocating(false);
    }
  }
  function saveDraft() {
    try {
      saveReportDraft(values);
      toast.success('Đã lưu nháp trong phiên trình duyệt', {
        description: 'Bản nháp không lưu tệp ảnh và chưa gửi đến SOC.',
      });
    } catch {
      toast.error('Trình duyệt chưa cho phép lưu nháp.');
    }
  }
  function restoreDraft() {
    try {
      const draft = readReportDraft();
      if (!draft) {
        toast.info('Chưa có bản nháp hợp lệ trong phiên này.');
        return;
      }
      setValues(draft);
      setErrors({});
      setResult('');
      toast.info('Đã khôi phục nội dung nháp', {
        description: 'Vui lòng chọn lại ảnh minh chứng nếu cần.',
      });
    } catch {
      toast.error('Không thể đọc bản nháp. Bạn vẫn có thể nhập báo cáo mới.');
    }
  }
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateReportDraft(values);
    setErrors(nextErrors);
    setResult('');
    const firstField = (['title', 'description', 'location'] as const).find(
      (key) => nextErrors[key],
    );
    if (firstField) {
      event.currentTarget.querySelector<HTMLElement>(`[name="${firstField}"]`)?.focus();
      return;
    }
    setReviewOpen(true);
  }
  function confirmPreview() {
    setReviewOpen(false);
    setResult(
      'Thông tin đã sẵn sàng. Báo cáo chưa được gửi đến SOC vì giao diện chưa kết nối API.',
    );
  }
  return {
    values,
    errors,
    update,
    selectBuilding,
    locate,
    locating,
    gpsMessage,
    saveDraft,
    restoreDraft,
    handleSubmit,
    reviewOpen,
    setReviewOpen,
    confirmPreview,
    result,
  };
}
