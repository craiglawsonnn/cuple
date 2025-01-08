import React, { useState, useEffect } from 'react';
import './Fridge.css';

const COMMON_INGREDIENTS = [
    'Chicken', 'Beef', 'Pork', 'Rice', 'Pasta', 'Tomatoes', 
    'Onion', 'Garlic', 'Potatoes', 'Carrots', 'Milk', 'Eggs',
    'Cheese', 'Bell Peppers', 'Mushrooms'
];

const API_URL = 'http://localhost:4000';

const INGREDIENT_CATEGORIES = {
    Proteins: ['Chicken', 'Beef', 'Pork', 'Fish', 'Eggs'],
    Grains: ['Rice', 'Pasta', 'Bread', 'Quinoa'],
    Vegetables: ['Tomatoes', 'Onion', 'Garlic', 'Potatoes', 'Carrots', 'Bell Peppers'],
    Dairy: ['Milk', 'Cheese', 'Yogurt', 'Butter'],
    Pantry: ['Flour', 'Sugar', 'Oil', 'Salt']
};

const UNITS = ['grams', 'kg', 'pieces', 'ml', 'liters', 'cups', 'tbsp', 'tsp'];

const DEFAULT_UNITS = {
    'Chicken': 'grams',
    'Beef': 'grams',
    'Pork': 'grams',
    'Rice': 'cups',
    'Pasta': 'grams',
    'Milk': 'ml',
    'Water': 'ml',
    'Sugar': 'grams',
    'Flour': 'cups',
    default: 'pieces'
};

function Fridge() {
    const [fridge, setFridge] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('pieces');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        console.log('Fridge component mounted');
        fetchFridgeItems();
    }, []);

    // Show suggestions based on input
    useEffect(() => {
        if (newItem.trim()) {
            const filtered = COMMON_INGREDIENTS.filter(ingredient =>
                ingredient.toLowerCase().includes(newItem.toLowerCase())
            );
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    }, [newItem]);

    const fetchFridgeItems = async () => {
        try {
            setLoading(true);
            console.log('Fetching fridge items...');
            const response = await fetch(`${API_URL}/api/fridge`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Fetched data:', data);
            setFridge(data);
        } catch (error) {
            console.error('Fetch error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (ingredientToAdd) => {
        try {
            setLoading(true);
            console.log('Adding ingredient:', ingredientToAdd, quantity, unit);
            
            const response = await fetch(`${API_URL}/api/fridge`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    ingredient: ingredientToAdd,
                    quantity: {
                        value: Number(quantity),
                        unit: unit
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add item');
            }
            
            const data = await response.json();
            console.log('Add response data:', data);
            setFridge(data.fridge);
            setNewItem('');
            setSuggestions([]);
            setError(null);
        } catch (error) {
            console.error('Add error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newItem.trim()) {
            addItem(newItem.trim());
        }
    };

    const removeItem = async (item) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/fridge`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ingredient: item })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to remove item');
            }
            
            const data = await response.json();
            setFridge(data.fridge);
            setError(null);
        } catch (error) {
            console.error('Remove error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setNewItem(suggestion);
        setUnit(DEFAULT_UNITS[suggestion] || DEFAULT_UNITS.default);
    };

    return (
        <div className="fridge-container">
            <h2>Fridge Inventory</h2>
            {error && <div className="error-message">{error}</div>}
            
            <div className="fridge-content">
                <div className="add-ingredient-section">
                    <form onSubmit={handleSubmit} className="add-item-form">
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={newItem}
                                onChange={(e) => setNewItem(e.target.value)}
                                placeholder="Add ingredient"
                                className="ingredient-input"
                                disabled={loading}
                            />
                            {suggestions.length > 0 && (
                                <div className="suggestions">
                                    {suggestions.map((suggestion) => (
                                        <div
                                            key={suggestion}
                                            className="suggestion-item"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="quantity-inputs">
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="quantity-input"
                                disabled={loading}
                            />
                            <select
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="unit-select"
                                disabled={loading}
                            >
                                {UNITS.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="add-button" disabled={loading || !newItem.trim()}>
                            {loading ? 'Adding...' : 'Add'}
                        </button>
                    </form>

                    <div className="common-ingredients">
                        <h3>Common Ingredients</h3>
                        <div className="ingredient-chips">
                            {COMMON_INGREDIENTS.filter(ingredient => 
                                !fridge.some(item => item.name === ingredient)
                            )
                            .slice(0, 8)
                            .map((ingredient) => (
                                <button
                                    key={ingredient}
                                    onClick={() => {
                                        const defaultUnit = DEFAULT_UNITS[ingredient] || DEFAULT_UNITS.default;
                                        setNewItem(ingredient);
                                        setUnit(defaultUnit);
                                        setQuantity(1);
                                    }}
                                    className="ingredient-chip"
                                    disabled={loading}
                                >
                                    {ingredient}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="current-ingredients">
                    <h3>Current Ingredients</h3>
                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <div className="ingredients-grid">
                            {Array.isArray(fridge) && fridge.map((item, index) => (
                                <div key={index} className="ingredient-item">
                                    <span>
                                        {item?.name}
                                        {item?.quantity && (
                                            <small className="quantity">
                                                {item.quantity.value} {item.quantity.unit}
                                            </small>
                                        )}
                                    </span>
                                    <button 
                                        onClick={() => removeItem(item.name)}
                                        className="remove-button"
                                        disabled={loading}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Fridge; 