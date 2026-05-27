'use client';
import { useRef, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

interface Props {
  value: File | null;
  onChange: (f: File | null) => void;
  accept?: string;
  maxSizeMb?: number;
}

export function FileUpload({
  value,
  onChange,
  accept = '.pdf,.txt,.png,.jpg,.jpeg',
  maxSizeMb = 10,
}: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handle = (file: File | null) => {
    if (!file) {
      onChange(null);
      return;
    }
    if (file.size > maxSizeMb * 1024 * 1024) {
      alert(`File too large. Max ${maxSizeMb} MB.`);
      return;
    }
    onChange(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handle(f);
      }}
      className={`border-2 border-dashed rounded-2xl bg-white py-8 px-6 text-center transition ${
        dragging ? 'border-veda-accent bg-orange-50' : 'border-veda-border'
      }`}
    >
      {value ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm truncate">
            <span className="font-medium">{value.name}</span>
            <span className="text-veda-subtle ml-2">
              ({(value.size / 1024).toFixed(0)} KB)
            </span>
          </div>
          <button
            type="button"
            onClick={() => handle(null)}
            className="w-8 h-8 grid place-items-center rounded-full hover:bg-veda-muted"
            aria-label="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud className="w-7 h-7 mx-auto text-veda-subtle" />
          <p className="mt-3 text-sm font-medium">Choose a file or drag & drop it here</p>
          <p className="text-xs text-veda-subtle mt-1">
            PDF, TXT, JPEG, PNG, upto {maxSizeMb}MB
          </p>
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="veda-btn-ghost mt-4 !text-xs"
          >
            Browse Files
          </button>
          <input
            ref={ref}
            type="file"
            hidden
            accept={accept}
            onChange={(e) => handle(e.target.files?.[0] ?? null)}
          />
        </>
      )}
    </div>
  );
}
