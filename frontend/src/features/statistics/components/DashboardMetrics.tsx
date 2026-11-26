import { Activity, Clock3, ShieldAlert, UsersRound, TrendingDown, TrendingUp } from 'lucide-react';

const metrics = [
  {
    label: 'SỰ CỐ ĐANG HOẠT ĐỘNG',
    value: '24',
    unit: 'sự cố',
    icon: Activity,
    tone: 'blue',
    trend: '+12%',
    note: 'so với ca trực trước',
    bars: [25, 40, 30, 55, 45, 65, 48, 75, 60, 90, 73, 100],
  },
  {
    label: 'CẢNH BÁO NGHIÊM TRỌNG',
    value: '08',
    unit: 'cảnh báo',
    icon: ShieldAlert,
    tone: 'red',
    trend: 'Ưu tiên xử lý',
    note: '03 sự cố cần xác minh',
    bars: [30, 35, 60, 40, 70, 50, 60, 90, 60, 75, 100, 85],
  },
  {
    label: 'LỰC LƯỢNG SẴN SÀNG',
    value: '18',
    unit: '/ 24 đội',
    icon: UsersRound,
    tone: 'green',
    trend: '75% khả dụng',
    note: '06 đội đang làm nhiệm vụ',
    bars: [55, 65, 60, 80, 65, 85, 75, 80, 90, 85, 95, 90],
  },
  {
    label: 'THỜI GIAN PHẢN HỒI TB',
    value: '04:32',
    unit: 'phút',
    icon: Clock3,
    tone: 'amber',
    trend: '−18%',
    note: 'nhanh hơn ca trực trước',
    bars: [90, 85, 75, 80, 70, 60, 65, 50, 55, 40, 45, 30],
  },
] as const;

export function DashboardMetrics() {
  return (
    <section className="dashboard-metrics" aria-label="Tổng quan ca trực">
      {metrics.map(({ icon: Icon, ...metric }) => (
        <article className="dashboard-metric" key={metric.label} data-tone={metric.tone}>
          <div className="metric-heading">
            <span>{metric.label}</span>
            <span className="metric-icon">
              <Icon size={16} />
            </span>
          </div>
          <div className="metric-value">
            {metric.value}
            <span>{metric.unit}</span>
          </div>
          <div className="metric-bottom">
            <div>
              <strong>
                {metric.tone === 'amber' ? (
                  <TrendingDown size={12} />
                ) : metric.tone === 'blue' ? (
                  <TrendingUp size={12} />
                ) : null}
                {metric.trend}
              </strong>
              <p>{metric.note}</p>
            </div>
            <div className="metric-sparkline" aria-hidden="true">
              {metric.bars.map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
