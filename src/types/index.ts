export type MealPeriod = 'Morning' | 'Lunch' | 'Evening' | 'Dinner';

export type DateFilterOption = 'Today' | 'Yesterday' | 'Last 7 Days' | 'Last 30 Days' | 'Custom';

export interface SalesRecord {
  id: string;
  date: string; // YYYY-MM-DD format (or DD-MM-YYYY)
  time: string; // e.g. "12:30 PM"
  dishId: string;
  dishName: string;
  quantityPrepared: number;
  quantitySold: number;
  quantityRemaining: number;
  quantityWasted: number;
  mealPeriod: MealPeriod;
  sellingPrice: number;
  totalSales: number; // quantitySold * sellingPrice
  isDemo?: boolean; // Distinguishes sample demo data from staff-entered live data
  createdAt?: string;
}

export type DemandStatus = 'High' | 'Medium' | 'Low';

export type StockStatus = 'In Stock' | 'Low Stock' | 'Critical' | 'Overstocked';

export type PurchasePriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type EventType = 'Holiday' | 'Weekend' | 'Festival' | 'Promotion' | 'Local Event';

export type WasteActionTaken = 'Discarded' | 'Staff Meal' | 'Composted';

export type WasteReason =
  | 'Overcooked'
  | 'Customer Leftover'
  | 'Expired'
  | 'Spillage'
  | 'Overproduction'
  | 'Preparation Error'
  | 'Customer Return'
  | 'Damaged'
  | 'Other';

export interface DishIngredientUsage {
  ingredientId: string;
  quantityPerPortion: number; // in ingredient's standard unit
}

export interface Dish {
  id: string;
  name: string;
  category: 'Biryani & Rice' | 'South Indian Breakfast' | 'Curries & Breads' | 'Starters' | 'Beverages';
  priceINR: number;
  historicalAvg: number;
  predictedDemand: number;
  recommendedPrep: number;
  confidence: number; // percentage, e.g. 94
  status: DemandStatus;
  trend: 'up' | 'down' | 'neutral';
  ingredients: DishIngredientUsage[];
  imagePlaceholderColor?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: 'kg' | 'L' | 'pieces' | 'packets';
  currentStock: number;
  dailyUsage: number;
  daysRemaining: number;
  minStockLevel: number;
  costPerUnitINR: number;
  category: 'Grains & Flours' | 'Meat & Poultry' | 'Dairy' | 'Vegetables' | 'Oils & Spices' | 'Beverage Base';
  status: StockStatus;
  supplier?: string;
}

export interface HistoricalDemandPoint {
  date: string;
  dayName: string;
  actualOrders: number;
  predictedOrders: number;
  weatherFactor: number;
  isWeekend: boolean;
}

export interface MealPeriodPrepPlan {
  dishId: string;
  dishName: string;
  category: string;
  mealPeriod: MealPeriod;
  predictedDemand: number;
  recommendedPrep: number;
  safetyBufferPercent: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  lastUpdated?: string;
}

export interface RealTimeHourOrder {
  hour: string;
  predicted: number;
  actual: number;
}

export interface RealTimeMetrics {
  currentOrders: number;
  ordersPerHour: number;
  expectedRemainingOrders: number;
  updatedDemandPrediction: number;
  lastUpdatedMinutesAgo: number;
  statusMessage: string;
  statusType: 'positive' | 'warning' | 'normal';
  hourlyTrends: RealTimeHourOrder[];
}

export interface WeatherData {
  temperatureC: number;
  rainProbability: number;
  condition: 'Partly Cloudy' | 'Sunny' | 'Rainy' | 'Thunderstorm' | 'Overcast';
  windKmh: number;
  humidityPercent: number;
  impactSummary: string;
  dishImpacts: {
    dishName: string;
    impactPercentage: number;
    reason: string;
  }[];
}

export interface RestaurantEvent {
  id: string;
  name: string;
  date: string;
  expectedCrowdIncreasePercent: number;
  type: EventType;
  description: string;
}

export interface IngredientRequirement {
  ingredientId: string;
  ingredientName: string;
  unit: string;
  currentStock: number;
  predictedRequirement: number;
  shortage: number;
  recommendedPurchaseQty: number;
  unitCostINR: number;
}

export interface PurchaseRecommendation {
  id: string;
  ingredientId: string;
  ingredientName: string;
  unit: string;
  currentStock: number;
  predictedRequirement: number;
  requiredPurchaseQuantity: number;
  priority: PurchasePriority;
  estimatedCostINR: number;
  supplier: string;
}

export interface FoodWastePredictionItem {
  dishId: string;
  dishName: string;
  quantityPrepared: number;
  expectedSales: number;
  predictedWaste: number;
  wastePercent: number;
  costLossINR: number;
  recommendation: string;
}

export interface WasteRiskItem {
  dishId: string;
  dishName: string;
  recommendedPrep: number;
  predictedDemand: number;
  predictedWastePortions: number;
  financialLossINR: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface WasteLog {
  id: string;
  date: string;
  item: string;
  quantity: number;
  unit: string;
  reason: WasteReason;
  costINR: number;
  actionTaken?: WasteActionTaken;
}

export interface RecordedWasteItem {
  id: string;
  date: string;
  dishId: string;
  dishName: string;
  quantityWasted: number;
  unit: string;
  wasteReason: WasteReason;
  mealPeriod: MealPeriod;
  estimatedCostINR: number;
  recordedBy: string;
  actionTaken?: WasteActionTaken;
}

export interface AIInsightItem {
  id: string;
  title: string;
  message: string;
  type: 'action' | 'warning' | 'info' | 'positive';
  impact?: string;
  dishOrItem?: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  branchName?: string;
  address?: string;
  phone?: string;
  seatingCapacity?: number;
  openingTime?: string;
  closingTime?: string;
  location: string;
  operatingHours: string;
  mealPeriods: Record<MealPeriod, { start: string; end: string }>;
  currency: string;
  currencySymbol?: string;
  defaultSafetyBufferPercent: number;
  lowStockAlertThresholdPercent?: number;
  autoReorderThresholdPercent?: number;
  weatherIntegrationEnabled: boolean;
  eventIntegrationEnabled: boolean;
  lowStockAlerts: boolean;
  highWasteAlerts: boolean;
  enableWeatherAutoAdjust?: boolean;
  enableEventSync?: boolean;
  emailAlerts?: boolean;
}
