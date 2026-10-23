import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingredients from './pages/Ingredients.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import Reports from './pages/Reports.jsx';
import SettingsPage from './pages/Settings.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRecipeId, setActiveRecipeId] = useState('rec-1'); // Default to Biscuit recipe spec
  const [reloadKey, setReloadKey] = useState(0);

  const handleOpenRecipe = (recipeId) => {
    setActiveRecipeId(recipeId);
    setActiveTab('calculator');
  };

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <div key={reloadKey} className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onNavigate={setActiveTab} 
            onOpenRecipe={handleOpenRecipe} 
          />
        )}

        {activeTab === 'ingredients' && (
          <Ingredients />
        )}

        {activeTab === 'recipes' && (
          <Recipes 
            onOpenRecipe={handleOpenRecipe} 
          />
        )}

        {activeTab === 'calculator' && (
          <RecipeDetail 
            recipeId={activeRecipeId} 
            onBack={() => setActiveTab('recipes')}
            onRecipeChange={handleReload}
          />
        )}

        {activeTab === 'reports' && (
          <Reports 
            onOpenRecipe={handleOpenRecipe} 
          />
        )}

        {activeTab === 'settings' && (
          <SettingsPage 
            onReload={handleReload} 
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 BakeCost Pro • Precision Bakery Recipe & Production Costing</p>
          <p className="flex items-center gap-2 text-slate-400">
            <span>Currency: INR (₹)</span>
            <span>•</span>
            <span>Firebase Spark Free Tier Compatible</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
