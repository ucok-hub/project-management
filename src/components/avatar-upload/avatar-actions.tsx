"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Image as ImageIcon, Trash2 } from "lucide-react";
import { CropModal } from "@/components/avatar-upload/crop-modal";
import { buttonClass } from "@/components/ui/button";
import { deleteAvatarAction, uploadAvatarAction } from "@/lib/actions/avatar";

const MAX_RAW_BYTES = 20 * 1024 * 1024;

export function AvatarActions({ hasAvatar }: { hasAvatar: boolean }) {
  const [pickedSrc, setPickedSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pickedSrc) URL.revokeObjectURL(pickedSrc);
    };
  }, [pickedSrc]);

  function closeEditor() {
    setPickedSrc(null);
    setError(null);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar.");
      return;
    }
    if (file.size > MAX_RAW_BYTES) {
      setError("Ukuran file terlalu besar (maks 20MB).");
      return;
    }
    setError(null);
    setPickedSrc(URL.createObjectURL(file));
  }

  async function handleApply(blob: Blob) {
    setBusy(true);
    try {
      const formData = new FormData();
      formData.set("avatar", blob, "avatar.jpg");
      const result = await uploadAvatarAction({}, formData);
      if (result.error) setError(result.error);
      else closeEditor();
    } catch {
      setError("Foto gagal disimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      await deleteAvatarAction();
    } catch {
      setError("Foto gagal dihapus. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={busy}
          className={buttonClass("secondary", "sm")}
        >
          <Camera className="h-4 w-4" /> Ambil Foto
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={busy}
          className={buttonClass("secondary", "sm")}
        >
          <ImageIcon className="h-4 w-4" /> Pilih dari Galeri
        </button>
        {hasAvatar && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={busy}
            className={buttonClass("ghost", "sm", "text-red-600")}
          >
            <Trash2 className="h-4 w-4" /> Hapus Foto
          </button>
        )}
      </div>

      {error && !pickedSrc && <p className="mt-2 text-sm font-medium text-red-600">{error}</p>}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {pickedSrc && (
        <CropModal
          imageSrc={pickedSrc}
          error={error}
          onApply={handleApply}
          onCancel={closeEditor}
        />
      )}
    </>
  );
}
