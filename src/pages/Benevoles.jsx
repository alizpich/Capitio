import React, { useEffect, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal, { Field, Input, Select } from '../components/ui/Modal'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ui/Toast'

const ROLES_DEFAULT = ['🍺 Buvette', '🟡 Arbitrage', '📋 Table de marque', '👋 Accueil']
const EMPTY_MATCH = { adversaire: '', equipe: 'Senior', terrain: '', competition: '', date_match: new Date().toISOString().slice(0,16) }

export default function Benevoles() {
  const [matchs, setMatchs] = useState([])
  const [membres, setMembres] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('match')
  const [modalMatch, setModalMatch] = useState(false)
  const [modalAffect, setModalAffect] = useState(null) // {roleId, matchTitle}
  const [formMatch, setFormMatch] = useState(EMPTY_MATCH)
  const [formAffect, setFormAffect] = useState({ membre_id: '', statut: 'confirme' })
  const [saving, setSaving] = useState(false)
  const { toasts, success, error: toastError } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: m }, { data: mb }] = await Promise.all([
      supabase.from('matchs')
        .select(`*, roles_benevoles(*, affectations(*, membres(prenom, nom)))`)
        .order('date_match', { ascending: true }),
      supabase.from('membres').select('id, prenom, nom, is_coach').eq('actif', true).order('nom'),
    ])
    setMatchs(m || [])
    setMembres(mb || [])
    setLoading(false)
  }

  const set = k => e => setFormMatch(f => ({ ...f, [k]: e.target.value }))

  async function saveMatch() {
    setSaving(true)
    const { data: newMatch, error } = await supabase.from('matchs').insert(formMatch).select().single()
    if (error) { toastError(error.message); setSaving(false); return }

    // Créer les rôles par défaut
    const roles = ROLES_DEFAULT.map(nom_role => ({ match_id: newMatch.id, nom_role, quota: nom_role.includes('Buvette') || nom_role.includes('Table') ? 2 : 1 }))
    await supabase.from('roles_benevoles').insert(roles)

    success('Match créé avec les rôles par défaut ✓')
    setModalMatch(false)
    setFormMatch(EMPTY_MATCH)
    load()
    setSaving(false)
  }

  async function saveAffect() {
    if (!formAffect.membre_id) return
    setSaving(true)
    const { error } = await supabase.from('affectations').upsert({
      role_id: modalAffect.roleId,
      membre_id: formAffect.membre_id,
      statut: formAffect.statut,
    })
    if (error) toastError(error.message)
    else { success('Bénévole affecté ✓'); setModalAffect(null); load() }
    setSaving(false)
  }

  async function removeAffect(affectId) {
    await supabase.from('affectations').delete().eq('id', affectId)
    success('Affectation supprimée')
    load()
  }

  // Calcul couverture
  function coverage(match) {
    const roles = match.roles_benevoles || []
    const total = roles.reduce((a, r) => a + r.quota, 0)
    const filled = roles.reduce((a, r) => a + Math.min(r.affectations?.length || 0, r.quota), 0)
    return { total, filled, pct: total > 0 ? filled / total : 0 }
  }

  const avColors = ['#4A7FFF','#9B59B6','#00A86B','#E53E3E','#F6A623','#0891B2','#7B5EA7','#1A5FFF']
  const avColor = m => m ? avColors[(m.prenom?.charCodeAt(0) ?? 0) % avColors.length] : '#9BA8B5'
  const initials = m => m ? `${m.prenom?.[0] ?? ''}${m.nom?.[0] ?? ''}`.toUpperCase() : '?'

  return (
    <PageShell
      title="Bénévoles"
      subtitle={`${matchs.length} matchs à domicile`}
      actions={<>
        <Button variant="ghost" onClick={() => success('⚙ Gestion des rôles — bientôt disponible','warn')}>⚙ Gérer les rôles</Button>
        <Button variant="orange" onClick={() => { setFormMatch(EMPTY_MATCH); setModalMatch(true) }}>+ Ajouter un match</Button>
      </>}
    >
      <ToastContainer toasts={toasts} />

      {/* Onglets */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 18, background: '#fff', borderRadius: '12px 12px 0 0', padding: '0 4px' }}>
        {[['match','Par match'],['planning','Planning par bénévole']].map(([k,l]) => (
          <div key={k} onClick={() => setActiveTab(k)}
            style={{
              padding: '11px 16px', fontSize: '0.84rem', fontWeight: activeTab===k ? 600 : 400,
              color: activeTab===k ? '#1A5FFF' : '#9BA8B5',
              borderBottom: `2.5px solid ${activeTab===k ? '#1A5FFF' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>{l}</div>
        ))}
      </div>

      {/* Alerte matchs incomplets */}
      {matchs.some(m => coverage(m).pct < 1) && (
        <div style={{ background: '#FFF0F0', border: '1px solid rgba(229,62,62,0.25)', borderRadius: 12, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, fontSize: '0.83rem' }}>
          ⚠️ <strong>{matchs.filter(m => coverage(m).pct < 1).length} match(s)</strong> n'ont pas le nombre requis de bénévoles.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9BA8B5' }}>Chargement…</div>
      ) : matchs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9BA8B5' }}>
          Aucun match. <span onClick={() => setModalMatch(true)} style={{ color: '#1A5FFF', cursor: 'pointer' }}>Ajouter le premier match →</span>
        </div>
      ) : activeTab === 'match' ? (

        /* ── VUE PAR MATCH ── */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {matchs.map(match => {
            const cov = coverage(match)
            const critColor = cov.pct === 1 ? '#00A86B' : cov.pct >= 0.6 ? '#F6A623' : '#E53E3E'
            const dateFmt = new Date(match.date_match)

            return (
              <div key={match.id} style={{
                background: '#fff', borderRadius: 16,
                border: `1px solid ${cov.pct < 0.6 ? 'rgba(229,62,62,0.3)' : cov.pct < 1 ? 'rgba(246,166,35,0.3)' : '#E2E8F0'}`,
                overflow: 'hidden',
              }}>
                {/* Header */}
                <div style={{
                  padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                  borderBottom: '1px solid #E2E8F0',
                  background: cov.pct < 0.6 ? '#FFF8F8' : cov.pct < 1 ? '#FFFDF5' : '#F5F7FA',
                }}>
                  <div style={{
                    width: 46, height: 50, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: cov.pct < 0.6 ? '#FFF0F0' : cov.pct < 1 ? '#FFF8EC' : '#EEF3FF',
                  }}>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 900, fontSize: '1.3rem', color: critColor, lineHeight: 1 }}>
                      {dateFmt.getDate()}
                    </div>
                    <div style={{ fontSize: '0.58rem', fontWeight: 700, color: critColor, textTransform: 'uppercase' }}>
                      {dateFmt.toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0B1A3E' }}>
                      {match.equipe} vs {match.adversaire} — Domicile
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9BA8B5', marginTop: 3, display: 'flex', gap: 14 }}>
                      {match.terrain && <span>📍 {match.terrain}</span>}
                      <span>🕐 {dateFmt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      {match.competition && <span>🏆 {match.competition}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 72, height: 5, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: 5, width: `${cov.pct * 100}%`, background: critColor, borderRadius: 99 }} />
                    </div>
                    <div style={{
                      padding: '5px 12px', borderRadius: 99, fontSize: '0.77rem', fontWeight: 600,
                      background: cov.pct === 1 ? '#E6F7F1' : cov.pct >= 0.6 ? '#FFF8EC' : '#FFF0F0',
                      color: critColor,
                    }}>
                      {cov.pct === 1 ? '✓' : cov.pct >= 0.6 ? '~' : '⚠'} {cov.filled}/{cov.total}
                    </div>
                  </div>
                </div>

                {/* Rôles */}
                <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {(match.roles_benevoles || []).map(role => {
                    const filled = role.affectations?.length || 0
                    const ok = filled >= role.quota
                    return (
                      <div key={role.id} style={{
                        background: '#F5F7FA', borderRadius: 12, padding: '12px 14px',
                        border: `1.5px ${ok ? 'solid transparent' : 'dashed #E2E8F0'}`,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0B1A3E' }}>
                            {role.nom_role}
                            <span style={{ fontWeight: 400, color: '#9BA8B5', marginLeft: 6, fontSize: '0.68rem' }}>{role.quota} requis</span>
                          </div>
                          <Badge variant={ok ? 'green' : filled > 0 ? 'yellow' : 'red'}>
                            {filled}/{role.quota} {ok ? '✓' : '⚠'}
                          </Badge>
                        </div>

                        {role.affectations?.map(a => (
                          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', marginBottom: 6 }}>
                            <div style={{ width: 26, height: 26, borderRadius: '50%', background: avColor(a.membres), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.64rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                              {initials(a.membres)}
                            </div>
                            <div style={{ flex: 1, fontSize: '0.77rem', fontWeight: 500, color: '#0B1A3E' }}>
                              {a.membres?.prenom} {a.membres?.nom}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: a.statut === 'confirme' ? '#00A86B' : '#F6A623' }}>
                              {a.statut === 'confirme' ? '✓' : '⏳'}
                            </span>
                            <button onClick={() => removeAffect(a.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9BA8B5', fontSize: '0.7rem', padding: 2 }}
                              title="Retirer">✕</button>
                          </div>
                        ))}

                        {filled < role.quota && (
                          <div onClick={() => { setModalAffect({ roleId: role.id, matchTitle: `${match.equipe} vs ${match.adversaire}`, roleName: role.nom_role }); setFormAffect({ membre_id: '', statut: 'confirme' }) }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8,
                              border: `1.5px dashed ${ok ? '#E2E8F0' : 'rgba(229,62,62,0.4)'}`,
                              fontSize: '0.75rem', color: ok ? '#9BA8B5' : '#E53E3E',
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#1A5FFF'}
                            onMouseOut={e => e.currentTarget.style.borderColor = ok ? '#E2E8F0' : 'rgba(229,62,62,0.4)'}
                          >
                            + {ok ? 'Ajouter' : `${role.quota - filled} bénévole(s) manquant(s)`}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

      ) : (
        /* ── PLANNING PAR BÉNÉVOLE ── */
        <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', overflowX: 'auto' }}>
          <div style={{ minWidth: 600 }}>
            {/* Header */}
            <div style={{ display: 'flex', background: '#F5F7FA', borderBottom: '1px solid #E2E8F0' }}>
              <div style={{ width: 190, flexShrink: 0, padding: '10px 14px', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9BA8B5', borderRight: '1px solid #E2E8F0' }}>
                Bénévole
              </div>
              {matchs.map(m => (
                <div key={m.id} style={{ flex: 1, padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #F5F7FA' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: coverage(m).pct < 1 ? '#E53E3E' : '#0B1A3E' }}>
                    {new Date(m.date_match).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} {coverage(m).pct < 1 ? '⚠' : ''}
                  </div>
                  <div style={{ fontSize: '0.63rem', color: '#9BA8B5' }}>{m.equipe} / {m.adversaire.slice(0,8)}</div>
                </div>
              ))}
              <div style={{ width: 60, flexShrink: 0, padding: '10px 8px', textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', color: '#9BA8B5', borderLeft: '1px solid #E2E8F0' }}>
                Total
              </div>
            </div>

            {/* Lignes bénévoles */}
            {membres.map(mb => {
              const assignments = matchs.map(match => {
                const roles = match.roles_benevoles || []
                const allAffects = roles.flatMap(r => r.affectations || [])
                const myAffects = allAffects.filter(a => a.membre_id === mb.id)
                return myAffects.length > 0 ? myAffects.map(a => {
                  const role = roles.find(r => r.id === a.role_id)
                  return role?.nom_role?.split(' ').slice(0,2).join(' ') || '—'
                }).join(' + ') : null
              })

              const total = assignments.filter(Boolean).length
              if (total === 0) return null

              const chipColor = (label) => {
                if (label?.includes('Buvette')) return { bg: '#FFF3EE', color: '#D05A1E' }
                if (label?.includes('Arbitrage')) return { bg: '#EEF3FF', color: '#1A5FFF' }
                if (label?.includes('Table')) return { bg: '#E0F7FA', color: '#0891B2' }
                return { bg: '#F5F7FA', color: '#6B7A8D' }
              }

              return (
                <div key={mb.id} style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', transition: 'background 0.12s' }}
                  onMouseOver={e => e.currentTarget.style.background = '#F8FAFF'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                  <div style={{ width: 190, flexShrink: 0, padding: '10px 14px', borderRight: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: avColor(mb), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                      {initials(mb)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0B1A3E' }}>{mb.prenom} {mb.nom}</div>
                      <div style={{ fontSize: '0.65rem', color: '#9BA8B5' }}>{mb.is_coach ? 'Coach' : 'Bénévole'}</div>
                    </div>
                  </div>
                  {assignments.map((a, i) => {
                    const c = chipColor(a)
                    return (
                      <div key={i} style={{ flex: 1, padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid #F5F7FA' }}>
                        {a ? (
                          <span style={{ padding: '3px 8px', borderRadius: 7, fontSize: '0.65rem', fontWeight: 600, background: c.bg, color: c.color, whiteSpace: 'nowrap' }}>
                            {a}
                          </span>
                        ) : (
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E2E8F0' }} />
                        )}
                      </div>
                    )
                  })}
                  <div style={{ width: 60, flexShrink: 0, padding: 8, textAlign: 'center', borderLeft: '1px solid #E2E8F0' }}>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0B1A3E' }}>{total}</div>
                    <div style={{ fontSize: '0.61rem', color: '#9BA8B5' }}>match{total > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}

            {/* Footer couverture */}
            <div style={{ display: 'flex', borderTop: '2px solid #E2E8F0', background: '#F5F7FA' }}>
              <div style={{ width: 190, flexShrink: 0, padding: '10px 14px', fontSize: '0.75rem', fontWeight: 700, color: '#0B1A3E', borderRight: '1px solid #E2E8F0' }}>
                Couverture
              </div>
              {matchs.map(m => {
                const cov = coverage(m)
                const c = cov.pct === 1 ? '#00A86B' : cov.pct >= 0.6 ? '#F6A623' : '#E53E3E'
                return (
                  <div key={m.id} style={{ flex: 1, padding: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '1rem', color: c }}>
                      {cov.filled}/{cov.total}
                    </div>
                    <div style={{ width: '80%', height: 4, background: '#E2E8F0', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: 4, width: `${cov.pct * 100}%`, background: c, borderRadius: 99 }} />
                    </div>
                  </div>
                )
              })}
              <div style={{ width: 60, flexShrink: 0, borderLeft: '1px solid #E2E8F0', padding: 8, textAlign: 'center' }}>
                <div style={{ fontSize: '0.65rem', color: '#9BA8B5' }}>Moy.</div>
                <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, color: '#0B1A3E' }}>
                  {matchs.length > 0 ? Math.round(matchs.reduce((a, m) => a + coverage(m).pct, 0) / matchs.length * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal nouveau match */}
      <Modal
        open={modalMatch}
        onClose={() => setModalMatch(false)}
        title="Ajouter un match à domicile"
        subtitle="Les rôles buvette, arbitrage et table de marque seront créés automatiquement."
        footer={<>
          <Button variant="ghost" onClick={() => setModalMatch(false)}>Annuler</Button>
          <Button variant="orange" loading={saving} onClick={saveMatch}>Créer le match</Button>
        </>}
      >
        <Field label="Équipe">
          <Select value={formMatch.equipe} onChange={e => setFormMatch(f => ({ ...f, equipe: e.target.value }))}>
            {['Senior','Senior F','U18','U15','U15 Fém.','U12'].map(e => <option key={e}>{e}</option>)}
          </Select>
        </Field>
        <Field label="Adversaire"><Input value={formMatch.adversaire} onChange={e => setFormMatch(f => ({ ...f, adversaire: e.target.value }))} required placeholder="ex. AS Bagneux" /></Field>
        <Field label="Date et heure"><Input type="datetime-local" value={formMatch.date_match} onChange={e => setFormMatch(f => ({ ...f, date_match: e.target.value }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Terrain"><Input value={formMatch.terrain} onChange={e => setFormMatch(f => ({ ...f, terrain: e.target.value }))} placeholder="ex. Terrain B" /></Field>
          <Field label="Compétition"><Input value={formMatch.competition} onChange={e => setFormMatch(f => ({ ...f, competition: e.target.value }))} placeholder="ex. Championnat D3" /></Field>
        </div>
      </Modal>

      {/* Modal affectation */}
      <Modal
        open={!!modalAffect}
        onClose={() => setModalAffect(null)}
        title="Affecter un bénévole"
        subtitle={modalAffect ? `${modalAffect.matchTitle} — ${modalAffect.roleName}` : ''}
        footer={<>
          <Button variant="ghost" onClick={() => setModalAffect(null)}>Annuler</Button>
          <Button variant="orange" loading={saving} onClick={saveAffect}>Affecter</Button>
        </>}
      >
        <Field label="Bénévole">
          <Select value={formAffect.membre_id} onChange={e => setFormAffect(f => ({ ...f, membre_id: e.target.value }))}>
            <option value="">— Choisir un bénévole —</option>
            {membres.map(m => (
              <option key={m.id} value={m.id}>{m.prenom} {m.nom}{m.is_coach ? ' 🎽' : ''}</option>
            ))}
          </Select>
        </Field>
        <Field label="Statut">
          <Select value={formAffect.statut} onChange={e => setFormAffect(f => ({ ...f, statut: e.target.value }))}>
            <option value="confirme">✓ Confirmé directement</option>
            <option value="en_attente">⏳ En attente de confirmation</option>
          </Select>
        </Field>
      </Modal>
    </PageShell>
  )
}
