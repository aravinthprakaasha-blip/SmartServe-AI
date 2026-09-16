import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Dish,
  Ingredient,
  RestaurantEvent,
  RecordedWasteItem,
  WasteLog,
  WeatherData,
  RestaurantSettings,
  SalesRecord,
  DateFilterOption,
} from '../types';
import { dataService, RecipeDeductionDetail } from '../services/dataService';
import { firestoreDataService } from '../services/firestoreDataService';
import { useAuth } from './AuthContext';

export interface AppContextType {
  // State
  salesRecords: SalesRecord[];
  filteredSalesRecords: SalesRecord[];
  dishes: Dish[];
  ingredients: Ingredient[];
  events: RestaurantEvent[];
  wasteRecords: RecordedWasteItem[];
  wasteLogs: WasteLog[];
  weather: WeatherData;
  settings: RestaurantSettings;
  dateFilter: DateFilterOption;
  customDateRange: { start: string; end: string };
  lastUpdatedTime: string;
  isFirestoreConnected: boolean;
  hasDemoData: boolean;
  recentDeductions: RecipeDeductionDetail[];

  // Setters / Filters
  setDateFilter: (filter: DateFilterOption) => void;
  setCustomDateRange: (range: { start: string; end: string }) => void;

  // Actions
  addSalesRecord: (
    data: Omit<SalesRecord, 'id' | 'totalSales' | 'createdAt'>
  ) => RecipeDeductionDetail[];
  updateSalesRecord: (id: string, updates: Partial<SalesRecord>) => void;
  deleteSalesRecord: (id: string) => void;

  addInventoryIngredient: (item: Ingredient) => void;
  updateIngredientStock: (id: string, newStock: number) => void;
  deleteInventoryIngredient: (id: string) => void;
  markPurchased: (ingredientId: string, quantity: number) => void;

  addWasteRecord: (record: Omit<RecordedWasteItem, 'id'>) => void;
  deleteWasteRecord: (id: string) => void;
  addWasteLog: (log: Omit<WasteLog, 'id'>) => void;
  deleteWasteLog: (id: string) => void;

