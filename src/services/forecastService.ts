import {
  Dish,
  Ingredient,
  MealPeriod,
  MealPeriodPrepPlan,
  IngredientRequirement,
  PurchaseRecommendation,
  FoodWastePredictionItem,
  WasteRiskItem,
  RealTimeMetrics,
  WeatherData,
  RestaurantEvent,
  SalesRecord,
} from '../types';

/**
 * Predict overall demand for a given date, factoring in:
 * - Day of week (weekend bump)
 * - Weather impact
 * - Active scheduled events
 */
export function predictDemand(
  dateStr: string,
  events: RestaurantEvent[] = [],
  weather?: WeatherData,
  mealType?: string
): {
  expectedCustomers: number;
  predictedOrders: number;
  confidencePercent: number;
  variancePercent: number;
  breakdownByMeal: { period: MealPeriod; orders: number; percent: number }[];
} {
  const targetDate = new Date(dateStr);
  const day = targetDate.getDay();
  const isWeekend = day === 0 || day === 6; // Sun or Sat
  const isFriday = day === 5;

  let baseCustomers = 1050;
  if (isWeekend) baseCustomers = 1420;
  else if (isFriday) baseCustomers = 1210;

  // Weather modifier
  let weatherMod = 1.0;
  if (weather) {
    if (weather.condition === 'Rainy' || weather.condition === 'Thunderstorm') {
      weatherMod = 0.94; // slightly fewer walk-ins, though delivery increases
    } else if (weather.rainProbability > 60) {
      weatherMod = 0.98;
    }
  }

  // Event modifier
  let eventMod = 1.0;
  const matchedEvent = events.find(e => e.date === dateStr);
  if (matchedEvent) {
    eventMod += matchedEvent.expectedCrowdIncreasePercent / 100;
  }

  const expectedCustomers = Math.round(baseCustomers * weatherMod * eventMod);
  const predictedOrders = Math.round(expectedCustomers * 0.94); // avg 0.94 orders per customer

  // Meal breakdown percentages
  const morningRatio = 0.22;
  const lunchRatio = 0.38;
  const eveningRatio = 0.16;
  const dinnerRatio = 0.24;

  const breakdownByMeal = [
    { period: 'Morning' as MealPeriod, orders: Math.round(predictedOrders * morningRatio), percent: 22 },
    { period: 'Lunch' as MealPeriod, orders: Math.round(predictedOrders * lunchRatio), percent: 38 },
    { period: 'Evening' as MealPeriod, orders: Math.round(predictedOrders * eveningRatio), percent: 16 },
    { period: 'Dinner' as MealPeriod, orders: Math.round(predictedOrders * dinnerRatio), percent: 24 },
  ];

  if (mealType && mealType !== 'All') {
    // If specific meal period selected
    const found = breakdownByMeal.find(m => m.period.toLowerCase() === mealType.toLowerCase());
    if (found) {
      return {
        expectedCustomers: Math.round(found.orders * 1.06),
        predictedOrders: found.orders,
        confidencePercent: 93,
        variancePercent: isWeekend ? 6.2 : 3.8,
        breakdownByMeal: [found],
      };
    }
  }

  return {
    expectedCustomers,
    predictedOrders,
    confidencePercent: 92,
    variancePercent: isWeekend ? 5.8 : 3.4,
    breakdownByMeal,
  };
}

/**
 * Predict demand for a specific dish
 */
