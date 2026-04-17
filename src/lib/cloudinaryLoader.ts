export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const appendSizingParams = (urlString: string) => {
    try {
      const url = new URL(urlString);
      url.searchParams.set("w", width.toString());
      if (quality) {
        url.searchParams.set("q", quality.toString());
      }
      return url.toString();
    } catch {
      const separator = urlString.includes("?") ? "&" : "?";
      const qualityParam = quality ? `&q=${quality}` : "";
      return `${urlString}${separator}w=${width}${qualityParam}`;
    }
  };

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
      // Keep Google image paths untouched, but include width/quality as query params
      // so the custom Next.js loader contract is satisfied.
      return appendSizingParams(src);
  }

  // Generic fallback for all other external images
  // Cloudinary proxy is currently returning 401 Unauthorized for this cloudName.
  // Return original image URL instead of breaking it.
  if (!src.startsWith('/') && !src.includes('localhost')) {
      return appendSizingParams(src);
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
