'use server';

import cloudinary from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase/server';

export async function getCloudinarySignature(folder?: string) {
    // 🔐 Ensure the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
        timestamp,
        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    };

    if (folder) {
        params.folder = folder;
    }

    const signature = cloudinary.utils.api_sign_request(
        params,
        process.env.API_SECRET!
    );

    return {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        folder,
    };
}

/**
 * Server Action to delete an image from Cloudinary.
 */
export async function deleteCloudinaryImage(publicId?: string | null) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    if (!publicId) {
        return { success: true, message: 'No public ID provided, skipping Cloudinary deletion' };
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return { success: true, result };
    } catch (error) {
        // Log the error but don't throw, so we don't break the database update process
        // particularly for external links that don't have public_ids.
        console.error('Error deleting image from Cloudinary:', error);
        return { success: false, error: 'Could not delete from Cloudinary' };
    }
}
