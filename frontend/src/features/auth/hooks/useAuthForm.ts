'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { AuthErrors, AuthMode, AuthValues } from '@/types/auth';
import { validateAuthForm } from '../validation';
import { useAuth } from '@/hooks/useAuth';

export function useAuthForm(mode: AuthMode) {
  const { login } = useAuth();
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
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
    if (mode === 'register') {
      setResult(
        'Thông tin hợp lệ. Chưa tạo tài khoản vì giao diện đăng ký chưa kết nối hệ thống xác thực.',
      );
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const user = await login({ email: values.email.trim(), password: values.password });
      setValues((current) => ({ ...current, password: '' }));
      setResult(`Đăng nhập thành công. Xin chào ${user.fullName}.`);
    } catch (error) {
      setResult(`Chưa đăng nhập. ${error instanceof Error ? error.message : 'Vui lòng thử lại.'}`);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return { formRef, values, errors, result, pending, updateValue, handleSubmit };
}
