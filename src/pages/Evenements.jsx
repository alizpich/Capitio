import React, { useEffect, useState } from 'react'
import PageShell from '../components/layout/PageShell'
import { supabase } from '../lib/supabase'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal, { Field, Input, Select } from '../components/ui/Modal'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/ui/Toast'

const TYPES = ['tournoi','gala','ag','reunion','autre']
const TYPE_LABELS = { tournoi: '🏆 Tournoi', gala: '🎉 Gala', ag: '🏛️ AG', reunion: '📋 Réunion', autre: '📌 Autre' }
const TYPE_COLORS = { tournoi: '#7B5EA7', gala: '#FF6B2B', ag: '#1A5FFF', reunion: '#0891B2', autre: '#9BA8B5' }
const EMPTY = { type: 'tournoi', nom: '', description: '', lieu: '', date_debut: '', date_fin: '', capacite: '' }

export default function Evenements() {
  const [evts, setEvts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const { toasts, success, error: toastError } = useToast()

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('evenements').select('*').order('date_debut', { ascending: true })
    setEvts(data || [])
    setLoading(false)
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  async function save() {
    if (!form.nom) return
    setSaving(true)
    const payload = { ...form, capacite: form.capacite ? parseInt(form.capacite) : null }
    const { error } = await supabase.from('evenements').insert(payload)
    if (error) toastError(error.message)
    else { success('Événement créé ✓'); setModal(false); setForm(EMPTY); load() }
    setSaving(false)
  }

  async function deleteEvt(id) {
    if (!confirm('Supprimer cet événement ?')) return
    await supabase.from('evenements').delete().eq('id', id)
    success('Événement supprimé')
    load()
  }

  return (
    <PageShell
      title="Événements"
      subtitle={`${evts.length} événement(s)`}
      actions={<Button variant="orange" onClick={() => { setForm(EMPTY); setModal(true) }}>+ Créer un événement</Button>}
    >
      <ToastContainer toasts={toasts} />

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#9BA8B5' }}>Chargement…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 16 }}>
          {evts.map(ev => (
            <div key={ev.id} style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
              <div style={{ height: 7, background: TYPE_COLORS[ev.type] }} />
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: '0.67rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#9BA8B5', marginBottom: 6 }}>
                  {TYPE_LABELS[ev.type]}
                </div>
                <div style={{ fontFamily: "'Big Shoulders Display', sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#0B1A3E', marginBottom: 10 }}>
                  {ev.nom}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {ev.date_debut && (
                    <span style={{ fontSize: '0.72rem', color: '#6B7A8D', display: 'flex', alignItems: 'center', gap: 4 }}>
                      📅 {new Date(ev.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {ev.lieu && <span style={{ fontSize: '0.72rem', color: '#6B7A8D' }}>📍 {ev.lieu}</span>}
                  {ev.capacite && <span style={{ fontSize: '0.72rem', color: '#6B7A8D' }}>👥 {ev.capacite} places</span>}
                </div>
                {ev.description && (
                  <p style={{ fontSize: '0.78rem', color: '#9BA8B5', lineHeight: 1.5, marginBottom: 10 }}>
                    {ev.description.slice(0, 100)}{ev.description.length > 100 ? '…' : ''}
                  </p>
                )}
              </div>
              <div style={{ padding: '10px 16px', borderTop: '1px solid #E2E8F0', background: '#F5F7FA', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => deleteEvt(ev.id)}
                  style={{ fontSize: '0.76rem', color: '#9BA8B5', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}

          {/* Ajouter */}
          <div onClick={() => { setForm(EMPTY); setModal(true) }}
            style={{ border: '1.5px dashed #E2E8F0', borderRadius: 14, minHeight: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#9BA8B5', transition: 'all 0.15s', background: '#F5F7FA' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#1A5FFF'; e.currentTarget.style.color = '#1A5FFF'; e.currentTarget.style.background = '#EEF3FF' }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#9BA8B5'; e.currentTarget.style.background = '#F5F7FA' }}>
            <div style={{ fontSize: '2rem', marginBottom: 10 }}>＋</div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Créer un événement</div>
          </div>
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Créer un événement"
        footer={<>
          <Button variant="ghost" onClick={() => setModal(false)}>Annuler</Button>
          <Button variant="orange" loading={saving} onClick={save}>Créer l'événement</Button>
        </>}
      >
        <Field label="Type">
          <Select value={form.type} onChange={set('type')}>
            {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
          </Select>
        </Field>
        <Field label="Nom de l'événement"><Input value={form.nom} onChange={set('nom')} required placeholder="ex. Tournoi Printemps U12" /></Field>
        <Field label="Description"><Input value={form.description} onChange={set('description')} placeholder="Optionnel" /></Field>
        <Field label="Lieu"><Input value={form.lieu} onChange={set('lieu')} placeholder="ex. Complexe municipal" /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Date de début"><Input type="datetime-local" value={form.date_debut} onChange={set('date_debut')} /></Field>
          <Field label="Date de fin"><Input type="datetime-local" value={form.date_fin} onChange={set('date_fin')} /></Field>
        </div>
        <Field label="Capacité max (optionnel)"><Input type="number" value={form.capacite} onChange={set('capacite')} placeholder="ex. 120" /></Field>
      </Modal>
    </PageShell>
  )
}
