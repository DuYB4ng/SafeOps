import { IncidentSeverity, IncidentStatus, UserRole } from '@/types';

export const USER_ROLES: Record<UserRole, { label: string; description: string }> = {
  ADMIN: {
    label: 'Quản trị viên',
    description: 'Toàn quyền cấu hình hệ thống, người dùng và báo cáo tổng thể',
  },
  OPERATOR: {
    label: 'Điều phối viên',
    description: 'Tiếp nhận, thẩm định và phân công xử lý các sự cố khẩn cấp',
  },
  SECURITY: {
    label: 'Nhân viên An ninh',
    description: 'Tiếp nhận nhiệm vụ cơ động tại hiện trường, cập nhật xử lý',
  },
  REPORTER: {
    label: 'Người báo cáo',
    description: 'Người dùng gửi phản ánh, báo cáo sự cố qua bản đồ và ảnh',
  },
};

export const INCIDENT_SEVERITY_CONFIG: Record<
  IncidentSeverity,
  {
    label: string;
    color: string;
    badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  CRITICAL: {
    label: 'Khẩn cấp',
    color: 'text-red-500 bg-red-500/10 border-red-500/30',
    badgeVariant: 'destructive',
  },
  HIGH: {
    label: 'Cao',
    color: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
    badgeVariant: 'destructive',
  },
  MEDIUM: {
    label: 'Trung bình',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    badgeVariant: 'secondary',
  },
  LOW: {
    label: 'Thấp',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    badgeVariant: 'outline',
  },
};

export const INCIDENT_STATUS_CONFIG: Record<
  IncidentStatus,
  { label: string; badgeVariant: string }
> = {
  PENDING: { label: 'Chờ tiếp nhận', badgeVariant: 'outline' },
  ASSIGNED: { label: 'Đã phân công', badgeVariant: 'secondary' },
  PROCESSING: { label: 'Đang xử lý', badgeVariant: 'default' },
  RESOLVED: { label: 'Đã giải quyết', badgeVariant: 'outline' },
  CANCELED: { label: 'Đã hủy', badgeVariant: 'destructive' },
};

export const APP_ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    INCIDENTS: '/incidents',
    MAP: '/map',
    DISPATCH: '/dispatch',
    ADMIN: '/admin',
    PROFILE: '/profile',
  },
};
