import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { AuthProvider } from '../hooks/useAuth';

export default function App() {
  return (
    
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
    
  );
}