export function predictDishDemand(
  dish: Dish,
  dateStr: string,
  events: RestaurantEvent[] = [],
  weather?: WeatherData
): {
  predictedDemand: number;
  recommendedPrep: number;
  confidence: number;
  reason: string;
} {
  const d = new Date(dateStr);
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;

  let factor = 1.0;
  let reason = 'Based on 30-day weighted moving average';

  if (isWeekend) {
    if (dish.category === 'Biryani & Rice' || dish.category === 'Starters') {
      factor += 0.24;
      reason = 'Weekend crowd boost for premium biryanis & starters (+24%)';
    } else {
      factor += 0.12;
    }
  }

  // Weather impact
  if (weather) {
    const dishImpact = weather.dishImpacts.find(di => di.dishName === dish.name);
    if (dishImpact) {
      factor += dishImpact.impactPercentage / 100;
      reason = `${reason}. ${dishImpact.reason}`;
    }
  }

  // Event impact
  const matchedEvent = events.find(e => e.date === dateStr);
  if (matchedEvent) {
    factor += (matchedEvent.expectedCrowdIncreasePercent / 100) * 0.7;
    reason = `${reason}. Adjusted for event: ${matchedEvent.name}`;
  }

  const predictedDemand = Math.round(dish.historicalAvg * factor);
  const safetyBuffer = Math.round(predictedDemand * 0.075); // 7.5% safety buffer
  const recommendedPrep = predictedDemand + safetyBuffer;

  return {
    predictedDemand,
    recommendedPrep,
    confidence: dish.confidence,
    reason,
  };
}

/**
 * Generate Smart Preparation Planning across meal periods
 */
export function generatePreparationPlan(
  dishes: Dish[],
  mealPeriod: MealPeriod,
  safetyBufferPercent = 8
): MealPeriodPrepPlan[] {
  // Meal period distribution mapping
  const categoryMealWeight: Record<string, Record<MealPeriod, number>> = {
    'South Indian Breakfast': { Morning: 0.75, Lunch: 0.05, Evening: 0.2, Dinner: 0.0 },
    'Biryani & Rice': { Morning: 0.0, Lunch: 0.58, Evening: 0.04, Dinner: 0.38 },
    'Curries & Breads': { Morning: 0.05, Lunch: 0.45, Evening: 0.1, Dinner: 0.4 },
    'Starters': { Morning: 0.0, Lunch: 0.35, Evening: 0.25, Dinner: 0.4 },
    'Beverages': { Morning: 0.4, Lunch: 0.15, Evening: 0.35, Dinner: 0.1 },
  };

  return dishes.map(dish => {
    const weightMap = categoryMealWeight[dish.category] || { Morning: 0.25, Lunch: 0.35, Evening: 0.15, Dinner: 0.25 };
    const periodWeight = weightMap[mealPeriod] || 0.25;

    const baseForPeriod = Math.max(8, Math.round(dish.predictedDemand * periodWeight * 2.2));
    const prep = Math.ceil(baseForPeriod * (1 + safetyBufferPercent / 100));

    return {
      dishId: dish.id,
      dishName: dish.name,
      category: dish.category,
      mealPeriod,
      predictedDemand: baseForPeriod,
      recommendedPrep: prep,
      safetyBufferPercent,
      status: 'Pending',
      lastUpdated: 'Just now',
    };
  });
}

/**
 * Convert dish demand into raw ingredient requirements
 */
export function predictIngredientRequirement(
  dishes: Dish[],
  ingredients: Ingredient[]
): IngredientRequirement[] {
  // Aggregate required amount per ingredient id
  const totals: Record<string, number> = {};

  dishes.forEach(dish => {
    const demand = dish.predictedDemand;
    dish.ingredients.forEach(usage => {
      totals[usage.ingredientId] = (totals[usage.ingredientId] || 0) + usage.quantityPerPortion * demand;
    });
  });

  return ingredients.map(ing => {
    const reqRaw = totals[ing.id] || ing.dailyUsage * 1.05;
    const predictedRequirement = Math.round(reqRaw * 10) / 10;
    const currentStock = ing.currentStock;
    const shortage = Math.max(0, Math.round((predictedRequirement - currentStock) * 10) / 10);
    // Recommend purchase if current stock < predicted + min safety level
    const needBuffer = ing.minStockLevel * 0.5;
    const recommendedPurchaseQty =
      currentStock < predictedRequirement + needBuffer
        ? Math.ceil(predictedRequirement + needBuffer - currentStock)
        : 0;

    return {
      ingredientId: ing.id,
      ingredientName: ing.name,
      unit: ing.unit,
      currentStock,
      predictedRequirement,
      shortage,
      recommendedPurchaseQty,
      unitCostINR: ing.costPerUnitINR,
    };
  });
}

