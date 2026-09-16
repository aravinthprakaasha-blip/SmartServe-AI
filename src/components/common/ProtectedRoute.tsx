import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChefHat } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <ChefHat className="w-8 h-8 text-indigo-400 animate-bounce" />
          </div>
          <div className="absolute -inset-2 bg-indigo-500/10 rounded-3xl blur-md -z-10" />
        </div>
        <h2 className="text-base font-bold tracking-wide text-slate-100 mb-1">
          Authenticating RestoAI Enterprise
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Verifying security credentials & live kitchen node...
        </p>
      </div>
    );
  }

  if (!user) {
    // Redirect immediately to login with return path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
