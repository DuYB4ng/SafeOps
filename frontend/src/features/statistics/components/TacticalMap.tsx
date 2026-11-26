'use client';

import { useState } from 'react';
import {
  Crosshair,
  Flame,
  Layers3,
  Map,
  Minus,
  Plus,
  Radio,
  ScanLine,
  Shield,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type MapLayer = 'units' | 'sensors' | 'drones';

export function TacticalMap({ onSelectIncident }: { onSelectIncident: () => void }) {
  const [layers, setLayers] = useState<Record<MapLayer, boolean>>({
    units: true,
    sensors: true,
    drones: true,
  });
  const [zoom, setZoom] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  function toggleLayer(layer: MapLayer) {
    setLayers((current) => ({ ...current, [layer]: !current[layer] }));
  }
  return (
    <section className="dashboard-panel tactical-map" id="map" aria-labelledby="map-title">
      <div className="map-panel-header">
        <div className="dashboard-panel-heading">
          <h2 id="map-title">
            <Map size={17} />
            Bản đồ điều hành trực tuyến
          </h2>
          <span className="map-live">
            <span />
            MÔ PHỎNG
          </span>
        </div>
        <p>Theo dõi sự cố, lực lượng và thiết bị theo khu vực.</p>
        <div className="map-layer-controls" aria-label="Lớp hiển thị sơ đồ">
          <span>
            <Layers3 size={13} />
            Lớp bản đồ:
          </span>
          {(
            [
              { id: 'units', label: 'Lực lượng', icon: Shield },
              { id: 'sensors', label: 'Cảm biến', icon: Radio },
              { id: 'drones', label: 'Drone', icon: ScanLine },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant="outline"
              size="sm"
              aria-pressed={layers[id]}
              onClick={() => toggleLayer(id)}
            >
              <Icon size={12} />
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="tactical-canvas" aria-label="Sơ đồ điều hành mô phỏng">
        <div className="map-blueprint" style={{ transform: `scale(${zoom})` }}>
          <svg
            viewBox="0 0 626 340"
            preserveAspectRatio="none"
            className="map-sectors"
            aria-hidden="true"
          >
            <defs>
              <pattern id="tactical-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#cbd5e1" strokeWidth=".5" />
              </pattern>
            </defs>
            <rect width="626" height="340" fill="url(#tactical-grid)" />
            <path
              d="M0 253 Q90 200 125 238 T245 225 T380 265 T626 200 L626 340 L0 340Z"
              fill="#dbeafe"
              opacity=".55"
            />
            <g fill="#e2e8f0" stroke="#b7c3d1" strokeWidth="1">
              <rect x="35" y="50" width="95" height="62" rx="4" />
              <rect x="152" y="43" width="88" height="73" rx="4" />
              <rect x="264" y="52" width="69" height="55" rx="4" />
              <rect x="370" y="36" width="109" height="61" rx="4" />
              <rect x="500" y="48" width="90" height="48" rx="4" />
              <rect x="41" y="149" width="86" height="55" rx="4" />
              <rect x="155" y="153" width="98" height="49" rx="4" />
              <rect x="281" y="142" width="80" height="71" rx="4" />
              <rect x="398" y="141" width="101" height="55" rx="4" />
              <rect x="520" y="130" width="70" height="76" rx="4" />
              <rect x="57" y="265" width="94" height="45" rx="4" />
              <rect x="189" y="257" width="81" height="59" rx="4" />
              <rect x="306" y="266" width="83" height="40" rx="4" />
              <rect x="437" y="264" width="117" height="44" rx="4" />
            </g>
            <g fill="none" stroke="#fff" strokeWidth="12">
              <path d="M0 126 H626 M140 0 V340 M375 0 V340 M0 233 H626" />
            </g>
            <g fill="none" stroke="#c3cdd9" strokeWidth="1.2" strokeDasharray="5 5">
              <path d="M0 126 H626 M140 0 V340 M375 0 V340 M0 233 H626" />
            </g>
            <path
              d="M330 206 L330 126 L260 126"
              fill="none"
              stroke="#004ac6"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <g fill="#7c8b9d" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="600">
              <text x="64" y="30">
                KHU A · TRUNG TÂM
              </text>
              <text x="422" y="118">
                KHU B · CÔNG NGHIỆP
              </text>
              <text x="43" y="251">
                KHU C · VÀNH ĐAI NGOÀI
              </text>
              <text x="393" y="326">
                ĐƯỜNG TUẦN TRA SỐ 2
              </text>
            </g>
          </svg>
          <button
            type="button"
            className="map-threat-pin"
            aria-label="Xem sự cố INC-1024 trên sơ đồ"
            onClick={onSelectIncident}
          >
            <Flame size={16} />
            <span>INC-1024</span>
          </button>
          {layers.units && (
            <>
              <button
                className="map-unit-pin alpha"
                type="button"
                onClick={() => setSelectedUnit('Alpha 1 · Nguyễn Văn A · Đang làm nhiệm vụ')}
              >
                <Shield size={12} />
                Alpha 1
              </button>
              <button
                className="map-unit-pin bravo"
                type="button"
                onClick={() => setSelectedUnit('Bravo 04 · Lê Quốc Huy · Sẵn sàng')}
              >
                <Shield size={12} />
                Bravo 04
              </button>
            </>
          )}
          {layers.drones && (
            <button
              className="map-drone-pin"
              type="button"
              onClick={() => setSelectedUnit('Drone 02 · Đang trinh sát khu vực B')}
            >
              <ScanLine size={12} />
              Drone 02
            </button>
          )}
          {layers.sensors && (
            <button
              className="map-sensor-pin"
              type="button"
              aria-label="Xem cảm biến IOT-B04"
              onClick={() => setSelectedUnit('IOT-B04 · Cảnh báo nhiệt độ tại kho hóa chất')}
            >
              <Radio size={13} />
            </button>
          )}
        </div>
        <div className="map-zoom">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Phóng to sơ đồ"
            disabled={zoom >= 1.6}
            onClick={() => setZoom((current) => Math.min(1.6, current + 0.2))}
          >
            <Plus size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Thu nhỏ sơ đồ"
            disabled={zoom <= 1}
            onClick={() => setZoom((current) => Math.max(1, current - 0.2))}
          >
            <Minus size={15} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Đặt lại sơ đồ"
            onClick={() => {
              setZoom(1);
              setSelectedUnit(null);
            }}
          >
            <Crosshair size={15} />
          </Button>
        </div>
        <span className="map-coordinate">
          <Navigation size={11} />
          Sơ đồ khu vực SOC
        </span>
        <div className="map-legend">
          <span>
            <i className="legend-critical" />
            Sự cố
          </span>
          <span>
            <i className="legend-unit" />
            Lực lượng
          </span>
          <span>
            <i className="legend-sensor" />
            Cảm biến
          </span>
        </div>
        {selectedUnit && (
          <div className="map-unit-detail" role="status">
            {selectedUnit}
            <button
              type="button"
              aria-label="Đóng thông tin sơ đồ"
              onClick={() => setSelectedUnit(null)}
            >
              ×
            </button>
          </div>
        )}
      </div>
      <div className="map-telemetry">
        <span>
          <i />
          05 điểm giám sát mẫu
        </span>
        <span id="units">18/24 lực lượng sẵn sàng</span>
        <a href="#incident-feed">Xem danh sách</a>
      </div>
    </section>
  );
}
