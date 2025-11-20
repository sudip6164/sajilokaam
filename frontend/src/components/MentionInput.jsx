import { useState } from 'react'

export function MentionInput({
  users = [],
  selectedIds = [],
  onChange
}) {
  const [selectedOption, setSelectedOption] = useState('')

  const availableUsers = users.filter(
    (user) => !selectedIds.some((id) => String(id) === String(user.id))
  )

  const handleAdd = () => {
    if (!selectedOption) return
    const parsed = Number(selectedOption)
    const value = Number.isNaN(parsed) ? selectedOption : parsed
    const next = [...selectedIds, value]
    onChange(next)
    setSelectedOption('')
  }

  const handleRemove = (id) => {
    const next = selectedIds.filter((userId) => String(userId) !== String(id))
    onChange(next)
  }

  if (!users.length) {
    return null
  }

  return (
    <div className="space-y-2">
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedIds.map((id) => {
            const user = users.find((u) => String(u.id) === String(id))
            if (!user) return null
            return (
              <span
                key={id}
                className="flex items-center gap-2 px-2 py-1 bg-white/10 rounded-full text-xs text-white"
              >
                @{user.fullName || user.email}
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="text-white/70 hover:text-white"
                >
                  ×
                </button>
              </span>
            )
          })}
        </div>
      )}
      <div className="flex gap-2 items-center">
        <select
          className="input-field text-sm flex-1"
          value={selectedOption}
          onChange={(e) => setSelectedOption(e.target.value)}
        >
          <option value="">Mention someone…</option>
          {availableUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.fullName || user.email}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          className="btn btn-secondary text-xs"
          disabled={!selectedOption}
        >
          Add
        </button>
      </div>
    </div>
  )
}


