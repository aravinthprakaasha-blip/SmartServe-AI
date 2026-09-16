import {
  Dish,
  Ingredient,
  HistoricalDemandPoint,
  WeatherData,
  RestaurantEvent,
  RecordedWasteItem,
  RestaurantSettings,
} from '../types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: 'Basmati Rice',
    unit: 'kg',
    currentStock: 48,
    dailyUsage: 35,
    daysRemaining: 1.4,
    minStockLevel: 60,
    costPerUnitINR: 95,
    category: 'Grains & Flours',
    status: 'Low Stock',
  },
  {
    id: 'ing-2',
    name: 'Fresh Chicken',
    unit: 'kg',
    currentStock: 52,
    dailyUsage: 45,
    daysRemaining: 1.1,
    minStockLevel: 50,
    costPerUnitINR: 230,
    category: 'Meat & Poultry',
    status: 'Low Stock',
  },
  {
    id: 'ing-3',
    name: 'Tender Mutton',
    unit: 'kg',
    currentStock: 14,
    dailyUsage: 18,
    daysRemaining: 0.8,
    minStockLevel: 25,
    costPerUnitINR: 780,
    category: 'Meat & Poultry',
    status: 'Critical',
  },
  {
    id: 'ing-4',
    name: 'Paneer (Cottage Cheese)',
    unit: 'kg',
    currentStock: 18,
    dailyUsage: 12,
    daysRemaining: 1.5,
    minStockLevel: 15,
    costPerUnitINR: 360,
    category: 'Dairy',
    status: 'In Stock',
  },
  {
    id: 'ing-5',
    name: 'Farm Fresh Tomatoes',
    unit: 'kg',
    currentStock: 15,
    dailyUsage: 25,
    daysRemaining: 0.6,
    minStockLevel: 30,
    costPerUnitINR: 42,
    category: 'Vegetables',
    status: 'Critical',
  },
  {
    id: 'ing-6',
    name: 'Red Onions',
    unit: 'kg',
    currentStock: 85,
    dailyUsage: 30,
    daysRemaining: 2.8,
    minStockLevel: 45,
    costPerUnitINR: 38,
    category: 'Vegetables',
    status: 'In Stock',
  },
  {
    id: 'ing-7',
    name: 'Potatoes',
    unit: 'kg',
    currentStock: 65,
    dailyUsage: 20,
    daysRemaining: 3.2,
    minStockLevel: 35,
    costPerUnitINR: 32,
    category: 'Vegetables',
    status: 'In Stock',
  },
  {
    id: 'ing-8',
    name: 'Refined Sunflower Oil',
    unit: 'L',
    currentStock: 42,
    dailyUsage: 18,
    daysRemaining: 2.3,
    minStockLevel: 40,
    costPerUnitINR: 145,
    category: 'Oils & Spices',
    status: 'In Stock',
  },
  {
    id: 'ing-9',
    name: 'Chakki Wheat Flour (Atta)',
    unit: 'kg',
    currentStock: 110,
    dailyUsage: 22,
    daysRemaining: 5.0,
    minStockLevel: 50,
    costPerUnitINR: 48,
    category: 'Grains & Flours',
    status: 'Overstocked',
  },
  {
    id: 'ing-10',
    name: 'Fresh Cow Milk',
    unit: 'L',
    currentStock: 22,
    dailyUsage: 45,
    daysRemaining: 0.5,
    minStockLevel: 40,
    costPerUnitINR: 62,
    category: 'Dairy',
    status: 'Critical',
  },
  {
    id: 'ing-11',
    name: 'Assam Tea Leaves Dust',
    unit: 'kg',
    currentStock: 8,
    dailyUsage: 2.5,
    daysRemaining: 3.2,
    minStockLevel: 5,
    costPerUnitINR: 420,
    category: 'Beverage Base',
    status: 'In Stock',
  },
  {
    id: 'ing-12',
    name: 'Filter Coffee Powder (85/15)',
    unit: 'kg',
    currentStock: 3.2,
    dailyUsage: 2.0,
    daysRemaining: 1.6,
    minStockLevel: 4.0,
    costPerUnitINR: 580,
    category: 'Beverage Base',
    status: 'Low Stock',
  },
  {
    id: 'ing-13',
    name: 'Toor Dal (Lentils)',
    unit: 'kg',
    currentStock: 40,
    dailyUsage: 14,
    daysRemaining: 2.8,
    minStockLevel: 30,
    costPerUnitINR: 165,
    category: 'Grains & Flours',
    status: 'In Stock',
  },
  {
    id: 'ing-14',
    name: 'Biryani Whole Spices Mix',
    unit: 'kg',
    currentStock: 6.5,
    dailyUsage: 1.5,
    daysRemaining: 4.3,
    minStockLevel: 4.0,
    costPerUnitINR: 850,
    category: 'Oils & Spices',
    status: 'In Stock',
  },
  {
    id: 'ing-15',
    name: 'Ginger & Garlic Paste',
    unit: 'kg',
    currentStock: 12,
    dailyUsage: 8,
    daysRemaining: 1.5,
    minStockLevel: 10,
    costPerUnitINR: 180,
    category: 'Oils & Spices',
    status: 'In Stock',
  },
];

