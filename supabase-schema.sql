-- KILLER App Database Schema
-- Run this SQL in your Supabase SQL editor

-- Table des parties
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code VARCHAR(6) UNIQUE NOT NULL,
  admin_password VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'lobby' CHECK (status IN ('lobby', 'active', 'finished')),
  winner_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- Table des joueurs
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_emoji TEXT DEFAULT '🎭',
  kill_code VARCHAR(4) NOT NULL,
  target_id UUID REFERENCES players(id),
  mission_id INT,
  is_alive BOOLEAN DEFAULT TRUE,
  kill_count INT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  died_at TIMESTAMPTZ,
  UNIQUE(game_id, kill_code),
  UNIQUE(game_id, name)
);

-- Table des événements de kill (pour le feed)
CREATE TABLE kill_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  killer_id UUID REFERENCES players(id),
  victim_id UUID REFERENCES players(id),
  mission_description TEXT,
  survivors_count INT,
  killed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour la performance
CREATE INDEX idx_players_game ON players(game_id);
CREATE INDEX idx_players_alive ON players(game_id, is_alive);
CREATE INDEX idx_kill_events_game ON kill_events(game_id);

-- Enable Realtime pour le feed
ALTER PUBLICATION supabase_realtime ADD TABLE kill_events;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE games;

-- Row Level Security (permissive for this app)
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE kill_events ENABLE ROW LEVEL SECURITY;

-- Allow all operations (the app uses service role key for mutations)
CREATE POLICY "Allow all on games" ON games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on kill_events" ON kill_events FOR ALL USING (true) WITH CHECK (true);
