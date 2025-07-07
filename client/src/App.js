import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import ReceiptUploader from './ReceiptUploader';


function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
}

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: '', unit: '' });
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const searchItems = async (query) => {
    try {
      const res = await axios.get('/api/items', {
        params: { search: query }
      });
      setItems(res.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      searchItems(query);
    }, 300), []
  );

  useEffect(() => {
    if (searchQuery.trim()) {
      setLoading(true);
      debouncedSearch(searchQuery);
      setLoading(false);
    } else {
      axios.get('/api/items').then(res => setItems(res.data));
    }
  }, [searchQuery]);

  useEffect(() => {
    axios.get('/api/items').then(res => setItems(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/items/${id}`);
      setItems(items.filter(item => item._id !== id));
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete item.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post('/api/items', form);
    setItems([...items, res.data]);
    setForm({ name: '', quantity: '', unit: '' });
  };

return (
  <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
    <h2>🧊 Fridge Tracker</h2>

    {/* OCR Receipt Upload Section */}
    <ReceiptUploader
      onParsedItems={(rawText) => {
        console.log("🧾 Raw OCR Text:", rawText);
        // Later: parse into structured items and allow review/edit
      }}
    />
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search fridge items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} style={{ marginLeft: '0.5rem' }}>
            Clear
          </button>
        )}
        {loading && <p>Loading...</p>}
        {!loading && searchQuery && items.length === 0 && <p>No results found.</p>}
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input name="name" placeholder="Item name" value={form.name} onChange={handleChange} required />
        <input name="quantity" type="number" placeholder="Qty" value={form.quantity} onChange={handleChange} required />
        <select name="unit" value={form.unit} onChange={handleChange} required>
          <option value="">Unit</option>
          <option value="grams">g</option>
          <option value="kg">kg</option>
          <option value="ml">ml</option>
          <option value="litre">l</option>
          <option value="oz">oz</option>
          <option value="units">pcs</option>
        </select>
        <button type="submit">Add</button>
      </form>

      <ul>
        {items.map(item => (
          <li key={item._id}>
            <strong>{item.name}</strong> – {item.quantity} {item.unit}
            <button
              style={{ marginLeft: '1rem' }}
              onClick={() => handleDelete(item._id)}
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;