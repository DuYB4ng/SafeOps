'use client';

import * as React from 'react';
import Link from 'next/link';
import { Activity, CheckCircle2, Lock, Radio, Shield, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gradient-to-br from-[#f0f6fd] via-[#f5f8ff] to-[#faf8ff] text-[#131b2e]">
      {/* 1. Subtle Top Brand Anchor Header */}
      <header className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 pt-6 sm:px-12">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#2563eb] text-white shadow-xs transition-transform group-hover:scale-105">
            <Shield className="size-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#131b2e] leading-tight">
              SafeOps
            </span>
            <span className="text-[10px] font-bold tracking-[0.6px] uppercase text-[#515f74]">
              SOC Dispatch Suite
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#c3c6d7]/60 bg-white/80 px-3 py-1 shadow-2xs backdrop-blur-xs">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-[#10b981]"></span>
            </span>
            <span className="text-xs font-semibold text-[#131b2e]">Socket: Active</span>
          </div>
          <a
            href="mailto:support@safeops.internal"
            className="hidden text-xs font-medium text-[#515f74] hover:text-[#2563eb] sm:inline-block transition-colors"
          >
            Hỗ trợ kỹ thuật 24/7
          </a>
        </div>
      </header>

      {/* 2. Main 2-Column Auth Canvas */}
      <main className="mx-auto my-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 py-8 lg:grid-cols-12 lg:px-12">
        {/* Left Column: Trust & Value Proposition */}
        <div className="flex flex-col gap-6 lg:col-span-7">
          {/* Trial Pill Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c3c6d7]/60 bg-white/80 px-3.5 py-1.5 shadow-2xs backdrop-blur-xs">
            <Sparkles className="size-3.5 text-[#2563eb]" />
            <span className="text-xs font-semibold text-[#004ac6]">
              Dùng thử miễn phí 14 ngày – Không yêu cầu thẻ tín dụng
            </span>
          </div>

          {/* Hero Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-[#131b2e] leading-[1.2]">
              Kích hoạt trung tâm <span className="text-[#2563eb]">vận hành an toàn</span> chuẩn
              quốc tế trong 2 phút
            </h1>
            <p className="text-sm sm:text-base text-[#515f74] leading-relaxed max-w-xl">
              Tối ưu hóa khả năng giám sát, chuẩn hóa chứng chỉ tuân thủ SOC2 & ISO 27001 và trao
              quyền tự chủ an toàn tuyệt đối cho đội ngũ hiện trường của bạn.
            </p>
          </div>

          {/* 3 Modern Bento / Feature Cards */}
          <div className="flex flex-col gap-3.5 max-w-xl">
            {/* Bento Card 1 */}
            <div className="flex items-start gap-4 rounded-xl border border-[#c3c6d7]/60 bg-white/90 p-4 shadow-xs backdrop-blur-xs transition-shadow hover:shadow-md">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#dbeafe] bg-[#eff6ff] text-[#2563eb]">
                <Activity className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#131b2e]">
                  Giám sát tuân thủ tự động theo thời gian thực
                </h3>
                <p className="text-xs text-[#515f74] leading-relaxed">
                  Quét cấu hình đám mây, cảm biến IoT và quy trình ca kíp liên tục, phát hiện và
                  cảnh báo sai lệch tức thì.
                </p>
              </div>
            </div>

            {/* Bento Card 2 */}
            <div className="flex items-start gap-4 rounded-xl border border-[#c3c6d7]/60 bg-white/90 p-4 shadow-xs backdrop-blur-xs transition-shadow hover:shadow-md">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#fef3c7] bg-[#fffbeb] text-[#d97706]">
                <Radio className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#131b2e]">
                  Tự động hóa điều phối sự cố khẩn cấp
                </h3>
                <p className="text-xs text-[#515f74] leading-relaxed">
                  Tự động phân loại cấp độ P1–P4, gắn kết tọa độ GIS thực địa và điều động đội phản
                  ứng nhanh ngay trên Live Map.
                </p>
              </div>
            </div>

            {/* Bento Card 3 */}
            <div className="flex items-start gap-4 rounded-xl border border-[#c3c6d7]/60 bg-white/90 p-4 shadow-xs backdrop-blur-xs transition-shadow hover:shadow-md">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] text-[#059669]">
                <ShieldCheck className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#131b2e]">
                  Tích hợp đa nền tảng bảo mật & IoT
                </h3>
                <p className="text-xs text-[#515f74] leading-relaxed">
                  Kết nối camera AI, cảm biến hồng ngoại, hệ thống SIEM, Slack và Jira đồng bộ hóa
                  100% thời gian thực.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badges Bar */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[#c3c6d7]/40 pt-4 text-xs font-medium text-[#515f74]">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#10b981]" />
              <span>SOC2 Type II & ISO 27001</span>
            </div>
            <span className="text-[#c3c6d7]">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#10b981]" />
              <span>Triển khai trong 2 phút</span>
            </div>
            <span className="text-[#c3c6d7]">•</span>
            <div className="flex items-center gap-1.5">
              <Lock className="size-4 text-[#2563eb]" />
              <span>Mã hóa AES-256</span>
            </div>
          </div>
        </div>

        {/* Right Column: Elevated Auth Card */}
        <div className="flex justify-center lg:col-span-5">{children}</div>
      </main>

      {/* 3. Grounded Minimalist Footer */}
      <footer className="mx-auto flex w-full max-w-[1440px] flex-col items-center justify-between gap-3 border-t border-[#c3c6d7]/30 px-6 py-4 text-xs text-[#515f74] sm:flex-row sm:px-12">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-[#10b981]" />
          <span>
            Bản quyền © 2024 Trung tâm Chỉ huy & Tác chiến An ninh Số. Mọi quyền được bảo lưu.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#515f74]">
          <span className="font-mono">SafeOps Real-time Incident Command System v4.8.2-PROD</span>
          <span>•</span>
          <span className="font-medium text-emerald-600">SOC Đồng bộ: Bình thường</span>
        </div>
      </footer>
    </div>
  );
}
