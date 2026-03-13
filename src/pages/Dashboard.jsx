import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'

function KpiCard({ label, value, delta, deltaType, color }) {
  const colors = { green: '#00A86B', blue: '#1A5FFF', orange: '#FF6B2B', red: '#E53E3E', purple: '#7B5EA7' }
  const c = colors[color] || colors.blue
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14,
      padding: '18px 20px', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c }} />
      <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9BA8B5', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: '2rem', color: '#0B1A3E', lineHeight: 1 }}>
        {value ?? '—'}
      </div>
      {delta && (
        <div style={{ fontSize: '0.74rem', marginTop: 5, color: deltaType === 'up' ? '#00A86B' : deltaType === 'down' ? '#E53E3E' : '#F6A623' }}>
          {delta}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { club, profil } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ membres: 0, solde: 0, impayees: 0, certificats: 0 })
  const [creneaux, setCreneaux] = useState([])
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    if (!club) return
    loadStats()
    loadCreneaux()
  }, [club])

  async function loadStats() {
    const [{ count: membres }, { data: ops }, { count: impayees }, { count: certificats }] = await Promise.all([
      supabase.from('membres').select('*', { count: 'exact', head: true }).eq('actif', true),
      supabase.from('operations').select('type, montant'),
      supabase.from('membres').select('*', { count: 'exact', head: true }).eq('cotisation_statut', 'en_retard'),
      supabase.from('membres').select('*', { count: 'exact', head: true }).lte('certificat_date', new Date(Date.now() + 14*24*60*60*1000).toISOString().split('T')[0]),
    ])

    const solde = (ops || []).reduce((acc, op) => acc + (op.type === 'recette' ? +op.montant : -op.montant), 0)
    setStats({ membres: membres || 0, solde, impayees: impayees || 0, certificats: certificats || 0 })
  }

  async function loadCreneaux() {
    const now = new Date().toISOString()
    const { data } = await supabase
      .from('creneaux')
      .select('*')
      .gte('date_debut', now)
      .order('date_debut', { ascending: true })
      .limit(5)
    setCreneaux(data || [])
  }

  const typeColors = { match: '#00A86B', entrainement: '#1A5FFF', reunion: '#7B5EA7', evenement: '#FF6B2B' }
  const typeIcons  = { match: '⚽', entrainement: '🏃', reunion: '🏛️', evenement: '🎪' }

  return (
    <PageShell
      title="Tableau de bord"
      subtitle={`Bonjour ${profil?.prenom ?? ''} 👋 — ${today}`}
      actions={
        <Button variant="blue" onClick={() => navigate('/app/membres')}>
          + Ajouter un membre
        </Button>
      }
    >
      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 22 }}>
        <KpiCard label="Membres actifs"      value={stats.membres}         delta="Saison en cours"     deltaType="neutral" color="green"  />
        <KpiCard label="Solde trésorerie"    value={`${stats.solde.toLocaleString('fr-FR')}€`} delta="Toutes catégories" deltaType="neutral" color="blue"   />
        <KpiCard label="Cotisations en retard" value={stats.impayees}       delta="À relancer"          deltaType="warn"    color="orange" />
        <KpiCard label="Certificats à renouveler" value={stats.certificats} delta="Sous 14 jours"       deltaType="down"    color="red"    />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Agenda */}
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9BA8B5' }}>
              Prochains créneaux
            </div>
            <span onClick={() => navigate('/app/planning')} style={{ fontSize: '0.76rem', color: '#1A5FFF', fontWeight: 600, cursor: 'pointer' }}>
              Voir le planning →
            </span>
          </div>
          {creneaux.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#9BA8B5', fontSize: '0.85rem' }}>
              Aucun créneau à venir.<br />
              <span onClick={() => navigate('/app/planning')} style={{ color: '#1A5FFF', cursor: 'pointer' }}>
                Ajouter un créneau →
              </span>
            </div>
          ) : creneaux.map(c => {
            const d = new Date(c.date_debut)
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F7FA' }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: typeColors[c.type] || '#1A5FFF', flexShrink: 0 }} />
                <div style={{ fontSize: '0.72rem', color: '#9BA8B5', width: 38, flexShrink: 0 }}>
                  {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', color: '#0B1A3E', fontWeight: 500 }}>
                    {typeIcons[c.type]} {c.titre}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#9BA8B5' }}>
                    {d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {c.terrain ? ` · ${c.terrain}` : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Accès rapides */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: 18 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#9BA8B5', marginBottom: 14 }}>
              Accès rapides
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '👥', label: 'Membres',      to: '/app/membres' },
                { icon: '💰', label: 'Trésorerie',   to: '/app/tresorerie' },
                { icon: '📅', label: 'Planning',     to: '/app/planning' },
                { icon: '🙋', label: 'Bénévoles',    to: '/app/benevoles' },
                { icon: '🎪', label: 'Événements',   to: '/app/evenements' },
              ].map(item => (
                <div key={item.to}
                  onClick={() => navigate(item.to)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 12px', background: '#F5F7FA',
                    border: '1.5px solid #E2E8F0', borderRadius: 10,
                    fontSize: '0.81rem', fontWeight: 600, color: '#0B1A3E',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#1A5FFF'; e.currentTarget.style.color = '#1A5FFF'; e.currentTarget.style.background = '#EEF3FF' }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#0B1A3E'; e.currentTarget.style.background = '#F5F7FA' }}
                >
                  <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