/**
 * Generate Smart Purchasing Recommendations
 */
export function generatePurchasePlan(
  inventory: Ingredient[],
  requirements: IngredientRequirement[]
): PurchaseRecommendation[] {
  const recommendations: PurchaseRecommendation[] = [];

  const suppliers: Record<string, string> = {
    'Grains & Flours': 'Apex Agro Wholesale Ltd',
    'Meat & Poultry': 'FreshFarms Halal Poultry',
    'Dairy': 'Nandini Dairy Cooperative',
    'Vegetables': 'City Green Mandi Direct',
    'Oils & Spices': 'Malabar Spice Traders',
    'Beverage Base': 'Tata Tea & Coffee Supply',
  };

  inventory.forEach(ing => {
    const req = requirements.find(r => r.ingredientId === ing.id);
    const needed = req ? req.predictedRequirement : ing.dailyUsage;
    const stock = ing.currentStock;

    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let qtyToOrder = 0;

    if (stock <= ing.minStockLevel * 0.6 || (req && req.shortage > 0)) {
      priority = 'HIGH';
      qtyToOrder = Math.ceil(needed * 2 - stock + ing.minStockLevel);
    } else if (stock <= ing.minStockLevel) {
      priority = 'MEDIUM';
      qtyToOrder = Math.ceil(needed * 1.5 - stock + ing.minStockLevel * 0.5);
    } else if (ing.daysRemaining < 2.5) {
      priority = 'LOW';
      qtyToOrder = Math.ceil(ing.dailyUsage * 2);
    }

    if (qtyToOrder > 0) {
      recommendations.push({
        id: `po-${ing.id}-${Date.now().toString().slice(-4)}`,
        ingredientId: ing.id,
        ingredientName: ing.name,
        unit: ing.unit,
        currentStock: stock,
        predictedRequirement: needed,
        requiredPurchaseQuantity: qtyToOrder,
        priority,
        estimatedCostINR: qtyToOrder * ing.costPerUnitINR,
        supplier: suppliers[ing.category] || 'General Metro Wholesale',
      });
    }
  });

  // Sort by priority HIGH first
  return recommendations.sort((a, b) => {
    const map = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return map[b.priority] - map[a.priority];
  });
}

/**
 * Predict food waste by dish
 */
export function predictWaste(dishes: Dish[]): {
  items: FoodWastePredictionItem[];
  overallWastePercent: number;
  totalPreparedCostINR: number;
  totalWasteCostINR: number;
  actionableInsights: string[];
} {
  const items: FoodWastePredictionItem[] = dishes.map(dish => {
    // Prep vs expected
    const prepared = dish.recommendedPrep;
    const sales = dish.predictedDemand;
    const excess = Math.max(0, prepared - sales);
    // Typical discard rate for perishables vs hot served
    let wasteRate = 0.06;
    if (dish.category === 'South Indian Breakfast') wasteRate = 0.085;
    else if (dish.category === 'Biryani & Rice') wasteRate = 0.055;
    else if (dish.category === 'Starters') wasteRate = 0.068;
    else if (dish.category === 'Beverages') wasteRate = 0.045;

    const predictedWaste = Math.round(excess * 0.7 + sales * wasteRate);
    const wastePercent = Math.round((predictedWaste / prepared) * 1000) / 10;
    const portionCost = dish.priceINR * 0.42; // standard 42% cost of food
    const costLossINR = Math.round(predictedWaste * portionCost);

    let recommendation = 'Optimal balance. Maintain current safety buffer.';
    if (wastePercent > 8.0) {
      recommendation = `Reduce ${dish.name} preparation by ${Math.ceil(excess * 0.6)} plates to curb overproduction.`;
    } else if (wastePercent < 3.5 && dish.status === 'High') {
      recommendation = `Demand is high. Increase preparation by ${Math.ceil(sales * 0.05)} plates to prevent stockouts.`;
    }

    return {
      dishId: dish.id,
      dishName: dish.name,
      quantityPrepared: prepared,
      expectedSales: sales,
      predictedWaste,
      wastePercent,
      costLossINR,
      recommendation,
    };
  });

  const totalPrepared = items.reduce((sum, i) => sum + i.quantityPrepared, 0);
  const totalWasted = items.reduce((sum, i) => sum + i.predictedWaste, 0);
  const totalWasteCostINR = items.reduce((sum, i) => sum + i.costLossINR, 0);
  const totalPreparedCostINR = dishes.reduce((sum, d) => sum + d.recommendedPrep * (d.priceINR * 0.42), 0);
  const overallWastePercent = Math.round((totalWasted / totalPrepared) * 1000) / 10;

  const actionableInsights = [
    'Masala Dosa batter and potato masala shows an 8.4% overproduction trend on weekday mornings. Recommend staggering preparation in 2 batches.',
    'Chicken Biryani prep is well calibrated; however, evening dinner buffer can be lowered by 5 portions if rain starts before 6 PM.',
    'Filter Coffee decoction waste dropped 18% after implementing the 4-hour batch timer rule.',
  ];

  return {
    items,
    overallWastePercent,
    totalPreparedCostINR,
    totalWasteCostINR,
    actionableInsights,
  };
}

