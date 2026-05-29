import { useState, useEffect, useRef } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core'
import GuestList from './components/GuestList'
import TableView from './components/TableView'
import Configuration from './components/Configuration'
import './App.css'

function App() {
  const [guests, setGuests] = useState([])
  const [tables, setTables] = useState([])
  const [activeGuest, setActiveGuest] = useState(null)
  const [showConfig, setShowConfig] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  // Track whether initial server load has completed so we don't save before loading
  const serverLoadedRef = useRef(false)

  // Auto-load from server on mount
  useEffect(() => {
    fetch('/api/plan')
      .then(res => res.json())
      .then(data => {
        if (data && data.guests && data.tables) {
          setGuests(data.guests)
          setTables(data.tables)
        }
        serverLoadedRef.current = true
      })
      .catch(err => {
        console.error('Failed to load plan from server:', err)
        serverLoadedRef.current = true
      })
  }, [])

  // Auto-save to server whenever guests or tables change (after initial load)
  useEffect(() => {
    if (!serverLoadedRef.current) return
    if (guests.length === 0 && tables.length === 0) return
    fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests, tables, version: '1.0' }),
    }).catch(err => console.error('Failed to save plan to server:', err))
  }, [guests, tables])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event) => {
    const { active } = event
    const guest = guests.find(g => g.id === active.id)
    setActiveGuest(guest)
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveGuest(null)

    if (!over) return

    const guestId = active.id
    const targetId = over.id

    // Save current state to history before making changes
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ guests: [...guests] })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    if (targetId === 'unassigned') {
      setGuests(guests.map(g =>
        g.id === guestId ? { ...g, tableId: null } : g
      ))
    } else if (targetId.toString().startsWith('table-')) {
      const tableId = targetId.toString().replace('table-', '')
      const table = tables.find(t => t.id === tableId)
      const assignedCount = guests.filter(g => g.tableId === tableId).length

      if (table && assignedCount < table.capacity) {
        setGuests(guests.map(g =>
          g.id === guestId ? { ...g, tableId } : g
        ))
      }
    }
  }

  const handleAddGuest = (name) => {
    const newGuest = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      tableId: null
    }
    setGuests([...guests, newGuest])
  }

  const handleAddGuests = (names) => {
    const newGuests = names.map((name, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      tableId: null
    }))
    setGuests([...guests, ...newGuests])
  }

  const handleRemoveGuest = (id) => {
    setGuests(guests.filter(g => g.id !== id))
  }

  const handleUpdateTables = (numTables, seatsPerTable) => {
    const newTables = Array.from({ length: numTables }, (_, i) => ({
      id: (i + 1).toString(),
      number: i + 1,
      capacity: seatsPerTable
    }))
    setTables(newTables)

    setGuests(guests.map(g => {
      if (g.tableId && parseInt(g.tableId) > numTables) {
        return { ...g, tableId: null }
      }
      return g
    }))
  }

  const handleExportData = () => {
    const dataToExport = {
      guests,
      tables,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `wedding-seating-plan-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (importedData.guests && importedData.tables) {
          setGuests(importedData.guests)
          setTables(importedData.tables)
          alert('Seating plan imported successfully!')
        } else {
          alert('Invalid file format')
        }
      } catch (error) {
        alert('Failed to import file. Please check the file format.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      setGuests([])
      setTables([])
      setHistory([])
      setHistoryIndex(-1)
      // Also clear on server
      fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guests: [], tables: [], version: '1.0' }),
      }).catch(err => console.error('Failed to clear plan on server:', err))
    }
  }

  const handleUndo = () => {
    if (historyIndex >= 0) {
      setGuests(history[historyIndex].guests)
      setHistoryIndex(historyIndex - 1)
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setGuests(history[historyIndex + 1].guests)
    }
  }

  const canUndo = historyIndex >= 0
  const canRedo = historyIndex < history.length - 1

  const unassignedGuests = guests.filter(g => !g.tableId)
  const assignedCount = guests.filter(g => g.tableId).length

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="app">
        <header className="app-header">
          <h1>💒 Wedding Seat Planner</h1>
          <div className="header-stats">
            <span>{guests.length} Total Guests</span>
            <span>{assignedCount} Assigned</span>
            <span>{unassignedGuests.length} Unassigned</span>
            <div className="header-actions">
              <button
                onClick={handleUndo}
                className="action-btn"
                title="Undo last assignment"
                disabled={!canUndo}
              >
                ↶ Undo
              </button>
              <button
                onClick={handleRedo}
                className="action-btn"
                title="Redo assignment"
                disabled={!canRedo}
              >
                ↷ Redo
              </button>
              <button onClick={handleExportData} className="action-btn" title="Export to file">
                💾 Save
              </button>
              <label className="action-btn" title="Import from file">
                📂 Load
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
              </label>
              <button onClick={handleClearData} className="action-btn danger" title="Clear all data">
                🗑️ Clear
              </button>
              <button onClick={() => setShowConfig(!showConfig)} className="config-btn">
                ⚙️ Configure
              </button>
            </div>
          </div>
        </header>

        {showConfig && (
          <Configuration
            onUpdate={handleUpdateTables}
            onClose={() => setShowConfig(false)}
          />
        )}

        <div className="app-content">
          <GuestList
            guests={unassignedGuests}
            onAddGuest={handleAddGuest}
            onAddGuests={handleAddGuests}
            onRemoveGuest={handleRemoveGuest}
          />

          <TableView
            tables={tables}
            guests={guests}
          />
        </div>

        <DragOverlay>
          {activeGuest ? (
            <div className="guest-card dragging">
              {activeGuest.name}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default App
