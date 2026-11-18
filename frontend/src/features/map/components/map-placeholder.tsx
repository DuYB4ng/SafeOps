'use client';

import * as React from 'react';
import { Compass, MapPin } from 'lucide-react';

export function MapPlaceholder() {
  return (
    <div className="flex h-[450px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
      <div className="rounded-full bg-primary/10 p-4 text-primary mb-3">
        <Compass className="h-8 w-8 animate-spin" style={{ animationDuration: '8s' }} />
      </div>
      <h3 className="text-base font-semibold text-foreground">Bản đồ Trực chiến Tác chiến</h3>
      <p className="max-w-md text-xs text-muted-foreground mt-1">
        Tích hợp Leaflet / Mapbox hiển thị vị trí camera giám sát, cảm biến IoT HazNode và vị trí
        đội phản ứng nhanh theo thời gian thực (Milestone M3).
      </p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-4 w-4 text-destructive" />
        <span>Tọa độ trung tâm: Tòa nhà Trụ sở G-Tel</span>
      </div>
    </div>
  );
}
