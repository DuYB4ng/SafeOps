'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, Expand, Layers3, LocateFixed, Minus, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { clusterMapIncidents } from '@/lib/map/geometry';
import type { MapIncident, MapUnit } from '@/types/map';
import { mapCenter } from '../fixtures';

type LeafletCanvasProps = {
  incidents: readonly MapIncident[];
  units: readonly MapUnit[];
  showUnits: boolean;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUnitSelect: (id: string) => void;
};

function markerContent(className: string, symbol: string, label?: string) {
  const root = document.createElement('div');
  root.className = className;
  const core = document.createElement('span');
  core.className = 'operator-map-pin-core';
  core.textContent = symbol;
  root.appendChild(core);
  if (label) {
    const caption = document.createElement('span');
    caption.className = 'operator-map-pin-label';
    caption.textContent = label;
    root.appendChild(caption);
  }
  return root;
}

export default function LeafletCanvas({
  incidents,
  units,
  showUnits,
  selectedId,
  onSelect,
  onUnitSelect,
}: LeafletCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [basemap, setBasemap] = useState<'tactical' | 'streets' | 'minimal'>('tactical');
  const [grouped, setGrouped] = useState(true);
  const [zoom, setZoom] = useState(16);
  const [tileFailed, setTileFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      center: [mapCenter.latitude, mapCenter.longitude],
      zoom: 16,
      minZoom: 13,
      maxZoom: 19,
      zoomControl: false,
      scrollWheelZoom: true,
    });
    mapRef.current = map;
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 100 }).addTo(map);
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      map.off('zoomend', onZoom);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer =
      basemap === 'streets'
        ? L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          })
        : L.imageOverlay(
            '/maps/operator-campus.svg',
            [
              [10.754, 106.65],
              [10.771, 106.672],
            ],
            {
              attribution: 'SafeOps · Sơ đồ minh họa',
              className: basemap === 'minimal' ? 'operator-map-light-image' : '',
            },
          );
    const onTileError = () => setTileFailed(true);
    layer.on('tileerror', onTileError);
    layer.addTo(map);
    return () => {
      layer.off('tileerror', onTileError);
      map.removeLayer(layer);
    };
  }, [basemap]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const layer = L.layerGroup().addTo(map);
    function drawMarkers() {
      if (!map) return;
      layer.clearLayers();
      const clusters = clusterMapIncidents(
        incidents,
        (item) => map.latLngToLayerPoint([item.latitude, item.longitude]),
        selectedId,
        grouped && map.getZoom() < 19,
      );
      for (const cluster of clusters) {
        if (cluster.incidents.length > 1) {
          const danger = cluster.incidents.some((item) => item.priority === 'CRITICAL');
          const content = document.createElement('span');
          content.className = danger
            ? 'operator-map-cluster cluster-critical'
            : 'operator-map-cluster';
          content.textContent = String(cluster.incidents.length);
          const center = map.layerPointToLatLng(L.point(cluster.x, cluster.y));
          const marker = L.marker(center, {
            icon: L.divIcon({
              html: content,
              className: 'operator-map-cluster-wrapper',
              iconSize: [44, 44],
              iconAnchor: [22, 22],
            }),
            keyboard: true,
            title: `Mở cụm ${cluster.incidents.length} sự cố`,
          }).addTo(layer);
          marker
            .getElement()
            ?.setAttribute('aria-label', `Mở cụm ${cluster.incidents.length} sự cố`);
          marker.on('click', () => {
            onSelect(null);
            map.fitBounds(
              L.latLngBounds(
                cluster.incidents.map(
                  (item) => [item.latitude, item.longitude] as [number, number],
                ),
              ),
              { padding: [90, 110], maxZoom: 19, animate: false },
            );
          });
        } else {
          const incident = cluster.incidents[0];
          const active = incident.id === selectedId;
          const icon = L.divIcon({
            html: markerContent(
              `operator-map-incident-pin priority-${incident.priority.toLowerCase()}${active ? ' is-selected' : ''}`,
              incident.priority === 'CRITICAL' ? '!' : '•',
              active || !incident.clusterable ? `#${incident.code}` : undefined,
            ),
            className: 'operator-map-icon',
            iconSize: [34, 34],
            iconAnchor: [17, 17],
          });
          const marker = L.marker([incident.latitude, incident.longitude], {
            icon,
            keyboard: true,
            title: `Sự cố ${incident.code}`,
            zIndexOffset: active ? 1000 : 0,
            riseOnHover: true,
          }).addTo(layer);
          marker.getElement()?.setAttribute('aria-label', `Sự cố ${incident.code}`);
          marker.on('click', () => onSelect(incident.id));
        }
      }
      if (showUnits)
        for (const unit of units) {
          const icon = L.divIcon({
            html: markerContent(
              `operator-map-unit-pin status-${unit.status.toLowerCase()}`,
              'S',
              unit.name,
            ),
            className: 'operator-map-icon',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });
          const marker = L.marker([unit.latitude, unit.longitude], {
            icon,
            keyboard: true,
            title: `Lực lượng ${unit.name}`,
          }).addTo(layer);
          marker.getElement()?.setAttribute('aria-label', `Lực lượng ${unit.name}`);
          marker.on('click', () => onUnitSelect(unit.id));
        }
    }
    drawMarkers();
    map.on('zoomend moveend', drawMarkers);
    return () => {
      map.off('zoomend moveend', drawMarkers);
      map.removeLayer(layer);
    };
  }, [incidents, units, showUnits, selectedId, grouped, onSelect, onUnitSelect]);

  useEffect(() => {
    const map = mapRef.current;
    const incident = incidents.find((item) => item.id === selectedId);
    if (!map || !incident) return;
    function keepSelectedVisible() {
      if (!map || !incident) return;
      const size = map.getSize();
      if (!size.x || !size.y) return;
      const container = map.getContainer();
      const bounds = container.getBoundingClientRect();
      const summary = container
        .closest('.operator-map-stage')
        ?.querySelector('.operator-map-summary');
      const summaryBounds = summary?.getBoundingClientRect();
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const paddingRight = !mobile && summaryBounds ? bounds.right - summaryBounds.left + 36 : 36;
      const paddingBottom = mobile && summaryBounds ? bounds.bottom - summaryBounds.top + 36 : 100;
      const point: L.LatLngExpression = [incident.latitude, incident.longitude];
      if (!map.getBounds().contains(point))
        map.setView(point, Math.max(16, map.getZoom()), { animate: false });
      map.panInside(point, {
        paddingTopLeft: [36, 130],
        paddingBottomRight: [paddingRight, paddingBottom],
        animate: false,
      });
    }
    keepSelectedVisible();
    map.on('resize', keepSelectedVisible);
    return () => {
      map.off('resize', keepSelectedVisible);
    };
  }, [selectedId, incidents]);

  function chooseBasemap(value: typeof basemap) {
    setTileFailed(false);
    setBasemap(value);
  }
  function fitIncidents() {
    const map = mapRef.current;
    if (!map) return;
    if (!incidents.length) {
      map.setView([mapCenter.latitude, mapCenter.longitude], 16);
      return;
    }
    map.fitBounds(
      L.latLngBounds(incidents.map((item) => [item.latitude, item.longitude] as [number, number])),
      {
        paddingTopLeft: [30, 110],
        paddingBottomRight: [selectedId && map.getSize().x >= 600 ? 360 : 30, 100],
        maxZoom: 17,
        animate: false,
      },
    );
  }
  async function fullscreen() {
    try {
      const target = containerRef.current?.closest('.operator-map-stage');
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (target?.requestFullscreen) await target.requestFullscreen();
      else toast.info('Trình duyệt chưa hỗ trợ toàn màn hình.');
    } catch {
      toast.info('Chưa thể chuyển sang toàn màn hình.');
    }
  }

  return (
    <div className="operator-map-leaflet-wrapper" data-basemap={basemap}>
      <div
        ref={containerRef}
        className="operator-map-leaflet"
        role="region"
        aria-label="Bản đồ Leaflet điều hành"
        data-testid="operator-leaflet-map"
      />
      {tileFailed && basemap === 'streets' && (
        <p className="operator-map-tile-error" role="status">
          Chưa tải được nền đường phố.{' '}
          <button type="button" onClick={() => chooseBasemap('tactical')}>
            Dùng sơ đồ chiến thuật
          </button>
        </p>
      )}
      <div className="operator-map-canvas-controls">
        <div className="operator-map-basemaps" aria-label="Nền bản đồ">
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={basemap === 'tactical'}
            onClick={() => chooseBasemap('tactical')}
          >
            Chiến thuật
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={basemap === 'streets'}
            onClick={() => chooseBasemap('streets')}
          >
            Đường phố
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-pressed={basemap === 'minimal'}
            onClick={() => chooseBasemap('minimal')}
          >
            Tối giản
          </Button>
        </div>
        <div className="operator-map-control-column">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Phóng to bản đồ"
            onClick={() => mapRef.current?.zoomIn()}
            disabled={zoom >= 19}
          >
            <Plus size={17} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Thu nhỏ bản đồ"
            onClick={() => mapRef.current?.zoomOut()}
            disabled={zoom <= 13}
          >
            <Minus size={17} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Xem toàn bộ sự cố" onClick={fitIncidents}>
            <Crosshair size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Về tâm khu vực"
            onClick={() => mapRef.current?.setView([mapCenter.latitude, mapCenter.longitude], 16)}
          >
            <LocateFixed size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toàn màn hình bản đồ"
            onClick={fullscreen}
          >
            <Expand size={15} />
          </Button>
        </div>
      </div>
      <Button
        className="operator-map-cluster-toggle"
        size="sm"
        variant="outline"
        aria-pressed={grouped}
        onClick={() => setGrouped((current) => !current)}
      >
        <Layers3 size={12} />
        Gom cụm
      </Button>
      <span className="operator-map-zoom-readout" data-testid="map-zoom-level">
        Zoom {zoom}
      </span>
    </div>
  );
}
