import type { AuthErrors, AuthMode, AuthValues } from '@/types/auth';

export function validateAuthForm(mode: AuthMode, values: AuthValues): AuthErrors {
  const errors: AuthErrors = {};
  if (!values.email.trim()) errors.email = 'Vui lòng nhập địa chỉ email.';
  else if (
    values.email.trim().length > 255 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  )
    errors.email = 'Địa chỉ email không hợp lệ.';
  if (!values.password) errors.password = 'Vui lòng nhập mật khẩu.';
  if (mode === 'register') {
    if (!values.fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên.';
    else if (values.fullName.trim().length > 255)
      errors.fullName = 'Họ và tên không được quá 255 ký tự.';
    if (values.phone.trim() && !/^\+?\d{9,15}$/.test(values.phone.replace(/[\s().-]/g, '')))
      errors.phone = 'Số điện thoại cần có từ 9 đến 15 chữ số.';
    if (
      values.password &&
      (values.password.length < 8 ||
        !/\d/.test(values.password) ||
        !/[^\p{L}\p{N}\s]/u.test(values.password))
    )
      errors.password = 'Mật khẩu cần ít nhất 8 ký tự, gồm số và ký tự đặc biệt.';
    if (!values.terms) errors.terms = 'Vui lòng đồng ý với điều khoản và chính sách bảo mật.';
  }
  return errors;
}

export function passwordStrength(password: string) {
  if (!password) return { score: 0, label: 'Chưa nhập mật khẩu' };
  const valid = password.length >= 8 && /\d/.test(password) && /[^\p{L}\p{N}\s]/u.test(password);
  if (!valid) return { score: password.length >= 6 ? 2 : 1, label: 'Chưa đạt yêu cầu' };
  const strong = password.length >= 12 && /\p{Ll}/u.test(password) && /\p{Lu}/u.test(password);
  return { score: strong ? 4 : 3, label: strong ? 'Mạnh' : 'Đạt yêu cầu' };
}
