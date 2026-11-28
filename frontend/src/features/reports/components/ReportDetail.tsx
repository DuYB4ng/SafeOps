'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Camera,
  Check,
  ChevronRight,
  Clock3,
  FileText,
  House,
  MapPin,
  MessageSquarePlus,
  Printer,
  Send,
  ShieldCheck,
  Star,
  UsersRound,
  ZoomIn,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EvidenceUploader } from '@/components/common/EvidenceUploader';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { useImageAttachments } from '@/hooks/useImageAttachments';
import type { ReporterReport } from '@/types/reports';
import { reportCategories } from '../fixtures';
import { formatReportTime, reportStatusPresentation } from '../presentation';
import { CampusMap } from './CampusMap';
import { ReportIllustration } from './ReportIllustration';

const timeline = [
  {
    title: 'Báo cáo được tiếp nhận',
    label: 'PENDING',
    detail: 'Thông tin phản ánh được ghi nhận trong hàng đợi của trực ban.',
  },
  {
    title: 'Trực ban xác minh',
    label: 'CONFIRMED',
    detail: 'Kiểm tra nội dung phản ánh và phân loại sự việc.',
  },
  {
    title: 'Phân công lực lượng',
    label: 'ASSIGNED',
    detail: 'Đội phụ trách được điều phối đến khu vực xảy ra sự cố.',
  },
  {
    title: 'Đang xử lý tại hiện trường',
    label: 'PROCESSING',
    detail: 'Lực lượng phối hợp kiểm tra và xử lý tình hình tại vị trí phản ánh.',
  },
  {
    title: 'Hoàn tất xử lý',
    label: 'RESOLVED',
    detail: 'Kết quả xử lý được ghi nhận để người báo cáo theo dõi.',
  },
];

