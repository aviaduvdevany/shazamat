export interface Player {
  id: string;
  name: string;
  role: string;
  photoUrl: string | null;
}

export const PLAYERS: Player[] = [
  { id: "nimrod", name: "נמרוד ויאלגוס", role: "🎸", photoUrl: null },
  { id: "aviad", name: "אביעד דובדבני", role: "🎸", photoUrl: null },
  { id: "itai", name: "איתי גרינברג", role: "🥁", photoUrl: null },
  { id: "riff", name: "ריף שפירא", role: "🎹", photoUrl: null },
  { id: "shai", name: "שי קולבר", role: "🎛️", photoUrl: null },
];

export const PLAYER_IDS = new Set(PLAYERS.map((p) => p.id));
