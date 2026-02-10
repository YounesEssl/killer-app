export type GameStatus = "lobby" | "active" | "finished";

export type Game = {
  id: string;
  name: string;
  join_code: string;
  admin_password: string;
  status: GameStatus;
  winner_id: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
};

export type Player = {
  id: string;
  game_id: string;
  name: string;
  avatar_emoji: string;
  kill_code: string;
  target_id: string | null;
  mission_id: number | null;
  is_alive: boolean;
  kill_count: number;
  joined_at: string;
  died_at: string | null;
  user_id: string | null;
};

export type KillEvent = {
  id: string;
  game_id: string;
  killer_id: string;
  victim_id: string;
  mission_description: string;
  survivors_count: number;
  killed_at: string;
};

export type PlayerWithTarget = Player & {
  target?: Player;
};

export type Database = {
  public: {
    Tables: {
      games: {
        Row: Game;
        Insert: Partial<Game> & Pick<Game, "name" | "join_code" | "admin_password">;
        Update: Partial<Game>;
        Relationships: [];
      };
      players: {
        Row: Player;
        Insert: Partial<Player> & Pick<Player, "game_id" | "name" | "kill_code">;
        Update: Partial<Player>;
        Relationships: [];
      };
      kill_events: {
        Row: KillEvent;
        Insert: Partial<KillEvent> & Pick<KillEvent, "game_id" | "killer_id" | "victim_id">;
        Update: Partial<KillEvent>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
