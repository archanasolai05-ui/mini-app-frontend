import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../../redux/slices/cartSlice'
import { getAllMenuItems } from '../../services/menuService'
import Navbar from '../../components/Navbar'

function Menu() {
  const dispatch = useDispatch()
  const { items: cartItems } = useSelector((state) => state.cart)

  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState([])
  const [addedItem, setAddedItem] = useState(null)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await getAllMenuItems()
      setMenuItems(res.data)
      const cats = ['All', ...new Set(res.data.map((i) => i.category))]
      setCategories(cats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter((i) => i.category === activeCategory)

  const handleAddToCart = (item) => {
    dispatch(addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      category: item.category,
    }))
    setAddedItem(item.id)
    setTimeout(() => setAddedItem(null), 1000)
  }

  const getCategoryEmoji = (category) => {
    const emojis = {
      Starters: '🥗',
      Mains: '🍛',
      Breads: '🍞',
      Drinks: '🥤',
      Desserts: '🍮',
    }
    return emojis[category] || '🍽️'
  }

  const isInCart = (id) => cartItems.some((i) => i.id === id)

  if (loading) return (
    <div className="menu-page">
      <Navbar />
      <div className="loading">Loading menu...</div>
    </div>
  )

  return (
    <div className="menu-page">
      <Navbar />

      <div className="menu-hero">
        <h2>Our Menu 🍽️</h2>
        <p>Fresh and delicious food made with love</p>
      </div>

      <div className="menu-content">
        <div className="menu-categories">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div className="menu-empty">No items found</div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <div key={item.id} className="menu-card">
                <div className="menu-card-emoji">
                  {getCategoryEmoji(item.category)}
                </div>
                <div className="menu-card-body">
                  <div className="menu-card-category">{item.category}</div>
                  <div className="menu-card-name">{item.name}</div>
                  <div className="menu-card-desc">{item.description}</div>
                  <div className="menu-card-footer">
                    <span className="menu-card-price">₹{item.price}</span>
                    {item.isAvailable ? (
                      <button
                        className={`add-to-cart-btn ${isInCart(item.id) ? 'in-cart' : ''}`}
                        onClick={() => handleAddToCart(item)}
                      >
                        {addedItem === item.id
                          ? '✓ Added!'
                          : isInCart(item.id)
                          ? '+ Add More'
                          : 'Add to Cart'}
                      </button>
                    ) : (
                      <span className="unavailable-badge">Unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Menu