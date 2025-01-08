import React from 'react';
import Fridge from './components/Fridge';
import Recipes from './components/Recipes';
import TestConnection from './components/TestConnection';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>Smart Meal Planner</h1>
            </header>
            <main className="App-main">
                <TestConnection />
                <Fridge />
                <Recipes />
            </main>
        </div>
    );
}

export default App;
