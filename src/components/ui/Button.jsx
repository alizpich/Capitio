import React from 'react'

const VARIANTS = {
  blue:    { background: '#1A5FFF', color: '#fff', border: 'none' },
  orange:  { background: '#FF6B2B', color: '#fff', border: 'none' },
  ghost:   { background: 'transparent', color: '#6B7A8D', border: '1.5px solid #E2E8F0' },
  danger:  { background: '#FFF0F0', color: '#E53E3E', border: '1.5px solid rgba(229,62,62,0.25)' },
  green:   { background: '#E6F7F1', color: '#00A86B', border: 'none' },
}

export default function Button({
  children, variant = 'blue', size = 'md',
  onClick, disabled, loading, style, type = 'button', ...rest
}) {
  const sizes = {
    sm: { padding: '5px 12px', fontSize: '0.76rem', borderRadius: 8 },
    md: { padding: '8px 16px', fontSize: '0.82rem', borderRadius: 9 },
    lg: { padding: '13px 28px', fontSize: '0.9rem',  borderRadius: 11 },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontFamily: 'inherit', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s', opacity: disabled ? 0.6 : 1,
        ...VARIANTS[variant], ...sizes[size], ...style,
      }}
      {...rest}
    >
      {loading ? '⏳' : children}
    </button>
  )
}