export const INITIAL_DISHES: Dish[] = [
  {
    id: 'dish-1',
    name: 'Chicken Biryani',
    category: 'Biryani & Rice',
    priceINR: 280,
    historicalAvg: 162,
    predictedDemand: 186,
    recommendedPrep: 198,
    confidence: 94,
    status: 'High',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-1', quantityPerPortion: 0.135 }, // Rice
      { ingredientId: 'ing-2', quantityPerPortion: 0.12 },  // Chicken
      { ingredientId: 'ing-6', quantityPerPortion: 0.045 }, // Onion
      { ingredientId: 'ing-5', quantityPerPortion: 0.035 }, // Tomato
      { ingredientId: 'ing-8', quantityPerPortion: 0.022 }, // Oil
      { ingredientId: 'ing-14', quantityPerPortion: 0.008 },// Spices
    ],
  },
  {
    id: 'dish-2',
    name: 'Masala Dosa',
    category: 'South Indian Breakfast',
    priceINR: 110,
    historicalAvg: 140,
    predictedDemand: 148,
    recommendedPrep: 155,
    confidence: 91,
    status: 'High',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-1', quantityPerPortion: 0.08 },  // Rice batter
      { ingredientId: 'ing-7', quantityPerPortion: 0.09 },  // Potato filling
      { ingredientId: 'ing-6', quantityPerPortion: 0.03 },  // Onion
      { ingredientId: 'ing-8', quantityPerPortion: 0.015 }, // Oil
    ],
  },
  {
    id: 'dish-3',
    name: 'Paneer Butter Masala',
    category: 'Curries & Breads',
    priceINR: 240,
    historicalAvg: 78,
    predictedDemand: 88,
    recommendedPrep: 94,
    confidence: 89,
    status: 'Medium',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-4', quantityPerPortion: 0.12 },  // Paneer
      { ingredientId: 'ing-5', quantityPerPortion: 0.08 },  // Tomato puree
      { ingredientId: 'ing-10', quantityPerPortion: 0.05 }, // Milk/Cream
      { ingredientId: 'ing-8', quantityPerPortion: 0.02 },  // Oil/Butter
    ],
  },
  {
    id: 'dish-4',
    name: 'Idli (Set of 2)',
    category: 'South Indian Breakfast',
    priceINR: 60,
    historicalAvg: 175,
    predictedDemand: 182,
    recommendedPrep: 190,
    confidence: 96,
    status: 'High',
    trend: 'neutral',
    ingredients: [
      { ingredientId: 'ing-1', quantityPerPortion: 0.09 }, // Rice
      { ingredientId: 'ing-13', quantityPerPortion: 0.03 },// Lentils (Urad)
    ],
  },
  {
    id: 'dish-5',
    name: 'Malabar Parotta (2 pcs)',
    category: 'Curries & Breads',
    priceINR: 70,
    historicalAvg: 130,
    predictedDemand: 142,
    recommendedPrep: 152,
    confidence: 92,
    status: 'High',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-9', quantityPerPortion: 0.14 }, // Flour
      { ingredientId: 'ing-8', quantityPerPortion: 0.025 },// Oil
    ],
  },
  {
    id: 'dish-6',
    name: 'Egg & Chicken Fried Rice',
    category: 'Biryani & Rice',
    priceINR: 210,
    historicalAvg: 85,
    predictedDemand: 92,
    recommendedPrep: 98,
    confidence: 88,
    status: 'Medium',
    trend: 'neutral',
    ingredients: [
      { ingredientId: 'ing-1', quantityPerPortion: 0.12 }, // Rice
      { ingredientId: 'ing-2', quantityPerPortion: 0.06 }, // Chicken
      { ingredientId: 'ing-8', quantityPerPortion: 0.02 }, // Oil
      { ingredientId: 'ing-6', quantityPerPortion: 0.025 },// Onion
    ],
  },
  {
    id: 'dish-7',
    name: 'Crispy Chicken 65',
    category: 'Starters',
    priceINR: 230,
    historicalAvg: 92,
    predictedDemand: 114,
    recommendedPrep: 122,
    confidence: 93,
    status: 'High',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-2', quantityPerPortion: 0.14 }, // Chicken
      { ingredientId: 'ing-8', quantityPerPortion: 0.03 }, // Oil
      { ingredientId: 'ing-15', quantityPerPortion: 0.015 },// Ginger Garlic
    ],
  },
  {
    id: 'dish-8',
    name: 'Executive Veg Meals',
    category: 'Biryani & Rice',
    priceINR: 160,
    historicalAvg: 110,
    predictedDemand: 118,
    recommendedPrep: 125,
    confidence: 95,
    status: 'Medium',
    trend: 'neutral',
    ingredients: [
      { ingredientId: 'ing-1', quantityPerPortion: 0.16 }, // Rice
      { ingredientId: 'ing-13', quantityPerPortion: 0.04 },// Dal
      { ingredientId: 'ing-5', quantityPerPortion: 0.04 }, // Tomato
      { ingredientId: 'ing-7', quantityPerPortion: 0.05 }, // Potato sabzi
    ],
  },
  {
    id: 'dish-9',
    name: 'Mutton Dum Biryani',
    category: 'Biryani & Rice',
    priceINR: 390,
    historicalAvg: 54,
    predictedDemand: 68,
    recommendedPrep: 72,
    confidence: 90,
    status: 'Medium',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-1', quantityPerPortion: 0.135 },// Rice
      { ingredientId: 'ing-3', quantityPerPortion: 0.15 }, // Mutton
      { ingredientId: 'ing-6', quantityPerPortion: 0.05 }, // Onion
      { ingredientId: 'ing-8', quantityPerPortion: 0.025 },// Oil/Ghee
      { ingredientId: 'ing-14', quantityPerPortion: 0.01 },// Spices
    ],
  },
  {
    id: 'dish-10',
    name: 'Special Masala Tea',
    category: 'Beverages',
    priceINR: 25,
    historicalAvg: 230,
    predictedDemand: 275,
    recommendedPrep: 290,
    confidence: 97,
    status: 'High',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-10', quantityPerPortion: 0.07 },// Milk
      { ingredientId: 'ing-11', quantityPerPortion: 0.008 },// Tea dust
    ],
  },
  {
    id: 'dish-11',
    name: 'South Indian Filter Coffee',
    category: 'Beverages',
    priceINR: 35,
    historicalAvg: 190,
    predictedDemand: 220,
    recommendedPrep: 235,
    confidence: 95,
    status: 'High',
    trend: 'up',
    ingredients: [
      { ingredientId: 'ing-10', quantityPerPortion: 0.08 },// Milk
      { ingredientId: 'ing-12', quantityPerPortion: 0.01 },// Coffee powder
    ],
  },
  {
    id: 'dish-12',
    name: 'Fresh Seasonal Juice',
    category: 'Beverages',
    priceINR: 90,
    historicalAvg: 65,
    predictedDemand: 52,
    recommendedPrep: 55,
    confidence: 86,
    status: 'Low',
    trend: 'down',
    ingredients: [],
  },
];

