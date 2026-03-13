import React from 'react'

const styles = {
  container: {
    position: 'fixed', bottom: 28, right: 28,
    display: 'flex', flexDirection: 'column', gap: 8, zIndex: 9999,
  },
  toast: {
    padding: '12px 20px', borderRadius: 12,
    fontSize: '0.85rem', fontWeight: 500,
    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
    maxWidth: 340, display: 'flex', alignItems: 'center', gap: 8,
    animation: 'slideUp 0.3s ease',
  },
}

const COLORS = {
  default: { background: '#0B1A3E', color: '#fff' },
  success: { background: '#00A86B', color: '#fff' },
  error:   { background: '#E53E3E', color: '#fff' },
  warn:    { background: '#FF6B2B', color: '#fff' },
}

const ICONS = { success: '✅', error: '❌', warn: '⚠️', default: 'ℹ️' }

export default function ToastContainer({ toasts }) {
  return (
    <div style={styles.container}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      {toasts.map(t => (
        <div key={t.id} style={{ ...styles.toast, ...COLORS[t.type] }}>
          <span>{ICONS[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}
