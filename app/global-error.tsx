'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body style={{ margin: 0, padding: 0, background: '#09090b', color: '#f4f4f5' }}>
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2>Terjadi Kesalahan Sistem</h2>
          <p>{error?.message || 'Aplikasi mengalami kendala yang tidak terduga.'}</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#10b981',
              color: '#000',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Muat Ulang Aplikasi
          </button>
        </div>
      </body>
    </html>
  );
}