export const INITIAL_WEATHER: WeatherData = {
  temperatureC: 32,
  rainProbability: 70,
  condition: 'Partly Cloudy',
  windKmh: 14,
  humidityPercent: 78,
  impactSummary:
    'High humidity and 70% afternoon rain forecast creates high surge in hot tea, filter coffee, and fried snacks, while suppressing cold beverages.',
  dishImpacts: [
    {
      dishName: 'Special Masala Tea',
      impactPercentage: 18,
      reason: 'Rainy overcast afternoon triggers high consumer impulse for hot beverages.',
    },
    {
      dishName: 'South Indian Filter Coffee',
      impactPercentage: 14,
      reason: 'Cooler evening breezes drive prolonged cafe & dine-in beverage orders.',
    },
    {
      dishName: 'Crispy Chicken 65',
      impactPercentage: 12,
      reason: 'Increased monsoon snacking behavior in early evening hours.',
    },
    {
      dishName: 'Fresh Seasonal Juice',
      impactPercentage: -14,
      reason: 'Subdued consumer preference for cold juices during damp overcast weather.',
    },
  ],
};

export const INITIAL_EVENTS: RestaurantEvent[] = [
  {
    id: 'evt-1',
    name: 'IPL T20 Cricket Match (Home Team)',
    date: '2026-09-18',
    expectedCrowdIncreasePercent: 22,
    type: 'Promotion',
    description: 'High evening dining & takeaway volume expected for biryani and snacks during 7:30 PM broadcast.',
  },
  {
    id: 'evt-2',
    name: 'Regional Cultural Festival Weekend',
    date: '2026-09-20',
    expectedCrowdIncreasePercent: 28,
    type: 'Festival',
    description: 'Extended family dining groups seeking traditional vegetarian meals, dosas, and parottas.',
  },
  {
    id: 'evt-3',
    name: 'Tech Corridor Mega Expo',
    date: '2026-09-23',
    expectedCrowdIncreasePercent: 15,
    type: 'Local Event',
    description: 'Corporate lunch rush and mid-afternoon express coffee catering near business park.',
  },
];

