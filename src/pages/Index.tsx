import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Login from '../components/Login';
import Layout from '../components/Layout';
import MainContent from '../components/MainContent';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-2xl font-bold text-primary-foreground">🏪</span>
          </div>
          <p className="text-lg text-muted-foreground">Memuat sistem...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout />
  );
};

export default Index;
