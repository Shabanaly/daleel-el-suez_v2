"use client";

/**
 * global-error.tsx — Root-level Error Boundary (Next.js App Router)
 *
 * This component catches any unhandled error that bubbles up through the
 * entire root layout, including errors from providers, ad scripts, and
 * third-party libraries. Without this file, Next.js shows the raw
 * "Application error: a client-side exception has occurred" screen.
 *
 * IMPORTANT: This component replaces the <html> and <body> tags,
 * so it must include them.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console (or a monitoring service)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>حدث خطأ - دليل السويس</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
            background: #0a0a0f;
            color: #e2e8f0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }
          .orb {
            position: fixed;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.15;
            pointer-events: none;
          }
          .orb-1 {
            width: 600px; height: 600px;
            background: #3b82f6;
            top: -200px; left: -200px;
          }
          .orb-2 {
            width: 500px; height: 500px;
            background: #8b5cf6;
            bottom: -150px; right: -150px;
          }
          .card {
            position: relative;
            z-index: 10;
            text-align: center;
            padding: 3rem 2.5rem;
            border-radius: 2rem;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(24px);
            max-width: 480px;
            width: 90%;
            box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
          }
          .icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            display: block;
          }
          h1 {
            font-size: 1.6rem;
            font-weight: 800;
            color: #f1f5f9;
            margin-bottom: 0.75rem;
          }
          p {
            color: #94a3b8;
            line-height: 1.7;
            font-size: 0.95rem;
            margin-bottom: 2rem;
          }
          .btn-group {
            display: flex;
            gap: 0.75rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          button, a {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.75rem;
            border-radius: 0.875rem;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.2s ease;
            border: none;
            font-family: inherit;
          }
          .btn-primary {
            background: linear-gradient(135deg, #3b82f6, #6366f1);
            color: white;
            box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          }
          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 24px rgba(99, 102, 241, 0.6);
          }
          .btn-secondary {
            background: rgba(255,255,255,0.08);
            color: #94a3b8;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .btn-secondary:hover {
            background: rgba(255,255,255,0.12);
            color: #e2e8f0;
          }
          .error-code {
            margin-top: 2rem;
            font-size: 0.7rem;
            color: rgba(148, 163, 184, 0.4);
            font-family: monospace;
            word-break: break-all;
          }
        `}</style>
      </head>
      <body>
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="card">
          <span className="icon">⚡</span>
          <h1>حدث خطأ مؤقت</h1>
          <p>
            واجه الموقع مشكلة غير متوقعة. لا تقلق، هذا لا يؤثر على بياناتك.
            يمكنك المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
          </p>
          <div className="btn-group">
            <button className="btn-primary" onClick={() => reset()}>
              🔄 إعادة المحاولة
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a className="btn-secondary" href="/">
              🏠 الصفحة الرئيسية
            </a>
          </div>
          {error?.digest && (
            <p className="error-code">رمز الخطأ: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
