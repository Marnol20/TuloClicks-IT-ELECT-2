import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import '../../styles/Events.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    try {
      // Nagtawag sa admin endpoint para makuha tanan categories
      const res = await api.get('/categories/admin/all')
      setCategories(res.data || [])
    } catch {
      setCategories([])
    }
  }

  async function handleCreate() {
    if (!name.trim()) { setError('Category name is required'); return }
    try {
      // Pag-post og bag-ong category sa database
      await api.post('/categories', { 
        name: name.trim(), 
        description: description.trim() 
      })
      setError('')
      setShowForm(false)
      setName('')
      setDescription('')
      fetchCategories() // Refresh ang list human ma-create
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create category')
    }
  }

  function handleCancel() {
    setShowForm(false)
    setName('')
    setDescription('')
    setError('')
  }

  const activeCount = categories.filter((c) => c.is_active).length

  return (
    <main className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(139,92,246,0.42) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Categories</h2>
          <p>Manage event categories used across the platform.</p>
        </div>
        <div className="admin-hero-stats">
          <div className="admin-hero-stat purple">
            <span className="admin-hero-stat-val">{categories.length}</span>
            <span className="admin-hero-stat-label">Total</span>
          </div>
          <div className="admin-hero-stat green">
            <span className="admin-hero-stat-val">{activeCount}</span>
            <span className="admin-hero-stat-label">Active</span>
          </div>
          <div>
            <button className="admin-add-btn" onClick={() => setShowForm(true)}>
              <Plus size={14} /> Add Category
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="create-form">
          <h3>Create Category</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Category Name</label>
              <input
                className="form-input"
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                className="form-textarea"
                placeholder="Write a short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="admin-error-msg">{error}</p>}
          <div className="form-buttons">
            <button className="create-btn" onClick={handleCreate}>Create Category</button>
            <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      )}

      <div className="events-list">
        {categories.length === 0 ? (
          <div className="event-card"><p className="event-description">No categories found.</p></div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="event-card">
              <div className="event-card-top">
                <div>
                  <h3>{category.name}</h3>
                  <p className="event-description">{category.description || 'No description'}</p>
                </div>
                <span className={`badge ${category.is_active ? 'confirmed' : 'cancelled'}`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default Categories