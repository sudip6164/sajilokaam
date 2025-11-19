import { formatDistanceToNow } from 'date-fns'

export function TaskActivityTimeline({ activities = [], currentUserId }) {
  if (!activities.length) {
    return (
      <p className="text-sm text-white/50">
        No activity yet. Updates to this task will appear here.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map(activity => (
        <div
          key={activity.id}
          className="flex items-start gap-3 border border-white/10 rounded-lg p-3 bg-white/5"
        >
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white">
            {activity.user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">
                {activity.user?.fullName || 'System'}
                {activity.user?.id === currentUserId && (
                  <span className="ml-2 text-xs text-violet-300">(you)</span>
                )}
              </p>
              <span className="text-xs text-white/50">
                {activity.createdAt
                  ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
                  : ''}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wide text-white/40 mt-1">
              {activity.action.replace(/_/g, ' ')}
            </p>
            <p className="text-sm text-white/80 mt-1 whitespace-pre-line">
              {activity.description || '—'}
            </p>
            {activity.metadata && (
              <pre className="mt-2 text-xs text-white/60 bg-black/20 rounded p-2 overflow-x-auto">
                {activity.metadata}
              </pre>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}


