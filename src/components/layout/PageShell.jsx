import React from 'react'

export default function PageShell({ title, subtitle, actions, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Topbar */}
      <div style={{
        background: '#fff', padding: '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #E2E8F0', flexShrink: 0, gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '1.3rem', color: '#0B1A3E' }}>
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: '0.82rem', color: '#9BA8B5', marginTop: 1 }}>{subtitle}</div>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {actions}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        {children}
      </div>
    </div>
  )
}
