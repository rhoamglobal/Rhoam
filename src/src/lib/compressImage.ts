import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 0.45,
    maxWidthOrHeight: 1800,
    useWebWorker: true,
    fileType: "image/webp",
    initialQuality: 0.85,
  };

  return await imageCompression(file, options);
}
