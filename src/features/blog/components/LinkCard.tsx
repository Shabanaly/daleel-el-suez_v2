'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Globe, Loader2 } from 'lucide-react';
import { SafeImage } from '@/components/common/SafeImage';

interface LinkMetadata {
  title: string;
  description: string;
  image: string;
  siteName: string;
  favicon: string;
  url: string;
}

export function LinkCard({ url }: { url: string }) {
  const [data, setData] = useState<LinkMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMetadata() {
      try {
        const res = await fetch(`/api/blog/url-info?url=${encodeURIComponent(url)}`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchMetadata();
  }, [url]);

  if (loading) {
    return (
      <div className="my-6 flex animate-pulse items-center gap-4 rounded-3xl border border-border-subtle bg-surface-secondary/50 p-4">
        <div className="h-20 w-20 shrink-0 rounded-2xl bg-elevated/50" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-3/4 rounded-full bg-elevated/50" />
          <div className="h-3 w-1/2 rounded-full bg-elevated/20" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-text-muted opacity-20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="my-4 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface-secondary px-4 py-3 text-sm font-bold text-primary transition hover:border-primary/30"
      >
        <ExternalLink className="h-4 w-4" />
        {url}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group my-8 block overflow-hidden rounded-[32px] border border-border-subtle bg-surface shadow-sm transition hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5"
    >
      <div className="flex flex-col md:flex-row">
        {data.image && (
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-elevated/30 md:aspect-square md:w-48">
            <SafeImage
              src={data.image}
              alt={data.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-1 flex-col justify-center p-5 md:p-6">
          <div className="mb-2 flex items-center gap-2">
            {data.favicon ? (
              <img src={data.favicon} alt="" className="h-4 w-4 rounded-sm" />
            ) : (
              <Globe className="h-3.5 w-3.5 text-text-muted" />
            )}
            <span className="text-[11px] font-black uppercase tracking-wider text-text-muted">
              {data.siteName || new URL(url).hostname}
            </span>
          </div>
          <h4 className="mb-2 line-clamp-2 text-lg font-black text-text-primary group-hover:text-primary">
            {data.title}
          </h4>
          <p className="line-clamp-2 text-sm leading-relaxed text-text-secondary opacity-80">
            {data.description}
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 transition group-hover:opacity-100">
            <span>زيارة الرابط</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </a>
  );
}