/**
 * Calculate waste risk per dish for the Waste Prediction view
 */
export function calculateWasteRiskForDishes(dishes: Dish[]): WasteRiskItem[] {
  return dishes.map(dish => {
    const recommendedPrep = dish.recommendedPrep;
    const predictedDemand = dish.predictedDemand;
    const surplus = Math.max(0, recommendedPrep - predictedDemand);
    const wastePortions = Math.max(1, Math.round(surplus * 0.75 + predictedDemand * 0.04));
    const portionCost = dish.priceINR * 0.42;
    const financialLossINR = Math.round(wastePortions * portionCost);

    let riskLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let recommendation = 'Safety buffer is calibrated to safe limits.';

    if (wastePortions > 15 || financialLossINR > 1800) {
      riskLevel = 'HIGH';
      recommendation = `Reduce prep by ${Math.ceil(surplus * 0.5)} portions; shift remainder to second-tier evening cook.`;
    } else if (wastePortions > 8 || financialLossINR > 900) {
      riskLevel = 'MEDIUM';
      recommendation = 'Monitor 1:30 PM ticket velocity before loading second batch.';
    }

    return {
      dishId: dish.id,
      dishName: dish.name,
      recommendedPrep,
      predictedDemand,
      predictedWastePortions: wastePortions,
      financialLossINR,
      riskLevel,
      recommendation,
    };
  });
}

/**
 * Real-time orders stream calculation incorporating actual user-entered sales
 */
