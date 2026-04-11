import { getMarketAdBySlug, getMarketAdById } from "@/features/market/actions/market.server";
import AdDetailsClient from "@/features/market/components/AdDetailsClient";
import { notFound, redirect } from "next/navigation";
import BreadcrumbsJsonLd from "@/components/seo/BreadcrumbsJsonLd";
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

    const title = `${ad.title} | سوق السويس`;
    const description = ad.description ? ad.description.substring(0, 160) : `إعلان ${ad.title} في سوق السويس. السعر: ${ad.price} ج.م.`;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';
    const url = `${baseUrl}/market/${encodeURIComponent(ad.slug)}`;

    return {
        title,
        description,
        keywords: [ad.title, ad.category_name || '', ad.location, "سوق السويس", "بيع وشراء", "مستعمل"].filter(Boolean),
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            title,
            description,
            url,
            images: ad.images[0] ? [{ url: ad.images[0] }] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ad.images[0] ? [ad.images[0]] : [],
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://daleel-al-suez.com';

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": ad.title,
        "description": ad.description,
        "image": ad.images,
        "sku": ad.id,
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/market/${ad.slug}`,
            "priceCurrency": "EGP",
            "price": ad.price,
            "itemCondition": ad.condition === 'new' ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "EG",
                "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": 0,
                    "currency": "EGP"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "EG",
                    "addressRegion": "Suez"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "DAY"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 0,
                        "maxValue": 1,
                        "unitCode": "DAY"
                    }
                }
            }
        },
        "brand": {
            "@type": "Brand",
            "name": "سوق السويس"
        }
    };

    const breadcrumbs = [
        { name: 'الرئيسية', item: '/' },
        { name: 'سوق السويس', item: '/market' },
        { name: ad.category_name || 'تصنيف', item: `/market?category=${encodeURIComponent(ad.category_slug || '')}` },
        { name: ad.title, item: `/market/${ad.slug}` }
    ];

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <BreadcrumbsJsonLd items={breadcrumbs} />
            <AdDetailsClient ad={ad} />
        </>
    );
}
