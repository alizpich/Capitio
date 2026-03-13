# Capitio — Guide de déploiement

## Ce que tu as

Une app React complète avec :
- Authentification (inscription / connexion par email)
- Dashboard avec KPIs en temps réel
- Membres : CRUD complet, filtres, badge coach, alertes certificats
- Trésorerie : recettes/dépenses, solde, export
- Planning : créneaux, détection conflits terrains
- Bénévoles : affectation par rôle sur les matchs, planning croisé
- Événements : tournois, galas, AG

---

## Étape 1 — Supabase : créer la base de données

1. Va sur app.supabase.com → ton projet "capitio"
2. Clique sur **SQL Editor** dans le menu gauche
3. Clique **New query**
4. Copie-colle tout le contenu de `src/lib/database.sql`
5. Clique **Run** (▶)

---

## Étape 2 — Variables d'environnement

1. Copie le fichier `.env.example` en `.env.local`
2. Va dans Supabase → Settings → API
3. Remplace les valeurs dans `.env.local` :

```
VITE_SUPABASE_URL=https://TON_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=ta_clé_anon
```

---

## Étape 3 — Tester en local

```bash
npm install
npm run dev
```

Ouvre http://localhost:5173 — tu devrais voir la page de connexion.

---

## Étape 4 — Déployer sur Vercel

### Méthode simple (recommandée) :

1. Va sur github.com et crée un nouveau repository "capitio"
2. Upload tous les fichiers (drag & drop ou GitHub Desktop)
3. Va sur vercel.com → **New Project**
4. Importe le repository GitHub
5. Dans **Environment Variables**, ajoute :
   - `VITE_SUPABASE_URL` → ton URL Supabase
   - `VITE_SUPABASE_ANON_KEY` → ta clé anon
6. Clique **Deploy**

🎉 Ton app est en ligne avec une URL du type `capitio.vercel.app`

---

## Structure du projet

```
src/
├── App.jsx                  ← Routeur + protection auth
├── main.jsx                 ← Point d'entrée
├── index.css                ← Styles globaux
├── hooks/
│   ├── useAuth.js           ← Authentification
│   └── useToast.js          ← Notifications
├── lib/
│   ├── supabase.js          ← Client Supabase
│   └── database.sql         ← Schéma à coller dans Supabase
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx    ← Shell sidebar + contenu
│   │   ├── Sidebar.jsx      ← Navigation
│   │   └── PageShell.jsx    ← Topbar + wrapper
│   └── ui/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Badge.jsx
│       └── Toast.jsx
└── pages/
    ├── Login.jsx
    ├── Dashboard.jsx
    ├── Membres.jsx
    ├── Tresorerie.jsx
    ├── Planning.jsx
    ├── Benevoles.jsx
    └── Evenements.jsx
```
