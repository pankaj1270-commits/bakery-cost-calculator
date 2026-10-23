import { localStore } from './storage.js';
import { firebaseService } from './firebase.js';

// Pluggable data service: LocalStorage (100% offline & free on Firebase Hosting) + Optional Firestore / Express API
export const api = {
  // --- INGREDIENTS ---
  async getIngredients(category, search) {
    // If Firebase is configured and user enabled sync, we can read from Firestore
    if (firebaseService.isConfigured) {
      const fsData = await firebaseService.getIngredients();
      if (fsData && fsData.length > 0) return fsData;
    }
    return localStore.getIngredients(category, search);
  },

  async getIngredientById(id) {
    return localStore.getIngredientById(id);
  },

  async createIngredient(payload) {
    const item = localStore.createIngredient(payload);
    if (firebaseService.isConfigured) {
      await firebaseService.saveIngredient(item);
    }
    return item;
  },

  async updateIngredient(id, payload) {
    const updated = localStore.updateIngredient(id, payload);
    if (firebaseService.isConfigured && updated) {
      await firebaseService.saveIngredient(updated);
    }
    return updated;
  },

  async deleteIngredient(id) {
    const ok = localStore.deleteIngredient(id);
    if (ok && firebaseService.isConfigured) {
      await firebaseService.deleteIngredient(id);
    }
    return ok;
  },

  async getPriceHistory(ingredientId) {
    return localStore.getPriceHistory(ingredientId);
  },

  // --- RECIPES ---
  async getRecipes(category, search) {
    if (firebaseService.isConfigured) {
      const fsData = await firebaseService.getRecipes();
      if (fsData && fsData.length > 0) {
        return fsData.map(r => localStore.calculateFullRecipeCost(r));
      }
    }
    return localStore.getRecipes(category, search);
  },

  async getRecipeById(id) {
    return localStore.getRecipeById(id);
  },

  async createRecipe(payload) {
    const recipe = localStore.createRecipe(payload);
    if (firebaseService.isConfigured) {
      await firebaseService.saveRecipe(recipe);
    }
    return recipe;
  },

  async updateRecipe(id, payload) {
    const updated = localStore.updateRecipe(id, payload);
    if (firebaseService.isConfigured && updated) {
      await firebaseService.saveRecipe(updated);
    }
    return updated;
  },

  async duplicateRecipe(id, newName) {
    const copy = localStore.duplicateRecipe(id, newName);
    if (firebaseService.isConfigured && copy) {
      await firebaseService.saveRecipe(copy);
    }
    return copy;
  },

  async deleteRecipe(id) {
    const ok = localStore.deleteRecipe(id);
    if (ok && firebaseService.isConfigured) {
      await firebaseService.deleteRecipe(id);
    }
    return ok;
  },

  // --- DASHBOARD ---
  async getDashboardStats() {
    return localStore.getDashboardStats();
  },

  // --- BACKUP ---
  exportBackup() {
    return localStore.exportAllData();
  },

  importBackup(data) {
    return localStore.importAllData(data);
  },

  resetDefaults() {
    localStore.resetToDefaults();
  }
};
