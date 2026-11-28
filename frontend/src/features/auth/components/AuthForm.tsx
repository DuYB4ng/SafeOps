'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  CircleHelp,
  LogIn,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PasswordField } from './PasswordField';
import type { AuthMode } from '@/types/auth';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuth } from '@/hooks/useAuth';

type InfoTopic = 'sso' | 'reset' | 'terms' | 'privacy';
const infoContent: Record<InfoTopic, { title: string; description: string; content: string }> = {
  sso: {
    title: 'Google Workspace',
    description: 'Đăng nhập Google Workspace chưa được kết nối.',
    content:
      'Hệ thống cần cấu hình SSO của đơn vị trước khi sử dụng. Hiện bạn có thể xem form đăng nhập bằng email và mật khẩu.',
  },
  reset: {
    title: 'Quên mật khẩu?',
    description: 'Liên hệ quản trị viên để yêu cầu đặt lại mật khẩu.',
    content:
      'Chức năng gửi email khôi phục chưa được kết nối. Không có email đặt lại mật khẩu nào được gửi từ giao diện này.',
  },
  terms: {
    title: 'Điều khoản sử dụng',
    description:
      'Nội dung điều khoản chính thức sẽ được đơn vị vận hành cung cấp trước khi mở đăng ký.',
    content:
      'Đây là giao diện kiểm tra form. Thao tác tại đây chưa tạo tài khoản hoặc ghi nhận thỏa thuận sử dụng dịch vụ.',
  },
  privacy: {
    title: 'Chính sách bảo mật',
    description:
      'Chính sách bảo mật chính thức sẽ được đơn vị vận hành cung cấp trước khi mở đăng ký.',
    content:
      'Đăng nhập gửi email và mật khẩu đến máy chủ xác thực. Mật khẩu không được lưu vào bộ nhớ trình duyệt. Form đăng ký hiện chỉ là bản xem thử.',
  },
};

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.8 12.2c0-.7-.1-1.4-.2-2.2H12v4.2h5.5a4.8 4.8 0 0 1-2 3.1v2.6h3.4c2-1.8 2.9-4.5 2.9-7.7Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.9-5.8-4.3H2.7v2.7A10.4 10.4 0 0 0 12 22Z"
      />
      <path fill="#FBBC05" d="M6.2 13.6a6.2 6.2 0 0 1 0-3.2V7.7H2.7a10 10 0 0 0 0 8.6l3.5-2.7Z" />
      <path
        fill="#EA4335"
        d="M12 6.1c1.5 0 2.8.5 3.8 1.5l3-3A10 10 0 0 0 2.7 7.7l3.5 2.7C7 8 9.3 6.1 12 6.1Z"
      />
    </svg>
  );
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const auth = useAuth();
  const register = mode === 'register';
  const { formRef, values, errors, result, pending, updateValue, handleSubmit } = useAuthForm(mode);
  const infoTrigger = useRef<HTMLButtonElement | null>(null);
  const [topic, setTopic] = useState<InfoTopic | null>(null);

  function openInfo(nextTopic: InfoTopic, trigger: HTMLButtonElement) {
    infoTrigger.current = trigger;
    setTopic(nextTopic);
  }

  return (
    <section className="auth-card" data-mode={mode} aria-labelledby="auth-card-title">
      <nav className="auth-switcher" aria-label="Đăng nhập hoặc đăng ký">
        <Link href="/login" aria-current={!register ? 'page' : undefined}>
          <LogIn size={15} />
          Đăng nhập
        </Link>
        <Link href="/register" aria-current={register ? 'page' : undefined}>
          <UserRoundPlus size={15} />
          Đăng ký
        </Link>
      </nav>
      <div className="auth-card-heading">
        <span className="auth-card-shield">
          <ShieldCheck size={23} />
        </span>
        <h2 id="auth-card-title">{register ? 'Tạo tài khoản SafeOps' : 'Chào mừng trở lại'}</h2>
        <p>
          {register
            ? 'Bắt đầu kết nối và báo cáo sự cố, cùng xây dựng một môi trường an toàn hơn.'
            : 'Đăng nhập để tiếp tục theo dõi và phối hợp xử lý sự cố cùng đội ngũ của bạn.'}
        </p>
      </div>
      {!register && auth.status === 'authenticated' && auth.user && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <p>Phiên hiện tại: {auth.user.fullName}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void auth.logout().catch(() => undefined);
            }}
          >
            Đăng xuất
          </Button>
        </div>
      )}
      {!register && auth.status === 'error' && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
          <p>Chưa thể kiểm tra phiên đăng nhập.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void auth.retry();
            }}
          >
            Thử lại kiểm tra phiên
          </Button>
        </div>
      )}
      <Button
        type="button"
        variant="outline"
        className="auth-google-button"
        onClick={(event) => openInfo('sso', event.currentTarget)}
      >
        <GoogleMark />
        Tiếp tục với Google Workspace
      </Button>
      <div className="auth-divider">
        <span>hoặc sử dụng email</span>
      </div>
      <form ref={formRef} className="auth-fields" noValidate onSubmit={handleSubmit}>
        {register && (
          <div className="auth-field">
            <Label htmlFor="auth-full-name">Họ và tên</Label>
            <div className="auth-input-wrap">
              <UserRound size={15} aria-hidden="true" />
              <Input
                id="auth-full-name"
                name="fullName"
                autoComplete="name"
                required
                value={values.fullName}
                onChange={(event) => updateValue('fullName', event.target.value)}
                placeholder="Nguyễn Văn An"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'full-name-error' : undefined}
              />
            </div>
            {errors.fullName && (
              <p id="full-name-error" className="auth-field-error">
                {errors.fullName}
              </p>
            )}
          </div>
        )}
        <div className="auth-field">
          <Label htmlFor="auth-email">Địa chỉ email</Label>
          <div className="auth-input-wrap">
            <Mail size={15} aria-hidden="true" />
            <Input
              id="auth-email"
              name="email"
              type="email"
              autoComplete={register ? 'email' : 'username'}
              autoCapitalize="none"
              spellCheck={false}
              required
              value={values.email}
              onChange={(event) => updateValue('email', event.target.value)}
              placeholder="an.nguyen@safeops.vn"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="auth-field-error">
              {errors.email}
            </p>
          )}
        </div>
        {register && (
          <div className="auth-field">
            <Label htmlFor="auth-phone">
              Số điện thoại <span className="auth-optional"></span>
            </Label>
            <div className="auth-input-wrap">
              <Phone size={15} aria-hidden="true" />
              <Input
                id="auth-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={values.phone}
                onChange={(event) => updateValue('phone', event.target.value)}
                placeholder="0912 345 678"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'phone-error' : undefined}
              />
            </div>
            {errors.phone && (
              <p id="phone-error" className="auth-field-error">
                {errors.phone}
              </p>
            )}
          </div>
        )}
        <PasswordField
          register={register}
          value={values.password}
          onChange={(value) => updateValue('password', value)}
          error={errors.password}
        />
        {register ? (
          <div className="auth-agreement">
            <div>
              <input
                id="auth-terms"
                name="terms"
                type="checkbox"
                checked={values.terms}
                onChange={(event) => updateValue('terms', event.target.checked)}
                required
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={errors.terms ? 'terms-error' : undefined}
              />
              <label htmlFor="auth-terms">
                Tôi đồng ý với{' '}
                <button type="button" onClick={(event) => openInfo('terms', event.currentTarget)}>
                  Điều khoản sử dụng
                </button>{' '}
                và{' '}
                <button type="button" onClick={(event) => openInfo('privacy', event.currentTarget)}>
                  Chính sách bảo mật
                </button>{' '}
                của SafeOps.
              </label>
            </div>
            {errors.terms && (
              <p id="terms-error" className="auth-field-error">
                {errors.terms}
              </p>
            )}
          </div>
        ) : (
          <div className="auth-login-options">
            <span>
              <ShieldCheck size={13} />
              Tài khoản được phân quyền
            </span>
            <button type="button" onClick={(event) => openInfo('reset', event.currentTarget)}>
              Quên mật khẩu?
            </button>
          </div>
        )}
        <Button type="submit" className="auth-submit" disabled={pending} aria-busy={pending}>
          {register ? <UserRoundPlus size={16} /> : <LogIn size={16} />}
          {pending ? 'Đang đăng nhập...' : register ? 'Tạo tài khoản' : 'Đăng nhập'}
        </Button>
        {result && (
          <p className="auth-result" role="status">
            <Check size={15} />
            {result}
          </p>
        )}
      </form>
      <p className="auth-bottom-note">
        {register ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
        <Link href={register ? '/login' : '/register'}>
          {register ? 'Đăng nhập ngay' : 'Đăng ký ngay'}
        </Link>
      </p>
      <p className="auth-form-note">
        <CircleHelp size={12} />
        {register
          ? 'Tài khoản đăng ký mới dành cho người báo cáo.'
          : 'Sử dụng tài khoản do đơn vị cấp hoặc tài khoản người báo cáo.'}
      </p>
      <Dialog
        open={topic !== null}
        onOpenChange={(open) => {
          if (!open) setTopic(null);
        }}
      >
        <DialogContent
          onCloseAutoFocus={(event) => {
            if (infoTrigger.current?.isConnected) {
              event.preventDefault();
              infoTrigger.current.focus();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle>{topic && infoContent[topic].title}</DialogTitle>
            <DialogDescription>{topic && infoContent[topic].description}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            {topic && infoContent[topic].content}
          </p>
        </DialogContent>
      </Dialog>
    </section>
  );
}
