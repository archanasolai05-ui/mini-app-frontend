import { useState, useEffect } from 'react'
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../../services/menuService'
import Navbar from '../../components/Navbar'

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  isAvailable: true,
}

const categories = ['Starters', 'Mains', 'Breads', 'Drinks', 'Desserts']

function ManageMenu() {
  const [items, setItems]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await getAllMenuItems()
      setItems(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const openAddModal = () => {
    setEditItem(null)
    setFormData(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEditModal = (item) => {
    setEditItem(item)
    setFormData({
      name:        item.name,
      description: item.description,
      price:       item.price,
      category:    item.category,
      image:       item.image || '',
      isAvailable: item.isAvailable,
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
        price: parseFloat(formData.price),
      }
      if (editItem) {
        await updateMenuItem(editItem.id, data)
      } else {
        await createMenuItem(data)
      }
      setShowModal(false)
      fetchItems()
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return
    try {
      await deleteMenuItem(id)
      setItems(items.filter((i) => i.id !== id))
    } catch (err) {
      alert('Delete failed')
    }
  }

  if (loading) return (
    <div className="adminmenu-page">
      <Navbar />
      <div className="loading">Loading menu...</div>
    </div>
  )

  return (
    <div className="adminmenu-page">
      <Navbar />
      <div className="adminmenu-content">

        <div className="adminmenu-header">
          <h2>Manage Menu 🍽️</h2>
          <button className="add-btn" onClick={openAddModal}>
            + Add Item
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.category}</td>
                <td>₹{item.price}</td>
                <td>{item.isAvailable ? '✅' : '❌'}</td>
                <td>
                  <button
                    className="edit-btn"
                    onClick={() => openEditModal(item)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <h3>{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>

              {error && <div className="modal-error">{error}</div>}

              <div className="modal-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Item name"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <input
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Item description"
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Price"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
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

export default ManageMenu