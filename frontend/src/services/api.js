import { localStore } from './storage.js';
import { firebaseService } from './firebase.js';
import { userService } from './userService.js';

function getActiveUserId() {
  const user = userService.getCurrentUser();
  return user && user.mobile ? user.mobile : null;
}

// Pluggable data service with 100% User Isolation per Mobile Number:
export const api = {
  // --- INGREDIENTS ---
  async getIngredients(category, search) {
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && userId) {
      let fsData = await firebaseService.getIngredients(userId);
      // Auto-sync initial ingredients to user's private Firestore space if empty
      if (!fsData || fsData.length === 0) {
        const localList = localStore.getIngredients();
        if (localList && localList.length > 0) {
          for (const item of localList) {
            await firebaseService.saveIngredient(item, userId);
          }
          fsData = localList;
        }
      }
      if (fsData && fsData.length > 0) {
        localStore.setIngredients(fsData);
        let list = fsData;
        if (category && category !== 'All') {
          list = list.filter(i => (i.category || '').toLowerCase() === category.toLowerCase());
        }
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(i =>
            (i.name || '').toLowerCase().includes(q) ||
            (i.supplierName && i.supplierName.toLowerCase().includes(q)) ||
            (i.category && i.category.toLowerCase().includes(q))
          );
        }
        return list;
      }
    }
    // Guest or offline fallback
    return localStore.getIngredients(category, search);
  },

  async getIngredientById(id) {
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && userId) {
      const fsIng = await firebaseService.getIngredientById(id, userId);
      if (fsIng) return fsIng;
    }
    return localStore.getIngredientById(id);
  },

  async createIngredient(payload) {
    const item = localStore.createIngredient(payload);
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && userId) {
      await firebaseService.saveIngredient(item, userId);
    }
    return item;
  },

  async updateIngredient(id, payload) {
    const updated = localStore.updateIngredient(id, payload);
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && updated && userId) {
      await firebaseService.saveIngredient(updated, userId);
    }
    return updated;
  },

  async deleteIngredient(id) {
    const ok = localStore.deleteIngredient(id);
    const userId = getActiveUserId();
    if (ok && firebaseService.isConfigured && userId) {
      await firebaseService.deleteIngredient(id, userId);
    }
    return ok;
  },

  async getPriceHistory(ingredientId) {
    return localStore.getPriceHistory(ingredientId);
  },

  // --- RECIPES ---
  async getRecipes(category, search) {
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && userId) {
      const [fsDataRaw, fsIngredients] = await Promise.all([
        firebaseService.getRecipes(userId),
        firebaseService.getIngredients(userId)
      ]);
      let fsData = fsDataRaw;
      // Auto-sync initial recipes to user's private Firestore space if empty
      if (!fsData || fsData.length === 0) {
        const localList = localStore.getRawRecipes();
        if (localList && localList.length > 0) {
          for (const rec of localList) {
            await firebaseService.saveRecipe(rec, userId);
          }
          fsData = localList;
        }
      }
      if (fsIngredients && fsIngredients.length > 0) {
        localStore.setIngredients(fsIngredients);
      }
      if (fsData && fsData.length > 0) {
        localStore.setRecipes(fsData);
        const liveIngs = (fsIngredients && fsIngredients.length > 0) ? fsIngredients : localStore.getIngredients();
        let list = fsData.map(r => localStore.calculateFullRecipeCost(r, liveIngs));
        if (category && category !== 'All') {
          list = list.filter(r => (r.category || '').toLowerCase() === category.toLowerCase());
        }
        if (search) {
          const q = search.toLowerCase();
          list = list.filter(r =>
            (r.name || '').toLowerCase().includes(q) ||
            (r.description || '').toLowerCase().includes(q) ||
            (r.category || '').toLowerCase().includes(q)
          );
        }
        return list;
      }
    }
    return localStore.getRecipes(category, search);
  },

  async getRecipeById(id) {
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && userId) {
      const [fsRecipe, fsIngredients] = await Promise.all([
        firebaseService.getRecipeById(id, userId),
        firebaseService.getIngredients(userId)
      ]);
      if (fsIngredients && fsIngredients.length > 0) {
        localStore.setIngredients(fsIngredients);
      }
      if (fsRecipe) {
        const liveIngs = (fsIngredients && fsIngredients.length > 0) ? fsIngredients : localStore.getIngredients();
        return localStore.calculateFullRecipeCost(fsRecipe, liveIngs);
      }
    }
    return localStore.getRecipeById(id);
  },

  async createRecipe(payload) {
    const userId = getActiveUserId();
    let fsIngredients = null;
    if (firebaseService.isConfigured && userId) {
      fsIngredients = await firebaseService.getIngredients(userId);
      if (fsIngredients && fsIngredients.length > 0) {
        localStore.setIngredients(fsIngredients);
      }
    }
    const recipe = localStore.createRecipe(payload, fsIngredients);
    if (firebaseService.isConfigured && recipe && userId) {
      const rawRecipe = localStore.getRawRecipes().find(r => r.id === recipe.id);
      await firebaseService.saveRecipe(rawRecipe || recipe, userId);
    }
    return recipe;
  },

  async updateRecipe(id, payload) {
    const userId = getActiveUserId();
    let fsIngredients = null;
    if (firebaseService.isConfigured && userId) {
      fsIngredients = await firebaseService.getIngredients(userId);
      if (fsIngredients && fsIngredients.length > 0) {
        localStore.setIngredients(fsIngredients);
      }
    }
    const updated = localStore.updateRecipe(id, payload, fsIngredients);
    if (firebaseService.isConfigured && userId) {
      const rawRecipe = localStore.getRawRecipes().find(r => r.id === id);
      await firebaseService.saveRecipe(rawRecipe || payload, userId);
    }
    return updated;
  },

  async duplicateRecipe(id, newName) {
    const copy = localStore.duplicateRecipe(id, newName);
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && copy && userId) {
      const rawRecipe = localStore.getRawRecipes().find(r => r.id === copy.id);
      await firebaseService.saveRecipe(rawRecipe || copy, userId);
    }
    return copy;
  },

  async deleteRecipe(id) {
    const ok = localStore.deleteRecipe(id);
    const userId = getActiveUserId();
    if (ok && firebaseService.isConfigured && userId) {
      await firebaseService.deleteRecipe(id, userId);
    }
    return ok;
  },

  // --- DASHBOARD ---
  async getDashboardStats() {
    const userId = getActiveUserId();
    if (firebaseService.isConfigured && userId) {
      const recipes = await this.getRecipes();
      const ingredients = await this.getIngredients();
      const sortedByUnitCost = [...recipes].sort((a, b) =>
        b.productionCost.costPerProduct - a.productionCost.costPerProduct
      );
      const sortedByMargin = [...recipes].sort((a, b) =>
        b.profitAnalysis.profitMarginPercentage - a.profitAnalysis.profitMarginPercentage
      );
      return {
        totalIngredients: ingredients.length,
        totalRecipes: recipes.length,
        recentPriceChanges: localStore.getPriceHistory().slice(0, 10),
        mostExpensiveRecipes: sortedByUnitCost.slice(0, 5),
        highestMarginRecipes: sortedByMargin.slice(0, 5),
        allRecipesOverview: recipes.map(r => ({
          id: r.id,
          name: r.name,
          category: r.category,
          yieldCount: r.yieldCount,
          yieldUnit: r.yieldUnit,
          ingredientCost: r.totalIngredientCost,
          totalProductionCost: r.productionCost.totalProductionCost,
          costPerProduct: r.productionCost.costPerProduct,
          suggestedSellingPrice: r.profitAnalysis.suggestedSellingPrice,
          profitPerProduct: r.profitAnalysis.profitPerProduct,
          totalProfitPerBatch: r.profitAnalysis.totalProfitPerBatch,
          marginPct: r.profitAnalysis.profitMarginPercentage,
          markupPct: r.profitAnalysis.markupPercentage
        }))
      };
    }
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
  },

  async syncAllToFirestore() {
    const userId = getActiveUserId();
    if (!userId) throw new Error('Please sign in to sync your bakery data.');
    const ingredients = localStore.getIngredients();
    const recipes = localStore.getRawRecipes();
    return firebaseService.syncAllToFirestore(ingredients, recipes, userId);
  }
};
