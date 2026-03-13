import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profil, setProfil] = useState(null)
  const [club, setClub] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfil(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) loadProfil(session.user.id)
      else { setProfil(null); setClub(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadProfil(userId) {
    const { data: profilData } = await supabase
      .from('profils')
      .select('*, clubs(*)')
      .eq('id', userId)
      .single()

    if (profilData) {
      setProfil(profilData)
      setClub(profilData.clubs)
    }
    setLoading(false)
  }

  async function signUp({ email, password, prenom, nom, clubNom, sport }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom, club_nom: clubNom, sport }
      }
    })
    return { data, error }
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profil, club, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être dans AuthProvider')
  return ctx
}
