import React, { useState } from 'react';
import { 
  Settings, 
  Cloud, 
  HardDrive, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Server
} from 'lucide-react';
import { firebaseService } from '../services/firebase.js';
import { api } from '../services/api.js';

export default function SettingsPage({ onReload }) {
  const currentConfig = firebaseService.getConfig();
  const [config, setConfig] = useState(currentConfig);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState('');
  const [errorToast, setErrorToast] = useState('');

  const handleSaveFirebase = (e) => {
    e.preventDefault();
    try {
      firebaseService.saveConfig(config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      if (onReload) onReload();
    } catch (err) {
      setErrorToast(err.message);
    }
  };

  const handleExportBackup = () => {
    try {
      const data = api.exportBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bakecost_pro_backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupSuccess('Backup JSON downloaded successfully!');
      setTimeout(() => setBackupSuccess(''), 3000);
    } catch (err) {
      setErrorToast('Export failed: ' + err.message);
    }
  };

  const handleImportBackup = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target.result);
        api.importBackup(parsed);
        setBackupSuccess('Data imported successfully!');
        setTimeout(() => setBackupSuccess(''), 3000);
        if (onReload) onReload();
      } catch (err) {
        setErrorToast('Failed to import backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all recipes and ingredients back to factory defaults (including sample biscuit recipe)? Custom additions will be overwritten.')) {
      api.resetDefaults();
      setBackupSuccess('Reset to defaults complete!');
      setTimeout(() => setBackupSuccess(''), 3000);
      if (onReload) onReload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Toast Alert */}
      {(saveSuccess || backupSuccess || errorToast) && (
        <div className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
          errorToast
            ? 'bg-rose-50 text-rose-800 border border-rose-200'
            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          <span>{errorToast || backupSuccess || 'Firebase configuration updated successfully!'}</span>
          <button onClick={() => { setErrorToast(''); setBackupSuccess(''); }} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-amber-600" />
          <span>Storage & Cloud Deployment Settings</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Deploy to Firebase Hosting for free, connect Cloud Firestore, or manage local backups
        </p>
      </div>

      {/* Firebase Free Tier Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              firebaseService.isConfigured ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {firebaseService.isConfigured ? <Cloud className="w-6 h-6" /> : <HardDrive className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {firebaseService.isConfigured ? 'Firebase Cloud Firestore Connected' : 'Browser Local Storage (Firebase Hosting Ready)'}
              </h3>
              <p className="text-xs text-slate-500">
                {firebaseService.isConfigured
                  ? 'Cloud data is syncing in real time across devices.'
                  : 'Operating locally in your browser with zero latency and 100% free hosting compatibility.'}
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Spark Plan (100% Free)
          </span>
        </div>

        {/* Free Tier Guide Checklist */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">1. Firebase Hosting</p>
            <p className="text-slate-500">10 GB SSD storage, free custom domain, SSL included forever at ₹0 cost.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">2. Cloud Firestore</p>
            <p className="text-slate-500">50,000 free reads/day, 20,000 free writes/day — ample for bakery management.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <p className="font-bold text-slate-800">3. Zero Card Required</p>
            <p className="text-slate-500">No credit card or paid billing account is required to deploy or use.</p>
          </div>
        </div>

        {/* Firebase Config Form */}
        <form onSubmit={handleSaveFirebase} className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Firebase Project Credentials (Optional)
            </h4>
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Firebase Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                API Key
              </label>
              <input
                type="text"
                placeholder="AIzaSy..."
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Project ID
              </label>
              <input
                type="text"
                placeholder="my-bakery-app"
                value={config.projectId || ''}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Auth Domain
              </label>
              <input
                type="text"
                placeholder="my-bakery-app.firebaseapp.com"
                value={config.authDomain || ''}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                App ID
              </label>
              <input
                type="text"
                placeholder="1:123456789:web:abcdef"
                value={config.appId || ''}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all"
            >
              Save Firebase Config
            </button>
          </div>
        </form>
      </div>

      {/* Data Backup, Import & Factory Reset */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Data Backup & Migration
          </h3>
          <p className="text-xs text-slate-500">
            Export a full JSON snapshot of your ingredient master, recipes, and price revisions
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Export JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Download Backup</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Save complete bakery database to a secure JSON file on your computer.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-800">Restore Backup</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Load a previously saved backup file to restore recipes and ingredients.
              </p>
            </div>
            <label className="w-full py-2 px-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          {/* Reset to Factory Defaults */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-900">Reset to Defaults</h4>
              <p className="text-[11px] text-rose-700/80 mt-0.5">
                Restore sample biscuit, cookie, cake, and bread recipes.
              </p>
            </div>
            <button
              onClick={handleResetDefaults}
              className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
