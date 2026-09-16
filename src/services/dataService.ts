import {
  Dish,
  Ingredient,
  RestaurantEvent,
  RecordedWasteItem,
  WeatherData,
  RestaurantSettings,
  SalesRecord,
} from '../types';
import {
  INITIAL_DISHES,
  INITIAL_INGREDIENTS,
  INITIAL_EVENTS,
  INITIAL_WASTE_RECORDS,
  INITIAL_WEATHER,
  INITIAL_SETTINGS,
  INITIAL_SALES_RECORDS,
} from '../data/mockData';

const STORAGE_KEYS = {
  SALES_RECORDS: 'resto_ai_sales',
  DISHES: 'resto_ai_dishes',
  INGREDIENTS: 'resto_ai_ingredients',
  EVENTS: 'resto_ai_events',
  WASTE_RECORDS: 'resto_ai_waste',
  WEATHER: 'resto_ai_weather',
  SETTINGS: 'resto_ai_settings',
  DEMO_LOADED: 'resto_ai_demo_loaded',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export interface RecipeDeductionDetail {
  ingredientId: string;
  ingredientName: string;
  usedAmount: number;
  unit: string;
  previousStock: number;
  newStock: number;
}

export const dataService = {
  // Sales Data (Core Real-Time Operational Records)
  getSalesData(): SalesRecord[] {
    const raw = loadStorage<SalesRecord[]>(STORAGE_KEYS.SALES_RECORDS, []);
    return raw.filter(r => !r.isDemo);
  },

  saveSalesData(records: SalesRecord[]): void {
    saveStorage(STORAGE_KEYS.SALES_RECORDS, records.filter(r => !r.isDemo));
  },

  addSalesRecord(
    recordData: Omit<SalesRecord, 'id' | 'totalSales' | 'createdAt'>
  ): {
    newRecord: SalesRecord;
    allSales: SalesRecord[];
    deductions: RecipeDeductionDetail[];
  } {
    const list = this.getSalesData();
    const totalSales = recordData.quantitySold * recordData.sellingPrice;
    const newRecord: SalesRecord = {
      ...recordData,
      id: `sale-${Date.now().toString().slice(-6)}`,
      totalSales,
      createdAt: new Date().toISOString(),
      isDemo: false, // Explicitly tagged as live restaurant staff entered data
    };

    const updatedSales = [newRecord, ...list];
    this.saveSalesData(updatedSales);

    // Automatic recipe ingredient deduction
    const deductions = this.deductRecipeIngredients(
      recordData.dishId,
      recordData.quantitySold
    );

    // If waste was recorded in this sale entry, automatically create a waste tracking entry
    if (recordData.quantityWasted > 0) {
      const dish = this.getDishes().find(d => d.id === recordData.dishId);
      const estCost = Math.round(recordData.quantityWasted * (recordData.sellingPrice * 0.45)); // ~45% food cost
      this.addWasteRecord({
        date: recordData.date,
        dishId: recordData.dishId,
        dishName: recordData.dishName,
        quantityWasted: recordData.quantityWasted,
        unit: 'portions',
        wasteReason: 'Overproduction',
        mealPeriod: recordData.mealPeriod,
        estimatedCostINR: estCost,
        recordedBy: 'Shift Manager (Sales Entry)',
      });
    }

    return {
      newRecord,
      allSales: updatedSales,
      deductions,
    };
  },

  updateSalesData(id: string, updates: Partial<SalesRecord>): SalesRecord[] {
    const list = this.getSalesData();
    const updated = list.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updates };
        merged.totalSales = merged.quantitySold * merged.sellingPrice;
        merged.quantityRemaining = Math.max(0, merged.quantityPrepared - merged.quantitySold - merged.quantityWasted);
        return merged;
      }
      return item;
    });
    this.saveSalesData(updated);
    return updated;
  },

  deleteSalesData(id: string): SalesRecord[] {
    const list = this.getSalesData();
    const updated = list.filter(item => item.id !== id);
    this.saveSalesData(updated);
    return updated;
  },

  // Calculate ingredient consumption based on recipe mapping
  calculateRecipeDeductions(dishId: string, portionsSold: number): RecipeDeductionDetail[] {
    const dishes = this.getDishes();
    const ingredients = this.getIngredients();
    const targetDish = dishes.find(d => d.id === dishId);

    if (!targetDish || !targetDish.ingredients || portionsSold <= 0) {
      return [];
    }

    const deductions: RecipeDeductionDetail[] = [];

    targetDish.ingredients.forEach(usage => {
      const ing = ingredients.find(i => i.id === usage.ingredientId);
      if (ing) {
        const usedAmount = Math.round(usage.quantityPerPortion * portionsSold * 100) / 100;
        deductions.push({
          ingredientId: ing.id,
          ingredientName: ing.name,
          usedAmount,
          unit: ing.unit,
          previousStock: ing.currentStock,
          newStock: Math.max(0, Math.round((ing.currentStock - usedAmount) * 100) / 100),
        });
      }
    });

    return deductions;
  },

  // Execute recipe ingredient deduction and update inventory
  deductRecipeIngredients(dishId: string, portionsSold: number): RecipeDeductionDetail[] {
    const deductions = this.calculateRecipeDeductions(dishId, portionsSold);
    if (deductions.length === 0) return [];

    const ingredients = this.getIngredients();
    const updatedIngredients = ingredients.map(ing => {
      const deduction = deductions.find(d => d.ingredientId === ing.id);
      if (deduction) {
        const newStock = Math.max(0, Math.round((ing.currentStock - deduction.usedAmount) * 100) / 100);
        const days = ing.dailyUsage > 0 ? Math.round((newStock / ing.dailyUsage) * 10) / 10 : 2;
        let status: Ingredient['status'] = 'In Stock';
        if (newStock <= ing.minStockLevel * 0.5) status = 'Critical';
        else if (newStock <= ing.minStockLevel) status = 'Low Stock';
        else if (days > 4.5) status = 'Overstocked';

        return {
          ...ing,
          currentStock: newStock,
          daysRemaining: days,
          status,
        };
      }
      return ing;
    });

    this.saveIngredients(updatedIngredients);
    return deductions;
  },

  // Dishes
  getDishes(): Dish[] {
    return loadStorage<Dish[]>(STORAGE_KEYS.DISHES, INITIAL_DISHES);
  },
  saveDishes(dishes: Dish[]): void {
    saveStorage(STORAGE_KEYS.DISHES, dishes);
  },
  updateDish(dishId: string, updates: Partial<Dish>): Dish[] {
    const list = this.getDishes();
    const updated = list.map(d => (d.id === dishId ? { ...d, ...updates } : d));
    this.saveDishes(updated);
    return updated;
  },

  // Ingredients / Inventory
  getIngredients(): Ingredient[] {
    return loadStorage<Ingredient[]>(STORAGE_KEYS.INGREDIENTS, INITIAL_INGREDIENTS);
  },
  getInventoryData(): Ingredient[] {
    return this.getIngredients();
  },
  saveIngredients(items: Ingredient[]): void {
    saveStorage(STORAGE_KEYS.INGREDIENTS, items);
  },
  saveInventoryData(items: Ingredient[]): void {
    this.saveIngredients(items);
  },
  addInventoryIngredient(item: Ingredient): Ingredient[] {
    const list = this.getIngredients();
    const exists = list.some(i => i.id === item.id);
    const updated = exists ? list.map(i => (i.id === item.id ? item : i)) : [item, ...list];
    this.saveIngredients(updated);
    return updated;
  },
  deleteInventoryIngredient(id: string): Ingredient[] {
    const list = this.getIngredients();
    const updated = list.filter(i => i.id !== id);
    this.saveIngredients(updated);
    return updated;
  },
  updateIngredientStock(ingredientId: string, newStock: number): Ingredient[] {
    const list = this.getIngredients();
    const updated = list.map(item => {
      if (item.id === ingredientId) {
        const days = item.dailyUsage > 0 ? Math.round((newStock / item.dailyUsage) * 10) / 10 : 2;
        let status: Ingredient['status'] = 'In Stock';
        if (newStock <= item.minStockLevel * 0.5) status = 'Critical';
        else if (newStock <= item.minStockLevel) status = 'Low Stock';
        else if (days > 4.5) status = 'Overstocked';

        return {
          ...item,
          currentStock: newStock,
          daysRemaining: days,
          status,
        };
      }
      return item;
    });
    this.saveIngredients(updated);
    return updated;
  },

  // Events
  getEvents(): RestaurantEvent[] {
    return loadStorage<RestaurantEvent[]>(STORAGE_KEYS.EVENTS, INITIAL_EVENTS);
  },
  saveEvents(events: RestaurantEvent[]): void {
    saveStorage(STORAGE_KEYS.EVENTS, events);
  },
  addEvent(event: Omit<RestaurantEvent, 'id'>): RestaurantEvent[] {
    const list = this.getEvents();
    const newEvent: RestaurantEvent = {
      ...event,
      id: `evt-${Date.now().toString().slice(-5)}`,
    };
    const updated = [newEvent, ...list];
    this.saveEvents(updated);
    return updated;
  },
  deleteEvent(id: string): RestaurantEvent[] {
    const list = this.getEvents();
    const updated = list.filter(e => e.id !== id);
    this.saveEvents(updated);
    return updated;
  },

  // Recorded Waste
  getWasteRecords(): RecordedWasteItem[] {
    return loadStorage<RecordedWasteItem[]>(STORAGE_KEYS.WASTE_RECORDS, []);
  },
  saveWasteRecords(records: RecordedWasteItem[]): void {
    saveStorage(STORAGE_KEYS.WASTE_RECORDS, records);
  },
  addWasteRecord(record: Omit<RecordedWasteItem, 'id'>): RecordedWasteItem[] {
    const list = this.getWasteRecords();
    const newRecord: RecordedWasteItem = {
      ...record,
      id: `w-${Date.now().toString().slice(-5)}`,
    };
    const updated = [newRecord, ...list];
    this.saveWasteRecords(updated);
    return updated;
  },
  deleteWasteRecord(id: string): RecordedWasteItem[] {
    const list = this.getWasteRecords();
    const updated = list.filter(r => r.id !== id);
    this.saveWasteRecords(updated);
    return updated;
  },

  // Weather
  getWeather(): WeatherData {
    return loadStorage<WeatherData>(STORAGE_KEYS.WEATHER, INITIAL_WEATHER);
  },
  saveWeather(weather: WeatherData): void {
    saveStorage(STORAGE_KEYS.WEATHER, weather);
  },

  // Settings
  getSettings(): RestaurantSettings {
    return loadStorage<RestaurantSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: RestaurantSettings): void {
    saveStorage(STORAGE_KEYS.SETTINGS, settings);
  },

  // Demo Mode Controls
  loadDemoData(): {
    sales: SalesRecord[];
    dishes: Dish[];
    ingredients: Ingredient[];
    events: RestaurantEvent[];
    waste: RecordedWasteItem[];
  } {
    this.saveSalesData(INITIAL_SALES_RECORDS);
    this.saveDishes(INITIAL_DISHES);
    this.saveIngredients(INITIAL_INGREDIENTS);
    this.saveEvents(INITIAL_EVENTS);
    this.saveWasteRecords(INITIAL_WASTE_RECORDS);
    this.saveWeather(INITIAL_WEATHER);
    return {
      sales: INITIAL_SALES_RECORDS,
      dishes: INITIAL_DISHES,
      ingredients: INITIAL_INGREDIENTS,
      events: INITIAL_EVENTS,
      waste: INITIAL_WASTE_RECORDS,
    };
  },

  clearDemoData(): SalesRecord[] {
    // Keep user-entered records, remove only those marked isDemo === true
    const currentSales = this.getSalesData();
    const nonDemoSales = currentSales.filter(s => !s.isDemo);
    this.saveSalesData(nonDemoSales);
    return nonDemoSales;
  },

  clearAllSales(): void {
    this.saveSalesData([]);
  },

  resetAll(): void {
    localStorage.removeItem(STORAGE_KEYS.SALES_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.DISHES);
    localStorage.removeItem(STORAGE_KEYS.INGREDIENTS);
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.WASTE_RECORDS);
    localStorage.removeItem(STORAGE_KEYS.WEATHER);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};