export function calculateRealTimeMetrics(salesRecords: SalesRecord[] = []): RealTimeMetrics {
  const currentHour = new Date().getHours();
  // Simulated hourly distribution for a full service day
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00'
  ];

  // Aggregate user entered sales into hourly buckets if available
  const salesByHour: Record<string, number> = {};
  salesRecords.forEach(s => {
    // Parse time if like "12:30 PM" or "14:00"
    let hourKey = '12:00';
    if (s.time) {
      const match = s.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let h = parseInt(match[1]);
        const isPM = match[3] && match[3].toUpperCase() === 'PM';
        const isAM = match[3] && match[3].toUpperCase() === 'AM';
        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;
        const normalized = `${h.toString().padStart(2, '0')}:00`;
        hourKey = normalized;
      }
    }
    salesByHour[hourKey] = (salesByHour[hourKey] || 0) + s.quantitySold;
  });

  const hasStaffSales = salesRecords.length > 0;

  const hourlyTrends = hours.map((hour) => {
    const h = parseInt(hour.split(':')[0]);
    let base = 35;
    if (h >= 8 && h <= 10) base = 85; // breakfast peak
    else if (h >= 12 && h <= 14) base = 160; // lunch rush
    else if (h >= 16 && h <= 17) base = 70; // tea time
    else if (h >= 19 && h <= 21) base = 145; // dinner rush

    const predicted = base;
    const actual = salesByHour[hour] || 0;

    return {
      hour,
      predicted,
      actual,
    };
  });

  const totalPredictedFullDay = hourlyTrends.reduce((acc, curr) => acc + curr.predicted, 0);

  if (!hasStaffSales) {
    return {
      currentOrders: 0,
      ordersPerHour: 0,
      expectedRemainingOrders: totalPredictedFullDay,
      updatedDemandPrediction: totalPredictedFullDay,
      lastUpdatedMinutesAgo: 0,
      statusMessage: "Awaiting today's service data. Use 'Enter Today's Data' or 'Quick Entry' to log actual meal service orders.",
      statusType: 'normal',
      hourlyTrends,
    };
  }

  const currentOrders = salesRecords.reduce((acc, s) => acc + s.quantitySold, 0);
  const activeHoursCount = Object.keys(salesByHour).length;
  const ordersPerHour = Math.round(currentOrders / Math.max(1, activeHoursCount));

  // Compare actual vs predicted for the hours that had sales
  const predictedForLoggedHours = Object.keys(salesByHour).reduce((sum, hr) => {
    const matched = hourlyTrends.find(item => item.hour === hr);
    return sum + (matched ? matched.predicted : 100);
  }, 0);

  const diffPercent = predictedForLoggedHours > 0
    ? Math.round(((currentOrders - predictedForLoggedHours) / predictedForLoggedHours) * 100)
    : 0;

  const expectedRemainingOrders = Math.max(0, totalPredictedFullDay - currentOrders);

  let statusMessage = `Real-time demand tracking at ${currentOrders} portions across ${activeHoursCount} meal service block${activeHoursCount > 1 ? 's' : ''} (±${Math.abs(diffPercent)}% of model).`;
  let statusType: 'positive' | 'warning' | 'normal' = 'normal';

  if (diffPercent > 8) {
    statusMessage = `Real-time demand is ${diffPercent}% HIGHER than model projections (${currentOrders} portions sold). Kitchen staff alerted to expedite secondary batch prep.`;
    statusType = 'warning';
  } else if (diffPercent < -8) {
    statusMessage = `Real-time demand is ${Math.abs(diffPercent)}% below model projections (${currentOrders} portions sold). Recommend pacing remaining batch prep to prevent waste.`;
    statusType = 'normal';
  } else {
    statusMessage = `Real-time sales (${currentOrders} portions) are closely tracking AI baseline model within ±${Math.abs(diffPercent)}%. Prep targets are well calibrated.`;
    statusType = 'positive';
  }

  return {
    currentOrders,
    ordersPerHour,
    expectedRemainingOrders,
    updatedDemandPrediction: Math.round(currentOrders + expectedRemainingOrders),
    lastUpdatedMinutesAgo: 1,
    statusMessage,
    statusType,
    hourlyTrends,
  };
}

/**
 * Calculate current live demand dynamically from staff-entered sales records
 */
