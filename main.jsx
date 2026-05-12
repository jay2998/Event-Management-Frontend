import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <HelmetProvider>
          <ThemeProvider>
            <Toaster position="top-right" />
            <App />
          </ThemeProvider>
        </HelmetProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
