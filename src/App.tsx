import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth Context & Protection
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// Pages
import { Login } from './pages/Login';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { SalesEntry } from './pages/SalesEntry';
import { DemandForecasting } from './pages/DemandForecasting';
import { DishPredictions } from './pages/DishPredictions';
import { PreparationPlanning } from './pages/PreparationPlanning';
import { RealTimeForecast } from './pages/RealTimeForecast';
import { WeatherEvents } from './pages/WeatherEvents';
import { Inventory } from './pages/Inventory';
import { IngredientForecasting } from './pages/IngredientForecasting';
import { SmartPurchasing } from './pages/SmartPurchasing';
import { WastePrediction } from './pages/WastePrediction';
import { WasteTracking } from './pages/WasteTracking';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication & Overview Portal */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>

            {/* Strictly Protected SaaS Platform - Requires Active Firebase Login */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/sales-entry" element={<SalesEntry />} />
              <Route path="/enter-data" element={<Navigate to="/sales-entry" replace />} />
              <Route path="/forecasting" element={<DemandForecasting />} />
              <Route path="/demand-forecasting" element={<Navigate to="/forecasting" replace />} />
              <Route path="/dish-predictions" element={<DishPredictions />} />
              <Route path="/preparation-planning" element={<PreparationPlanning />} />
              <Route path="/real-time" element={<RealTimeForecast />} />
              <Route path="/real-time-forecast" element={<Navigate to="/real-time" replace />} />
              <Route path="/weather-events" element={<WeatherEvents />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/ingredient-forecasting" element={<IngredientForecasting />} />
              <Route path="/smart-purchasing" element={<SmartPurchasing />} />
              <Route path="/waste-prediction" element={<WastePrediction />} />
              <Route path="/waste-tracking" element={<WasteTracking />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Default Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
