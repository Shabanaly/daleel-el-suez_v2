import { getMarketAdById } from "@/lib/actions/market";
import AdDetailsClient from "./_components/AdDetailsClient";
import { notFound } from "next/navigation";
import { Metadata } from 'next';

interface Props {
    params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const ad = await getMarketAdById(params.id);
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
    const ad = await getMarketAdById(params.id);

    if (!ad) {
        notFound();
    }

    return <AdDetailsClient ad={ad} />;
}
