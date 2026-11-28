'use client';

import { useState } from 'react';
import { normalizeVietnameseSearch } from '@/lib/search';
import { reporterReports } from '../fixtures';
import { reportStatusFilters } from '../presentation';

export function useReportFilters(initialSearch = '') {
  const [search, setSearch] = useState(initialSearch);
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const dateError = Boolean(startDate && endDate && startDate > endDate);
  const group = reportStatusFilters.find((item) => item.id === status)!;
  const filtered = reporterReports.filter((report) => {
    const date = report.receivedAt.slice(0, 10);
    return (
      !dateError &&
      (status === 'ALL' || group.statuses.includes(report.status)) &&
      (category === 'ALL' || report.category === category) &&
      normalizeVietnameseSearch(`${report.id} ${report.title} ${report.location}`).includes(
        normalizeVietnameseSearch(search),
      ) &&
      (!startDate || date >= startDate) &&
      (!endDate || date <= endDate)
    );
  });
  function changeFilter(
    field: 'search' | 'status' | 'category' | 'startDate' | 'endDate',
    value: string,
  ) {
    ({
      search: setSearch,
      status: setStatus,
      category: setCategory,
      startDate: setStartDate,
      endDate: setEndDate,
    })[field](value);
    setPage(1);
  }
  function resetFilters() {
    setSearch('');
    setStatus('ALL');
    setCategory('ALL');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }
  return {
    search,
    status,
    category,
    startDate,
    endDate,
    page,
    setPage,
    dateError,
    changeFilter,
    resetFilters,
    reports: filtered.slice((page - 1) * 3, page * 3),
    total: filtered.length,
    pageCount: Math.max(1, Math.ceil(filtered.length / 3)),
  };
}
