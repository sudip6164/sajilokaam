import { formatDistanceToNow } from 'date-fns'

const ACTIVITY_ICONS = {
  COMMENT: '💬',
  STATUS_CHANGE: '🔄',
  ASSIGNEE_CHANGE: '👤',
  TIME_LOG: '⏱',
  FILE_UPLOAD: '📁',
  TASK_UPDATE: '📝'
}

const ACTIVITY_TEXT = {
  COMMENT: 'commented',
  STATUS_CHANGE: 'changed the status',
  ASSIGNEE_CHANGE: 'updated the assignee',
  TIME_LOG: 'logged time',
  FILE_UPLOAD: 'uploaded a file',
  TASK_UPDATE: 'updated the task'
}

const parseMetadata = (metadata) => {
  if (!metadata) return null
  try {
    return JSON.parse(metadata)
  } catch {
    return null
  }
}

const renderActivityDetail = (activity, currentUserId) => {
  const metadata = parseMetadata(activity.metadata)
  const actorName = activity.user?.fullName || 'System'
  const actorLabel = activity.user?.id === currentUserId ? 'You' : actorName
  const actionText = ACTIVITY_TEXT[activity.action] || activity.action?.toLowerCase()

  switch (activity.action) {
    case 'COMMENT':
      return (
        <>
          <p className="text-sm text-white">
            <span className="font-semibold text-white">{actorLabel}</span> replied
          </p>
          <p className="mt-1 text-white/80 whitespace-pre-line">{activity.description}</p>
        </>
      )
    case 'STATUS_CHANGE':
      return (
        <p className="text-sm text-white">
          <span className="font-semibold">{actorLabel}</span> moved the task from{' '}
          <span className="text-amber-300">{metadata?.from || 'unknown'}</span> to{' '}
          <span className="text-emerald-300">{metadata?.to || 'unknown'}</span>
        </p>
      )
    case 'ASSIGNEE_CHANGE':
      return (
        <p className="text-sm text-white">
          <span className="font-semibold">{actorLabel}</span> assigned the task to{' '}
          <span className="text-violet-300">{metadata?.assigneeName || 'someone'}</span>
        </p>
      )
    case 'TIME_LOG':
      return (
        <p className="text-sm text-white">
          <span className="font-semibold">{actorLabel}</span> logged{' '}
          <span className="text-emerald-300">{metadata?.minutes || 0} minutes</span>
        </p>
      )
    case 'FILE_UPLOAD':
      return (
        <p className="text-sm text-white">
          <span className="font-semibold">{actorLabel}</span> uploaded{' '}
          <span className="text-sky-300">{metadata?.fileName || 'a file'}</span>
        </p>
      )
    default:
      return (
        <>
          <p className="text-sm text-white">
            <span className="font-semibold">{actorLabel}</span> {actionText}
          </p>
          {activity.description && (
            <p className="text-sm text-white/80 mt-1 whitespace-pre-line">
              {activity.description}
            </p>
          )}
        </>
      )
  }
}

export function TaskActivityTimeline({
  activities = [],
  currentUserId,
  onLoadMore,
  hasMore,
  loading
}) {
  if (!activities.length && !loading) {
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
            {ACTIVITY_ICONS[activity.action] || '📌'}
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
            <div className="mt-1 space-y-1">
              {renderActivityDetail(activity, currentUserId)}
            </div>
          </div>
        </div>
      ))}
      {hasMore && (
        <button
          className="w-full text-sm text-violet-300 hover:text-violet-200 font-semibold py-2"
          onClick={onLoadMore}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load more activity'}
        </button>
      )}
      {!hasMore && activities.length > 0 && (
        <p className="text-xs text-white/40 text-center">
          You’ve reached the beginning of the history.
        </p>
      )}
    </div>
  )
}



