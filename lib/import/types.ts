export type ColumnMapping = {
  sourceColumn: string;
  targetField: string;
  confidence: number;
};

export type ImportBatch = {
  id: string;
  filename: string;
  totalRows: number;
  newParticipants: number;
  updatedParticipants: number;
  conflicts: number;
  createdAt: string;
  status: "processing" | "completed" | "error";
};

export type ParsedFile = {
  filename: string;
  headers: string[];
  rows: Record<string, string | null | undefined>[];
  totalRows: number;
};

export type MatchResult = {
  existingParticipantId: string | null;
  confidence: number;
  matchType: "exact" | "high" | "medium" | "low" | "none";
  suggestedMerge: boolean;
};

export type ImportResult = {
  newParticipants: Array<{
    row: Record<string, string | null | undefined>;
    mapping: ColumnMapping[];
  }>;
  updates: Array<{
    existingId: string;
    row: Record<string, string | null | undefined>;
    mapping: ColumnMapping[];
    confidence: number;
  }>;
  conflicts: Array<{
    row: Record<string, string | null | undefined>;
    candidates: Array<{
      participantId: string;
      participantName: string;
      confidence: number;
    }>;
  }>;
};
