// src/main.tsx (or index.tsx)
import './lib/firebaseClient';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Optional but recommended
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { HelmetProvider } from 'react-helmet-async';

// ✅ Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Optional: retry failed queries once
      refetchOnWindowFocus: false, // Optional: disable refetch on window focus
    },
    mutations: {
      retry: 0, // Don't retry mutations (like login) by default
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}> {/* ✅ Wrap with QueryClientProvider */}
      <HelmetProvider>
      <AuthProvider>
        <Router>
          <App />
        </Router>
      </AuthProvider>
      </HelmetProvider>
      <ReactQueryDevtools initialIsOpen={false} /> {/* ✅ Devtools (optional, but super helpful) */}
    </QueryClientProvider>
  </React.StrictMode>
);