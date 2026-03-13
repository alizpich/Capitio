import React from 'react'

const VARIANTS = {
  green:  { background: '#E6F7F1', color: '#00A86B', border: '1px solid rgba(0,168,107,0.2)' },
  red:    { background: '#FFF0F0', color: '#E53E3E', border: '1px solid rgba(229,62,62,0.2)' },
  orange: { background: '#FFF3EE', color: '#FF6B2B', border: '1px solid rgba(255,107,43,0.2)' },
  blue:   { background: '#EEF3FF', color: '#1A5FFF', border: '1px solid rgba(26,95,255,0.2)' },
  yellow: { background: '#FFF8EC', color: '#F6A623', border: '1px solid rgba(246,166,35,0.2)' },
  purple: { background: '#F0EEFF', color: '#7B5EA7', border: '1px solid rgba(123,94,167,0.2)' },
  gray:   { background: '#F5F7FA', color: '#6B7A8D', border: '1px solid #E2E8F0' },
  teal:   { background: '#E0F7FA', color: '#0891B2', border: '1px solid rgba(8,145,178,0.2)' },
}

export default function Badge({ children, variant = 'gray', style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      padding: '3px 9px', borderRadius: 99,
      fontSize: '0.69rem', fontWeight: 600,
      ...VARIANTS[variant], ...style,
    }}>
      {children}
    </span>
  )
}
