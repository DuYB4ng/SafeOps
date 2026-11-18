'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, EyeOff, Lock, Mail, Phone, Shield, User, UserPlus } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState('Nguyễn Văn An');
  const [email, setEmail] = React.useState('an.nguyen@safeops.vn');
  const [phoneNumber, setPhoneNumber] = React.useState('0912 345 678');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [agreeTerms, setAgreeTerms] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      router.push('/login');
    } catch {
      setError('Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[500px] rounded-2xl border border-[#c3c6d7]/70 bg-white p-6 sm:p-8 shadow-[0px_12px_36px_-6px_rgba(15,23,42,0.08),0px_4px_12px_-2px_rgba(15,23,42,0.04)]">
      {/* 1. Segmented Pill Switcher */}
      <div className="flex w-full items-center rounded-xl bg-[#eef2f6] p-1 mb-6">
        <Link
          href="/login"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-[#515f74] hover:text-[#131b2e] transition-all"
        >
          <span>Đăng nhập</span>
        </Link>
        <Link
          href="/register"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white py-2 text-xs font-semibold text-[#004ac6] shadow-xs border border-[#c3c6d7]/30 transition-all"
        >
          <UserPlus className="size-3.5" />
          <span>Đăng ký tài khoản</span>
        </Link>
      </div>

      {/* 2. Card Header & Shield Badge */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="mb-3 flex size-12 items-center justify-center rounded-2xl border border-blue-200/80 bg-gradient-to-b from-blue-50 to-blue-100 text-[#2563eb] shadow-xs">
          <Shield className="size-6 fill-[#2563eb]" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#131b2e]">
          Tạo tài khoản SafeOps
        </h2>
        <p className="mt-1 text-xs text-[#515f74]">
          Bắt đầu hành trình nâng cao tiêu chuẩn an toàn vận hành ngay hôm nay
        </p>
      </div>

      {/* 3. Google Workspace SSO Button */}
      <button
        type="button"
        onClick={() => router.push('/')}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#c3c6d7]/80 bg-white py-2.5 px-4 text-xs sm:text-sm font-semibold text-[#131b2e] shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <svg className="size-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Đăng ký bằng Google Workspace</span>
      </button>

      {/* 4. Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#c3c6d7]/50" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7e8b9f]">
          Hoặc đăng ký bằng email
        </span>
        <div className="h-px flex-1 bg-[#c3c6d7]/50" />
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* 5. Input Fields Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#131b2e]" htmlFor="reg-fullname">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 size-4 text-[#7e8b9f]" />
            <input
              id="reg-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn An"
              required
              className="h-10 w-full rounded-xl border border-[#c3c6d7] bg-white pl-10 pr-3.5 text-xs sm:text-sm text-[#131b2e] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:outline-hidden focus:ring-1 focus:ring-[#2563eb] transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#131b2e]" htmlFor="reg-email">
            Email doanh nghiệp <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 size-4 text-[#7e8b9f]" />
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="an.nguyen@safeops.vn"
              required
              className="h-10 w-full rounded-xl border border-[#c3c6d7] bg-white pl-10 pr-3.5 text-xs sm:text-sm text-[#131b2e] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:outline-hidden focus:ring-1 focus:ring-[#2563eb] transition-all"
            />
          </div>
        </div>

        {/* Phone number */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#131b2e]" htmlFor="reg-phone">
            Số điện thoại liên hệ <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-3 size-4 text-[#7e8b9f]" />
            <input
              id="reg-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="0912 345 678"
              required
              className="h-10 w-full rounded-xl border border-[#c3c6d7] bg-white pl-10 pr-3.5 text-xs sm:text-sm text-[#131b2e] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:outline-hidden focus:ring-1 focus:ring-[#2563eb] transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#131b2e]" htmlFor="reg-password">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-3 size-4 text-[#7e8b9f]" />
            <input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-10 w-full rounded-xl border border-[#c3c6d7] bg-white pl-10 pr-10 text-xs sm:text-sm text-[#131b2e] placeholder:text-[#94a3b8] focus:border-[#2563eb] focus:outline-hidden focus:ring-1 focus:ring-[#2563eb] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-[#7e8b9f] hover:text-[#131b2e] cursor-pointer"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <p className="text-[11px] text-[#515f74]">Ít nhất 8 ký tự, gồm số & ký tự đặc biệt</p>
        </div>

        {/* Terms agreement checkbox */}
        <div className="flex items-start gap-2 pt-1">
          <input
            id="agree-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 size-4 rounded-sm border-[#c3c6d7] text-[#2563eb] focus:ring-[#2563eb]"
          />
          <label
            htmlFor="agree-terms"
            className="text-xs text-[#515f74] leading-snug cursor-pointer select-none"
          >
            Tôi đồng ý với{' '}
            <span className="font-semibold text-[#2563eb] hover:underline">Điều khoản sử dụng</span>{' '}
            và{' '}
            <span className="font-semibold text-[#2563eb] hover:underline">Chính sách bảo mật</span>{' '}
            của SafeOps.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-4 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70"
        >
          <span>{isLoading ? 'Đang khởi tạo...' : 'Bắt đầu dùng thử miễn phí'}</span>
          <ArrowRight className="size-4" />
        </button>
      </form>

      {/* 6. Card Bottom Redirection Note */}
      <div className="mt-6 border-t border-[#c3c6d7]/40 pt-4 text-center text-xs text-[#515f74]">
        Đã có tài khoản SafeOps?{' '}
        <Link href="/login" className="font-semibold text-[#2563eb] hover:underline">
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