export function calculateCurrentDemand(
  salesRecords: SalesRecord[],
  dishes: Dish[]
): {
  totalSold: number;
  totalPrepared: number;
  totalRemaining: number;
  totalWasted: number;
  totalSalesINR: number;
  wastePercent: number;
  dishSalesMap: Record<string, { sold: number; prepared: number; wasted: number }>;
} {
  let totalSold = 0;
  let totalPrepared = 0;
  let totalRemaining = 0;
  let totalWasted = 0;
  let totalSalesINR = 0;

  const dishSalesMap: Record<string, { sold: number; prepared: number; wasted: number }> = {};

  salesRecords.forEach(s => {
    totalSold += s.quantitySold;
    totalPrepared += s.quantityPrepared;
    totalRemaining += s.quantityRemaining;
    totalWasted += s.quantityWasted;
    totalSalesINR += s.totalSales;

    if (!dishSalesMap[s.dishId]) {
      dishSalesMap[s.dishId] = { sold: 0, prepared: 0, wasted: 0 };
    }
    dishSalesMap[s.dishId].sold += s.quantitySold;
    dishSalesMap[s.dishId].prepared += s.quantityPrepared;
    dishSalesMap[s.dishId].wasted += s.quantityWasted;
  });

  const wastePercent = totalPrepared > 0 ? Math.round((totalWasted / totalPrepared) * 1000) / 10 : 0;

  return {
    totalSold,
    totalPrepared,
    totalRemaining,
    totalWasted,
    totalSalesINR,
    wastePercent,
    dishSalesMap,
  };
}

/**
 * Predict demand for the next upcoming meal period based on current service progress
 */
export function predictNextMealDemand(
  currentMeal: MealPeriod,
  todaySales: SalesRecord[],
  dishes: Dish[]
): {
  nextMeal: MealPeriod;
  predictedOrders: number;
  recommendedPrep: number;
  rationale: string;
} {
  const sequence: Record<MealPeriod, MealPeriod> = {
    Morning: 'Lunch',
    Lunch: 'Evening',
    Evening: 'Dinner',
    Dinner: 'Morning',
  };
  const nextMeal = sequence[currentMeal] || 'Lunch';

  const currentSold = todaySales.reduce((acc, s) => acc + s.quantitySold, 0);
  const baseline = nextMeal === 'Lunch' ? 480 : nextMeal === 'Dinner' ? 360 : 210;

  // If current meal ran hot (> 15% over expected), give next meal an upward trend
  const momentumFactor = currentSold > 250 ? 1.12 : 1.0;
  const predictedOrders = Math.round(baseline * momentumFactor);
  const recommendedPrep = Math.ceil(predictedOrders * 1.08); // 8% safety buffer

  return {
    nextMeal,
    predictedOrders,
    recommendedPrep,
    rationale: `Calculated from ${currentMeal} run-rate with a ${Math.round((momentumFactor - 1) * 100)}% service velocity boost.`,
  };
}

/**
 * Predict next day total and dish-level demand based on historical entries, weather & events
 */
export function predictNextDayDemand(
  historicalSales: SalesRecord[],
  dishes: Dish[],
  weather?: WeatherData,
  events: RestaurantEvent[] = []
): {
  predictedTotalOrders: number;
  dishPredictions: { dishId: string; dishName: string; predictedOrders: number; recommendedPrep: number }[];
  keyFactors: string[];
} {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isWeekend = tomorrow.getDay() === 0 || tomorrow.getDay() === 6;

  let totalFactor = isWeekend ? 1.25 : 1.02;
  const keyFactors: string[] = [];

  if (isWeekend) keyFactors.push('Weekend customer traffic surge (+25%)');

  if (weather && (weather.condition === 'Rainy' || weather.rainProbability > 60)) {
    totalFactor *= 0.96;
    keyFactors.push('Rain probability expected to trim walk-ins (-4%)');
  }

  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const matchedEvent = events.find(e => e.date === tomorrowStr);
  if (matchedEvent) {
    totalFactor += matchedEvent.expectedCrowdIncreasePercent / 100;
    keyFactors.push(`Scheduled event "${matchedEvent.name}" (+${matchedEvent.expectedCrowdIncreasePercent}%)`);
  }

  let totalOrders = 0;
  const dishPredictions = dishes.map(d => {
    const base = d.historicalAvg || 120;
    const predicted = Math.round(base * totalFactor);
    const prep = Math.ceil(predicted * 1.07);
    totalOrders += predicted;
    return {
      dishId: d.id,
      dishName: d.name,
      predictedOrders: predicted,
      recommendedPrep: prep,
    };
  });

  return {
    predictedTotalOrders: totalOrders,
    dishPredictions,
    keyFactors,
  };
}
