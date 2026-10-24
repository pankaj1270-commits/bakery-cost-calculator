import React, { useState } from 'react';
import { 
  Cake, 
  Wheat, 
  BookOpen, 
  Calculator, 
  BarChart3, 
  Settings, 
  Menu, 
  X, 
  Cloud, 
  HardDrive,
  LogOut,
  Phone,
  Store,
  ChevronRight
} from 'lucide-react';
import { firebaseService, identifierToPhone } from '../services/firebase.js';

export default function Navbar({ activeTab, setActiveTab, currentUser, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isCloud = firebaseService.isConfigured;

  const bakeryTitle = currentUser && currentUser.bakeryName && currentUser.bakeryName.trim()
    ? currentUser.bakeryName.trim()
    : 'BakeCost Pro';

  const userPhoneLabel = currentUser 
    ? (currentUser.formattedMobile || currentUser.mobile || identifierToPhone(currentUser)) 
    : '';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'ingredients', label: 'Ingredients', icon: Wheat },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'calculator', label: 'Costing', icon: Calculator },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Left Brand: Shows Bakery Name when logged in */}
            <div 
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none py-1 min-w-0" 
              onClick={() => handleNavClick('dashboard')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20 shrink-0">
                <Cake className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-extrabold text-sm sm:text-base md:text-lg text-slate-900 tracking-tight truncate max-w-[150px] sm:max-w-[220px] md:max-w-xs lg:max-w-sm">
                    {bakeryTitle}
                  </span>
                  <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    ₹ INR
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium truncate max-w-[160px] sm:max-w-xs">
                  {currentUser && currentUser.bakeryName 
                    ? (userPhoneLabel ? `Bakery Costing • ${userPhoneLabel}` : 'Precision Bakery Costing') 
                    : 'Bakery Recipe & Production Costing'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation (visible on xl screens to prevent squishing) */}
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Status Badge & Auth (Desktop) */}
            <div className="hidden xl:flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleNavClick('settings')}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full font-medium border transition-colors ${
                  isCloud
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
                title={isCloud ? 'Connected to Firebase Firestore' : 'Running locally in browser'}
              >
                {isCloud ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Cloud Synced</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="w-3.5 h-3.5 text-amber-600" />
                    <span>Local Mode</span>
                  </>
                )}
              </button>

              {currentUser && (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold border border-amber-300 shadow-2xs shrink-0">
                    <Phone className="w-3.5 h-3.5 text-amber-700" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 max-w-[130px] truncate" title={bakeryTitle}>
                    {bakeryTitle}
                  </span>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile / Tablet Right Controls (Cloud pill + Hamburger) */}
            <div className="flex items-center gap-2 xl:hidden shrink-0">
              {isCloud && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="hidden sm:inline">Cloud</span> Synced
                </span>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 focus:outline-none shadow-2xs"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-amber-600" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Full-Width Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {/* User profile card inside mobile menu */}
            {currentUser && (
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 truncate">
                      {bakeryTitle}
                    </p>
                    <p className="text-xs text-amber-800 font-semibold mt-0.5 flex items-center gap-1 truncate">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{userPhoneLabel}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1 shadow-2xs shrink-0 ml-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* Navigation Grid for Mobile */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-400'
                        : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-600'}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Sleek Mobile Bottom Navigation Bar for Smart Phones (md:hidden) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 flex items-center justify-around">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'ingredients', label: 'Ingredients', icon: Wheat },
          { id: 'recipes', label: 'Recipes', icon: BookOpen },
          { id: 'calculator', label: 'Costing', icon: Calculator },
          { id: 'reports', label: 'Reports', icon: Settings }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-bold transition-colors ${
                isActive
                  ? 'text-amber-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-amber-100 text-amber-700' : ''}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
