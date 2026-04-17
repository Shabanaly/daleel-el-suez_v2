'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { LinkCard } from './LinkCard';

interface RichContentProps {
  content: string;
}

export function RichContent({ content }: RichContentProps) {
  if (!content) return null;

  return (
    <div className="rich-content space-y-6 text-base leading-[2.1] text-text-secondary md:text-lg text-right" dir="rtl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeRaw,
          [rehypeSanitize, {
            ...defaultSchema,
            tagNames: [...(defaultSchema.tagNames || []), 'iframe', 'script', 'video', 'source', 'div', 'span'],
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
            const isNakedLink = props.children === props.href;
            if (isNakedLink && props.href) {
              return <LinkCard url={props.href} />;
            }
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
