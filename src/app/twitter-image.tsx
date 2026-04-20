import { ImageResponse } from 'next/og';
import { APP_CONFIG } from '@/constants';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = APP_CONFIG.NAME;
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '40px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '400px',
            height: '400px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '50%',
            filter: 'blur(80px)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '60px 80px',
            borderRadius: '40px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1
            style={{
              fontSize: '84px',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '20px',
              letterSpacing: '-2px',
            }}
          >
            {APP_CONFIG.NAME}
          </h1>

          <p
            style={{
              fontSize: '32px',
              fontWeight: 400,
              color: '#94a3b8',
              marginTop: '10px',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            {APP_CONFIG.TAGLINE}
          </p>

          <div
            style={{
              marginTop: '40px',
              fontSize: '24px',
              fontWeight: 600,
              color: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '10px 30px',
              borderRadius: '100px',
            }}
          >
            {new URL(APP_CONFIG.BASE_URL).hostname}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
