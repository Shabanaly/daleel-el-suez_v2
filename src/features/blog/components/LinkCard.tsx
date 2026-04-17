'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ExternalLink, Globe, Loader2 } from 'lucide-react';
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
      <div className="my-3 flex animate-pulse items-center gap-3 rounded-xl border border-border-subtle bg-surface-secondary/30 p-2.5">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-elevated/50 md:h-14 md:w-14" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 w-1/4 rounded-full bg-elevated/50" />
          <div className="h-3.5 w-3/4 rounded-full bg-elevated/30" />
        </div>
        <Loader2 className="h-3.5 w-3.5 animate-spin text-text-muted opacity-20" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="my-3 flex items-center gap-2.5 rounded-lg border border-border-subtle bg-surface-secondary px-3 py-2 text-[11px] font-bold text-primary transition hover:border-primary/30"
      >
        <ExternalLink className="h-3 w-3" />
        <span className="truncate">{url}</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group my-5 flex items-center gap-3 overflow-hidden rounded-lg border border-border-subtle bg-surface/50 p-2.5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:bg-surface hover:shadow-md hover:shadow-primary/5 active:scale-[0.98] backdrop-blur-sm"
    >
      {/* Thumbnail */}
      {data.image && (
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-elevated/30 md:h-14 md:w-14">
          <SafeImage
            src={data.image}
            alt={data.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-110"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="mb-0.5 flex items-center gap-1 overflow-hidden">
          {data.favicon ? (
            <img src={data.favicon} alt="" className="h-2.5 w-2.5 shrink-0 rounded-[2px]" />
          ) : (
            <Globe className="h-2.5 w-2.5 shrink-0 text-text-muted" />
          )}
          <span className="truncate text-[9px] font-black uppercase tracking-widest text-text-muted opacity-70">
            {data.siteName || new URL(url).hostname}
          </span>
        </div>
        
        <h4 className="line-clamp-1 text-xs font-black text-text-primary transition-colors group-hover:text-primary md:text-sm">
          {data.title}
        </h4>
        
        {/* Optional: Tiny description for desktop if space permits */}
        {data.description && (
          <p className="mt-0.5 hidden line-clamp-1 text-[10px] font-medium text-text-muted opacity-80 md:block">
            {data.description}
          </p>
        )}
      </div>

      {/* Action Area */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10">
        <ChevronLeft className="h-4 w-4 translate-x-1 text-primary transition-transform group-hover:translate-x-0" />
      </div>
    </a>
  );
}