export const INITIAL_WASTE_RECORDS: RecordedWasteItem[] = [];

export const INITIAL_SETTINGS: RestaurantSettings = {
  restaurantName: 'Saffron & Spice Bistro',
  branchName: 'Indiranagar Flagship Kitchen',
  address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru, Karnataka 560038',
  location: 'Bangalore, India',
  operatingHours: '07:30 - 23:30',
  mealPeriods: {
    Morning: { start: '07:30', end: '11:30' },
    Lunch: { start: '12:00', end: '15:30' },
    Evening: { start: '16:00', end: '18:30' },
    Dinner: { start: '19:00', end: '23:30' },
  },
  phone: '+91 80 4125 8900',
  seatingCapacity: 140,
  openingTime: '07:30',
  closingTime: '23:30',
  currency: '₹',
  currencySymbol: '₹',
  defaultSafetyBufferPercent: 7.5,
  autoReorderThresholdPercent: 20,
  weatherIntegrationEnabled: true,
  eventIntegrationEnabled: true,
  lowStockAlerts: true,
  highWasteAlerts: true,
  enableWeatherAutoAdjust: true,
  enableEventSync: true,
  emailAlerts: true,
};

// 30 days historical mock data points
export function generateHistoricalDemand(): HistoricalDemandPoint[] {
  const points: HistoricalDemandPoint[] = [];
  const today = new Date('2026-09-15');
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const base = isWeekend ? 1340 : 1020;
    // sinusoidal variation with some noise
    const variance = Math.sin(i / 2) * 85;
    const actual = Math.round(base + variance + (Math.random() * 40 - 20));
    const predicted = Math.round(base + variance);

    points.push({
      date: d.toISOString().split('T')[0],
      dayName: dayNames[dayOfWeek],
      actualOrders: actual,
      predictedOrders: predicted,
      weatherFactor: isWeekend ? 1.15 : 1.0,
      isWeekend,
    });
  }
  return points;
}

export const INITIAL_SALES_RECORDS: any[] = [];
