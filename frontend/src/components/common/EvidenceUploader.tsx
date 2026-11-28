'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, ImagePlus, UploadCloud, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ImageAttachment } from '@/types/uploads';

type EvidenceUploaderProps = {
  images: readonly ImageAttachment[];
  error: string;
  onFiles: (files: readonly File[]) => void;
  onRemove: (id: string) => void;
};

export function EvidenceUploader({ images, error, onFiles, onRemove }: EvidenceUploaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  return (
    <div className="reporter-evidence-uploader">
      <input
        ref={fileInput}
        type="file"
        className="sr-only"
        tabIndex={-1}
        accept="image/jpeg,image/png,image/webp"
        multiple
        aria-label="Chọn ảnh minh chứng"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <input
        ref={cameraInput}
        type="file"
        className="sr-only"
        tabIndex={-1}
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        aria-label="Ảnh chụp từ camera"
        onChange={(event) => {
          onFiles(Array.from(event.target.files ?? []));
          event.target.value = '';
        }}
      />
      <div className="reporter-upload-toolbar">
        <span>{images.length}/5 ảnh đã chọn</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => cameraInput.current?.click()}
        >
          <Camera size={14} />
          Chụp ảnh mới
        </Button>
      </div>
      <div
        className="reporter-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          onFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <UploadCloud size={28} />
        <button type="button" onClick={() => fileInput.current?.click()}>
          <strong>Bấm để chọn ảnh</strong> hoặc kéo thả vào đây
        </button>
        <p>JPG, PNG, WebP · Tối đa 5 ảnh · 5 MB/ảnh</p>
      </div>
      {error && (
        <p className="reporter-form-error" role="alert">
          {error}
        </p>
      )}
      {images.length > 0 && (
        <div className="reporter-upload-grid">
          {images.map((image) => (
            <figure key={image.id}>
              <Image
                src={image.url}
                alt={`Ảnh đã chọn: ${image.file.name}`}
                unoptimized
                width={300}
                height={180}
              />
              <button
                type="button"
                onClick={() => onRemove(image.id)}
                aria-label={`Xóa ảnh ${image.file.name}`}
              >
                <X size={14} />
              </button>
              <figcaption>
                <span>{image.file.name}</span>
                <small>{(image.file.size / 1024 / 1024).toFixed(2)} MB · Chưa tải lên</small>
              </figcaption>
            </figure>
          ))}
        </div>
      )}
      {!images.length && (
        <p className="reporter-upload-note">
          <ImagePlus size={12} />
          Ảnh rõ nét giúp bộ phận phụ trách xác minh nhanh hơn.
        </p>
      )}
    </div>
  );
}
