'use client';

import { useState, useEffect, useMemo } from 'react';
import { getCloudinarySignature, deleteCloudinaryImage } from '@/lib/actions/media';
import { compressImages, type CompressionOptions } from '@/lib/utils/compressImage';

interface UseImageUploadOptions {
    folder: string;
    maxImages?: number;
    initialImages?: string[];
    initialPublicIds?: string[];
    /** Optional compression settings. Pass `false` to disable compression entirely. */
    compression?: CompressionOptions | false;
}

export function useImageUpload({
    folder,
    maxImages = 5,
    initialImages = [],
    initialPublicIds = [],
    compression = {},
}: UseImageUploadOptions) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [publicIds, setPublicIds] = useState<string[]>(initialPublicIds);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    
    // Sync state with props if they change externally (e.g. after a server action + router.refresh)
    useEffect(() => {
        setImages(prev => JSON.stringify(prev) !== JSON.stringify(initialImages) ? initialImages : prev);
        setPublicIds(prev => JSON.stringify(prev) !== JSON.stringify(initialPublicIds) ? initialPublicIds : prev);
    }, [initialImages, initialPublicIds]);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Cleanup previews on unmount
    useEffect(() => {
        return () => {
            previews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previews]);

    const addFiles = (files: FileList | File[]) => {
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);
        if (images.length + pendingFiles.length + newFiles.length > maxImages) {
            setError(`يمكنك رفع حتى ${maxImages} صور فقط`);
            return;
        }

        setError(null);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));

        setPendingFiles(prev => [...prev, ...newFiles]);
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const startUpload = async () => {
        if (pendingFiles.length === 0) return { urls: images, publicIds };

        setError(null);

        // ── Step 1: Compress ────────────────────────────────────────────────
        let filesToUpload = pendingFiles;

        if (compression !== false) {
            setIsCompressing(true);
            try {
                filesToUpload = await compressImages(pendingFiles, compression);
            } catch {
                setError('فشل ضغط الصور، سيتم الرفع بدون ضغط');
                filesToUpload = pendingFiles; // Graceful fallback: upload originals
            } finally {
                setIsCompressing(false);
            }
        }

        // ── Step 2: Upload ──────────────────────────────────────────────────
        setIsUploading(true);

        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                const { signature, timestamp, apiKey, cloudName, uploadPreset } = await getCloudinarySignature(folder);

                const uploadFormData = new FormData();
                uploadFormData.append('file', file);
                uploadFormData.append('signature', signature);
                uploadFormData.append('timestamp', timestamp.toString());
                uploadFormData.append('api_key', apiKey || '');
                uploadFormData.append('upload_preset', uploadPreset || '');
                if (folder) {
                    uploadFormData.append('folder', folder);
                }

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    { method: 'POST', body: uploadFormData }
                );

                const data = await response.json();
                if (data.error) throw new Error(data.error.message);

                return { url: data.secure_url, publicId: data.public_id };
            });

            const results = await Promise.all(uploadPromises);

            const allUrls = [...images, ...results.map(r => r.url)];
            const allPublicIds = [...publicIds, ...results.map(r => r.publicId)];

            setImages(allUrls);
            setPublicIds(allPublicIds);
            setPendingFiles([]);
            setPreviews([]);

            return { urls: allUrls, publicIds: allPublicIds };
        } catch (err) {
            setError(err instanceof Error ? err.message : 'فشل رفع الصور');
            throw err;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteImage = async (index: number) => {
        // If it's an existing image (already uploaded)
        if (index < images.length) {
            const publicId = publicIds[index];
            try {
                // If publicId is missing (external link), the server action will handle it gracefully
                await deleteCloudinaryImage(publicId);
                
                setImages(prev => prev.filter((_, i) => i !== index));
                setPublicIds(prev => prev.filter((_, i) => i !== index));
            } catch (err) {
                console.error('Failed to delete image:', err);
                setError('فشل حذف الصورة من السيرفر، لكن سيتم حذفها من القائمة');
                // Still remove from local state to allow DB update to proceed
                setImages(prev => prev.filter((_, i) => i !== index));
                setPublicIds(prev => prev.filter((_, i) => i !== index));
            }
        } else {
            // If it's a pending file
            const pendingIndex = index - images.length;
            URL.revokeObjectURL(previews[pendingIndex]);
            setPendingFiles(prev => prev.filter((_, i) => i !== pendingIndex));
            setPreviews(prev => prev.filter((_, i) => i !== pendingIndex));
        }
    };

    const clearImages = () => {
        previews.forEach(url => URL.revokeObjectURL(url));
        setImages([]);
        setPublicIds([]);
        setPendingFiles([]);
        setPreviews([]);
    };

    // Only clears the pending previews — does NOT touch existing uploaded images
    const clearPending = () => {
        previews.forEach(url => URL.revokeObjectURL(url));
        setPendingFiles([]);
        setPreviews([]);
    };

    const combinedImages = useMemo(() => [...images, ...previews], [images, previews]);

    return {
        images: combinedImages,
        publicIds,
        isCompressing,
        isUploading,
        isBusy: isCompressing || isUploading,
        error,
        uploadFiles: addFiles,
        startUpload,
        deleteImage,
        clearImages,
        clearPending,
        setError,
    };
}
