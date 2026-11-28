'use client';

import { useCallback, useState } from 'react';
import { normalizeVietnameseSearch } from '@/lib/search';
import { distanceMeters } from '@/lib/map/geometry';
import { mapCenter, mapIncidents, mapUnits } from '../fixtures';

export function useOperatorMap() {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [radius, setRadius] = useState('ALL');
  const [tab, setTab] = useState('incidents');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>('map-8921');
  const [mobileView, setMobileView] = useState('map');
  const [showUnits, setShowUnits] = useState(true);
  const query = normalizeVietnameseSearch(search);
  const incidents = mapIncidents.filter(
    (item) =>
      (priority === 'ALL' || item.priority === priority) &&
      (category === 'ALL' || item.category === category) &&
      (status === 'ALL' || item.status === status) &&
      normalizeVietnameseSearch(`${item.code} ${item.title} ${item.location}`).includes(query) &&
      (radius === 'ALL' || distanceMeters(mapCenter, item) <= Number(radius)),
  );
  const units = mapUnits.filter((item) =>
    normalizeVietnameseSearch(`${item.name} ${item.code} ${item.assignment}`).includes(query),
  );
  const selected = incidents.find((item) => item.id === selectedId) ?? null;
  const selectIncident = useCallback((id: string | null) => {
    setSelectedId(id);
    setMobileView('map');
  }, []);
  function updateFilter(
    field: 'search' | 'priority' | 'status' | 'category' | 'radius',
    value: string,
  ) {
    ({
      search: setSearch,
      priority: setPriority,
      status: setStatus,
      category: setCategory,
      radius: setRadius,
    })[field](value);
    setPage(1);
  }
  function resetFilters() {
    setSearch('');
    setPriority('ALL');
    setStatus('ALL');
    setCategory('ALL');
    setRadius('ALL');
    setPage(1);
  }
  return {
    search,
    priority,
    status,
    category,
    radius,
    tab,
    setTab,
    page,
    setPage,
    mobileView,
    setMobileView,
    showUnits,
    setShowUnits,
    incidents,
    units,
    selected,
    selectIncident,
    updateFilter,
    resetFilters,
    pageItems: incidents.slice((page - 1) * 4, page * 4),
    pageCount: Math.max(1, Math.ceil(incidents.length / 4)),
  };
}
