export type GameStatus = "lobby" | "active" | "finished";

export type Account = {
  id: string;
  username: string;
  username_normalized: string;
  secret_code: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

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
  account_id: string | null;
  name: string;
  kill_code: string;
  target_id: string | null;
  mission_id: number | null;
  mission_description: string | null;
  is_alive: boolean;
  kill_count: number;
  joined_at: string;
  died_at: string | null;
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
