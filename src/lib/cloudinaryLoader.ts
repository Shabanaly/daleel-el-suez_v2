export default function cloudinaryLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // If it's not a cloudinary image, return it as is
    if (!src.includes('res.cloudinary.com')) return src;

    // Cloudinary optimization parameters
    // f_auto: automatic format (webp, avif, etc)
    // q_auto: automatic quality
    // w: width
    const params = [
        'f_auto',
        'q_auto',
        `w_${width}`,
        'c_limit' // maintains aspect ratio
    ];

    // Check if the URL already has parameters
    if (src.includes('/upload/')) {
        const parts = src.split('/upload/');
        return `${parts[0]}/upload/${params.join(',')}/${parts[1]}`;
    }

    // Unsplash optimization
    if (src.includes('images.unsplash.com')) {
        const url = new URL(src);
        url.searchParams.set('w', width.toString());
        url.searchParams.set('q', (quality || 75).toString());
        url.searchParams.set('auto', 'format');
        return url.toString();
    }

    // Google User Profile optimization (common for auth)
    if (src.includes('lh3.googleusercontent.com')) {
        // Append or replace the size parameter (e.g., =s96-c)
        const baseUrl = src.split('=')[0];
        return `${baseUrl}=s${width}-c`;
    }

    return src;
}
