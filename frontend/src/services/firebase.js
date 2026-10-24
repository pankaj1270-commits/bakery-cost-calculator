// Firebase Configuration & Service (Spark Free Tier)
// Free Tier Limits:
// - Firebase Hosting: 10 GB storage, 360 MB/day transfer (100% free)
// - Cloud Firestore: 1 GiB storage, 50,000 document reads/day, 20,000 writes/day (100% free)
// - Authentication: 50,000 monthly active users (100% free)

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
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
    this.auth = null;
    this.recaptchaVerifier = null;
    this.confirmationResult = null;
    this.isConfigured = false;
    this.init();
  }

  init() {
    // Check localStorage for user-provided Firebase config from Settings UI
    const savedConfig = localStorage.getItem('bakecost_firebase_config_v1');
    let config = DEFAULT_FIREBASE_CONFIG;
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed && parsed.apiKey && parsed.projectId) {
          config = parsed;
        }
      } catch (err) {
        console.warn('Invalid saved Firebase config:', err);
      }
    }

    if (config.apiKey && config.projectId) {
      try {
        this.app = getApps().length > 0 ? getApp() : initializeApp(config);
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
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

  setupRecaptcha(containerId = 'recaptcha-container') {
    if (!this.auth) throw new Error('Firebase Auth is not initialized');
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (e) {
        console.warn('Recaptcha clear:', e);
      }
      this.recaptchaVerifier = null;
    }
    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, containerId, {
      size: 'invisible',
      callback: () => {},
      'expired-callback': () => {
        console.warn('reCAPTCHA expired');
      }
    });
    return this.recaptchaVerifier;
  }

  async sendPhoneOtp(phoneNumber, containerId = 'recaptcha-container') {
    if (!this.auth) throw new Error('Firebase Auth is not initialized');
    const verifier = this.setupRecaptcha(containerId);
    const cleanDigits = (phoneNumber || '').replace(/[^0-9]/g, '');
    const e164 = cleanDigits.startsWith('91') && cleanDigits.length === 12
      ? `+${cleanDigits}`
      : `+91${cleanDigits.slice(-10)}`;
    const confirmationResult = await signInWithPhoneNumber(this.auth, e164, verifier);
    this.confirmationResult = confirmationResult;
    return confirmationResult;
  }

  async verifyPhoneOtp(otpCode, bakeryName = '') {
    if (!this.confirmationResult) {
      throw new Error('No SMS verification session found. Please click "Send OTP" again.');
    }
    const cleanCode = (otpCode || '').replace(/[^0-9]/g, '');
    const userCredential = await this.confirmationResult.confirm(cleanCode);
    if (userCredential && userCredential.user && bakeryName && bakeryName.trim()) {
      try {
        await updateProfile(userCredential.user, { displayName: bakeryName.trim() });
      } catch (e) {
        console.warn('Could not update display name:', e);
      }
    }
    return userCredential;
  }

  async loginWithPhone(phone, password) {
    if (!this.auth) throw new Error('Firebase Auth is not initialized');
    const identifier = phoneToIdentifier(phone);
    return signInWithEmailAndPassword(this.auth, identifier, password);
  }

  async signupWithPhone(phone, password, bakeryName = '') {
    if (!this.auth) throw new Error('Firebase Auth is not initialized');
    const identifier = phoneToIdentifier(phone);
    const userCred = await createUserWithEmailAndPassword(this.auth, identifier, password);
    if (userCred.user) {
      const clean = phone.replace(/[^0-9]/g, '');
      const formatted = clean.length === 10 ? `+91 ${clean.slice(0, 5)} ${clean.slice(5)}` : phone;
      const display = bakeryName.trim() ? `${bakeryName.trim()} (${formatted})` : formatted;
      try {
        await updateProfile(userCred.user, { displayName: display });
      } catch (e) {
        console.warn('Could not update display name:', e);
      }
    }
    return userCred;
  }

  async login(email, password) {
    if (!this.auth) throw new Error('Firebase Auth is not initialized');
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signup(email, password) {
    if (!this.auth) throw new Error('Firebase Auth is not initialized');
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    if (!this.auth) return;
    return signOut(this.auth);
  }

  onAuthChange(callback) {
    if (!this.auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(this.auth, callback);
  }

  getCurrentUser() {
    return this.auth ? this.auth.currentUser : null;
  }

  saveConfig(newConfig) {
    localStorage.setItem('bakecost_firebase_config_v1', JSON.stringify(newConfig));
    this.init();
  }

  getConfig() {
    const saved = localStorage.getItem('bakecost_firebase_config_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.apiKey && parsed.projectId) return parsed;
      } catch (err) {}
    }
    return DEFAULT_FIREBASE_CONFIG;
  }

  // --- FIRESTORE USER-SCOPED METHODS ---
  getIngredientsCol(userId) {
    if (!this.db) return null;
    return userId 
      ? collection(this.db, 'users', userId, 'ingredients')
      : collection(this.db, 'ingredients');
  }

  getRecipesCol(userId) {
    if (!this.db) return null;
    return userId 
      ? collection(this.db, 'users', userId, 'recipes')
      : collection(this.db, 'recipes');
  }

  async getIngredients(userId = null) {
    if (!this.isConfigured || !this.db) return null;
    try {
      const col = this.getIngredientsCol(userId);
      const snap = await getDocs(col);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Firestore getIngredients error:', err);
      return null;
    }
  }

  async getIngredientById(id, userId = null) {
    if (!this.isConfigured || !this.db) return null;
    try {
      const ref = userId 
        ? doc(this.db, 'users', userId, 'ingredients', id)
        : doc(this.db, 'ingredients', id);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      console.error('Firestore getIngredientById error:', err);
      return null;
    }
  }

  async saveIngredient(ingredient, userId = null) {
    if (!this.isConfigured || !this.db) return null;
    try {
      const ref = userId 
        ? doc(this.db, 'users', userId, 'ingredients', ingredient.id)
        : doc(this.db, 'ingredients', ingredient.id);
      await setDoc(ref, ingredient, { merge: true });
      return ingredient;
    } catch (err) {
      console.error('Firestore saveIngredient error:', err);
      return null;
    }
  }

  async deleteIngredient(id, userId = null) {
    if (!this.isConfigured || !this.db) return false;
    try {
      const ref = userId 
        ? doc(this.db, 'users', userId, 'ingredients', id)
        : doc(this.db, 'ingredients', id);
      await deleteDoc(ref);
      return true;
    } catch (err) {
      console.error('Firestore deleteIngredient error:', err);
      return false;
    }
  }

  async getRecipes(userId = null) {
    if (!this.isConfigured || !this.db) return null;
    try {
      const col = this.getRecipesCol(userId);
      const snap = await getDocs(col);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err) {
      console.error('Firestore getRecipes error:', err);
      return null;
    }
  }

  async getRecipeById(id, userId = null) {
    if (!this.isConfigured || !this.db) return null;
    try {
      const ref = userId 
        ? doc(this.db, 'users', userId, 'recipes', id)
        : doc(this.db, 'recipes', id);
      const snap = await getDoc(ref);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      console.error('Firestore getRecipeById error:', err);
      return null;
    }
  }

  async saveRecipe(recipe, userId = null) {
    if (!this.isConfigured || !this.db) return null;
    try {
      const ref = userId 
        ? doc(this.db, 'users', userId, 'recipes', recipe.id)
        : doc(this.db, 'recipes', recipe.id);
      await setDoc(ref, recipe, { merge: true });
      return recipe;
    } catch (err) {
      console.error('Firestore saveRecipe error:', err);
      return null;
    }
  }

  async deleteRecipe(id, userId = null) {
    if (!this.isConfigured || !this.db) return false;
    try {
      const ref = userId 
        ? doc(this.db, 'users', userId, 'recipes', id)
        : doc(this.db, 'recipes', id);
      await deleteDoc(ref);
      return true;
    } catch (err) {
      console.error('Firestore deleteRecipe error:', err);
      return false;
    }
  }

  async syncAllToFirestore(ingredients = [], recipes = [], userId = null) {
    if (!this.isConfigured) throw new Error('Firebase is not configured');
    let ingCount = 0;
    let recCount = 0;
    for (const ing of ingredients) {
      await this.saveIngredient(ing, userId);
      ingCount++;
    }
    for (const rec of recipes) {
      await this.saveRecipe(rec, userId);
      recCount++;
    }
    return { ingCount, recCount };
  }
}

export const firebaseService = new FirebaseService();

export function phoneToIdentifier(phoneNumber) {
  const cleaned = (phoneNumber || '').toString().replace(/[^0-9]/g, '');
  return `user_${cleaned}@bakecost.app`;
}

export function identifierToPhone(user) {
  if (!user) return '';
  if (user.displayName) return user.displayName;
  if (user.phoneNumber) {
    const p = user.phoneNumber;
    if (p.startsWith('+91') && p.length === 13) {
      return `+91 ${p.slice(3, 8)} ${p.slice(8)}`;
    }
    return p;
  }
  if (user.email && user.email.includes('@bakecost.app')) {
    const raw = user.email.replace('user_', '').replace('@bakecost.app', '');
    if (raw.length === 10) {
      return `+91 ${raw.slice(0, 5)} ${raw.slice(5)}`;
    }
    return raw;
  }
  return user.email || 'Bakery Owner';
}
