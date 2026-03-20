import { getMarketAdBySlug, getMarketAdById } from "@/lib/actions/market";
import AdDetailsClient from "./_components/AdDetailsClient";
import { notFound, redirect } from "next/navigation";
import { Metadata } from 'next';

interface Props {
    params: Promise<{ slug: string }>;
}

// Helper to check if string is UUID
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    
    // Check if it's a legacy ID
    let ad = null;
    if (isUUID(slug)) {
        ad = await getMarketAdById(slug);
    } else {
        ad = await getMarketAdBySlug(slug);
    }
    
    if (!ad) return { title: 'إعلان غير موجود' };

    return {
        title: `${ad.title} | سوق السويس`,
        description: ad.description.substring(0, 160),
        openGraph: {
            title: ad.title,
            description: ad.description.substring(0, 160),
            images: ad.images[0] ? [{ url: ad.images[0] }] : [],
        }
    };
}

export default async function AdDetailsPage({ params }: Props) {
    const { slug } = await params;

    // Handle legacy ID redirects
    if (isUUID(slug)) {
        const adById = await getMarketAdById(slug);
        if (adById) {
            redirect(`/market/${adById.slug}`);
        }
    }

    const ad = await getMarketAdBySlug(slug);

    if (!ad) {
        notFound();
    }

    return <AdDetailsClient ad={ad} />;
}
