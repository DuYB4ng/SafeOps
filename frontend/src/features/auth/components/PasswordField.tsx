'use client';

import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { passwordStrength } from '../validation';

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  register: boolean;
};

export function PasswordField({ value, onChange, error, register }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = passwordStrength(value);
  return (
    <div className="auth-field auth-password-field">
      <Label htmlFor="auth-password">Mật khẩu</Label>
      <div className="auth-input-wrap">
        <LockKeyhole size={15} aria-hidden="true" />
        <Input
          id="auth-password"
          name="password"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={register ? 'new-password' : 'current-password'}
          required
          placeholder={
            register ? 'Ít nhất 8 ký tự, gồm số & ký tự đặc biệt' : 'Nhập mật khẩu của bạn'
          }
          aria-invalid={Boolean(error)}
          aria-describedby={
            [error && 'password-error', register && 'password-hint'].filter(Boolean).join(' ') ||
            undefined
          }
        />
        <button
          type="button"
          className="auth-password-toggle"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {register && (
        <>
          <div
            className="auth-strength"
            data-score={strength.score}
            role="meter"
            aria-label="Độ mạnh mật khẩu"
            aria-valuemin={0}
            aria-valuemax={4}
            aria-valuenow={strength.score}
            aria-valuetext={strength.label}
          >
            {[1, 2, 3, 4].map((segment) => (
              <span key={segment} data-filled={segment <= strength.score} />
            ))}
          </div>
          <span className="sr-only" id="password-hint">
            Ít nhất 8 ký tự, gồm số và ký tự đặc biệt. {strength.label}.
          </span>
        </>
      )}
      {error && (
        <p className="auth-field-error" id="password-error">
          {error}
        </p>
      )}
    </div>
  );
}
