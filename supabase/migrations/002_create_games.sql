-- Games catalog table (nomenclature)
CREATE TABLE public.games (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  min_players INTEGER NOT NULL CHECK (min_players >= 1),
  max_players INTEGER NOT NULL CHECK (max_players >= 1),
  min_age INTEGER NOT NULL DEFAULT 0 CHECK (min_age >= 0),
  game_duration TEXT NOT NULL, -- e.g. '30-60 min'
  complexity INTEGER NOT NULL CHECK (complexity >= 1 AND complexity <= 5),
  genre TEXT[] NOT NULL DEFAULT '{}',
  weight NUMERIC(4,2), -- kg
  description TEXT NOT NULL DEFAULT '',
  official_photos TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_players CHECK (max_players >= min_players)
);

-- RLS
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

-- Everyone can read approved games
CREATE POLICY "Approved games are viewable by everyone"
  ON public.games FOR SELECT
  USING (moderation_status = 'approved');

-- Creators can also see their own pending/rejected games
CREATE POLICY "Creators can view own games"
  ON public.games FOR SELECT
  USING (auth.uid() = created_by);

-- Authenticated users can insert games
CREATE POLICY "Authenticated users can create games"
  ON public.games FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = created_by);

-- Creator can update own pending games
CREATE POLICY "Creators can update own pending games"
  ON public.games FOR UPDATE
  USING (auth.uid() = created_by AND moderation_status = 'pending');

-- Admins can update any game (for moderation)
CREATE POLICY "Admins can update any game"
  ON public.games FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Auto-update updated_at
CREATE TRIGGER games_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Indexes
CREATE INDEX games_name_idx ON public.games USING gin (to_tsvector('simple', name));
CREATE INDEX games_genre_idx ON public.games USING gin (genre);
CREATE INDEX games_moderation_idx ON public.games (moderation_status);
CREATE INDEX games_created_by_idx ON public.games (created_by);
