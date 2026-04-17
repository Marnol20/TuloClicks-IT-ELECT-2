import { useEffect, useState } from 'react'
import '../../styles/Events.css'
import api from '../../services/api'

function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const res = await api.get('/categories/admin/all')
      setCategories(res.data || [])
    } catch (error) {
      console.error('Fetch categories error:', error)
      setCategories([])
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError('Category name is required')
      return
    }

    try {
      await api.post('/categories', {
        name: name.trim(),
        description: description.trim()
      })

      setError('')
      setShowForm(false)
      setName('')
      setDescription('')
      fetchCategories()
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create category')
    }
  }

  function handleCancel() {
    setShowForm(false)
    setName('')
    setDescription('')
    setError('')
  }

  return (
    <main className="events-page">
      <div className="events-top">
        <div className="events-title">
          <div>
            <h2>Categories</h2>
            <p>Manage event categories</p>
          </div>
        </div>

        <button className="new-event-btn" onClick={() => setShowForm(true)}>
          Add Category
        </button>
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

          {error && (
            <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </p>
          )}

          <div className="form-buttons">
            <button className="create-btn" onClick={handleCreate}>
              Create Category
            </button>
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-list">
        {categories.length === 0 ? (
          <div className="event-card">
            <p className="event-description">No categories found.</p>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="event-card">
              <div className="event-card-top">
                <div>
                  <h3>{category.name}</h3>
                  <p className="event-description">
                    {category.description || 'No description'}
                  </p>
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