import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient.js';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ConfigProvider } from './contexts/ConfigContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ConfigProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                },
              }}
            />
          </BrowserRouter>
        </ConfigProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
