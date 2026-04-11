export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Force HTTPS for all external URLs to avoid Mixed Content warnings
  if (src.startsWith("http://")) {
    src = src.replace("http://", "https://");
  }

  // Cloudinary optimization
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const params = [
      "f_auto",
      "q_auto",
      `w_${width}`,
      "c_limit", // maintains aspect ratio
    ];
    const parts = src.split("/upload/");
    return `${parts[0]}/upload/${params.join(",")}/${parts[1]}`;
  }

  // Unsplash optimization
  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("w", width.toString());
    url.searchParams.set("q", (quality || 75).toString());
    url.searchParams.set("auto", "format");
    return url.toString();
  }

  // Google hosted images (Photos, Maps, Profile pics)
  const isGoogleDomain = src.includes('googleusercontent.com') || 
                         src.includes('ggpht.com') || 
                         src.includes('google.com') ||
                         src.includes('googleapis.com');
                         
  if (isGoogleDomain) {
      // Return Google images unmodified. They are already optimized or sized in the DB.
      // Modifying Google Maps /p/ or gps-cs-s URLs can lead to 403 or broken images.
      // Using the raw URL ensures it loads just like it does in the Lightbox.
      return src;
  }

  // Generic fallback for all other external images
  // Cloudinary proxy is currently returning 401 Unauthorized for this cloudName.
  // Return original image URL instead of breaking it.
  if (!src.startsWith('/') && !src.includes('localhost')) {
      return src;
  }

  // Local images fallback
  try {
    const url = new URL(
      src,
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    );
    if (!url.searchParams.has("w") && !url.searchParams.has("width")) {
      url.searchParams.set("w", width.toString());
    }
    if (
      quality &&
      !url.searchParams.has("q") &&
      !url.searchParams.has("quality")
    ) {
      url.searchParams.set("q", quality.toString());
    }
    return url.toString();
  } catch {
    return src.includes("?") ? `${src}&w=${width}` : `${src}?w=${width}`;
  }
}
