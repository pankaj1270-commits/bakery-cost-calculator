// Firebase Configuration & Service (Spark Free Tier)
// Free Tier Limits:
// - Firebase Hosting: 10 GB storage, 360 MB/day transfer (100% free)
// - Cloud Firestore: 1 GiB storage, 50,000 document reads/day, 20,000 writes/day (100% free)
// - Authentication: 50,000 monthly active users (100% free)

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  deleteDoc,
  query,
  orderBy
} from 'firebase/firestore';

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.db = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Check localStorage for user-provided Firebase config from Settings UI
    const savedConfig = localStorage.getItem('bakecost_firebase_config_v1');
    const config = savedConfig ? JSON.parse(savedConfig) : DEFAULT_FIREBASE_CONFIG;

    if (config.apiKey && config.projectId) {
      try {
        this.app = getApps().length > 0 ? getApp() : initializeApp(config);
        this.db = getFirestore(this.app);
        this.isConfigured = true;
        console.log('Firebase initialized successfully with project:', config.projectId);
      } catch (err) {
        console.warn('Firebase initialization error:', err);
        this.isConfigured = false;
      }
    } else {
      this.isConfigured = false;
    }
  }

  saveConfig(newConfig) {
    localStorage.setItem('bakecost_firebase_config_v1', JSON.stringify(newConfig));
    this.init();
  }

  getConfig() {
    const saved = localStorage.getItem('bakecost_firebase_config_v1');
    return saved ? JSON.parse(saved) : DEFAULT_FIREBASE_CONFIG;
  }

  // --- FIRESTORE METHODS ---
  async getIngredients() {
    if (!this.isConfigured) return null;
    try {
      const col = collection(this.db, 'ingredients');
      const snap = await getDocs(col);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Firestore getIngredients error:', err);
      return null;
    }
  }

  async saveIngredient(ingredient) {
    if (!this.isConfigured) return null;
    try {
      const ref = doc(this.db, 'ingredients', ingredient.id);
      await setDoc(ref, ingredient, { merge: true });
      return ingredient;
    } catch (err) {
      console.error('Firestore saveIngredient error:', err);
      return null;
    }
  }

  async deleteIngredient(id) {
    if (!this.isConfigured) return false;
    try {
      const ref = doc(this.db, 'ingredients', id);
      await deleteDoc(ref);
      return true;
    } catch (err) {
      console.error('Firestore deleteIngredient error:', err);
      return false;
    }
  }

  async getRecipes() {
    if (!this.isConfigured) return null;
    try {
      const col = collection(this.db, 'recipes');
      const snap = await getDocs(col);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Firestore getRecipes error:', err);
      return null;
    }
  }

  async saveRecipe(recipe) {
    if (!this.isConfigured) return null;
    try {
      const ref = doc(this.db, 'recipes', recipe.id);
      await setDoc(ref, recipe, { merge: true });
      return recipe;
    } catch (err) {
      console.error('Firestore saveRecipe error:', err);
      return null;
    }
  }

  async deleteRecipe(id) {
    if (!this.isConfigured) return false;
    try {
      const ref = doc(this.db, 'recipes', id);
      await deleteDoc(ref);
      return true;
    } catch (err) {
      console.error('Firestore deleteRecipe error:', err);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
