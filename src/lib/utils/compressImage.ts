/**
 * compressImage.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Zero-dependency, browser-native image compression using the Canvas API.
 * Fully decoupled from upload logic — can be used in any context.
 * ────────────────────────────────────────────────────────────────────────────
 */

export interface CompressionOptions {
    /** Maximum width OR height in pixels. The image is scaled proportionally. Default: 1280 */
    maxWidthOrHeight?: number;
    /** JPEG/WebP quality, from 0 to 1. Default: 0.82 */
    quality?: number;
    /** Output MIME type. Default: 'image/jpeg' */
    outputType?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
    maxWidthOrHeight: 1280,
    quality: 0.82,
    outputType: 'image/jpeg',
};

/**
 * Compresses a File using an off-screen Canvas.
 * Returns a new File (same filename, compressed content).
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const opts = { ...DEFAULT_OPTIONS, ...options };

    // Skip compression for non-image or SVG files
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            const { width, height } = calculateDimensions(
                img.naturalWidth,
                img.naturalHeight,
                opts.maxWidthOrHeight
            );

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Canvas 2D context not available'));
                return;
            }

            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas toBlob returned null'));
                        return;
                    }
                    const compressedFile = new File([blob], file.name, {
                        type: opts.outputType,
                        lastModified: Date.now(),
                    });
                    resolve(compressedFile);
                },
                opts.outputType,
                opts.quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error(`Failed to load image: ${file.name}`));
        };

        img.src = objectUrl;
    });
}

/**
 * Compresses multiple files in parallel.
 */
export async function compressImages(
    files: File[],
    options: CompressionOptions = {}
): Promise<File[]> {
    return Promise.all(files.map((file) => compressImage(file, options)));
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxSize: number
): { width: number; height: number } {
    if (originalWidth <= maxSize && originalHeight <= maxSize) {
        return { width: originalWidth, height: originalHeight };
    }

    const ratio = originalWidth / originalHeight;
    if (originalWidth > originalHeight) {
        return { width: maxSize, height: Math.round(maxSize / ratio) };
    } else {
        return { width: Math.round(maxSize * ratio), height: maxSize };
    }
}
