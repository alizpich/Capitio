import React, { useEffect } from 'react'
import Button from './Button'

export default function Modal({ open, onClose, title, subtitle, children, footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.() }
    if (open) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, backdropFilter: 'blur(2px)',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 18, padding: 28,
        width: 460, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.18)', position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            width: 28, height: 28, borderRadius: '50%',
            background: '#F5F7FA', border: 'none', cursor: 'pointer',
            fontSize: '0.8rem', color: '#6B7A8D',
          }}
        >✕</button>

        {title && (
          <div style={{ marginBottom: subtitle ? 4 : 20 }}>
            <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: '#0B1A3E' }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: '0.82rem', color: '#6B7A8D', marginTop: 4, marginBottom: 20 }}>
                {subtitle}
              </div>
            )}
          </div>
        )}

        {children}

        {footer && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 24 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0B1A3E', marginBottom: 5 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function Input({ ...props }) {
  return (
    <input
      style={{
        width: '100%', padding: '9px 12px',
        border: '1.5px solid #E2E8F0', borderRadius: 9,
        fontSize: '0.84rem', color: '#0B1A3E', outline: 'none',
        fontFamily: 'inherit',
      }}
      onFocus={e => e.target.style.borderColor = '#1A5FFF'}
      onBlur={e => e.target.style.borderColor = '#E2E8F0'}
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      style={{
        width: '100%', padding: '9px 12px',
        border: '1.5px solid #E2E8F0', borderRadius: 9,
        fontSize: '0.84rem', color: '#0B1A3E',
        background: '#fff', fontFamily: 'inherit', outline: 'none',
      }}
      {...props}
    >
      {children}
    </select>
  )
}
