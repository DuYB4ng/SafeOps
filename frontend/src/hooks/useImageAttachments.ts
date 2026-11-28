'use client';

import { useEffect, useRef, useState } from 'react';
import type { ImageAttachment } from '@/types/uploads';
import { selectReportImages } from '@/services/image-attachments.service';

export function useImageAttachments() {
  const current = useRef<ImageAttachment[]>([]);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [error, setError] = useState('');
  useEffect(
    () => () => {
      current.current.forEach((image) => URL.revokeObjectURL(image.url));
    },
    [],
  );
  function addFiles(files: readonly File[]) {
    const selected = selectReportImages(files, current.current.length);
    const additions = selected.accepted.map((file) => ({
      id: crypto.randomUUID(),
      file,
      url: URL.createObjectURL(file),
    }));
    current.current = [...current.current, ...additions];
    setImages(current.current);
    setError(selected.error);
  }
  function removeImage(id: string) {
    const image = current.current.find((item) => item.id === id);
    if (image) URL.revokeObjectURL(image.url);
    current.current = current.current.filter((item) => item.id !== id);
    setImages(current.current);
    setError('');
  }
  return { images, error, addFiles, removeImage };
}
