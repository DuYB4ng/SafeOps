'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ClipboardList,
  FilePlus2,
  Flame,
  MapPin,
  RefreshCcw,
  Search,
  ShieldCheck,
  Siren,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SeverityBadge } from '@/components/common/SeverityBadge';
import { useReportFilters } from '../hooks/useReportFilters';
import { reporterReports, reportCategories } from '../fixtures';
import { formatReportTime, reportStatusFilters, reportStatusPresentation } from '../presentation';
import { ReportIllustration } from './ReportIllustration';

export function ReporterHome({ initialSearch = '' }: { initialSearch?: string }) {
  const filters = useReportFilters(initialSearch);
  const stats = [
    {
      label: 'Tổng báo cáo đã gửi',
      value: reporterReports.length,
      note: 'Báo cáo cá nhân trong dữ liệu mẫu',
      icon: ClipboardList,
      tone: 'blue',
    },
    {
      label: 'Chờ xác minh',
      value: reporterReports.filter((item) => ['NEW', 'CONFIRMED'].includes(item.status)).length,
      note: 'Đang chờ bộ phận phụ trách tiếp nhận',
      icon: Clock3,
      tone: 'amber',
    },
    {
      label: 'Đang xử lý',
      value: reporterReports.filter((item) => ['DISPATCHED', 'IN_PROGRESS'].includes(item.status))
        .length,
      note: 'Đã phân công lực lượng',
      icon: ShieldCheck,
      tone: 'indigo',
    },
    {
      label: 'Đã giải quyết',
      value: reporterReports.filter((item) => ['RESOLVED', 'CLOSED'].includes(item.status)).length,
      note: 'Cảm ơn bạn đã đồng hành cùng BQL',
      icon: CheckCheck,
      tone: 'green',
    },
  ];
  return (
    <div className="reporter-home">
      <section className="reporter-hero">
        <div>
          <span className="reporter-hero-eyebrow">
            <ShieldCheck size={14} />
            AN TOÀN BẮT ĐẦU TỪ BẠN
          </span>
          <h1>
            Phát hiện sự cố?
            <br />
            Hãy cho chúng tôi biết.
          </h1>
          <p>
            Mỗi phản ánh của bạn giúp cộng đồng được bảo vệ tốt hơn.
            <br />
            Ban Quản lý luôn sẵn sàng tiếp nhận thông tin.
          </p>
          <div>
            <Link className="reporter-hero-primary" href="/reports/new?urgency=CRITICAL">
              <Siren size={19} />
              Báo cáo sự cố khẩn cấp
            </Link>
            <Link className="reporter-hero-secondary" href="/reports/new">
              <FilePlus2 size={16} />
              Gửi phản ánh khác
            </Link>
          </div>
        </div>
        <div className="reporter-hero-visual" aria-hidden="true">
          <div>
            <ShieldCheck size={92} strokeWidth={1.3} />
          </div>
          <span>
            <CheckCheck size={15} />
            CÙNG BẢO VỆ CỘNG ĐỒNG
          </span>
        </div>
      </section>
      <section className="reporter-stats" aria-label="Thống kê báo cáo cá nhân">
        {stats.map(({ icon: Icon, ...item }) => (
          <article key={item.label} data-tone={item.tone}>
            <div>
              <span>{item.label}</span>
              <i>
                <Icon size={18} />
              </i>
            </div>
            <strong>{item.value.toString().padStart(2, '0')}</strong>
            <p>{item.note}</p>
          </article>
        ))}
      </section>
      <section className="reporter-filters" aria-label="Bộ lọc báo cáo">
        <div className="reporter-status-tabs">
          {reportStatusFilters.map((group) => (
            <Button
              key={group.id}
              variant="ghost"
              aria-pressed={filters.status === group.id}
              onClick={() => filters.changeFilter('status', group.id)}
            >
              {group.label}
              <span>
                {group.id === 'ALL'
                  ? reporterReports.length
                  : reporterReports.filter((item) => group.statuses.includes(item.status)).length}
              </span>
            </Button>
          ))}
        </div>
        <div className="reporter-filter-controls">
          <div className="reporter-search">
            <Search size={15} />
            <Input
              aria-label="Tìm báo cáo của tôi"
              value={filters.search}
              onChange={(event) => filters.changeFilter('search', event.target.value)}
              placeholder="Tìm mã số, tiêu đề, vị trí (không dấu)..."
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => filters.changeFilter('category', value)}
          >
            <SelectTrigger aria-label="Loại sự cố">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tất cả loại sự cố</SelectItem>
              {reportCategories.map((item) => (
                <SelectItem key={item.code} value={item.code}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            aria-label="Từ ngày"
            value={filters.startDate}
            onChange={(event) => filters.changeFilter('startDate', event.target.value)}
          />
          <Input
            type="date"
            aria-label="Đến ngày"
            value={filters.endDate}
            onChange={(event) => filters.changeFilter('endDate', event.target.value)}
          />
          <Button
            variant="outline"
            size="icon"
            aria-label="Đặt lại bộ lọc báo cáo"
            onClick={filters.resetFilters}
          >
            <RefreshCcw size={15} />
          </Button>
        </div>
        {filters.dateError && (
          <p className="reporter-form-error" role="alert">
            Ngày bắt đầu cần trước hoặc bằng ngày kết thúc.
          </p>
        )}
      </section>
      <section id="my-reports" aria-labelledby="my-reports-title">
        <div className="reporter-list-heading">
          <h2 id="my-reports-title">
            Báo cáo của tôi <span>{filters.total}</span>
          </h2>
          <p>Theo dõi tiến trình xử lý phản ánh của bạn</p>
        </div>
        {filters.reports.length ? (
          <div className="reporter-card-grid">
            {filters.reports.map((report) => {
              const visualStatus = reportStatusPresentation[report.status];
              return (
                <article
                  className="reporter-report-card"
                  key={report.id}
                  data-needs-info={Boolean(report.supplementRequest)}
                >
                  <Link
                    className="reporter-card-image"
                    href={`/reports/${report.id}`}
                    aria-label={`Xem chi tiết ${report.id}`}
                  >
                    <ReportIllustration
                      scene={report.scene}
                      label={`Ảnh minh họa cho ${report.title}`}
                    />
                    <span>
                      <Flame size={12} />
                      {report.id}
                    </span>
                  </Link>
                  <div className="reporter-card-title">
                    <small>
                      {reportCategories.find((item) => item.code === report.category)?.name}
                    </small>
                    <h3>
                      <Link href={`/reports/${report.id}`}>{report.title}</Link>
                    </h3>
                  </div>
                  <div className="reporter-badge-pair">
                    {report.priority ? (
                      <SeverityBadge priority={report.priority} />
                    ) : (
                      <span className="reporter-unclassified">Chờ phân loại</span>
                    )}
                    <Badge variant={visualStatus.variant}>{visualStatus.label}</Badge>
                  </div>
                  <div
                    className="reporter-card-message"
                    data-kind={
                      report.supplementRequest ? 'request' : report.progress === 4 ? 'done' : 'unit'
                    }
                  >
                    {report.supplementRequest ? (
                      <>
                        <AlertTriangle size={16} />
                        <p>
                          <strong>Cần bổ sung minh chứng</strong>Ban Quản lý đề nghị bạn cập nhật
                          thêm thông tin.
                        </p>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <p>
                          <strong>
                            {report.progress === 4
                              ? 'Đã hoàn tất xử lý'
                              : (report.unit ?? 'Đang chờ xác minh')}
                          </strong>
                          {report.progress === 4
                            ? 'Bạn có thể xem lại kết quả và tiến trình.'
                            : report.unit
                              ? 'Lực lượng đang phối hợp xử lý.'
                              : 'Trực ban sẽ kiểm tra thông tin phản ánh.'}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="reporter-card-meta">
                    <span>
                      <MapPin size={12} />
                      {report.location}
                    </span>
                    <span>
                      <Clock3 size={12} />
                      {formatReportTime(report.receivedAt)}
                    </span>
                  </div>
                  <footer>
                    <Link href={`/reports/${report.id}`}>
                      Xem chi tiết & tiến trình
                      <ArrowUpRight size={13} />
                    </Link>
                    {report.allowedActions.includes('ADD_INFORMATION') && (
                      <Link
                        className="reporter-supplement-link"
                        href={`/reports/${report.id}#supplement`}
                      >
                        Bổ sung ngay
                      </Link>
                    )}
                  </footer>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="reporter-empty">
            <Search size={30} />
            <h3>Không tìm thấy báo cáo phù hợp</h3>
            <p>Thử thay đổi từ khóa, trạng thái hoặc khoảng ngày.</p>
            <Button variant="outline" onClick={filters.resetFilters}>
              Xóa bộ lọc báo cáo
            </Button>
          </div>
        )}
        <div className="reporter-pagination">
          <p>
            Hiển thị {filters.total ? (filters.page - 1) * 3 + 1 : 0}–
            {Math.min(filters.page * 3, filters.total)} trong {filters.total} báo cáo
          </p>
          <div>
            <Button
              variant="outline"
              disabled={filters.page === 1}
              onClick={() => filters.setPage((page) => page - 1)}
            >
              <ChevronLeft size={13} />
              Trước
            </Button>
            {Array.from({ length: filters.pageCount }, (_, i) => (
              <Button
                key={i}
                variant={filters.page === i + 1 ? 'default' : 'ghost'}
                aria-label={`Trang báo cáo ${i + 1}`}
                aria-current={filters.page === i + 1 ? 'page' : undefined}
                onClick={() => filters.setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              disabled={filters.page === filters.pageCount}
              onClick={() => filters.setPage((page) => page + 1)}
            >
              Sau
              <ChevronRight size={13} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
