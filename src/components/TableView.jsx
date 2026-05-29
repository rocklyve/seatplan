import Table from './Table'
import './TableView.css'

function TableView({ tables, guests }) {
  return (
    <div className="table-view">
      <div className="table-view-header">
        <h2>🍽️ Reception Tables</h2>
      </div>

      {tables.length === 0 ? (
        <div className="no-tables">
          <h3>No tables configured yet</h3>
          <p>Click the Configure button to set up your tables</p>
        </div>
      ) : (
        <div className="tables-grid">
          {tables.map(table => {
            const tableGuests = guests.filter(g => g.tableId === table.id)
            return (
              <Table
                key={table.id}
                table={table}
                guests={tableGuests}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TableView
