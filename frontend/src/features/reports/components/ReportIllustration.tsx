import type { ReportScene } from '@/types/reports';
import { useId } from 'react';

export function ReportIllustration({
  scene,
  label = 'Ảnh minh họa',
}: {
  scene: ReportScene;
  label?: string;
}) {
  const gradientId = useId();
  return (
    <div className={`reporter-illustration scene-${scene}`}>
      <svg viewBox="0 0 480 280" preserveAspectRatio="xMidYMid slice" role="img" aria-label={label}>
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="1">
            <stop stopColor={scene === 'parking' ? '#475569' : '#cbd5e1'} />
            <stop offset="1" stopColor={scene === 'parking' ? '#172033' : '#e2e8f0'} />
          </linearGradient>
        </defs>
        <rect width="480" height="280" fill={`url(#${gradientId})`} />
        <path d="M0 0H480L356 183H124Z" fill="#f1f5f9" opacity=".35" />
        <path d="M0 280L124 183H356L480 280Z" fill="#94a3b8" opacity=".6" />
        <path
          d="M124 0V183H356V0 M124 183L0 280 M356 183L480 280"
          stroke="#64748b"
          fill="none"
          strokeWidth="3"
          opacity=".35"
        />
        {scene === 'parking' ? (
          <>
            <g fill="#f8fafc" opacity=".5">
              <rect x="65" y="21" width="130" height="5" />
              <rect x="288" y="21" width="130" height="5" />
            </g>
            <g fill="#1e293b" stroke="#94a3b8" strokeWidth="3">
              <path d="M86 177L107 141H179L204 177V215H86Z" />
              <path d="M270 177L288 146H365L388 177V215H270Z" />
            </g>
            <g fill="#93c5fd">
              <path d="M110 148H174L190 174H96Z" />
              <path d="M291 153H361L375 176H279Z" />
            </g>
            <g fill="#0f172a">
              <circle cx="111" cy="211" r="14" />
              <circle cx="183" cy="211" r="14" />
              <circle cx="292" cy="211" r="14" />
              <circle cx="366" cy="211" r="14" />
            </g>
            <path d="M240 190V280" stroke="#f8fafc" strokeWidth="4" strokeDasharray="18 12" />
          </>
        ) : (
          <>
            <rect
              x="190"
              y="46"
              width="109"
              height="152"
              rx="4"
              fill="#475569"
              stroke="#64748b"
              strokeWidth="3"
            />
            <rect x="201" y="57" width="87" height="128" rx="2" fill="#64748b" />
            <rect x="211" y="72" width="65" height="36" fill="#1e293b" />
            <g stroke="#94a3b8" strokeWidth="3">
              <path d="M211 123H275 M211 132H275 M211 141H275" />
            </g>
            <circle cx="278" cy="145" r="3" fill="#e2e8f0" />
            <path d="M241 80L231 97H242L236 107L258 90H246L253 80Z" fill="#fbbf24" />
            {scene === 'fire' ? (
              <>
                <path
                  d="M235 82C195 53 261 38 226 3M266 100C305 74 239 53 274 13"
                  stroke="#64748b"
                  strokeWidth="24"
                  fill="none"
                  opacity=".45"
                  strokeLinecap="round"
                />
                <path
                  d="M228 190Q205 167 224 150Q234 164 238 143Q266 170 247 190Z"
                  fill="#ef4444"
                />
                <path d="M231 190Q222 173 236 163Q252 180 243 190Z" fill="#fbbf24" />
              </>
            ) : (
              <g stroke="#f59e0b" strokeWidth="3">
                <path d="M278 111L307 99 M286 121H316 M279 130L306 143" />
              </g>
            )}
          </>
        )}
        <rect x="20" y="20" width="76" height="24" rx="5" fill="#0f172a" opacity=".7" />
        <text
          x="58"
          y="36"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fill="white"
        >
          MINH HỌA
        </text>
      </svg>
    </div>
  );
}
