/**
 * Next.js Suspense loading UI — automatically shown during page navigation.
 * Displayed by Next.js when a page is being fetched (server component data loading).
 */
export default function Loading() {
  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#07070f',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* ── Ambient neon red glow ── */}
      <div style={{
        position: 'absolute',
        top: '30%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(229,9,20,0.12) 0%, transparent 70%)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* ── Hero skeleton ── */}
      <div style={{
        height: '100vh',
        background: 'linear-gradient(135deg, rgba(229,9,20,0.04) 0%, rgba(15,15,30,1) 60%)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0 4rem 3.5rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ maxWidth: '520px', width: '100%' }}>
          {/* Badges skeleton */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <SkeletonBlock width="70px" height="22px" radius="12px" />
            <SkeletonBlock width="90px" height="22px" radius="12px" />
            <SkeletonBlock width="40px" height="22px" radius="12px" />
          </div>
          {/* Title skeleton */}
          <SkeletonBlock width="380px" height="52px" radius="8px" style={{ marginBottom: '12px' }} />
          <SkeletonBlock width="260px" height="36px" radius="8px" style={{ marginBottom: '20px' }} />
          {/* Synopsis skeleton */}
          <SkeletonBlock width="100%" height="14px" radius="4px" style={{ marginBottom: '8px' }} />
          <SkeletonBlock width="90%" height="14px" radius="4px" style={{ marginBottom: '8px' }} />
          <SkeletonBlock width="75%" height="14px" radius="4px" style={{ marginBottom: '28px' }} />
          {/* Buttons skeleton */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <SkeletonBlock width="160px" height="44px" radius="24px" />
            <SkeletonBlock width="130px" height="44px" radius="24px" />
          </div>
        </div>
      </div>

      {/* ── Movie lanes skeleton ── */}
      <div style={{ padding: '2rem 0', zIndex: 1, position: 'relative' }}>
        {[1, 2, 3].map(lane => (
          <div key={lane} style={{ marginBottom: '2.5rem' }}>
            {/* Lane title */}
            <div style={{ padding: '0 4rem', marginBottom: '1rem' }}>
              <SkeletonBlock width="200px" height="26px" radius="6px" />
            </div>
            {/* Cards row */}
            <div style={{ display: 'flex', gap: '1rem', padding: '0 4rem', overflowX: 'hidden' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} style={{ flexShrink: 0, width: '160px' }}>
                  <SkeletonBlock width="160px" height="240px" radius="10px" style={{ marginBottom: '8px' }} />
                  <SkeletonBlock width="130px" height="14px" radius="4px" style={{ marginBottom: '6px' }} />
                  <SkeletonBlock width="90px" height="12px" radius="4px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CSS for shimmer animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes filmku-shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .skeleton-block {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.10) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 600px 100%;
          animation: filmku-shimmer 1.6s infinite linear;
        }
      `}} />
    </div>
  );
}

/* ── Skeleton block helper ── */
function SkeletonBlock({
  width, height, radius = '6px', style = {}
}: { width: string | number; height: string | number; radius?: string; style?: React.CSSProperties }) {
  return (
    <div
      className="skeleton-block"
      style={{
        width,
        height,
        borderRadius: radius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
