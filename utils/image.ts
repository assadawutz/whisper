export async function fileToImage(file: File): Promise<HTMLImageElement> {
  if (!file) throw new Error("No file");
  const url = URL.createObjectURL(file);

  const img = new Image();
  img.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Image decode failed"));
    img.src = url;
  });

  return img;
}
