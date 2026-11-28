'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { AuthErrors, AuthMode, AuthValues } from '@/types/auth';
import { validateAuthForm } from '../validation';

export function useAuthForm(mode: AuthMode) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<AuthValues>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    terms: false,
  });
  const [errors, setErrors] = useState<AuthErrors>({});
  const [result, setResult] = useState('');

  function updateValue<K extends keyof AuthValues>(field: K, value: AuthValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setResult('');
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateAuthForm(mode, values);
    setErrors(nextErrors);
    setResult('');
    if (Object.keys(nextErrors).length) {
      const fieldOrder: readonly (keyof AuthValues)[] =
        mode === 'register'
          ? ['fullName', 'email', 'phone', 'password', 'terms']
          : ['email', 'password'];
      const firstField = fieldOrder.find((field) => nextErrors[field]);
      formRef.current?.querySelector<HTMLInputElement>(`[name="${firstField}"]`)?.focus();
      return;
    }
    setResult(
      mode === 'register'
        ? 'Thông tin hợp lệ. Chưa tạo tài khoản vì giao diện chưa kết nối hệ thống xác thực.'
        : 'Thông tin đã được kiểm tra định dạng. Chưa đăng nhập vì giao diện chưa kết nối hệ thống xác thực.',
    );
  }

  return { formRef, values, errors, result, updateValue, handleSubmit };
}
