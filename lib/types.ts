export type EntryStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "REMOVED" | "FAILED"
export type PaloStatus = "QUEUED" | "SYNCED" | "ERROR" | "UNSYNCED"
export type EntryKind = "ip" | "domain"
export type IntegrationMode = "address-objects" | "edl"

export interface BlockingEntry {
  id: string
  input: string
  kind: EntryKind
  resolvedIps: string[]
  comment: string
  expiresAt: number // timestamp
  status: EntryStatus
  paloStatus: PaloStatus
  createdBy: string
  createdAt: number
  updatedAt: number
  removedAt?: number
}

export interface AuditLog {
  id: string
  entryId?: string
  action: string
  details?: Record<string, any>
  actor: string
  createdAt: number
}

export interface Settings {
  integrationMode: IntegrationMode
  dryRun: boolean
  edlToken?: string
  paloAltoApiUrl?: string
  paloAltoApiKey?: string
  addressGroupName?: string
}
