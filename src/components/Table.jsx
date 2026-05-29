import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import './Table.css'

function TableGuest({ guest, readOnly }) {
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
      className={`table-guest ${isDragging ? 'dragging' : ''} ${readOnly ? 'readonly' : ''}`}
      {...(!readOnly ? listeners : {})}
      {...(!readOnly ? attributes : {})}
    >
      {guest.name}
    </div>
  )
}

function Table({ table, guests, readOnly }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `table-${table.id}`,
    disabled: readOnly,
  })

  const isFull = guests.length >= table.capacity
  const percentage = (guests.length / table.capacity) * 100

  return (
    <div
      ref={setNodeRef}
      className={`table ${isOver && !isFull ? 'drag-over' : ''} ${isFull ? 'full' : ''}`}
    >
      <div className="table-header">
        <h3>Table {table.number}</h3>
        <span className="capacity-badge">
          {guests.length}/{table.capacity}
        </span>
      </div>

      <div className="capacity-bar">
        <div
          className="capacity-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="table-guests">
        {guests.length === 0 ? (
          <div className="empty-table">
            Drop guests here
          </div>
        ) : (
          guests.map(guest => (
            <TableGuest key={guest.id} guest={guest} readOnly={readOnly} />
          ))
        )}
      </div>

      {isFull && <div className="full-indicator">Table Full</div>}
    </div>
  )
}

export default Table
