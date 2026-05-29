import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import DraggableGuest from './DraggableGuest'
import './GuestList.css'

function GuestList({ guests, onAddGuest, onAddGuests, onRemoveGuest }) {
  const [newGuestName, setNewGuestName] = useState('')
  const [showBulkAdd, setShowBulkAdd] = useState(false)
  const [bulkGuestText, setBulkGuestText] = useState('')

  const { setNodeRef } = useDroppable({
    id: 'unassigned',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (newGuestName.trim()) {
      onAddGuest(newGuestName.trim())
      setNewGuestName('')
    }
  }

  const handleBulkAdd = () => {
    const names = bulkGuestText
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0)

    if (names.length > 0) {
      onAddGuests(names)
      setBulkGuestText('')
      setShowBulkAdd(false)
    }
  }

  return (
    <div className="guest-list-container">
      <div className="guest-list-header">
        <h2>👥 Unassigned Guests</h2>
        <span className="guest-count">{guests.length}</span>
      </div>

      <form onSubmit={handleSubmit} className="add-guest-form">
        <input
          type="text"
          value={newGuestName}
          onChange={(e) => setNewGuestName(e.target.value)}
          placeholder="Enter guest name..."
          className="guest-input"
        />
        <button type="submit" className="add-btn">Add</button>
      </form>

      <button
        onClick={() => setShowBulkAdd(!showBulkAdd)}
        className="bulk-add-toggle"
      >
        {showBulkAdd ? '− Single Add' : '+ Bulk Add'}
      </button>

      {showBulkAdd && (
        <div className="bulk-add-section">
          <textarea
            value={bulkGuestText}
            onChange={(e) => setBulkGuestText(e.target.value)}
            placeholder="Enter guest names (one per line)&#10;Example:&#10;John Smith&#10;Jane Doe&#10;Bob Johnson"
            className="bulk-input"
            rows="8"
          />
          <button onClick={handleBulkAdd} className="bulk-submit-btn">
            Add All Guests
          </button>
        </div>
      )}

      <div ref={setNodeRef} className="guests-scroll">
        {guests.length === 0 ? (
          <div className="empty-state">
            <p>🎉 All guests assigned!</p>
            <p className="empty-hint">Or add new guests above</p>
          </div>
        ) : (
          guests.map(guest => (
            <DraggableGuest
              key={guest.id}
              guest={guest}
              onRemove={onRemoveGuest}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default GuestList