  updateWeather: (weather: WeatherData) => void;
  addEvent: (event: Omit<RestaurantEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;

  updateSettings: (settings: RestaurantSettings) => void;
  updateDish: (dishId: string, updates: Partial<Dish>) => void;

  loadDemoData: () => void;
  clearDemoData: () => void;
  clearAllSales: () => void;
  resetToDefaults: () => void;
  refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function formatTimeNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  // Core Persistent State
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>(() =>
    dataService.getSalesData()
  );
  const [dishes, setDishes] = useState<Dish[]>(() => dataService.getDishes());
  const [ingredients, setIngredients] = useState<Ingredient[]>(() =>
    dataService.getIngredients()
  );
  const [events, setEvents] = useState<RestaurantEvent[]>(() => dataService.getEvents());
  const [wasteRecords, setWasteRecords] = useState<RecordedWasteItem[]>(() =>
    dataService.getWasteRecords()
  );
  const [weather, setWeather] = useState<WeatherData>(() => dataService.getWeather());
  const [settings, setSettings] = useState<RestaurantSettings>(() =>
    dataService.getSettings()
  );

  const [dateFilter, setDateFilter] = useState<DateFilterOption>('Today');
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() => formatTimeNow());
  const [recentDeductions, setRecentDeductions] = useState<RecipeDeductionDetail[]>([]);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  // Sync to Cloud Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      setIsFirestoreConnected(false);
      return;
    }

    let isMounted = true;
    firestoreDataService.seedIfEmpty().then(() => {
      if (isMounted) setIsFirestoreConnected(true);
    });

    const unsubDishes = firestoreDataService.subscribeDishes(liveDishes => {
      if (!isMounted) return;
      if (liveDishes.length > 0) {
        setDishes(liveDishes);
        dataService.saveDishes(liveDishes);
      }
    });

    const unsubSales = firestoreDataService.subscribeSalesRecords(liveSales => {
      if (!isMounted) return;
      const nonDemo = liveSales.filter(s => !s.isDemo);
      setSalesRecords(nonDemo);
      dataService.saveSalesData(nonDemo);
    });

    const unsubIngredients = firestoreDataService.subscribeIngredients(liveIngredients => {
      if (!isMounted) return;
      if (liveIngredients.length > 0) {
        setIngredients(liveIngredients);
        dataService.saveIngredients(liveIngredients);
      }
    });

    const unsubEvents = firestoreDataService.subscribeEvents(liveEvents => {
      if (!isMounted) return;
      if (liveEvents.length > 0) {
        setEvents(liveEvents);
        dataService.saveEvents(liveEvents);
      }
    });

    const unsubWaste = firestoreDataService.subscribeWasteRecords(liveWaste => {
      if (!isMounted) return;
      setWasteRecords(liveWaste);
      dataService.saveWasteRecords(liveWaste);
    });

    const unsubSettings = firestoreDataService.subscribeSettings(liveSettings => {
      if (!isMounted) return;
      if (liveSettings && liveSettings.restaurantName) {
        setSettings(liveSettings);
        dataService.saveSettings(liveSettings);
      }
    });

    return () => {
      isMounted = false;
      unsubDishes();
      unsubSales();
      unsubIngredients();
      unsubEvents();
      unsubWaste();
      unsubSettings();
    };
  }, [user]);

  // Check if there is demo data present
  const hasDemoData = useMemo(() => {
    return salesRecords.some(s => s.isDemo);
  }, [salesRecords]);

  // Date filtering logic
  const filteredSalesRecords = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return salesRecords.filter(record => {
      const recDate = record.date;
      if (dateFilter === 'Today') {
        return recDate === todayStr;
      }

      const recTime = new Date(recDate).getTime();
      const now = new Date().getTime();

      if (dateFilter === 'Yesterday') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr = yesterday.toISOString().split('T')[0];
        return recDate === yestStr;
      }

      if (dateFilter === 'Last 7 Days') {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        return recTime >= sevenDaysAgo;
      }

      if (dateFilter === 'Last 30 Days') {
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
        return recTime >= thirtyDaysAgo;
      }

      if (dateFilter === 'Custom') {
        if (!customDateRange.start || !customDateRange.end) return true;
        return recDate >= customDateRange.start && recDate <= customDateRange.end;
      }

      return true;
    });
  }, [salesRecords, dateFilter, customDateRange]);

  // Waste logs mapping
  const wasteLogs: WasteLog[] = useMemo(() => {
    return wasteRecords.map(r => ({
      id: r.id,
      date: r.date,
      item: r.dishName,
      quantity: r.quantityWasted,
      unit: r.unit,
      reason: r.wasteReason,
      costINR: r.estimatedCostINR,
    }));
  }, [wasteRecords]);

  // Actions
  const addSalesRecord = useCallback(
    (data: Omit<SalesRecord, 'id' | 'totalSales' | 'createdAt'>) => {
      const result = dataService.addSalesRecord(data);
      setSalesRecords(result.allSales);
      setRecentDeductions(result.deductions);
      // Reload ingredients after recipe deduction
      setIngredients(dataService.getIngredients());
      // Reload waste records if waste was created
      setWasteRecords(dataService.getWasteRecords());
      const nowTime = formatTimeNow();
      setLastUpdatedTime(nowTime);

      // Write to live Firestore database if user is authenticated
      if (user) {
        firestoreDataService.addSalesRecord(result.newRecord).catch(err => {
          console.warn('Firestore addSalesRecord error:', err);
        });

        // Sync ingredient deductions to Firestore
        if (result.deductions.length > 0) {
          result.deductions.forEach(ded => {
            const ing = dataService.getIngredients().find(i => i.id === ded.ingredientId);
            if (ing) {
              firestoreDataService
                .updateIngredientStock(ing.id, ing.currentStock, ing.dailyUsage, ing.minStockLevel)
                .catch(err => console.warn('Firestore stock deduction note:', err));
            }
          });
        }

        // Sync waste record to Firestore if waste was generated
        if (data.quantityWasted > 0) {
          const estCost = Math.round(data.quantityWasted * (data.sellingPrice * 0.45));
          firestoreDataService
            .addWasteRecord({
              date: data.date,
              dishId: data.dishId,
              dishName: data.dishName,
              quantityWasted: data.quantityWasted,
              unit: 'portions',
              wasteReason: 'Overproduction',
              mealPeriod: data.mealPeriod,
              estimatedCostINR: estCost,
              recordedBy: user.displayName || user.email?.split('@')[0] || 'Staff User',
            })
            .catch(err => console.warn('Firestore waste sync note:', err));
        }
      }

      return result.deductions;
    },
    [user]
  );

  const updateSalesRecord = useCallback(
    (id: string, updates: Partial<SalesRecord>) => {
      const updated = dataService.updateSalesData(id, updates);
      setSalesRecords(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.updateSalesRecord(id, updates).catch(err => {
          console.warn('Firestore updateSalesRecord error:', err);
        });
      }
    },
    [user]
  );

  const deleteSalesRecord = useCallback(
    (id: string) => {
      const updated = dataService.deleteSalesData(id);
      setSalesRecords(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.deleteSalesRecord(id).catch(err => {
          console.warn('Firestore deleteSalesRecord error:', err);
        });
      }
    },
    [user]
  );

  const addInventoryIngredient = useCallback(
    (item: Ingredient) => {
      const updated = dataService.addInventoryIngredient(item);
      setIngredients(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.addIngredient(item).catch(err => {
          console.warn('Firestore addIngredient error:', err);
        });
      }
    },
    [user]
  );

  const updateIngredientStock = useCallback(
    (id: string, newStock: number) => {
      const updated = dataService.updateIngredientStock(id, newStock);
      setIngredients(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        const item = updated.find(i => i.id === id);
        if (item) {
          firestoreDataService
            .updateIngredientStock(id, newStock, item.dailyUsage, item.minStockLevel)
            .catch(err => console.warn('Firestore stock update error:', err));
        }
      }
    },
    [user]
  );

  const deleteInventoryIngredient = useCallback(
    (id: string) => {
      const updated = dataService.deleteInventoryIngredient(id);
      setIngredients(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.deleteIngredient(id).catch(err => {
          console.warn('Firestore deleteIngredient error:', err);
        });
      }
    },
    [user]
  );

  const markPurchased = useCallback(
    (ingredientId: string, quantity: number) => {
      const current = dataService.getIngredients();
      const target = current.find(i => i.id === ingredientId);
      if (target) {
        const newStock = Math.round((target.currentStock + quantity) * 10) / 10;
        const updated = dataService.updateIngredientStock(ingredientId, newStock);
        setIngredients(updated);
        setLastUpdatedTime(formatTimeNow());
        if (user) {
          firestoreDataService
            .updateIngredientStock(ingredientId, newStock, target.dailyUsage, target.minStockLevel)
            .catch(err => console.warn('Firestore mark purchased error:', err));
        }
      }
    },
    [user]
  );

  const addWasteRecord = useCallback(
    (record: Omit<RecordedWasteItem, 'id'>) => {
      const updated = dataService.addWasteRecord(record);
      setWasteRecords(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.addWasteRecord(record).catch(err => {
          console.warn('Firestore addWasteRecord error:', err);
        });
      }
    },
    [user]
  );

  const deleteWasteRecord = useCallback(
    (id: string) => {
      const updated = dataService.deleteWasteRecord(id);
      setWasteRecords(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.deleteWasteRecord(id).catch(err => {
          console.warn('Firestore deleteWasteRecord error:', err);
        });
      }
    },
    [user]
  );

  const addWasteLog = useCallback(
    (log: Omit<WasteLog, 'id'>) => {
      const record: Omit<RecordedWasteItem, 'id'> = {
        date: log.date,
        dishId: `item-${Date.now()}`,
        dishName: log.item,
        quantityWasted: log.quantity,
        unit: log.unit,
        wasteReason: log.reason,
        mealPeriod: 'Lunch',
        estimatedCostINR: log.costINR,
        recordedBy: user?.displayName || user?.email?.split('@')[0] || 'Staff User',
      };
      addWasteRecord(record);
    },
    [user, addWasteRecord]
  );

  const deleteWasteLog = useCallback(
    (id: string) => {
      deleteWasteRecord(id);
    },
    [deleteWasteRecord]
  );

  const updateWeather = useCallback((newWeather: WeatherData) => {
    dataService.saveWeather(newWeather);
    setWeather(newWeather);
    setLastUpdatedTime(formatTimeNow());
  }, []);

  const addEvent = useCallback(
    (event: Omit<RestaurantEvent, 'id'>) => {
      const updated = dataService.addEvent(event);
      setEvents(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.addEvent(event).catch(err => {
          console.warn('Firestore addEvent error:', err);
        });
      }
    },
    [user]
  );

  const deleteEvent = useCallback(
    (id: string) => {
      const updated = dataService.deleteEvent(id);
      setEvents(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.deleteEvent(id).catch(err => {
          console.warn('Firestore deleteEvent error:', err);
        });
      }
    },
    [user]
  );

  const updateSettings = useCallback(
    (newSettings: RestaurantSettings) => {
      dataService.saveSettings(newSettings);
      setSettings(newSettings);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.saveSettings(newSettings).catch(err => {
          console.warn('Firestore saveSettings error:', err);
        });
      }
    },
    [user]
  );

  const updateDish = useCallback(
    (dishId: string, updates: Partial<Dish>) => {
      const updated = dataService.updateDish(dishId, updates);
      setDishes(updated);
      setLastUpdatedTime(formatTimeNow());
      if (user) {
        firestoreDataService.updateDish(dishId, updates).catch(err => {
          console.warn('Firestore updateDish error:', err);
        });
      }
    },
    [user]
  );

  const loadDemoData = useCallback(() => {
    const loaded = dataService.loadDemoData();
    setSalesRecords(loaded.sales);
    setDishes(loaded.dishes);
    setIngredients(loaded.ingredients);
    setEvents(loaded.events);
    setWasteRecords(loaded.waste);
    setLastUpdatedTime(formatTimeNow());
  }, []);

  const clearDemoData = useCallback(() => {
    const nonDemo = dataService.clearDemoData();
    setSalesRecords(nonDemo);
    setLastUpdatedTime(formatTimeNow());
  }, []);

  const clearAllSales = useCallback(() => {
    dataService.clearAllSales();
    setSalesRecords([]);
    setLastUpdatedTime(formatTimeNow());
    if (user) {
      firestoreDataService.clearAllSalesRecords().catch(err => {
        console.warn('Firestore clearAllSalesRecords error:', err);
      });
    }
  }, [user]);

  const refreshData = useCallback(() => {
    setSalesRecords(dataService.getSalesData());
    setDishes(dataService.getDishes());
    setIngredients(dataService.getIngredients());
    setEvents(dataService.getEvents());
    setWasteRecords(dataService.getWasteRecords());
    setWeather(dataService.getWeather());
    setSettings(dataService.getSettings());
    setLastUpdatedTime(formatTimeNow());
  }, []);

  const resetToDefaults = useCallback(() => {
    dataService.resetAll();
    refreshData();
  }, [refreshData]);

  const value = useMemo<AppContextType>(() => ({
    salesRecords,
    filteredSalesRecords,
    dishes,
    ingredients,
    events,
    wasteRecords,
    wasteLogs,
    weather,
    settings,
    dateFilter,
    customDateRange,
    lastUpdatedTime,
    isFirestoreConnected,
    hasDemoData,
    recentDeductions,

    setDateFilter,
    setCustomDateRange,

    addSalesRecord,
    updateSalesRecord,
    deleteSalesRecord,

    addInventoryIngredient,
    updateIngredientStock,
    deleteInventoryIngredient,
    markPurchased,

    addWasteRecord,
    deleteWasteRecord,
    addWasteLog,
    deleteWasteLog,

    updateWeather,
    addEvent,
    deleteEvent,

    updateSettings,
    updateDish,

    loadDemoData,
    clearDemoData,
    clearAllSales,
    resetToDefaults,
    refreshData,
  }), [
    salesRecords,
    filteredSalesRecords,
    dishes,
    ingredients,
    events,
    wasteRecords,
    wasteLogs,
    weather,
    settings,
    dateFilter,
    customDateRange,
    lastUpdatedTime,
    isFirestoreConnected,
    hasDemoData,
    recentDeductions,
    addSalesRecord,
    updateSalesRecord,
    deleteSalesRecord,
    addInventoryIngredient,
    updateIngredientStock,
    deleteInventoryIngredient,
    markPurchased,
    addWasteRecord,
    deleteWasteRecord,
    addWasteLog,
    deleteWasteLog,
    updateWeather,
    addEvent,
    deleteEvent,
    updateSettings,
    updateDish,
    loadDemoData,
    clearDemoData,
    clearAllSales,
    resetToDefaults,
    refreshData,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useAppContext(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
