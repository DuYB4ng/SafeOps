import { ChartNoAxesCombined, Ellipsis } from 'lucide-react';
import { areaBreakdown } from '../fixtures';

export function AreaSummary() {
  return (
    <section className="dashboard-panel area-summary" id="statistics" aria-labelledby="area-title">
      <div className="dashboard-panel-heading">
        <h2 id="area-title">
          <ChartNoAxesCombined size={16} />
          Phân bố sự cố khu vực
        </h2>
        <Ellipsis size={18} aria-hidden="true" />
      </div>
      <div className="area-breakdown">
        {areaBreakdown.map((area) => (
          <div key={area.name}>
            <div className="area-label">
              <span>
                <i style={{ background: area.color }} />
                {area.name}
              </span>
              <strong>
                {area.count}
                <small> · {area.percent}%</small>
              </strong>
            </div>
            <div className="area-track">
              <span style={{ width: `${area.percent}%`, background: area.color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="sla-summary">
        <h3>CHỈ SỐ HIỆU SUẤT VẬN HÀNH (SLA)</h3>
        <div className="sla-rings">
          {[
            { value: 96, label: 'Đúng hạn', color: '#16a34a' },
            { value: 82, label: 'Phản hồi', color: '#004ac6' },
            { value: 75, label: 'Khả dụng', color: '#f59e0b' },
          ].map((item) => (
            <div className="sla-item" key={item.label}>
              <div
                className="sla-ring"
                role="img"
                aria-label={`${item.label}: ${item.value}%`}
                style={{ background: `conic-gradient(${item.color} ${item.value}%, #e2e5f0 0)` }}
              >
                <span>
                  {item.value}
                  <small>%</small>
                </span>
              </div>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
