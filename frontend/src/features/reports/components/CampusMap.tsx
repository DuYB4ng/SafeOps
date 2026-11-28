'use client';

import { useState } from 'react';
import { LocateFixed, MapPin, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GeoPoint } from '@/types/reports';
import { campusBuildings } from '../fixtures';

export function CampusMap({
  point,
  building = 'landmark',
  onSelect,
}: {
  point: GeoPoint;
  building?: string;
  onSelect?: (id: string, point: GeoPoint) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const chosen = campusBuildings.find((item) => item.id === building) ?? campusBuildings[0];
  return (
    <div className="reporter-campus-map" id="campus-map" aria-label="Sơ đồ khuôn viên minh họa">
      <div className="reporter-campus-scene" style={{ transform: `scale(${zoom})` }}>
        <svg viewBox="0 0 500 280" preserveAspectRatio="none" aria-hidden="true">
          <rect width="500" height="280" fill="#e8eef5" />
          <rect x="10" y="10" width="114" height="82" rx="12" fill="#dcfce7" />
          <path d="M132 0V280 M0 214H500" stroke="white" strokeWidth="18" />
          <path d="M132 0V280 M0 214H500" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="6 5" />
          <rect x="355" y="12" width="128" height="90" rx="12" fill="#cbd5e1" stroke="#94a3b8" />
          <rect
            x="150"
            y="80"
            width="185"
            height="124"
            rx="12"
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <rect x="356" y="231" width="127" height="37" rx="10" fill="#dbeafe" stroke="#93c5fd" />
          <text x="22" y="49" fill="#65a30d" fontSize="11">
            CÔNG VIÊN
          </text>
          <text x="242" y="180" textAnchor="middle" fill="#92400e" fontSize="11" fontWeight="600">
            TÒA LANDMARK A1
          </text>
          <text x="418" y="64" textAnchor="middle" fill="#64748b" fontSize="10">
            RIVERSIDE B2
          </text>
          <text x="420" y="254" textAnchor="middle" fill="#3b82f6" fontSize="9">
            HỒ CẢNH QUAN
          </text>
        </svg>
        <span className={`reporter-map-pin pin-${building}`}>
          <MapPin size={22} fill="#dc2626" />
          <small>{chosen.name}</small>
        </span>
      </div>
      {onSelect && (
        <div className="reporter-map-buildings" aria-label="Chọn vị trí trên sơ đồ">
          {campusBuildings.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={building === item.id}
              onClick={() =>
                onSelect(item.id, { latitude: item.latitude, longitude: item.longitude })
              }
            >
              {item.name.split(' (')[0]}
            </button>
          ))}
        </div>
      )}
      <div className="reporter-map-zoom">
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Phóng to sơ đồ"
          disabled={zoom >= 1.6}
          onClick={() => setZoom((current) => Math.min(1.6, current + 0.2))}
        >
          <Plus size={14} />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="outline"
          aria-label="Thu nhỏ sơ đồ"
          disabled={zoom <= 1}
          onClick={() => setZoom((current) => Math.max(1, current - 0.2))}
        >
          <Minus size={14} />
        </Button>
      </div>
      <span className="reporter-map-coordinates">
        <LocateFixed size={11} />
        {point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}
      </span>
      <span className="reporter-map-caption">Sơ đồ minh họa</span>
    </div>
  );
}
