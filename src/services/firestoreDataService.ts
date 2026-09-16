import {
  collection,
  doc,
  onSnapshot,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  Dish,
  Ingredient,
  RestaurantEvent,
  RecordedWasteItem,
  RestaurantSettings,
  StockStatus,
  SalesRecord,
} from '../types';
import {
  INITIAL_DISHES,
  INITIAL_INGREDIENTS,
  INITIAL_EVENTS,
  INITIAL_SETTINGS,
} from '../data/mockData';

export const firestoreDataService = {
  // --- Initialization & Seeding for Live Firestore Database ---
  async seedIfEmpty(): Promise<boolean> {
    const dishesCol = 'dishes';
    try {
      const snap = await getDocs(collection(db, dishesCol));
      if (!snap.empty) {
        return false; // Already has live data
      }

      const batch = writeBatch(db);

      // Seed dishes
      INITIAL_DISHES.forEach(dish => {
        const ref = doc(db, 'dishes', dish.id);
        batch.set(ref, dish);
      });

      // Seed ingredients
      INITIAL_INGREDIENTS.forEach(ing => {
        const ref = doc(db, 'ingredients', ing.id);
        batch.set(ref, ing);
      });

      // Seed events
      INITIAL_EVENTS.forEach(evt => {
        const ref = doc(db, 'restaurantEvents', evt.id);
        batch.set(ref, evt);
      });

      // Seed current settings
      const settingsRef = doc(db, 'settings', 'current');
      batch.set(settingsRef, INITIAL_SETTINGS);

      await batch.commit();
      return true;
    } catch (error) {
      console.warn('Initial seed error or permission check:', error);
      return false;
    }
  },

  // --- Real-Time Sales Records Subscriptions & Operations ---
  subscribeSalesRecords(onUpdate: (sales: SalesRecord[]) => void, onError?: (err: any) => void) {
    const colPath = 'salesRecords';
    return onSnapshot(
      collection(db, colPath),
      snapshot => {
        const list: SalesRecord[] = [];
        snapshot.forEach(d => {
          list.push({ ...d.data(), id: d.id } as SalesRecord);
        });
        // Sort newest first by creation or date + time
        list.sort((a, b) => {
          const dateA = a.createdAt || `${a.date} ${a.time}`;
          const dateB = b.createdAt || `${b.date} ${b.time}`;
          return dateB.localeCompare(dateA);
        });
        onUpdate(list);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async addSalesRecord(record: SalesRecord): Promise<void> {
    const path = `salesRecords/${record.id}`;
    try {
      await setDoc(doc(db, 'salesRecords', record.id), record);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateSalesRecord(recordId: string, updates: Partial<SalesRecord>): Promise<void> {
    const path = `salesRecords/${recordId}`;
    try {
      await updateDoc(doc(db, 'salesRecords', recordId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteSalesRecord(recordId: string): Promise<void> {
    const path = `salesRecords/${recordId}`;
    try {
      await deleteDoc(doc(db, 'salesRecords', recordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async clearAllSalesRecords(): Promise<void> {
    const colPath = 'salesRecords';
    try {
      const snap = await getDocs(collection(db, colPath));
      const batch = writeBatch(db);
      snap.forEach(d => {
        batch.delete(d.ref);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, colPath);
    }
  },

  // --- Real-Time Dishes Subscriptions & Operations ---
  subscribeDishes(onUpdate: (dishes: Dish[]) => void, onError?: (err: any) => void) {
    const colPath = 'dishes';
    return onSnapshot(
      collection(db, colPath),
      snapshot => {
        const list: Dish[] = [];
        snapshot.forEach(d => {
          list.push({ ...d.data(), id: d.id } as Dish);
        });
        onUpdate(list);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async updateDish(dishId: string, updates: Partial<Dish>): Promise<void> {
    const path = `dishes/${dishId}`;
    try {
      await updateDoc(doc(db, 'dishes', dishId), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addDish(dish: Dish): Promise<void> {
    const path = `dishes/${dish.id}`;
    try {
      await setDoc(doc(db, 'dishes', dish.id), dish);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteDish(dishId: string): Promise<void> {
    const path = `dishes/${dishId}`;
    try {
      await deleteDoc(doc(db, 'dishes', dishId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Real-Time Ingredients Subscriptions & Operations ---
  subscribeIngredients(onUpdate: (ingredients: Ingredient[]) => void, onError?: (err: any) => void) {
    const colPath = 'ingredients';
    return onSnapshot(
      collection(db, colPath),
      snapshot => {
        const list: Ingredient[] = [];
        snapshot.forEach(d => {
          list.push({ ...d.data(), id: d.id } as Ingredient);
        });
        onUpdate(list);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async updateIngredientStock(
    ingredientId: string,
    currentStock: number,
    dailyUsage: number,
    minStockLevel: number
  ): Promise<void> {
    const path = `ingredients/${ingredientId}`;
    const daysRemaining = Math.round((currentStock / dailyUsage) * 10) / 10;
    let status: StockStatus = 'In Stock';
    if (currentStock <= minStockLevel * 0.5) status = 'Critical';
    else if (currentStock <= minStockLevel) status = 'Low Stock';
    else if (daysRemaining > 4.5) status = 'Overstocked';

    try {
      await updateDoc(doc(db, 'ingredients', ingredientId), {
        currentStock,
        daysRemaining,
        status,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addIngredient(ingredient: Ingredient): Promise<void> {
    const path = `ingredients/${ingredient.id}`;
    try {
      await setDoc(doc(db, 'ingredients', ingredient.id), ingredient);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteIngredient(ingredientId: string): Promise<void> {
    const path = `ingredients/${ingredientId}`;
    try {
      await deleteDoc(doc(db, 'ingredients', ingredientId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Real-Time Events Subscriptions & Operations ---
  subscribeEvents(onUpdate: (events: RestaurantEvent[]) => void, onError?: (err: any) => void) {
    const colPath = 'restaurantEvents';
    return onSnapshot(
      collection(db, colPath),
      snapshot => {
        const list: RestaurantEvent[] = [];
        snapshot.forEach(d => {
          list.push({ ...d.data(), id: d.id } as RestaurantEvent);
        });
        onUpdate(list);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async addEvent(event: Omit<RestaurantEvent, 'id'>): Promise<string> {
    const colPath = 'restaurantEvents';
    try {
      const docRef = await addDoc(collection(db, colPath), event);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colPath);
    }
  },

  async deleteEvent(eventId: string): Promise<void> {
    const path = `restaurantEvents/${eventId}`;
    try {
      await deleteDoc(doc(db, 'restaurantEvents', eventId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Real-Time Waste Records Subscriptions & Operations ---
  subscribeWasteRecords(
    onUpdate: (records: RecordedWasteItem[]) => void,
    onError?: (err: any) => void
  ) {
    const colPath = 'wasteRecords';
    return onSnapshot(
      collection(db, colPath),
      snapshot => {
        const list: RecordedWasteItem[] = [];
        snapshot.forEach(d => {
          list.push({ ...d.data(), id: d.id } as RecordedWasteItem);
        });
        // Sort newest first
        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        onUpdate(list);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, colPath);
      }
    );
  },

  async addWasteRecord(record: Omit<RecordedWasteItem, 'id'>): Promise<string> {
    const colPath = 'wasteRecords';
    try {
      const docRef = await addDoc(collection(db, colPath), record);
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, colPath);
    }
  },

  async deleteWasteRecord(recordId: string): Promise<void> {
    const path = `wasteRecords/${recordId}`;
    try {
      await deleteDoc(doc(db, 'wasteRecords', recordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- Real-Time Settings Subscriptions & Operations ---
  subscribeSettings(onUpdate: (settings: RestaurantSettings) => void, onError?: (err: any) => void) {
    const docPath = 'settings/current';
    return onSnapshot(
      doc(db, 'settings', 'current'),
      snapshot => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as RestaurantSettings);
        }
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, docPath);
      }
    );
  },

  async saveSettings(settings: RestaurantSettings): Promise<void> {
    const docPath = 'settings/current';
    try {
      await setDoc(doc(db, 'settings', 'current'), settings, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, docPath);
    }
  },
};
