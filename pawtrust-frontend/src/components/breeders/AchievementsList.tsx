import { useState } from 'react'
import type { Achievement } from '@/api/listings.api'

interface Props {
  achievements: Achievement[]
}

export function AchievementsList({ achievements }: Props) {
  const [expanded, setExpanded] = useState(false)

  if (achievements.length === 0) return null

  const visible = expanded ? achievements : achievements.slice(0, 3)

  return (
    <div className="space-y-2">
      {visible.map((a) => (
        <div
          key={a.id}
          className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-sm text-amber-800 mr-2"
        >
          🏆 {a.title} — {a.federation} ({a.year})
        </div>
      ))}
      {achievements.length > 3 && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="text-sm text-blue-600 hover:underline block mt-1"
        >
          {expanded ? 'Show less' : `Show all ${achievements.length} achievements`}
        </button>
      )}
    </div>
  )
}
