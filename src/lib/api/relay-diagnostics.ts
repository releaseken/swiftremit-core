// ---------------------------------------------------------------------------
// Relay diagnostics DTOs shared by the UI and (previously) the API layer.
// These mirror the server's relay diagnostics response shape.
// ---------------------------------------------------------------------------

export interface RelayDiagnostics {
  relayId: string;
  queueDepth: number;
  retryCount: number;
  lastSuccessAt: string | null;
  lastFailureAt: string | null;
  deadLetterCount: number;
}

export interface RelayDiagnosticsSignals {
  isDelayed: boolean;
  isRetryStorm: boolean;
  isDegraded: boolean;
}

export type RelayDiagnosticsStatus = "healthy" | "degraded" | "failing" | "empty";

export interface RelayDiagnosticsResponse extends RelayDiagnostics {
  status: RelayDiagnosticsStatus;
  signals: RelayDiagnosticsSignals;
}
