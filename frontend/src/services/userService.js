import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseService } from './firebase.js';

const AUTH_STORAGE_KEY = 'bakecost_auth_user_session_v1';
const LOCAL_USERS_KEY = 'bakecost_local_users_v1';

export const ADMIN_MOBILES = ['9756259249', '8574372555'];

export function isUserAdmin(user) {
  if (!user) return false;
  const raw = (user.mobile || user.phoneNumber || '').toString().replace(/[^0-9]/g, '');
  const digits10 = raw.slice(-10);
  return ADMIN_MOBILES.includes(digits10);
}

class UserService {
  constructor() {
    this.currentUser = this.loadSession();
    this.listeners = [];
  }

  loadSession() {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  saveSession(user) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    this.notify();
  }

  onAuthChange(callback) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb(this.currentUser));
  }

  getLocalUsers() {
    try {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  saveLocalUser(mobile, userRecord) {
    const users = this.getLocalUsers();
    users[mobile] = userRecord;
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  }

  // --- REGISTER ---
  async register({ mobile, password, bakeryName = '' }) {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }
    if (!password || password.length < 4) {
      throw new Error('Please set a password/PIN of at least 4 characters.');
    }

    const formattedMobile = `+91 ${cleanMobile.slice(-10, -5)} ${cleanMobile.slice(-5)}`;
    const userRecord = {
      mobile: cleanMobile,
      formattedMobile,
      bakeryName: bakeryName.trim() || 'My Bakery',
      password: password,
      registeredAt: new Date().toISOString()
    };

    // Save to Firestore if connected
    if (firebaseService.isConfigured && firebaseService.db) {
      try {
        const userRef = doc(firebaseService.db, 'users', cleanMobile);
        const existing = await getDoc(userRef);
        if (existing.exists()) {
          throw new Error('This mobile number is already registered. Please click "Sign In" to continue.');
        }
        await setDoc(userRef, userRecord);
      } catch (err) {
        if (err.message.includes('already registered')) throw err;
        console.warn('Firestore write warning (saving locally):', err);
      }
    }

    // Always cache locally so offline works too
    this.saveLocalUser(cleanMobile, userRecord);

    const sessionUser = {
      mobile: cleanMobile,
      formattedMobile,
      bakeryName: userRecord.bakeryName,
      displayName: userRecord.bakeryName ? `${userRecord.bakeryName} (${formattedMobile})` : formattedMobile
    };

    this.saveSession(sessionUser);
    return sessionUser;
  }

  // --- LOGIN ---
  async login({ mobile, password }) {
    const cleanMobile = mobile.replace(/[^0-9]/g, '');
    if (cleanMobile.length < 10) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }
    if (!password) {
      throw new Error('Please enter your password/PIN.');
    }

    let userRecord = null;

    // Check Cloud Firestore first
    if (firebaseService.isConfigured && firebaseService.db) {
      try {
        const userRef = doc(firebaseService.db, 'users', cleanMobile);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          userRecord = snap.data();
        }
      } catch (err) {
        console.warn('Firestore read error, checking local:', err);
      }
    }

    // Fallback to local users
    if (!userRecord) {
      const localUsers = this.getLocalUsers();
      userRecord = localUsers[cleanMobile];
    }

    if (!userRecord) {
      throw new Error('Mobile number not found. Please click "Register" to create your account in 5 seconds.');
    }

    if (userRecord.password !== password) {
      throw new Error('Incorrect password or PIN. Please check and try again.');
    }

    const formattedMobile = userRecord.formattedMobile || `+91 ${cleanMobile.slice(-10, -5)} ${cleanMobile.slice(-5)}`;
    const sessionUser = {
      mobile: cleanMobile,
      formattedMobile,
      bakeryName: userRecord.bakeryName || 'My Bakery',
      displayName: userRecord.bakeryName ? `${userRecord.bakeryName} (${formattedMobile})` : formattedMobile
    };

    this.saveSession(sessionUser);
    return sessionUser;
  }

  // --- LOGOUT ---
  logout() {
    this.saveSession(null);
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

export const userService = new UserService();
