import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import LoginPage from './components/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ingredients from './pages/Ingredients.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import Reports from './pages/Reports.jsx';
import SettingsPage from './pages/Settings.jsx';
import { firebaseService } from './services/firebase.js';
import { userService, isUserAdmin } from './services/userService.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeRecipeId, setActiveRecipeId] = useState('rec-1'); // Default to Biscuit recipe spec
  const [reloadKey, setReloadKey] = useState(0);

  // Auth state
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = userService.onAuthChange((user) => {
      setCurrentUser(user);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenRecipe = (recipeId) => {
    setActiveRecipeId(recipeId);
    setActiveTab('calculator');
  };

  const handleReload = () => {
    setReloadKey(prev => prev + 1);
  };

  const handleLogout = () => {
    userService.logout();
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-medium">Securing BakeCost Workspace...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginPage 
        onLoginSuccess={() => setLoadingAuth(false)}
      />
    );
  }

  return (
    <div key={reloadKey} className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-20 md:pb-8">
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
          isUserAdmin(currentUser) ? (
            <SettingsPage onReload={handleReload} />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-lg mx-auto shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-xl">
                🔒
              </div>
              <h3 className="text-base font-extrabold text-slate-900">Settings Restricted</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                System & Database configuration settings are restricted to administrator accounts.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6 mt-12 mb-14 md:mb-0 text-center text-xs text-slate-500">
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
