import type { BlockingEntry, AuditLog, Settings } from "./types"

const STORAGE_KEY_ENTRIES = "palo_entries"
const STORAGE_KEY_AUDIT = "palo_audit"
const STORAGE_KEY_SETTINGS = "palo_settings"

let entries: BlockingEntry[] = []
let auditLogs: AuditLog[] = []
let settings: Settings = {
  integrationMode: "edl",
  dryRun: true,
  edlToken: "",
}

// Initialize from localStorage
if (typeof window !== "undefined") {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ENTRIES)
    if (stored) entries = JSON.parse(stored)

    const storedAudit = localStorage.getItem(STORAGE_KEY_AUDIT)
    if (storedAudit) auditLogs = JSON.parse(storedAudit)

    const storedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS)
    if (storedSettings) settings = JSON.parse(storedSettings)
  } catch (e) {
    console.error("Failed to load from localStorage:", e)
  }
}

function saveToStorage() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_ENTRIES, JSON.stringify(entries))
    localStorage.setItem(STORAGE_KEY_AUDIT, JSON.stringify(auditLogs))
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings))
  }
}

export const storage = {
  getEntries: () => entries,
  getEntry: (id: string) => entries.find((e) => e.id === id),
  addEntry: (entry: BlockingEntry) => {
    entries.push(entry)
    saveToStorage()
  },
  updateEntry: (id: string, updates: Partial<BlockingEntry>) => {
    const idx = entries.findIndex((e) => e.id === id)
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], ...updates, updatedAt: Date.now() }
      saveToStorage()
    }
  },
  deleteEntry: (id: string) => {
    entries = entries.filter((e) => e.id !== id)
    saveToStorage()
  },

  getAuditLogs: () => auditLogs,
  addAuditLog: (log: AuditLog) => {
    auditLogs.push(log)
    saveToStorage()
  },

  getSettings: () => settings,
  updateSettings: (newSettings: Partial<Settings>) => {
    settings = { ...settings, ...newSettings }
    saveToStorage()
  },
}
