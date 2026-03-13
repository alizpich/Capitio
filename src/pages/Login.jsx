import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const [form, setForm] = useState({
    email: '', password: '', prenom: '', nom: '', clubNom: '', sport: 'football',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setErreur('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn({ email: form.email, password: form.password })
      if (error) setErreur(error.message)
      else navigate('/app/dashboard')
    } else {
      const { error } = await signUp({
        email: form.email, password: form.password,
        prenom: form.prenom, nom: form.nom,
        clubNom: form.clubNom, sport: form.sport,
      })
      if (error) setErreur(error.message)
      else setErreur('✅ Vérifiez votre email pour confirmer votre compte.')
    }

    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #E2E8F0', borderRadius: 10,
    fontSize: '0.88rem', color: '#0B1A3E',
    fontFamily: 'inherit', outline: 'none', marginTop: 5,
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#0B1A3E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      <div style={{
        background: '#fff', borderRadius: 20, padding: '36px 40px',
        width: '100%', maxWidth: 440, position: 'relative', zIndex: 1,
        boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: "'Big Shoulders Display', sans-serif",
          fontWeight: 900, fontSize: '1.5rem', color: '#0B1A3E',
          marginBottom: 28, textAlign: 'center',
        }}>
          CAPIT<span style={{ display: 'inline-block', width: 4, height: '0.9em', background: '#FF6B2B', margin: '0 1px', borderRadius: 1, position: 'relative', top: -1 }} />O
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#F5F7FA', borderRadius: 10, padding: 3, marginBottom: 24 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setErreur('') }}
              style={{
                flex: 1, padding: '8px', borderRadius: 8, border: 'none',
                background: mode === m ? '#fff' : 'transparent',
                fontWeight: mode === m ? 600 : 400,
                color: mode === m ? '#0B1A3E' : '#6B7A8D',
                fontSize: '0.84rem', cursor: 'pointer',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                fontFamily: 'inherit',
              }}>
              {m === 'login' ? 'Connexion' : 'Créer un compte'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0B1A3E' }}>Prénom</label>
                  <input style={inputStyle} value={form.prenom} onChange={set('prenom')} required placeholder="Marie" />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0B1A3E' }}>Nom</label>
                  <input style={inputStyle} value={form.nom} onChange={set('nom')} required placeholder="Dupont" />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0B1A3E' }}>Nom de votre club</label>
                <input style={inputStyle} value={form.clubNom} onChange={set('clubNom')} required placeholder="ex. US Montrouge FC" />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0B1A3E' }}>Sport principal</label>
                <select style={{ ...inputStyle, background: '#fff' }} value={form.sport} onChange={set('sport')}>
                  <option value="football">⚽ Football</option>
                  <option value="rugby">🏉 Rugby</option>
                  <option value="handball">🤾 Handball</option>
                  <option value="basketball">🏀 Basketball</option>
                  <option value="autre">🏆 Autre</option>
                </select>
              </div>
            </>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0B1A3E' }}>Email</label>
            <input style={inputStyle} type="email" value={form.email} onChange={set('email')} required placeholder="vous@email.fr" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#0B1A3E' }}>Mot de passe</label>
            <input style={inputStyle} type="password" value={form.password} onChange={set('password')} required placeholder="••••••••" minLength={6} />
          </div>

          {erreur && (
            <div style={{
              padding: '10px 14px', borderRadius: 9, marginBottom: 14, fontSize: '0.82rem',
              background: erreur.startsWith('✅') ? '#E6F7F1' : '#FFF0F0',
              color: erreur.startsWith('✅') ? '#00A86B' : '#E53E3E',
              border: `1px solid ${erreur.startsWith('✅') ? 'rgba(0,168,107,0.2)' : 'rgba(229,62,62,0.2)'}`,
            }}>
              {erreur}
            </div>
          )}

          <Button type="submit" variant="blue" loading={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
            {mode === 'login' ? 'Se connecter →' : 'Créer mon compte →'}
          </Button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.76rem', color: '#9BA8B5' }}>
          Sans carte bancaire · Données hébergées en France · RGPD conforme
        </p>
      </div>
    </div>
  )
}
