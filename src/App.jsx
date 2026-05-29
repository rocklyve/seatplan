import { useState, useEffect, useRef } from 'react'
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, KeyboardSensor, closestCenter } from '@dnd-kit/core'
import GuestList from './components/GuestList'
import TableView from './components/TableView'
import Configuration from './components/Configuration'
import Login from './components/Login'
import './App.css'

function App() {
  const [authenticated, setAuthenticated] = useState(null) // null = checking, false = login, true = in
  const [guests, setGuests] = useState([])
  const [tables, setTables] = useState([])
  const [activeGuest, setActiveGuest] = useState(null)
  const [showConfig, setShowConfig] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [saveStatus, setSaveStatus] = useState('') // '', 'saving', 'saved', 'error'
  // Track whether initial server load has completed so we don't save before loading
  const serverLoadedRef = useRef(false)

  // ── Check existing session on mount ─────────────────────────────────────────
  useEffect(() => {
    fetch('/api/session')
      .then(res => res.json())
      .then(data => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false))
  }, [])

  // ── Load plan once authenticated ─────────────────────────────────────────────
  useEffect(() => {
    if (!authenticated) return
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
  }, [authenticated])

  // ── Auto-save whenever data changes ─────────────────────────────────────────
  useEffect(() => {
    if (!serverLoadedRef.current) return
    if (guests.length === 0 && tables.length === 0) return

    setSaveStatus('saving')
    fetch('/api/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guests, tables, version: '1.0' }),
    })
      .then(res => {
        if (res.ok) {
          setSaveStatus('saved')
          setTimeout(() => setSaveStatus(''), 2000)
        } else {
          setSaveStatus('error')
        }
      })
      .catch(() => setSaveStatus('error'))
  }, [guests, tables]) // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event) => {
    const { active } = event
    setActiveGuest(guests.find(g => g.id === active.id))
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    setActiveGuest(null)
    if (!over) return

    const guestId = active.id
    const targetId = over.id

    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ guests: [...guests] })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)

    if (targetId === 'unassigned') {
      setGuests(guests.map(g => g.id === guestId ? { ...g, tableId: null } : g))
    } else if (targetId.toString().startsWith('table-')) {
      const tableId = targetId.toString().replace('table-', '')
      const table = tables.find(t => t.id === tableId)
      const assignedCount = guests.filter(g => g.tableId === tableId).length
      if (table && assignedCount < table.capacity) {
        setGuests(guests.map(g => g.id === guestId ? { ...g, tableId } : g))
      }
    }
  }

  const handleAddGuest = (name) => {
    setGuests([...guests, {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      tableId: null,
    }])
  }

  const handleAddGuests = (names) => {
    setGuests([...guests, ...names.map((name, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      tableId: null,
    }))])
  }

  const handleRemoveGuest = (id) => {
    setGuests(guests.filter(g => g.id !== id))
  }

  const handleUpdateTables = (numTables, seatsPerTable) => {
    setTables(Array.from({ length: numTables }, (_, i) => ({
      id: (i + 1).toString(),
      number: i + 1,
      capacity: seatsPerTable,
    })))
    setGuests(guests.map(g =>
      g.tableId && parseInt(g.tableId) > numTables ? { ...g, tableId: null } : g
    ))
  }

  const handleExportData = () => {
    const blob = new Blob([JSON.stringify({ guests, tables, exportedAt: new Date().toISOString(), version: '1.0' }, null, 2)], { type: 'application/json' })
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
        } else {
          alert('Invalid file format')
        }
      } catch {
        alert('Failed to import file. Please check the file format.')
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
    }
  }

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST' }).finally(() => {
      setAuthenticated(false)
      serverLoadedRef.current = false
    })
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

  // ── Render ───────────────────────────────────────────────────────────────────

  if (authenticated === null) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#666' }}>Loading…</div>
  }

  if (!authenticated) {
    return <Login onLogin={() => setAuthenticated(true)} />
  }

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
            {saveStatus === 'saving' && <span className="save-status saving">Saving…</span>}
            {saveStatus === 'saved' && <span className="save-status saved">Saved</span>}
            {saveStatus === 'error' && <span className="save-status error">Save failed</span>}
            <div className="header-actions">
              <button onClick={handleUndo} className="action-btn" title="Undo last assignment" disabled={!canUndo}>↶ Undo</button>
              <button onClick={handleRedo} className="action-btn" title="Redo assignment" disabled={!canRedo}>↷ Redo</button>
              <button onClick={handleExportData} className="action-btn" title="Export to file">💾 Export</button>
              <label className="action-btn" title="Import from file">
                📂 Import
                <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} />
              </label>
              <button onClick={handleClearData} className="action-btn danger" title="Clear all data">🗑️ Clear</button>
              <button onClick={() => setShowConfig(!showConfig)} className="config-btn">⚙️ Configure</button>
              <button onClick={handleLogout} className="action-btn" title="Log out">🔓 Logout</button>
            </div>
          </div>
        </header>

        {showConfig && (
          <Configuration onUpdate={handleUpdateTables} onClose={() => setShowConfig(false)} />
        )}

        <div className="app-content">
          <GuestList
            guests={unassignedGuests}
            onAddGuest={handleAddGuest}
            onAddGuests={handleAddGuests}
            onRemoveGuest={handleRemoveGuest}
          />
          <TableView tables={tables} guests={guests} />
        </div>

        <DragOverlay>
          {activeGuest ? <div className="guest-card dragging">{activeGuest.name}</div> : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

export default App
