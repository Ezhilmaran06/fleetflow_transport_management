import React from 'react';

export const SkeletonCard = () => (
  <div
    className="ff-card"
    style={{
      height: 120,
      animation: 'pulse 1.5s infinite ease-in-out',
      backgroundColor: 'var(--bg-surface-elevated)'
    }}
  />
);

export const SkeletonTable = ({ rows = 5, cols = 6 }) => (
  <div className="ff-table-container p-3">
    <div
      style={{
        height: 36,
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 4,
        marginBottom: 16
      }}
    />
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        style={{
          height: 48,
          backgroundColor: r % 2 === 0 ? 'var(--bg-surface-elevated)' : 'transparent',
          borderRadius: 4,
          marginBottom: 8,
          opacity: 0.6
        }}
      />
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div
    className="ff-card"
    style={{
      height: 320,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-surface-elevated)',
      opacity: 0.6
    }}
  >
    <span style={{ color: 'var(--text-muted)' }}>Loading analytics data...</span>
  </div>
);

export default function SkeletonLoader({ count = 3, height = 48 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            backgroundColor: 'var(--bg-surface-elevated, #1e293b)',
            borderRadius: 6,
            opacity: 0.6,
            animation: 'pulse 1.5s infinite ease-in-out'
          }}
        />
      ))}
    </div>
  );
}

