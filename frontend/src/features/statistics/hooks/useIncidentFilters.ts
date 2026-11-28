'use client';

import { useState } from 'react';
import type { DashboardIncident } from '@/types/incidents';

export function useIncidentFilters(items: readonly DashboardIncident[]) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('ALL');
  const normalizedSearch = search.trim().toLocaleLowerCase('vi');
  const incidents = items.filter(
    (incident) =>
      (priority === 'ALL' || incident.priority === priority) &&
      `${incident.code} ${incident.title} ${incident.location} ${incident.unit ?? ''}`
        .toLocaleLowerCase('vi')
        .includes(normalizedSearch),
  );

  function resetFilters() {
    setSearch('');
    setPriority('ALL');
  }

  return { search, setSearch, priority, setPriority, incidents, resetFilters };
}
