export function getRadianAngle(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Ukuran bounding box gambar setelah diputar sejumlah derajat. */
export function rotatedBoundingBox(
  width: number,
  height: number,
  rotationDeg: number,
): { width: number; height: number } {
  const rotation = getRadianAngle(rotationDeg);
  return {
    width: Math.abs(Math.cos(rotation) * width) + Math.abs(Math.sin(rotation) * height),
    height: Math.abs(Math.sin(rotation) * width) + Math.abs(Math.cos(rotation) * height),
  };
}

export type PixelCrop = { x: number; y: number; width: number; height: number };

const OUTPUT_SIZE = 256;
const JPEG_QUALITY = 0.82;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Gambar tidak dapat dibuka oleh browser."));
    image.src = src;
  });
}

export async function cropAndCompressAvatar(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotationDeg: number,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const bounds = rotatedBoundingBox(image.width, image.height, rotationDeg);

  const rotateCanvas = document.createElement("canvas");
  rotateCanvas.width = Math.ceil(bounds.width);
  rotateCanvas.height = Math.ceil(bounds.height);
  const rotateContext = rotateCanvas.getContext("2d");
  if (!rotateContext) throw new Error("Canvas tidak didukung oleh browser.");

  rotateContext.translate(rotateCanvas.width / 2, rotateCanvas.height / 2);
  rotateContext.rotate(getRadianAngle(rotationDeg));
  rotateContext.translate(-image.width / 2, -image.height / 2);
  rotateContext.drawImage(image, 0, 0);

  const cropData = rotateContext.getImageData(
    Math.max(0, Math.round(pixelCrop.x)),
    Math.max(0, Math.round(pixelCrop.y)),
    Math.max(1, Math.round(pixelCrop.width)),
    Math.max(1, Math.round(pixelCrop.height)),
  );
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = cropData.width;
  cropCanvas.height = cropData.height;
  const cropContext = cropCanvas.getContext("2d");
  if (!cropContext) throw new Error("Canvas tidak didukung oleh browser.");
  cropContext.putImageData(cropData, 0, 0);

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = OUTPUT_SIZE;
  outputCanvas.height = OUTPUT_SIZE;
  const outputContext = outputCanvas.getContext("2d");
  if (!outputContext) throw new Error("Canvas tidak didukung oleh browser.");
  outputContext.imageSmoothingEnabled = true;
  outputContext.imageSmoothingQuality = "high";
  outputContext.drawImage(cropCanvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Gagal mengompres gambar."))),
      "image/jpeg",
      JPEG_QUALITY,
    );
  });
}
