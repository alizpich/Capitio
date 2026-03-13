-- ══════════════════════════════════════════════════════
-- CAPITIO — Schéma base de données
-- Coller dans Supabase > SQL Editor > New query > Run
-- ══════════════════════════════════════════════════════

-- ── Clubs ──
create table clubs (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  sport text default 'football',
  plan text default 'starter' check (plan in ('starter','club','district')),
  created_at timestamptz default now()
);

-- ── Profils utilisateurs (liés à auth.users) ──
create table profils (
  id uuid primary key references auth.users(id) on delete cascade,
  club_id uuid references clubs(id) on delete cascade,
  prenom text,
  nom text,
  role text default 'admin' check (role in ('admin','secretaire','tresorier','coach')),
  created_at timestamptz default now()
);

-- ── Membres du club ──
create table membres (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade not null,
  prenom text not null,
  nom text not null,
  email text,
  telephone text,
  equipe text,
  is_coach boolean default false,
  equipement_coach text,
  date_naissance date,
  licence_statut text default 'en_attente' check (licence_statut in ('valide','en_attente','expiree')),
  certificat_date date,
  cotisation_statut text default 'en_attente' check (cotisation_statut in ('reglee','en_attente','en_retard')),
  actif boolean default true,
  created_at timestamptz default now()
);

-- ── Opérations de trésorerie ──
create table operations (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade not null,
  type text not null check (type in ('recette','depense')),
  libelle text not null,
  montant numeric(10,2) not null,
  categorie text,
  date_operation date default current_date,
  created_at timestamptz default now()
);

-- ── Créneaux planning ──
create table creneaux (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade not null,
  titre text not null,
  type text default 'entrainement' check (type in ('entrainement','match','reunion','evenement','autre')),
  equipe text,
  terrain text,
  date_debut timestamptz not null,
  date_fin timestamptz not null,
  created_at timestamptz default now()
);

-- ── Matchs à domicile (pour les bénévoles) ──
create table matchs (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade not null,
  adversaire text not null,
  equipe text not null,
  terrain text,
  date_match timestamptz not null,
  competition text,
  created_at timestamptz default now()
);

-- ── Rôles bénévoles configurés par match ──
create table roles_benevoles (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matchs(id) on delete cascade not null,
  nom_role text not null,
  quota integer default 1,
  created_at timestamptz default now()
);

-- ── Affectations bénévoles ──
create table affectations (
  id uuid primary key default gen_random_uuid(),
  role_id uuid references roles_benevoles(id) on delete cascade not null,
  membre_id uuid references membres(id) on delete cascade not null,
  statut text default 'en_attente' check (statut in ('confirme','en_attente','refuse')),
  created_at timestamptz default now(),
  unique(role_id, membre_id)
);

-- ── Événements ──
create table evenements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid references clubs(id) on delete cascade not null,
  type text default 'autre' check (type in ('tournoi','gala','ag','reunion','autre')),
  nom text not null,
  description text,
  lieu text,
  date_debut timestamptz,
  date_fin timestamptz,
  capacite integer,
  created_at timestamptz default now()
);

-- ══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY — chaque club ne voit que ses données
-- ══════════════════════════════════════════════════════

alter table clubs enable row level security;
alter table profils enable row level security;
alter table membres enable row level security;
alter table operations enable row level security;
alter table creneaux enable row level security;
alter table matchs enable row level security;
alter table roles_benevoles enable row level security;
alter table affectations enable row level security;
alter table evenements enable row level security;

-- Helpers
create or replace function my_club_id()
returns uuid language sql stable
as $$
  select club_id from profils where id = auth.uid()
$$;

-- Policies membres
create policy "membres: club only" on membres
  for all using (club_id = my_club_id());

-- Policies opérations
create policy "operations: club only" on operations
  for all using (club_id = my_club_id());

-- Policies créneaux
create policy "creneaux: club only" on creneaux
  for all using (club_id = my_club_id());

-- Policies matchs
create policy "matchs: club only" on matchs
  for all using (club_id = my_club_id());

-- Policies rôles bénévoles
create policy "roles_benevoles: club only" on roles_benevoles
  for all using (
    match_id in (select id from matchs where club_id = my_club_id())
  );

-- Policies affectations
create policy "affectations: club only" on affectations
  for all using (
    role_id in (
      select rb.id from roles_benevoles rb
      join matchs m on m.id = rb.match_id
      where m.club_id = my_club_id()
    )
  );

-- Policies événements
create policy "evenements: club only" on evenements
  for all using (club_id = my_club_id());

-- Profils
create policy "profils: own" on profils
  for all using (id = auth.uid());

-- Clubs
create policy "clubs: own" on clubs
  for all using (
    id in (select club_id from profils where id = auth.uid())
  );

-- ══════════════════════════════════════════════════════
-- TRIGGER : créer profil + club à l'inscription
-- ══════════════════════════════════════════════════════

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  new_club_id uuid;
begin
  insert into clubs (nom, sport)
  values (
    coalesce(new.raw_user_meta_data->>'club_nom', 'Mon Club'),
    coalesce(new.raw_user_meta_data->>'sport', 'football')
  )
  returning id into new_club_id;

  insert into profils (id, club_id, prenom, nom, role)
  values (
    new.id,
    new_club_id,
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    'admin'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
