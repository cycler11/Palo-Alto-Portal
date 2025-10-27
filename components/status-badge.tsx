import type { EntryStatus, PaloStatus } from "@/lib/types"

interface StatusBadgeProps {
  status: EntryStatus | PaloStatus
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    ERROR: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    EXPIRED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    REMOVED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    SYNCED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    QUEUED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    UNSYNCED: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  }

  return <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status] || "bg-gray-100"}`}>{status}</span>
}
