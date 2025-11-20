import { useEffect, useRef } from 'react'

const TOOLBAR_BUTTONS = [
  { icon: 'B', command: 'bold', label: 'Bold' },
  { icon: 'I', command: 'italic', label: 'Italic' },
  { icon: 'U', command: 'underline', label: 'Underline' },
  { icon: '•', command: 'insertUnorderedList', label: 'Bullet list' }
]

export function RichTextComposer({
  value = '',
  onChange,
  disabled = false,
  placeholder = 'Write a message...'
}) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || ''
    }
  }, [value])

  const handleInput = () => {
    if (!editorRef.current) return
    const html = editorRef.current.innerHTML
    const text = editorRef.current.innerText
    onChange?.(html, text)
  }

  const applyFormatting = (command) => {
    if (disabled) return
    editorRef.current?.focus()
    document.execCommand(command, false, null)
    handleInput()
  }

  const showPlaceholder =
    !value ||
    value === '<br>' ||
    value === '<div><br></div>' ||
    value === '<p><br></p>'

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-xs text-white/60">
        {TOOLBAR_BUTTONS.map(button => (
          <button
            key={button.command}
            type="button"
            className="px-2 py-1 rounded-md hover:bg-white/10 transition-colors"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyFormatting(button.command)}
            disabled={disabled}
            aria-label={button.label}
          >
            {button.icon}
          </button>
        ))}
        <span className="flex-1 text-right text-white/40 text-[11px] uppercase tracking-wide">
          Rich text
        </span>
      </div>
      <div className="relative">
        {showPlaceholder && (
          <span className="absolute left-4 top-3 text-sm text-white/30 pointer-events-none">
            {placeholder}
          </span>
        )}
        <div
          ref={editorRef}
          className="min-h-[110px] max-h-[220px] overflow-y-auto px-4 py-3 text-sm text-white/90 focus:outline-none"
          contentEditable={!disabled}
          role="textbox"
          aria-multiline="true"
          suppressContentEditableWarning
          onInput={handleInput}
          onBlur={handleInput}
        />
      </div>
    </div>
  )
}


