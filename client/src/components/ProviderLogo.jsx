import React, { useState } from 'react';

export default function ProviderLogo({
  provider,
  size = 52,
  maxImgHeight = 48,
  maxImgWidth = 140,
  radius = 'var(--radius-md)',
  fontSize = '1.2rem',
}) {
  const [failed, setFailed] = useState(false);
  const showImage = provider.logoUrl && !failed;

  if (showImage) {
    return (
      <img
        src={provider.logoUrl}
        alt={`Logo ${provider.name}`}
        style={{ maxHeight: `${maxImgHeight}px`, maxWidth: `${maxImgWidth}px`, objectFit: 'contain' }}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: radius,
        background: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize,
        flexShrink: 0,
      }}
      aria-label={`Logo ${provider.name}`}
    >
      {provider.name.slice(0, 2).toUpperCase()}
    </div>
  );
}
