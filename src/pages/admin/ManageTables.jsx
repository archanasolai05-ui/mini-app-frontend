import { useState, useEffect } from 'react'
import {
  getAllTables,
  createTable,
  updateTable,
  deleteTable,
} from '../../services/tableService'
import Navbar from '../../components/Navbar'

const emptyForm = {
  tableNumber: '',
  capacity: '',
  location: '',
  isAvailable: true,
}

function ManageTables() {
  const [tables, setTables]       = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editTable, setEditTable] = useState(null)
  const [formData, setFormData]   = useState(emptyForm)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      const res = await getAllTables()
      setTables(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditTable(null)
    setFormData(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEditModal = (table) => {
    setEditTable(table)
    setFormData({
      tableNumber: table.tableNumber,
      capacity:    table.capacity,
      location:    table.location || '',
      isAvailable: table.isAvailable,
    })
    setError('')
    setShowModal(true)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      const data = {
        ...formData,
        tableNumber: parseInt(formData.tableNumber),
        capacity:    parseInt(formData.capacity),
      }
      if (editTable) {
        await updateTable(editTable.id, data)
      } else {
        await createTable(data)
      }
      setShowModal(false)
      fetchTables()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return
    try {
      await deleteTable(id)
      setTables(tables.filter((t) => t.id !== id))
    } catch (err) {
      alert('Delete failed')
    }
  }

  if (loading) return (
    <div className="admintables-page">
      <Navbar />
      <div className="loading">Loading tables...</div>
    </div>
  )

  return (
    <div className="admintables-page">
      <Navbar />
      <div className="admintables-content">

        <div className="admintables-header">
          <h2>Manage Tables 🪑</h2>
          <button className="add-btn" onClick={openAddModal}>
            + Add Table
          </button>
        </div>

        <div className="tables-grid-admin">
          {tables.map((table) => (
            <div key={table.id} className="table-card-admin">
              <h3>Table {table.tableNumber}</h3>
              <p>👥 Capacity: {table.capacity}</p>
              {table.location && <p>📍 {table.location}</p>}
              <span className={`table-available ${table.isAvailable ? 'yes' : 'no'}`}>
                {table.isAvailable ? 'Available' : 'Unavailable'}
              </span>
              <div className="table-card-actions">
                <button
                  className="edit-btn"
                  onClick={() => openEditModal(table)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(table.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>{editTable ? 'Edit Table' : 'Add Table'}</h3>

              {error && <div className="modal-error">{error}</div>}

              <div className="modal-form">
                <div className="form-group">
                  <label>Table Number</label>
                  <input
                    name="tableNumber"
                    type="number"
                    value={formData.tableNumber}
                    onChange={handleChange}
                    placeholder="eg: 1"
                  />
                </div>
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    name="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="eg: 4"
                  />
                </div>
                <div className="form-group">
                  <label>Location (optional)</label>
                  <input
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="eg: Window Side"
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={formData.isAvailable}
                      onChange={handleChange}
                    />
                    {' '}Available
                  </label>
                </div>

                <div className="modal-actions">
                  <button
                    className="save-btn"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ManageTables