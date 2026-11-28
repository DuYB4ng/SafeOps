const imageExtensions: Record<string, readonly string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
};
export const MAX_REPORT_IMAGES = 5;
export const MAX_REPORT_IMAGE_BYTES = 5 * 1024 * 1024;

export function selectReportImages(files: readonly File[], existingCount: number) {
  const accepted: File[] = [];
  const errors: string[] = [];
  for (const file of files) {
    const extension = file.name.split('.').at(-1)?.toLowerCase() ?? '';
    if (!imageExtensions[file.type]?.includes(extension)) {
      errors.push(`${file.name}: chỉ nhận JPG, PNG hoặc WebP.`);
      continue;
    }
    if (file.size > MAX_REPORT_IMAGE_BYTES) {
      errors.push(`${file.name}: ảnh vượt quá 5 MB.`);
      continue;
    }
    if (file.size === 0) {
      errors.push(`${file.name}: tệp ảnh trống.`);
      continue;
    }
    if (accepted.length + existingCount >= MAX_REPORT_IMAGES) {
      errors.push('Tối đa 5 ảnh cho mỗi lần gửi.');
      continue;
    }
    accepted.push(file);
  }
  return { accepted, error: [...new Set(errors)].join(' ') };
}
