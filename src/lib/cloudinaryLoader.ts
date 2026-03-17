export default function cloudinaryLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // Force HTTPS for all external URLs to avoid Mixed Content warnings
    if (src.startsWith('http://')) {
        src = src.replace('http://', 'https://');
    }

    // Cloudinary optimization
    if (src.includes('res.cloudinary.com') && src.includes('/upload/')) {
        const params = [
            'f_auto',
            'q_auto',
            `w_${width}`,
            'c_limit' // maintains aspect ratio
        ];
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
    if (src.includes('lh3.googleusercontent.com') || src.includes('googleusercontent.com')) {
        const baseUrl = src.split('=')[0];
        return `${baseUrl}=s${width}-c`;
    }

    // Generic fallback for all other images to satisfy Next.js "loader must implement width" requirement
    try {
        const url = new URL(src, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
        if (!url.searchParams.has('w') && !url.searchParams.has('width')) {
            url.searchParams.set('w', width.toString());
        }
        if (quality && !url.searchParams.has('q') && !url.searchParams.has('quality')) {
            url.searchParams.set('q', quality.toString());
        }
        return url.toString();
    } catch {
        return src.includes('?') ? `${src}&w=${width}` : `${src}?w=${width}`;
    }
}
