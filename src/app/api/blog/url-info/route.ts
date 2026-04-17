import { NextRequest, NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

export const runtime = 'nodejs'; // Required for fetch to external URLs in some environments

export async function GET(req: NextRequest) {
  
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
      next: { revalidate: 3600 }, // Cache on Vercel/Next for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    const root = parse(html);

    const getMeta = (property: string) => {
      return (
        root.querySelector(`meta[property="${property}"]`)?.getAttribute('content') ||
        root.querySelector(`meta[name="${property}"]`)?.getAttribute('content')
      );
    };

    const title = getMeta('og:title') || root.querySelector('title')?.text || '';
    const description = getMeta('og:description') || getMeta('description') || '';
    const image = getMeta('og:image') || '';
    const siteName = getMeta('og:site_name') || '';

    // Try to find favicon if og:image is missing
    let favicon = '';
    if (!image) {
      const iconNode = root.querySelector('link[rel="icon"]') || root.querySelector('link[rel="shortcut icon"]');
      if (iconNode) {
        const href = iconNode.getAttribute('href');
        if (href) {
          if (href.startsWith('http')) {
            favicon = href;
          } else {
            const baseUrl = new URL(url).origin;
            favicon = new URL(href, baseUrl).toString();
          }
        }
      }
    }

    return NextResponse.json({
      title: title.trim(),
      description: description.trim(),
      image,
      siteName,
      favicon,
      url,
    });
  } catch (error) {
    console.error('Metadata fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 });
  }
}
