export type AiQueryType =
  | "DATABASE"
  | "ANALYTICAL"
  | "OPINION"
  | "UNKNOWN";

export type Entity = "MUMI" | "CABERAWIT" | "KEGIATAN";
export type Action = "COUNT" | "LIST";

export interface AIIntent {
  action: Action;
  entity: Entity;
  filters?: {
    daerah?: string;
    desa?: string;
    kelompok?: string;
    jenjang?: string;
  };
}
