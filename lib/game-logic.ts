import type { Player } from "./supabase/types";
import { shuffleArray } from "./utils";
import { MISSIONS } from "./missions";

export function createKillChain(
  players: Player[]
): { id: string; target_id: string; mission_id: number }[] {
  const shuffled = shuffleArray(players);
  const availableMissions = shuffleArray([...MISSIONS]);

  return shuffled.map((player, index) => {
    const nextIndex = (index + 1) % shuffled.length;
    return {
      id: player.id,
      target_id: shuffled[nextIndex].id,
      mission_id: availableMissions[index % availableMissions.length].id,
    };
  });
}

export function validateKillCode(
  inputCode: string,
  targetCode: string
): boolean {
  return inputCode === targetCode;
}

export type KillResult = {
  success: boolean;
  error?: string;
  newTargetId?: string;
  newMissionId?: number;
  survivorsCount?: number;
  isGameOver?: boolean;
  winnerId?: string;
};
