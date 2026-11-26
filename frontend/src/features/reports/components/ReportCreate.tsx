'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Building2,
  Camera,
  Check,
  ChevronRight,
  ClipboardList,
  FileText,
  House,
  Info,
  LocateFixed,
  MapPin,
  Save,
  Send,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { EvidenceUploader } from '@/components/common/EvidenceUploader';
import { useImageAttachments } from '@/hooks/useImageAttachments';
import type { IncidentPriority } from '@/types/enums';
import type { ReportCategory } from '@/types/reports';
import { campusBuildings, reportCategories } from '../fixtures';
import { useReportForm } from '../hooks/useReportForm';
import { CampusMap } from './CampusMap';

const priorities: readonly { value: IncidentPriority; label: string }[] = [
  { value: 'LOW', label: 'Bình thường' },
  { value: 'MEDIUM', label: 'Cần chú ý' },
  { value: 'HIGH', label: 'Khẩn cấp' },
  { value: 'CRITICAL', label: 'Nguy cấp' },
];

export function ReportCreate({ initialUrgency }: { initialUrgency?: string }) {
  const form = useReportForm(initialUrgency);
  const attachments = useImageAttachments();
  const critical = form.values.priority === 'CRITICAL';
  const building = campusBuildings.find((item) => item.id === form.values.building)!;
  return (
    <div className="reporter-create">
      <div className="reporter-friendly-guide">
        <Info size={15} />
        <p>
          <strong>Hướng dẫn gửi phản ánh:</strong> Mô tả rõ sự việc, chọn vị trí và bổ sung ảnh khi
          bạn ở nơi an toàn.
        </p>
      </div>
      <nav className="reporter-breadcrumb" aria-label="Đường dẫn">
        <Link href="/reports">
          <House size={12} />
          Báo cáo của tôi
        </Link>
        <ChevronRight size={12} />
        <span>Tạo báo cáo</span>
      </nav>
      <div className="reporter-page-title">
        <div>
          <h1>Gửi phản ánh, cùng giữ gìn an toàn</h1>
          <p>Thông tin của bạn giúp Ban Quản lý tiếp nhận và hỗ trợ đúng khu vực.</p>
        </div>
        <Button type="button" variant="outline" onClick={form.restoreDraft}>
          <Save size={13} />
          Khôi phục nháp
        </Button>
      </div>
      <form onSubmit={form.handleSubmit} noValidate>
        <div className="reporter-form-columns">
          <div className="reporter-column-stack">
            <section className="reporter-panel">
              <h2>
                <span className="reporter-step">1</span>Thông tin phản ánh
                <ClipboardList size={17} />
              </h2>
              <div className="reporter-field">
                <Label htmlFor="report-title">
                  Tiêu đề sự cố <span>*</span>
                </Label>
                <div className="reporter-icon-input">
                  <FileText size={16} />
                  <Input
                    id="report-title"
                    name="title"
                    value={form.values.title}
                    onChange={(event) => form.update('title', event.target.value)}
                    maxLength={200}
                    required
                    placeholder="Ví dụ: Phát hiện khói tại hộp kỹ thuật tầng 12"
                    aria-invalid={Boolean(form.errors.title)}
                    aria-describedby={form.errors.title ? 'report-title-error' : undefined}
                  />
                </div>
                {form.errors.title && (
                  <p className="reporter-form-error" id="report-title-error">
                    {form.errors.title}
                  </p>
                )}
              </div>
              <div className="reporter-field">
                <Label htmlFor="report-category">
                  Danh mục phản ánh <small>(nếu biết)</small>
                </Label>
                <Select
                  value={form.values.category || 'UNSURE'}
                  onValueChange={(value) =>
                    form.update('category', value === 'UNSURE' ? '' : (value as ReportCategory))
                  }
                >
                  <SelectTrigger id="report-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNSURE">Chưa xác định loại sự cố</SelectItem>
                    {reportCategories.map((item) => (
                      <SelectItem value={item.code} key={item.code}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <fieldset className="reporter-priority-field">
                <legend>
                  Mức độ bạn cần hỗ trợ <small>· Đề xuất ban đầu</small>
                </legend>
                <div>
                  {priorities.map((item) => (
                    <label key={item.value}>
                      <input
                        type="radio"
                        name="suggested-priority"
                        value={item.value}
                        checked={form.values.priority === item.value}
                        onChange={() => form.update('priority', item.value)}
                        className="sr-only"
                      />
                      <SeverityBadge priority={item.value} />
                      <small>{item.label}</small>
                    </label>
                  ))}
                </div>
                <p>Trực ban sẽ xác minh và phân loại mức độ chính thức.</p>
              </fieldset>
              {critical && (
                <div className="reporter-critical-note">
                  <AlertTriangle size={18} />
                  <p>
                    <strong>Bạn đang chọn mức hỗ trợ nguy cấp.</strong> Ưu tiên ở vị trí an toàn.
                    Giao diện này chưa phát cảnh báo đến lực lượng.
                  </p>
                </div>
              )}
              <div className="reporter-field">
                <Label htmlFor="report-description">
                  Chi tiết sự cố / Ghi chú cho Ban Quản lý <span>*</span>
                </Label>
                <Textarea
                  id="report-description"
                  name="description"
                  value={form.values.description}
                  onChange={(event) => form.update('description', event.target.value)}
                  maxLength={3000}
                  required
                  placeholder="Sự việc xảy ra khi nào? Bạn quan sát thấy điều gì? Khu vực nào đang bị ảnh hưởng?"
                  aria-invalid={Boolean(form.errors.description)}
                  aria-describedby={
                    form.errors.description ? 'report-description-error' : undefined
                  }
                />
                <small className="reporter-character-count">
                  {form.values.description.length}/3000 ký tự
                </small>
                {form.errors.description && (
                  <p id="report-description-error" className="reporter-form-error">
                    {form.errors.description}
                  </p>
                )}
              </div>
            </section>
            <section className="reporter-panel">
              <h2>
                <span className="reporter-step">2</span>Hình ảnh minh chứng
                <Camera size={17} />
              </h2>
              <EvidenceUploader
                images={attachments.images}
                error={attachments.error}
                onFiles={attachments.addFiles}
                onRemove={attachments.removeImage}
              />
            </section>
          </div>
          <section className="reporter-panel reporter-location-panel" id="location">
            <h2>
              <span className="reporter-step">3</span>Vị trí xảy ra
              <MapPin size={17} />
            </h2>
            <Button
              type="button"
              className="reporter-gps-button"
              onClick={form.locate}
              disabled={form.locating}
            >
              <LocateFixed size={17} />
              {form.locating ? 'Đang lấy vị trí...' : 'Lấy vị trí hiện tại của tôi'}
            </Button>
            <p className="reporter-gps-message" role="status">
              {form.gpsMessage}
            </p>
            <div className="reporter-building-fields">
              <div className="reporter-field">
                <Label htmlFor="report-building">Chọn tòa nhà / phân khu</Label>
                <Select
                  value={form.values.building}
                  onValueChange={(value) => form.selectBuilding(value)}
                >
                  <SelectTrigger id="report-building">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {campusBuildings.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="reporter-field">
                <Label htmlFor="report-location">
                  Tầng / Vị trí chi tiết <span>*</span>
                </Label>
                <div className="reporter-icon-input">
                  <Building2 size={15} />
                  <Input
                    id="report-location"
                    name="location"
                    value={form.values.location}
                    onChange={(event) => form.update('location', event.target.value)}
                    maxLength={300}
                    required
                    placeholder="Ví dụ: Tầng 12, gần cửa thang bộ số 2"
                    aria-invalid={Boolean(form.errors.location)}
                    aria-describedby={form.errors.location ? 'report-location-error' : undefined}
                  />
                </div>
                {form.errors.location && (
                  <p className="reporter-form-error" id="report-location-error">
                    {form.errors.location}
                  </p>
                )}
              </div>
            </div>
            <CampusMap
              point={form.values}
              building={form.values.building}
              onSelect={form.selectBuilding}
            />
            <div className="reporter-reassurance">
              <ShieldCheck size={28} />
              <div>
                <strong>Đúng vị trí, hỗ trợ nhanh hơn</strong>
                <p>
                  Vị trí chi tiết giúp đội phụ trách tiếp cận và xác minh sự việc thuận tiện hơn.
                </p>
              </div>
            </div>
          </section>
        </div>
        <div className="reporter-action-dock">
          <Link href="/reports">Quay lại</Link>
          <div>
            <Button type="button" variant="outline" onClick={form.saveDraft}>
              <Save size={15} />
              Lưu nháp
            </Button>
            <Button type="submit" className={critical ? 'reporter-submit-critical' : ''}>
              {critical ? <Siren size={17} /> : <Send size={16} />}
              {critical ? 'Kiểm tra phản ánh khẩn cấp' : 'Kiểm tra & gửi phản ánh'}
            </Button>
          </div>
        </div>
        {form.result && (
          <p className="reporter-form-result" role="status">
            <Check size={17} />
            {form.result}
          </p>
        )}
      </form>
      <Dialog open={form.reviewOpen} onOpenChange={form.setReviewOpen}>
        <DialogContent className="reporter-review-dialog">
          <DialogHeader>
            <DialogTitle>Kiểm tra thông tin phản ánh</DialogTitle>
            <DialogDescription>
              Bản xem thử chưa kết nối API. Xác nhận tại đây không gửi báo cáo đến SOC.
            </DialogDescription>
          </DialogHeader>
          <div className="reporter-review">
            <h3>{form.values.title}</h3>
            <SeverityBadge priority={form.values.priority} />
            <p>{form.values.description}</p>
            <dl>
              <dt>Vị trí</dt>
              <dd>
                {building.name} · {form.values.location}
              </dd>
              <dt>Tọa độ</dt>
              <dd>
                {form.values.latitude.toFixed(5)}, {form.values.longitude.toFixed(5)}
              </dd>
              <dt>Ảnh đính kèm</dt>
              <dd>{attachments.images.length} ảnh đã chọn, chưa tải lên</dd>
            </dl>
          </div>
          <Button onClick={form.confirmPreview}>Xác nhận bản xem thử</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