export function ReportDetail({ report }: { report: ReporterReport }) {
  const images = useImageAttachments();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);
  const lightboxTrigger = useRef<HTMLButtonElement | null>(null);
  const [rating, setRating] = useState(0);
  const visualStatus = reportStatusPresentation[report.status];
  const evidenceLabels = [
    'Tủ điện kỹ thuật tại khu vực phản ánh',
    'Hành lang gần vị trí xảy ra sự cố',
    'Chi tiết thiết bị cần kiểm tra',
  ];
  return (
    <div className="reporter-detail">
      <div className="reporter-detail-toolbar">
        <nav className="reporter-breadcrumb" aria-label="Đường dẫn">
          <Link href="/">
            <House size={12} />
            Báo cáo của tôi
          </Link>
          <ChevronRight size={12} />
          <span>Chi tiết phản ánh</span>
        </nav>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            <Printer size={13} />
            In báo cáo
          </Button>
          <Link href="/new">Gửi phản ánh mới</Link>
        </div>
      </div>
      <header className="reporter-detail-title">
        <div>
          <span>PHẢN ÁNH #{report.id}</span>
          <h1>{report.title}</h1>
          <p>
            <Clock3 size={12} />
            Tiếp nhận {formatReportTime(report.receivedAt)} ·{' '}
            {reportCategories.find((item) => item.code === report.category)?.name}
          </p>
        </div>
        <div className="reporter-badge-pair">
          {report.priority && <SeverityBadge priority={report.priority} />}
          <Badge variant={visualStatus.variant}>{visualStatus.label}</Badge>
        </div>
      </header>
      <div className="reporter-operational-note">
        <AlertCircle size={21} />
        <div>
          <strong>
            {report.supplementRequest
              ? 'Cập nhật từ Ban Quản lý · Cần thêm thông tin'
              : 'Thông tin tiến trình xử lý'}
          </strong>
          <p>
            {report.supplementRequest ??
              (report.progress === 4
                ? 'Bộ phận phụ trách đã hoàn tất xử lý phản ánh. Bạn có thể xem lại nội dung và tiến trình bên dưới.'
                : report.unit
                  ? `${report.unit} đang phụ trách phản ánh này. Theo dõi cập nhật tại phần tiến trình xử lý.`
                  : 'Báo cáo đang chờ bộ phận phụ trách tiếp nhận và xác minh thông tin.')}
          </p>
        </div>
      </div>
      <div className="reporter-detail-columns">
        <div className="reporter-column-stack">
          <section className="reporter-panel">
            <h2>
              <FileText size={18} />
              Nội dung phản ánh ban đầu
            </h2>
            <p className="reporter-original-text">{report.description}</p>
            <div className="reporter-report-metadata">
              <div>
                <small>Người tạo</small>
                <strong>Nguyễn Văn An</strong>
              </div>
              <div>
                <small>Kênh tiếp nhận</small>
                <strong>Cổng phản ánh cư dân</strong>
              </div>
              <div>
                <small>Mã báo cáo</small>
                <strong>{report.id}</strong>
              </div>
            </div>
          </section>
          <section className="reporter-panel">
            <h2>
              <Camera size={18} />
              Hình ảnh minh chứng ban đầu <span>3 ảnh minh họa</span>
            </h2>
            <div className="reporter-evidence-gallery">
              {evidenceLabels.map((label, index) => (
                <button
                  type="button"
                  key={label}
                  aria-label={`Mở ảnh minh họa ${index + 1}`}
                  onClick={(event) => {
                    lightboxTrigger.current = event.currentTarget;
                    setLightbox(label);
                  }}
                >
                  <ReportIllustration scene={report.scene} label={label} />
                  <span>{label}</span>
                  <ZoomIn size={16} />
                </button>
              ))}
            </div>
          </section>
          {report.allowedActions.includes('ADD_INFORMATION') && (
            <section className="reporter-panel reporter-supplement-panel" id="supplement">
              <h2>
                <MessageSquarePlus size={18} />
                Phản hồi & bổ sung minh chứng
              </h2>
              <p className="reporter-section-subtitle">
                Cập nhật thêm thông tin liên quan đến báo cáo của bạn.
              </p>
              <div className="reporter-supplement-request">
                <strong>Ban Quản lý đề nghị hỗ trợ:</strong>
                <p>{report.supplementRequest}</p>
              </div>
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  if (note.trim().length < 10) {
                    setError('Vui lòng bổ sung nội dung ít nhất 10 ký tự.');
                    event.currentTarget.querySelector('textarea')?.focus();
                    return;
                  }
                  setError('');
                  setResult(
                    'Nội dung đã được kiểm tra. Chưa gửi bổ sung vì giao diện chưa kết nối API.',
                  );
                }}
              >
                <div className="reporter-field">
                  <Label htmlFor="supplement-note">Nội dung mô tả tình hình bổ sung</Label>
                  <Textarea
                    id="supplement-note"
                    value={note}
                    maxLength={3000}
                    onChange={(event) => {
                      setNote(event.target.value);
                      setError('');
                      setResult('');
                    }}
                    placeholder="Mô tả thêm tình hình hiện tại, những thay đổi bạn quan sát được..."
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'supplement-error' : undefined}
                    required
                  />
                  <small className="reporter-character-count">{note.length}/3000 ký tự</small>
                  {error && (
                    <p className="reporter-form-error" role="alert" id="supplement-error">
                      {error}
                    </p>
                  )}
                </div>
                <EvidenceUploader
                  images={images.images}
                  error={images.error}
                  onFiles={images.addFiles}
                  onRemove={images.removeImage}
                />
                <div className="reporter-supplement-actions">
                  <span>
                    <ShieldCheck size={12} />
                    Nội dung sẽ được kiểm tra trước khi gửi.
                  </span>
                  <Button type="submit">
                    <Send size={14} />
                    Gửi thông tin bổ sung
                  </Button>
                </div>
                {result && (
                  <p className="reporter-form-result" role="status">
                    {result}
                  </p>
                )}
              </form>
            </section>
          )}
        </div>
        <div className="reporter-column-stack">
          <section className="reporter-panel reporter-timeline">
            <h2>
              <Clock3 size={18} />
              Tiến trình xử lý
            </h2>
            <p className="reporter-section-subtitle">Diễn tiến minh họa của báo cáo cá nhân</p>
            <ol>
              {timeline.map((step, index) => (
                <li
                  key={step.label}
                  data-state={
                    index < report.progress
                      ? 'done'
                      : index === report.progress
                        ? 'active'
                        : 'future'
                  }
                >
                  <i>{index < report.progress ? <Check size={13} /> : index + 1}</i>
                  <div>
                    <div>
                      <strong>{step.title}</strong>
                      <small>{step.label}</small>
                    </div>
                    <p>{step.detail}</p>
                    {index === report.progress && report.status !== 'CANCELLED' && (
                      <span className="reporter-timeline-current">
                        {report.progress === 4 ? 'Đã hoàn tất' : 'Cập nhật hiện tại'}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            {report.status === 'CANCELLED' && (
              <p className="reporter-form-error">
                Báo cáo này đã được hủy do trùng nội dung phản ánh trước đó.
              </p>
            )}
          </section>
          <section className="reporter-panel">
            <h2>
              <MapPin size={18} />
              Vị trí & đơn vị phụ trách
            </h2>
            <p className="reporter-detail-location">{report.location}</p>
            <CampusMap point={report} />
            <div className="reporter-assigned-unit">
              <span>
                <UsersRound size={20} />
              </span>
              <div>
                <small>LỰC LƯỢNG PHỤ TRÁCH</small>
                <strong>{report.unit ?? 'Chưa phân công'}</strong>
                <p>Thông tin mẫu do trung tâm cung cấp</p>
              </div>
            </div>
            <div className="reporter-rating">
              <div>
                <strong>Mức độ hài lòng</strong>
                <small>
                  {report.allowedActions.includes('RATE')
                    ? 'Chọn đánh giá mẫu của bạn'
                    : 'Mở khi được phép đánh giá'}
                </small>
              </div>
              <div>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    type="button"
                    key={value}
                    aria-label={`Đánh giá ${value} sao`}
                    aria-pressed={rating === value}
                    disabled={!report.allowedActions.includes('RATE')}
                    onClick={() => {
                      setRating(value);
                      toast.info(`Đã chọn ${value} sao (mẫu)`, {
                        description: 'Chưa gửi đánh giá đến hệ thống.',
                      });
                    }}
                  >
                    <Star size={17} fill={value <= rating ? '#f59e0b' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
      <Dialog
        open={lightbox !== null}
        onOpenChange={(open) => {
          if (!open) setLightbox(null);
        }}
      >
        <DialogContent
          className="reporter-lightbox"
          onCloseAutoFocus={(event) => {
            if (lightboxTrigger.current?.isConnected) {
              event.preventDefault();
              lightboxTrigger.current.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{lightbox}</DialogTitle>
            <DialogDescription>
              Hình minh họa giao diện, không phải ảnh hiện trường thật.
            </DialogDescription>
          </DialogHeader>
          <ReportIllustration scene={report.scene} label={lightbox ?? 'Ảnh minh họa'} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
