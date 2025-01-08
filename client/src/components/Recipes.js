import React, { useState, useEffect } from 'react';
import './Recipes.css';

const API_URL = 'http://localhost:4000';

function Recipes() {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRecipes();
        const interval = setInterval(fetchRecipes, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchRecipes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/recipes`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch recipes');
            const data = await response.json();
            setRecipes(data.meals || []);
            setError(null);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-container">Finding recipes for you...</div>;
    if (error) return <div className="error-container">{error}</div>;

    return (
        <div className="recipes-container">
            <h2>Recipe Suggestions</h2>
            {recipes.length === 0 ? (
                <div className="no-recipes">
                    <p>No recipes found for your ingredients.</p>
                    <p>Try adding more ingredients to your fridge!</p>
                </div>
            ) : (
                <div className="recipes-grid">
                    {recipes.map((recipe) => (
                        <div key={recipe.idMeal} className="recipe-card">
                            <div className="recipe-image-container">
                                <img 
                                    src={recipe.strMealThumb} 
                                    alt={recipe.strMeal} 
                                    className="recipe-image"
                                />
                            </div>
                            <div className="recipe-content">
                                <h3 className="recipe-title">{recipe.strMeal}</h3>
                                <a 
                                    href={`https://www.themealdb.com/meal/${recipe.idMeal}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="view-recipe-button"
                                >
                                    View Recipe
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Recipes; 