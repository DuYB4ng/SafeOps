'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity,
  ClipboardCheck,
  Headphones,
  LockKeyhole,
  RadioTower,
  Shield,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const features = [
  {
    icon: RadioTower,
    tone: 'blue',
    title: 'Giám sát sự cố theo thời gian thực',
    description:
      'Tiếp nhận cảnh báo từ nhiều nguồn, theo dõi tình hình và nắm bắt diễn biến trên một màn hình tập trung.',
  },
  {
    icon: ShieldCheck,
    tone: 'amber',
    title: 'Điều phối lực lượng nhanh chóng',
    description:
      'Kết nối trung tâm điều hành với lực lượng hiện trường, phối hợp xử lý và theo dõi tiến độ từng sự cố.',
  },
  {
    icon: UsersRound,
    tone: 'indigo',
    title: 'Một nền tảng, phối hợp mọi vai trò',
    description:
      'Phân quyền rõ ràng cho từng vị trí, lưu vết hoạt động và đồng hành xuyên suốt quy trình xử lý.',
  },
] as const;

export function AuthShell({ children }: { children: ReactNode }) {
  const [supportOpen, setSupportOpen] = useState(false);
  const supportTrigger = useRef<HTMLButtonElement>(null);
  return (
    <div className="auth-shell">
      <a className="auth-skip" href="#auth-form">
        Đến biểu mẫu tài khoản
      </a>
      <header className="auth-topbar">
        <Link href="/" className="auth-brand">
          <span>
            <Shield size={19} />
          </span>
          <span>
            SafeOps<small>TRUNG TÂM AN NINH</small>
          </span>
        </Link>
        <div className="auth-top-actions">
          <span className="auth-portal-tag">
            <LockKeyhole size={12} />
            CỔNG TÀI KHOẢN
          </span>
          <button ref={supportTrigger} type="button" onClick={() => setSupportOpen(true)}>
            <Headphones size={14} />
            Cần hỗ trợ?
          </button>
        </div>
      </header>
      <main className="auth-main">
        <section className="auth-introduction" aria-labelledby="auth-intro-title">
          <div className="auth-intro-pill">
            <Sparkles size={14} />
            An ninh tập trung. Phối hợp tức thời.
          </div>
          <h1 id="auth-intro-title">
            Khởi đầu quy trình vận hành
            <br className="auth-headline-break" /> an toàn trong <span>2 phút</span>
          </h1>
          <p className="auth-intro-description">
            Kết nối đội ngũ, kiểm soát sự cố và chủ động bảo vệ khu vực của bạn. SafeOps đồng hành
            cùng mọi ca trực.
          </p>
          <div className="auth-feature-list">
            {features.map(({ icon: Icon, ...feature }) => (
              <article className="auth-feature" key={feature.title}>
                <span className="auth-feature-icon" data-tone={feature.tone}>
                  <Icon size={20} />
                </span>
                <div>
                  <h2>{feature.title}</h2>
                  <p>{feature.description}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="auth-trust-bar">
            <span>
              <ShieldCheck size={15} />
              Phân quyền theo vai trò
            </span>
            <span>
              <ClipboardCheck size={15} />
              Lưu vết hoạt động
            </span>
            <span>
              <Activity size={15} />
              Thông tin tập trung
            </span>
          </div>
        </section>
        <div className="auth-form-column" id="auth-form">
          {children}
        </div>
      </main>
      <footer className="auth-footer">
        <span>© 2026 SafeOps. Nền tảng điều hành an ninh.</span>
        <span>
          <LockKeyhole size={12} />
          Chủ động giám sát · Phối hợp an toàn
        </span>
      </footer>
      <Dialog open={supportOpen} onOpenChange={setSupportOpen}>
        <DialogContent
          onCloseAutoFocus={(event) => {
            if (supportTrigger.current?.isConnected) {
              event.preventDefault();
              supportTrigger.current.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>Hỗ trợ tài khoản SafeOps</DialogTitle>
            <DialogDescription>
              Liên hệ quản trị viên tại đơn vị vận hành để được hỗ trợ tài khoản.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            Người báo cáo có thể tự đăng ký. Tài khoản điều phối viên, lực lượng hiện trường, chỉ
            huy và quản trị viên do đơn vị quản trị cấp.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
