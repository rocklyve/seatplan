import { useDraggable } from '@dnd-kit/core'
import './DraggableGuest.css'

function DraggableGuest({ guest, onRemove, readOnly }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: guest.id,
    disabled: readOnly,
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    opacity: isDragging ? 0.5 : 1,
  } : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`guest-card ${isDragging ? 'dragging' : ''} ${readOnly ? 'readonly' : ''}`}
      {...(!readOnly ? listeners : {})}
      {...(!readOnly ? attributes : {})}
    >
      <span className="guest-name">{guest.name}</span>
      {!readOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(guest.id)
          }}
          className="remove-btn"
          title="Remove guest"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default DraggableGuest
