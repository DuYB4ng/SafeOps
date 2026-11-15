import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-zinc-950 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="border-b border-zinc-200 pb-4 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                SafeOps — Design System & UI Components
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Task M0-18: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
              </p>
            </div>
            <Badge variant="default">Sprint 1</Badge>
          </div>
        </header>

        {/* Badges showcase */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            1. Incident Badges
          </h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline">LOW</Badge>
            <Badge variant="secondary">MEDIUM</Badge>
            <Badge variant="default">HIGH</Badge>
            <Badge variant="destructive">CRITICAL</Badge>
          </div>
        </section>

        {/* Buttons showcase */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            2. Buttons
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary Action</Button>
            <Button variant="secondary">Secondary Action</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="destructive">Emergency Alert</Button>
          </div>
        </section>

        {/* Inputs showcase */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            3. Form Inputs
          </h2>
          <div className="max-w-md space-y-2">
            <Input placeholder="Tìm kiếm sự cố an ninh..." />
          </div>
        </section>

        {/* Table showcase */}
        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-100">
            4. Live Incident Dispatch Table
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã sự cố</TableHead>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Mức độ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">INC-2026-001</TableCell>
                <TableCell className="font-medium">Cảnh báo xâm nhập trái phép khu vực A</TableCell>
                <TableCell>
                  <Badge variant="destructive">CRITICAL</Badge>
                </TableCell>
                <TableCell>Đang xử lý</TableCell>
                <TableCell className="text-right">
                  <Button size="xs" variant="outline">
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">INC-2026-002</TableCell>
                <TableCell className="font-medium">
                  Camera an ninh mất tín hiệu hành lang B
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">MEDIUM</Badge>
                </TableCell>
                <TableCell>Chờ điều phối</TableCell>
                <TableCell className="text-right">
                  <Button size="xs" variant="outline">
                    Chi tiết
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </section>
      </div>
    </div>
  );
}
