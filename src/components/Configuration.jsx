import { useState } from 'react'
import './Configuration.css'

function Configuration({ onUpdate, onClose }) {
  const [numTables, setNumTables] = useState(10)
  const [seatsPerTable, setSeatsPerTable] = useState(8)

  const handleSubmit = (e) => {
    e.preventDefault()
    onUpdate(numTables, seatsPerTable)
    onClose()
  }

  return (
    <div className="config-overlay" onClick={onClose}>
      <div className="config-modal" onClick={e => e.stopPropagation()}>
        <div className="config-header">
          <h2>⚙️ Configure Tables</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="config-field">
            <label htmlFor="numTables">Number of Tables</label>
            <input
              id="numTables"
              type="number"
              min="1"
              max="50"
              value={numTables}
              onChange={(e) => setNumTables(parseInt(e.target.value))}
              className="config-input"
            />
            <span className="field-hint">Total tables at your venue</span>
          </div>

          <div className="config-field">
            <label htmlFor="seatsPerTable">Seats per Table</label>
            <input
              id="seatsPerTable"
              type="number"
              min="1"
              max="20"
              value={seatsPerTable}
              onChange={(e) => setSeatsPerTable(parseInt(e.target.value))}
              className="config-input"
            />
            <span className="field-hint">Maximum guests per table</span>
          </div>

          <div className="config-summary">
            <strong>Total capacity:</strong> {numTables * seatsPerTable} guests
          </div>

          <div className="config-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Configuration
