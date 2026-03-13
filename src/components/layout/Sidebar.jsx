import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const NAV = [
  { section: 'Principal' },
  { to: '/app/dashboard',   icon: '🏠', label: 'Tableau de bord' },
  { to: '/app/membres',     icon: '👥', label: 'Membres' },
  { to: '/app/tresorerie',  icon: '💰', label: 'Trésorerie' },
  { to: '/app/planning',    icon: '📅', label: 'Planning' },
  { section: 'Club' },
  { to: '/app/benevoles',   icon: '🙋', label: 'Bénévoles' },
  { to: '/app/evenements',  icon: '🎪', label: 'Événements' },
  { to: '/app/documents',   icon: '📁', label: 'Documents', soon: true },
]

export default function Sidebar() {
  const { club, profil, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const initials = profil
    ? `${profil.prenom?.[0] ?? ''}${profil.nom?.[0] ?? ''}`.toUpperCase()
    : '?'

  const sportIcons = { football: '⚽', rugby: '🏉', handball: '🤾', basketball: '🏀' }
  const sportIcon = sportIcons[club?.sport] ?? '🏆'

  return (
    <aside style={{
      background: '#0B1A3E', display: 'flex', flexDirection: 'column',
      height: '100vh', width: 230, flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '22px 20px 18px',
        fontFamily: "'Big Shoulders Display', sans-serif",
        fontWeight: 900, fontSize: '1.2rem', color: '#fff',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        letterSpacing: 0.5, flexShrink: 0,
      }}>
        CAPIT<span style={{ display: 'inline-block', width: 4, height: '0.9em', background: '#FF6B2B', margin: '0 1px', borderRadius: 1, position: 'relative', top: -1 }} />O
      </div>

      {/* Club pill */}
      <div style={{
        margin: '12px 14px 4px', background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10,
        padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, background: '#1A5FFF', borderRadius: 7,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', flexShrink: 0,
        }}>{sportIcon}</div>
        <div>
          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
            {club?.nom ?? 'Mon Club'}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#9BA8B5', textTransform: 'capitalize' }}>
            Plan {club?.plan ?? 'starter'}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '8px 10px', flex: 1, overflowY: 'auto' }}>
        {NAV.map((item, i) => {
          if (item.section) return (
            <div key={i} style={{
              fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)',
              padding: '12px 10px 5px',
            }}>{item.section}</div>
          )

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={item.soon ? (e) => e.preventDefault() : undefined}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 9,
                padding: '8px 10px', borderRadius: 8, marginBottom: 2,
                fontSize: '0.82rem', textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.42)',
                background: isActive ? 'rgba(26,95,255,0.2)' : 'transparent',
                position: 'relative', transition: 'all 0.15s',
                opacity: item.soon ? 0.5 : 1,
                cursor: item.soon ? 'default' : 'pointer',
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span style={{
                      position: 'absolute', left: 0, top: '20%', height: '60%',
                      width: 3, borderRadius: '0 2px 2px 0', background: '#1A5FFF',
                    }} />
                  )}
                  <span style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {item.soon && (
                    <span style={{
                      marginLeft: 'auto', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)',
                      background: 'rgba(255,255,255,0.06)', padding: '1px 6px', borderRadius: 99,
                    }}>bientôt</span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', background: '#1A5FFF',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.72rem', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.79rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {profil?.prenom} {profil?.nom}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#9BA8B5', textTransform: 'capitalize' }}>
            {profil?.role ?? 'admin'}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          title="Déconnexion"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', padding: 4,
            borderRadius: 6, transition: 'color 0.15s',
          }}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
        >↩</button>
      </div>
    </aside>
  )
}
