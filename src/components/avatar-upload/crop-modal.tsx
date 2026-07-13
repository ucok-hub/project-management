"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import { RotateCcw, RotateCw } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { cropAndCompressAvatar, type PixelCrop } from "@/lib/crop-image";

export function CropModal({
  imageSrc,
  error,
  onApply,
  onCancel,
}: {
  imageSrc: string;
  error: string | null;
  onApply: (blob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<PixelCrop | null>(null);
  const [applying, setApplying] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  async function handleApply() {
    if (!area) return;
    setApplying(true);
    setProcessingError(null);
    try {
      onApply(await cropAndCompressAvatar(imageSrc, area, rotation));
    } catch {
      setProcessingError("Gambar tidak dapat diproses. Coba pilih foto lain.");
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80" role="dialog" aria-modal="true">
      <div className="relative flex-1">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={(_area, areaPixels: PixelCrop) => setArea(areaPixels)}
        />
      </div>

      <div className="space-y-3 bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs font-medium text-slate-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            aria-label="Zoom foto"
            onChange={(event) => setZoom(Number(event.target.value))}
            className="flex-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 text-xs font-medium text-slate-500">Putar</span>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            aria-label="Rotasi foto"
            onChange={(event) => setRotation(Number(event.target.value))}
            className="flex-1"
          />
          <button
            type="button"
            aria-label="Putar 90 derajat kiri"
            onClick={() => setRotation((value) => (value - 90 + 360) % 360)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Putar 90 derajat kanan"
            onClick={() => setRotation((value) => (value + 90) % 360)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
          >
            <RotateCw className="h-5 w-5" />
          </button>
        </div>

        {(processingError || error) && (
          <p className="text-sm font-medium text-red-600">{processingError ?? error}</p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={applying}
            className={buttonClass("secondary", "md", "flex-1")}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={applying || !area}
            className={buttonClass("primary", "md", "flex-1")}
          >
            {applying ? "Memproses…" : "Terapkan"}
          </button>
        </div>
      </div>
    </div>
  );
}
