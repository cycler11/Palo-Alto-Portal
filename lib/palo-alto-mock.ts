import type { BlockingEntry, Settings } from "./types"

export async function syncToPaloAlto(
  entry: BlockingEntry,
  settings: Settings,
): Promise<{ success: boolean; error?: string }> {
  if (settings.dryRun) {
    console.log("[DRY-RUN] Would sync to Palo Alto:", entry)
    return { success: true }
  }

  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate occasional failures
      if (Math.random() > 0.9) {
        resolve({ success: false, error: "Palo Alto API timeout" })
      } else {
        resolve({ success: true })
      }
    }, 500)
  })
}

export async function removePaloAltoEntry(
  entry: BlockingEntry,
  settings: Settings,
): Promise<{ success: boolean; error?: string }> {
  if (settings.dryRun) {
    console.log("[DRY-RUN] Would remove from Palo Alto:", entry)
    return { success: true }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true })
    }, 300)
  })
}
