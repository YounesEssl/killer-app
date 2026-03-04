"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Camera, ImagePlus, RotateCcw, Check } from "lucide-react";

interface PhotoCaptureProps {
  onCapture: (base64: string) => void;
}

function cropAndResize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d")!;

      // Crop square from center
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;

      ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    const base64 = await cropAndResize(file);
    setPreview(base64);
  }, []);

  const handleConfirm = () => {
    if (preview) onCapture(preview);
  };

  const handleReset = () => {
    setPreview(null);
  };

  if (preview) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-brand-200 shadow-brand">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        </div>
        <div className="flex gap-3 w-full">
          <Button
            variant="secondary"
            fullWidth
            onClick={handleReset}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Reprendre
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirm}
            icon={<Check className="w-4 h-4" />}
          >
            Confirmer
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={() => cameraRef.current?.click()}
        icon={<Camera className="w-5 h-5" />}
      >
        Prendre une photo
      </Button>
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={() => galleryRef.current?.click()}
        icon={<ImagePlus className="w-5 h-5" />}
      >
        Choisir dans la galerie
      </Button>
      <input
        ref={cameraRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
