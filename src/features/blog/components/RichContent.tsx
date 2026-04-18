'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';


interface RichContentProps {
  content: string;
}

export function RichContent({ content }: RichContentProps) {
  if (!content) return null;

  return (
    <div className="rich-content space-y-6 text-base leading-[2.1] text-text-secondary md:text-lg text-right [&_p.text-align-center]:text-center [&_p.text-align-right]:text-right [&_p.text-align-left]:text-left [&_h1.text-align-center]:text-center [&_h1.text-align-right]:text-right [&_h1.text-align-left]:text-left [&_h2.text-align-center]:text-center [&_h2.text-align-right]:text-right [&_h2.text-align-left]:text-left [&_h3.text-align-center]:text-center [&_h3.text-align-right]:text-right [&_h3.text-align-left]:text-left" dir="rtl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, {
            ...defaultSchema,
            tagNames: [...(defaultSchema.tagNames || []), 'iframe', 'script', 'video', 'source', 'div', 'span', 'ins'],
            attributes: {
              ...defaultSchema.attributes,
              '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'style', 'dir'],
              iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'className', 'style'],
              video: ['src', 'controls', 'autoplay', 'muted', 'loop', 'poster', 'className'],
              source: ['src', 'type'],
              script: ['src', 'async', 'defer', 'type', 'charset'],
            }
          }]
        ]}
        components={{
          // Custom Link Renderer
          a: ({ node, ...props }) => {
            const childrenText = Array.isArray(props.children) ? props.children.join('') : props.children;
            const isNakedLink = childrenText === props.href;
            
            if (isNakedLink && props.href) {
              const url = props.href;
              try {
                const urlObj = new URL(url);
                
                // 1. YouTube Embed
                if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
                  let videoId = '';
                  if (urlObj.hostname.includes('youtu.be')) {
                    videoId = urlObj.pathname.slice(1);
                  } else {
                    videoId = urlObj.searchParams.get('v') || '';
                  }
                  if (videoId) {
                    return (
                      <div className="my-8 aspect-video w-full overflow-hidden rounded-2xl shadow-xl border border-border-subtle bg-elevated">
                        <iframe 
                          src={`https://www.youtube.com/embed/${videoId}`} 
                          className="h-full w-full border-0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen 
                        />
                      </div>
                    );
                  }
                }
                
                // 2. Facebook Embed
                if (urlObj.hostname.includes('facebook.com') || urlObj.hostname.includes('fb.watch')) {
                  return (
                    <div className="my-8 flex w-full justify-center overflow-hidden rounded-2xl bg-surface p-2 shadow-lg border border-border-subtle">
                      <iframe 
                        src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=500`}
                        width="500" 
                        height="600" 
                        className="max-w-full overflow-hidden border-0"
                        scrolling="no" 
                        frameBorder="0" 
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                      />
                    </div>
                  );
                }
                
                // 3. Twitter / X Embed
                if (urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com')) {
                  return (
                    <div className="my-8 flex w-full justify-center">
                      <iframe 
                        src={`https://twitframe.com/show?url=${encodeURIComponent(url)}`}
                        className="w-full max-w-[550px] border-0"
                        height="400"
                        title="Twitter Embed"
                      />
                    </div>
                  );
                }
                
                // 4. Native Video or Audio
                if (url.match(/\.(mp4|webm|ogg)$/i)) {
                  return (
                    <div className="my-8 overflow-hidden rounded-2xl shadow-xl border border-border-subtle">
                      <video src={url} controls className="w-full h-auto" />
                    </div>
                  );
                }
              } catch (e) {
                // If invalid URL, proceed to default fallback
              }
            }
            
            // Standard hyperlinks
            return (
              <a
                className="font-black text-primary underline decoration-primary/30 underline-offset-4 transition hover:text-primary-hover hover:decoration-primary"
                target={props.href?.startsWith('http') ? '_blank' : undefined}
                rel={props.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                {...props}
              />
            );
          },
          // Custom Image Renderer
          img: ({ node, ...props }) => (
            <span className="my-8 block overflow-hidden rounded-xl border border-border-subtle bg-elevated/10 shadow-lg">
              <img
                {...props}
                className="h-auto w-full object-cover transition duration-700 hover:scale-105"
                loading="lazy"
              />
              {props.alt && (
                <span className="block border-t border-border-subtle bg-surface/50 px-5 py-3 text-center text-xs font-bold text-text-muted italic">
                  {props.alt}
                </span>
              )}
            </span>
          ),
          // Headings
          h1: ({ ...props }) => <h1 className="mt-12 text-3xl font-black text-text-primary md:text-4xl" {...props} />,
          h2: ({ ...props }) => <h2 className="mt-10 text-2xl font-black text-text-primary md:text-3xl" {...props} />,
          h3: ({ ...props }) => <h3 className="mt-8 text-xl font-black text-text-primary md:text-2xl" {...props} />,
          // List
          ul: ({ ...props }) => <ul className="my-6 list-inside list-disc space-y-3" {...props} />,
          ol: ({ ...props }) => <ol className="my-6 list-inside list-decimal space-y-3" {...props} />,
          li: ({ ...props }) => <li className="font-medium text-text-secondary" {...props} />,
          // Blockquote
          blockquote: ({ ...props }) => (
            <blockquote className="my-10 border-r-4 border-primary bg-primary/5 px-6 py-8 text-xl font-black italic leading-loose text-text-primary md:px-10" {...props} />
          ),
          // Code
          code: ({ inline, ...props }: any) => (
            inline ? 
            <code className="rounded-lg bg-surface-tertiary px-1.5 py-0.5 font-mono text-sm font-bold text-accent" {...props} /> :
            <pre className="my-8 overflow-x-auto rounded-xl border border-border-subtle bg-surface-secondary p-6 font-mono text-sm">
              <code {...props} />
            </pre>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
